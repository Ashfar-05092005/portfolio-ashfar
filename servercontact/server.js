const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const PORT = Number(process.env.PORT || "5000");
const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim();
const RESEND_FROM_EMAIL = (process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev").trim();
const CONTACT_EMAIL = (process.env.CONTACT_EMAIL || process.env.MAIL_TO || "").trim();
const FRONTEND_URL = (process.env.FRONTEND_URL || "").trim().replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = Number(process.env.SMTP_REQUEST_TIMEOUT_MS || "12000");
const NODE_ENV = (process.env.NODE_ENV || "development").trim().toLowerCase();

const app = express();
app.disable("x-powered-by");

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many contact requests. Please try again later.",
  },
});

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (FRONTEND_URL && origin === FRONTEND_URL) {
    return true;
  }

  if (!FRONTEND_URL && NODE_ENV !== "production") {
    return /^(http:\/\/localhost:(3000|5000))$/i.test(origin);
  }

  return NODE_ENV !== "production" && /^(http:\/\/localhost:(3000|5000))$/i.test(origin);
}

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 600,
  })
);
app.use(express.json({ limit: "10kb" }));

function normalizeText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\r/g, "").trim().slice(0, maxLength);
}

function normalizeMultilineText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildValidationResult(body) {
  const name = normalizeText(body?.name, 100);
  const email = normalizeText(body?.email, 254).toLowerCase();
  const subject = normalizeText(body?.subject, 120);
  const message = normalizeMultilineText(body?.message, 2000);

  const errors = [];

  if (!name) {
    errors.push("Name is required.");
  }

  if (!email) {
    errors.push("Email is required.");
  } else if (!isValidEmail(email)) {
    errors.push("Email format is invalid.");
  }

  if (!subject) {
    errors.push("Subject is required.");
  }

  if (!message) {
    errors.push("Message is required.");
  }

  return {
    errors,
    data: {
      name,
      email,
      subject,
      message,
    },
  };
}

function buildResendPayload(data) {
  const escapedName = escapeHtml(data.name);
  const escapedEmail = escapeHtml(data.email);
  const escapedSubject = escapeHtml(data.subject);
  const escapedMessage = escapeHtml(data.message).replace(/\n/g, "<br />");

  return {
    from: RESEND_FROM_EMAIL,
    to: [CONTACT_EMAIL],
    reply_to: data.email,
    subject: `Portfolio contact: ${data.subject}`,
    text: [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Subject: ${data.subject}`,
      "",
      data.message,
    ].join("\n"),
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapedName}</p>
      <p><strong>Email:</strong> ${escapedEmail}</p>
      <p><strong>Subject:</strong> ${escapedSubject}</p>
      <p><strong>Message:</strong><br />${escapedMessage}</p>
    `,
  };
}

async function sendViaResend(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(body?.message || `Resend API responded with ${response.status}`);
      error.status = response.status;
      error.body = body;
      throw error;
    }

    return body;
  } catch (err) {
    if (err.name === "AbortError") {
      const timeoutError = new Error("Timed out sending contact email");
      timeoutError.code = "EMAIL_SEND_TIMEOUT";
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function handleContactRequest(req, res) {
  const { errors, data } = buildValidationResult(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      error: errors[0],
      details: errors,
    });
  }

  if (!RESEND_API_KEY) {
    return res.status(500).json({
      error: "RESEND_API_KEY is not configured.",
    });
  }

  if (!CONTACT_EMAIL) {
    return res.status(500).json({
      error: "CONTACT_EMAIL is not configured.",
    });
  }

  try {
    await sendViaResend(buildResendPayload(data));

    return res.status(200).json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Failed to send contact email", {
      status: error?.status,
      message: error?.message,
      body: error?.body,
    });

    if (error?.status === 401 || error?.status === 403) {
      return res.status(500).json({
        error: "Email authentication failed. Check RESEND_API_KEY.",
      });
    }

    if (error?.status === 422) {
      return res.status(500).json({
        error: "Email rejected by provider. Check RESEND_FROM_EMAIL is a verified sender/domain in Resend.",
      });
    }

    if (error?.code === "EMAIL_SEND_TIMEOUT") {
      return res.status(504).json({
        error: "Email delivery timed out. Check Resend status and Render network access.",
      });
    }

    return res.status(500).json({
      error: "Failed to send message. Please try again later.",
    });
  }
}

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post(["/api/contact", "/contact"], contactLimiter, handleContactRequest);

app.use((err, _req, res, _next) => {
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS blocked this request.",
    });
  }

  console.error("Unexpected server error", err);
  return res.status(500).json({
    error: "Internal server error.",
  });
});

app.listen(PORT, () => {
  console.log("Contact API is running on port", PORT);
  console.log("Configured frontend URL:", FRONTEND_URL || "(not set)");
  console.log("Configured contact email:", CONTACT_EMAIL || "(not set)");
});
