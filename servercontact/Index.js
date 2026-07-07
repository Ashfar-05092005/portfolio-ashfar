const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const SENDGRID_KEY = (process.env.SENDGRID_API_KEY || "").trim();
const sgMail = SENDGRID_KEY ? require("@sendgrid/mail") : null;
const EMAIL_PROVIDER_SETTING = (process.env.EMAIL_PROVIDER || "").trim().toLowerCase();

function getActiveEmailProvider() {
  if (EMAIL_PROVIDER_SETTING === "sendgrid" || EMAIL_PROVIDER_SETTING === "smtp") {
    return EMAIL_PROVIDER_SETTING;
  }

  return SENDGRID_KEY ? "sendgrid" : "smtp";
}

const ACTIVE_EMAIL_PROVIDER = getActiveEmailProvider();

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
const SENDGRID_FROM = (process.env.SENDGRID_FROM || SMTP_USER || "no-reply@contact-form.local").trim();

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

function buildMailOptions(payload) {
  const { name, email, phone, message } = payload;

  return {
    from: SMTP_USER || "no-reply@contact-form.local",
    to: MAIL_RECIPIENT,
    subject: `New contact message from ${name}`,
    replyTo: email,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || ""}\n\nMessage:\n${message}`,
  };
}

function logMailFailure(err, context) {
  console.error("Mail send failed", {
    context,
    provider: ACTIVE_EMAIL_PROVIDER,
    code: err?.code,
    message: err?.message,
    responseStatus: err?.response?.statusCode,
    responseBody: err?.response?.body,
    stack: err?.stack,
    error: err,
  });
}

function getMailErrorMessage(err) {
  const sendgridMessage = err?.response?.body?.errors?.[0]?.message;
  const responseStatus = err?.response?.statusCode;

  if (err?.code === "EAUTH" || err?.code === "535") {
    return "Email authentication failed. Check SMTP_USER and SMTP_PASS (app password).";
  }

  if (err?.code === "EMAIL_SEND_TIMEOUT" || err?.code === "ETIMEDOUT" || err?.code === "ESOCKET") {
    return "Could not reach the email provider. Check SMTP_HOST/SMTP_PORT and hosting network rules.";
  }

  if (sendgridMessage) {
    return sendgridMessage;
  }

  if (typeof responseStatus === "number") {
    return `Email provider rejected the message (${responseStatus}). Check provider settings and sender verification.`;
  }

  return "Failed to send message";
}

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

function isAuthError(err) {
  return ["EAUTH", "535"].includes(err?.code) || /auth/i.test(err?.message || "");
}

function isRetryableMailError(err) {
  if (!err) return false;

  if (["EMAIL_SEND_TIMEOUT", "ETIMEDOUT", "ESOCKET", "ECONNECTION", "ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH"].includes(err?.code)) {
    return true;
  }

  const responseStatus = err?.response?.statusCode;
  if (responseStatus === 429 || (typeof responseStatus === "number" && responseStatus >= 500)) {
    return true;
  }

  return false;
}

function getOrderedAttemptPorts() {
  if (!lastSuccessfulPort || !smtpAttemptPorts.includes(lastSuccessfulPort)) {
    return smtpAttemptPorts;
  }

  return [lastSuccessfulPort, ...smtpAttemptPorts.filter((port) => port !== lastSuccessfulPort)];
}

async function sendViaSendGrid(payload) {
  const mailOptions = buildMailOptions(payload);

  if (!sgMail || !SENDGRID_KEY) {
    const configError = new Error("SENDGRID_API_KEY is not configured");
    configError.code = "ENOSENDGRID";
    throw configError;
  }

  sgMail.setApiKey(SENDGRID_KEY);

  try {
    await sendWithTimeout(
      sgMail.send({
        to: MAIL_RECIPIENT,
        from: SENDGRID_FROM,
        subject: mailOptions.subject,
        text: mailOptions.text,
        replyTo: mailOptions.replyTo,
      }),
      REQUEST_TIMEOUT_MS,
      "Timed out sending mail via SendGrid"
    );

    console.log("Mail sent via SendGrid API");
  } catch (err) {
    logMailFailure(err, "sendgrid");
    throw err;
  }
}

async function sendViaSmtp(payload) {
  const mailOptions = buildMailOptions(payload);
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
      return;
    } catch (sendErr) {
      lastMailError = sendErr;
      logMailFailure(sendErr, `smtp:${attemptPort}`);
      if (isAuthError(sendErr)) {
        break;
      }
    }
  }

  if (lastMailError) {
    throw lastMailError;
  }
}

async function deliverContactSubmission(payload) {
  if (ACTIVE_EMAIL_PROVIDER === "sendgrid") {
    return sendViaSendGrid(payload);
  }

  return sendViaSmtp(payload);
}

async function recordFailedSubmission(payload, reason) {
  try {
    const outPath = path.join(__dirname, "failed_submissions.log");
    const entry = JSON.stringify({
      ...payload,
      reason,
      date: new Date().toISOString(),
      provider: ACTIVE_EMAIL_PROVIDER,
      host: SMTP_EFFECTIVE_HOST,
      attempts: smtpAttemptPorts,
    }) + "\n";
    await fs.promises.appendFile(outPath, entry, { encoding: "utf8" });
  } catch (fileErr) {
    console.error("Failed to write failed_submissions.log:", fileErr?.message || fileErr);
  }
}

function enqueueContactSubmission(payload, attempts = 0, delayMs = 0) {
  contactQueue.push({
    payload,
    attempts,
    nextAttemptAt: Date.now() + delayMs,
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
    logMailFailure(err, "queue-retry");
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

console.log("Mail config loaded:", {
  provider: ACTIVE_EMAIL_PROVIDER,
  providerSetting: EMAIL_PROVIDER_SETTING || "(auto)",
  hasSendGridKey: !!SENDGRID_KEY,
  sendGridFrom: SENDGRID_FROM,
  smtpHost: SMTP_EFFECTIVE_HOST,
  hasSmtpAuth: !!(SMTP_USER && SMTP_PASS),
  requestTimeoutMs: REQUEST_TIMEOUT_MS,
  queuePollIntervalMs: QUEUE_POLL_INTERVAL_MS,
  queueMaxRetries: QUEUE_MAX_RETRIES,
  frontendOrigins: allowedOrigins,
});

setInterval(processContactQueue, QUEUE_POLL_INTERVAL_MS);

// GET routes
app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/contact/status", (_req, res) => {
  res.json({
    status: "ok",
    queueLength: contactQueue.length,
    isQueueWorkerRunning,
    emailProvider: ACTIVE_EMAIL_PROVIDER,
    hasSendGridKey: !!SENDGRID_KEY,
    deliveryStats,
  });
});

// POST route — await the real send result so the response reflects reality
app.post("/contact", async (req, res) => {
  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }

  if (!MAIL_RECIPIENT) {
    return res.status(500).json({ error: "Email recipient is not configured" });
  }

  if (ACTIVE_EMAIL_PROVIDER === "sendgrid" && !SENDGRID_KEY) {
    return res.status(500).json({ error: "SendGrid is selected but SENDGRID_API_KEY is not configured" });
  }

  if (ACTIVE_EMAIL_PROVIDER !== "sendgrid" && (!SMTP_USER || !SMTP_PASS)) {
    return res.status(500).json({ error: "Email credentials are not configured" });
  }

  const payload = { name, email, phone, message };

  try {
    await deliverContactSubmission(payload);
    deliveryStats.delivered += 1;
    deliveryStats.lastSuccessAt = new Date().toISOString();
    return res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Mail send failed on first attempt:", {
      code: err?.code,
      message: err?.message,
      responseStatus: err?.response?.statusCode,
      responseBody: err?.response?.body,
      error: err,
    });

    deliveryStats.failed += 1;
    deliveryStats.lastFailureAt = new Date().toISOString();
    deliveryStats.lastFailureReason = err?.code || err?.message || "unknown_error";

    if (isRetryableMailError(err)) {
      enqueueContactSubmission(payload, 1, 2000);
      deliveryStats.queued += 1;
      processContactQueue().catch((queueErr) => {
        console.error("Queue processing failed:", queueErr?.message || queueErr);
      });
    }

    const errorCode = err?.code;
    const userMessage =
      errorCode === "EAUTH"
        ? "Email authentication failed. Check SMTP_USER and SMTP_PASS (app password)."
        : errorCode === "ENOSENDGRID"
        ? "SendGrid is selected but SENDGRID_API_KEY is missing."
        : errorCode === "EMAIL_SEND_TIMEOUT"
        ? "Email delivery timed out. Check your provider settings and Render network access."
        : "Failed to send message. Please try again later.";

    return res.status(500).json({ error: userMessage });
  }
});

app.listen(process.env.PORT || 4000, () => console.log("Server is running on port " + (process.env.PORT || 4000)));