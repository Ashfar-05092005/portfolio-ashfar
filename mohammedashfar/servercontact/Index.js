const express = require("express");
const nodemailer = require("nodemailer");
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
const SMTP_HOST = (process.env.SMTP_HOST || "").trim();
const SMTP_PORT_ENV = process.env.SMTP_PORT || "587";
const SMTP_PORT = Number(SMTP_PORT_ENV);

if (isNaN(SMTP_PORT) || SMTP_PORT <= 0) {
  console.error(`ERROR: SMTP_PORT must be a number (e.g., 587 or 465), got: "${SMTP_PORT_ENV}"`);
  console.error("Check your Render environment variables. Common mistake: setting SMTP_PORT to a URL instead of a port number.");
  process.exit(1);
}

const SMTP_USER = (process.env.SMTP_USER || "").trim();
// Gmail app passwords are often pasted with spaces; normalize before auth.
const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s+/g, "").trim();
const MAIL_TO = (process.env.MAIL_TO || "").trim();
const MAIL_RECIPIENT = MAIL_TO || SMTP_USER;
const SMTP_EFFECTIVE_HOST = SMTP_HOST || "smtp.gmail.com";
const IS_GMAIL_HOST = /(^|\.)gmail\.com$/i.test(SMTP_EFFECTIVE_HOST);
const REQUEST_TIMEOUT_MS = Number(process.env.SMTP_REQUEST_TIMEOUT_MS || "12000");
const QUEUE_POLL_INTERVAL_MS = Number(process.env.CONTACT_QUEUE_POLL_INTERVAL_MS || "500");
const QUEUE_MAX_RETRIES = Number(process.env.CONTACT_QUEUE_MAX_RETRIES || "3");
const transporterCache = new Map();
let lastSuccessfulPort = null;
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

function createSmtpConfig(port) {
  return {
    host: SMTP_EFFECTIVE_HOST,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 12000,
    tls: {
      minVersion: "TLSv1.2",
    },
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  };
}

function getTransporter(port) {
  if (!transporterCache.has(port)) {
    transporterCache.set(port, nodemailer.createTransport(createSmtpConfig(port)));
  }
  return transporterCache.get(port);
}

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

const smtpAttemptPorts = IS_GMAIL_HOST
  ? Array.from(new Set([SMTP_PORT, 587, 465]))
  : [SMTP_PORT];

function isSmtpConnectivityError(err) {
  return ["ETIMEDOUT", "ESOCKET", "ECONNECTION", "ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH"].includes(err?.code);
}

function isAuthError(err) {
  return ["EAUTH", "535"].includes(err?.code) || /auth/i.test(err?.message || "");
}

function isRetryableMailError(err) {
  if (!err) {
    return false;
  }

  if (["EMAIL_SEND_TIMEOUT", "ETIMEDOUT", "ESOCKET", "ECONNECTION", "ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH"].includes(err?.code)) {
    return true;
  }

  return false;
}

function getOrderedAttemptPorts() {
  if (!lastSuccessfulPort || !smtpAttemptPorts.includes(lastSuccessfulPort)) {
    return smtpAttemptPorts;
  }

  return [
    lastSuccessfulPort,
    ...smtpAttemptPorts.filter((port) => port !== lastSuccessfulPort),
  ];
}

async function recordFailedSubmission(payload, reason) {
  try {
    const outPath = path.join(__dirname, "failed_submissions.log");
    const entry = JSON.stringify({ ...payload, reason, date: new Date().toISOString(), host: SMTP_EFFECTIVE_HOST, attempts: smtpAttemptPorts }) + "\n";
    await fs.promises.appendFile(outPath, entry, { encoding: "utf8" });
  } catch (fileErr) {
    console.error("Failed to write failed_submissions.log:", fileErr?.message || fileErr);
  }
}

async function deliverContactSubmission(payload) {
  const { name, email, phone, message } = payload;
  const mailOptions = {
    from: SMTP_USER || "no-reply@contact-form.local",
    to: MAIL_RECIPIENT,
    subject: `New contact message from ${name}`,
    replyTo: email,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || ""}\n\nMessage:\n${message}`,
  };

  let lastMailError;
  for (const attemptPort of getOrderedAttemptPorts()) {
    try {
      const transporter = getTransporter(attemptPort);
      await sendWithTimeout(
        transporter.sendMail(mailOptions),
        REQUEST_TIMEOUT_MS,
        `Timed out sending mail on ${SMTP_EFFECTIVE_HOST}:${attemptPort}`
      );
      console.log(`Mail sent using ${SMTP_EFFECTIVE_HOST}:${attemptPort}`);
      lastSuccessfulPort = attemptPort;
      lastMailError = null;
      break;
    } catch (sendErr) {
      lastMailError = sendErr;
      console.error(`Mail attempt failed on ${SMTP_EFFECTIVE_HOST}:${attemptPort}`, sendErr?.code || sendErr?.message);
      if (isAuthError(sendErr)) {
        break;
      }
    }
  }

  if (lastMailError) {
    throw lastMailError;
  }
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

console.log("SMTP Config loaded:", {
  host: SMTP_EFFECTIVE_HOST,
  attemptPorts: smtpAttemptPorts,
  hasAuth: !!(SMTP_USER && SMTP_PASS),
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
app.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    if (!MAIL_RECIPIENT) {
      return res.status(500).json({ error: "Email recipient is not configured" });
    }

    if (!SMTP_USER || !SMTP_PASS) {
      return res.status(500).json({ error: "Email credentials are not configured" });
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

    const errorCode = err?.code;
    const userMessage =
      errorCode === "EAUTH"
        ? "Email authentication failed. Check SMTP_USER and SMTP_PASS (app password)."
        : errorCode === "ETIMEDOUT" || errorCode === "ESOCKET"
        ? "Could not reach SMTP server. Check SMTP_HOST/SMTP_PORT and hosting network rules."
        : "Failed to send message";

    res.status(500).json({ error: userMessage });
  }
});

app.listen(process.env.PORT || 4000, () => console.log("Server is running on port " + (process.env.PORT || 4000)));

