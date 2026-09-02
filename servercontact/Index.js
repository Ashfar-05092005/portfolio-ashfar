const express = require("express");
const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  })
);
app.use(express.json());
const MAIL_TO = (process.env.MAIL_TO || "").trim();
const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim();
const RESEND_FROM_EMAIL = (process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev").trim();
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const REQUEST_TIMEOUT_MS = Number(process.env.RESEND_REQUEST_TIMEOUT_MS || "12000");
const QUEUE_POLL_INTERVAL_MS = Number(process.env.CONTACT_QUEUE_POLL_INTERVAL_MS || "500");
const QUEUE_MAX_RETRIES = Number(process.env.CONTACT_QUEUE_MAX_RETRIES || "3");
const contactQueue = [];
let isQueueWorkerRunning = false;
const deliveryStats = {
  queued: 0,
  delivered: 0,
  failed: 0,
  lastSuccessAt: null,
  lastFailureAt: null,
  lastFailureReason: null,
};

function sendWithTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        const timeoutError = new Error(message);
        timeoutError.code = "EMAIL_SEND_TIMEOUT";
        reject(timeoutError);
      }, timeoutMs);
    }),
  ]);
}

function isRetryableMailError(err) {
  if (!err) {
    return false;
  }

  if (["EMAIL_SEND_TIMEOUT", "ETIMEDOUT", "ECONNECTION", "ECONNRESET", "429", "500", "502", "503", "504"].includes(err?.code)) {
    return true;
  }

  return false;
}

async function recordFailedSubmission(payload, reason) {
  try {
    const outPath = path.join(__dirname, "failed_submissions.log");
    const entry = JSON.stringify({ ...payload, reason, date: new Date().toISOString() }) + "\n";
    await fs.promises.appendFile(outPath, entry, { encoding: "utf8" });
  } catch (fileErr) {
    console.error("Failed to write failed_submissions.log:", fileErr?.message || fileErr);
  }
}

async function deliverContactSubmission(payload) {
  const { name, email, phone, message } = payload;
  const sendPromise = resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: MAIL_TO,
    subject: `New contact message from ${name}`,
    reply_to: email,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || ""}\n\nMessage:\n${message}`,
  });
  const { data, error } = await sendWithTimeout(
    sendPromise,
    REQUEST_TIMEOUT_MS,
    "Timed out sending mail with Resend"
  );

  if (error) {
    const resendError = new Error(error.message || "Resend failed to send email");
    resendError.code = error.statusCode || error.name || "RESEND_ERROR";
    throw resendError;
  }

  console.log("Mail sent with Resend", data?.id || "");
}

function enqueueContactSubmission(payload) {
  contactQueue.push({
    payload,
    attempts: 0,
    nextAttemptAt: Date.now(),
  });
}

async function processContactQueue() {
  if (isQueueWorkerRunning || contactQueue.length === 0) {
    return;
  }

  const now = Date.now();
  const itemIndex = contactQueue.findIndex((item) => item.nextAttemptAt <= now);
  if (itemIndex === -1) {
    return;
  }

  const item = contactQueue[itemIndex];
  isQueueWorkerRunning = true;

  try {
    await deliverContactSubmission(item.payload);
    contactQueue.splice(itemIndex, 1);
    deliveryStats.delivered += 1;
    deliveryStats.lastSuccessAt = new Date().toISOString();
    deliveryStats.lastFailureReason = null;
  } catch (err) {
    item.attempts += 1;
    const retryable = isRetryableMailError(err);

    if (!retryable || item.attempts >= QUEUE_MAX_RETRIES) {
      await recordFailedSubmission(item.payload, err?.code || err?.message || "unknown_error");
      contactQueue.splice(itemIndex, 1);
      deliveryStats.failed += 1;
      deliveryStats.lastFailureAt = new Date().toISOString();
      deliveryStats.lastFailureReason = err?.code || err?.message || "unknown_error";
      console.error("Dropping queued contact submission", {
        email: item.payload?.email,
        attempts: item.attempts,
        reason: err?.code || err?.message,
      });
    } else {
      const backoffMs = Math.min(30000, 2000 * item.attempts);
      item.nextAttemptAt = Date.now() + backoffMs;
      console.warn("Retrying queued contact submission", {
        email: item.payload?.email,
        attempts: item.attempts,
        nextAttemptInMs: backoffMs,
        reason: err?.code || err?.message,
      });
    }
  } finally {
    isQueueWorkerRunning = false;
  }
}

console.log("Resend config loaded:", {
  from: RESEND_FROM_EMAIL,
  hasApiKey: !!RESEND_API_KEY,
  requestTimeoutMs: REQUEST_TIMEOUT_MS,
  queuePollIntervalMs: QUEUE_POLL_INTERVAL_MS,
  queueMaxRetries: QUEUE_MAX_RETRIES,
});

setInterval(processContactQueue, QUEUE_POLL_INTERVAL_MS);

// GET route
app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/contact/status", (_req, res) => {
  res.json({
    status: "ok",
    queueLength: contactQueue.length,
    isQueueWorkerRunning,
    deliveryStats,
  });
});

// POST route
app.post(["/contact", "/api/contact"], async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    if (!MAIL_TO) {
      return res.status(500).json({ error: "Email recipient is not configured" });
    }

    if (!resend) {
      return res.status(500).json({ error: "RESEND_API_KEY is not configured" });
    }

    enqueueContactSubmission({ name, email, phone, message });
    deliveryStats.queued += 1;
    processContactQueue().catch((queueErr) => {
      console.error("Queue processing failed:", queueErr?.message || queueErr);
    });
    res.status(202).json({
      success: true,
      message: "Message received and queued for delivery.",
    });
  } catch (err) {
    console.error("Mail error:", err);

    res.status(500).json({ error: "Failed to queue message" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Server is running on port " + PORT));

