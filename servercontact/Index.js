const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const SENDGRID_KEY = (process.env.SENDGRID_API_KEY || "").trim();
const sgMail = SENDGRID_KEY ? require("@sendgrid/mail") : null;
const cors = require("cors");

require("dotenv").config();

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

function createSmtpConfig(port) {
  return {
    host: SMTP_EFFECTIVE_HOST,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    tls: {
      minVersion: "TLSv1.2",
    },
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  };
}

const smtpAttemptPorts = IS_GMAIL_HOST
  ? Array.from(new Set([SMTP_PORT, 587, 465]))
  : [SMTP_PORT];

function isSmtpConnectivityError(err) {
  return ["ETIMEDOUT", "ESOCKET", "ECONNECTION", "ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH"].includes(err?.code);
}

console.log("SMTP Config loaded:", {
  host: SMTP_EFFECTIVE_HOST,
  attemptPorts: smtpAttemptPorts,
  hasAuth: !!(SMTP_USER && SMTP_PASS),
});

// GET route
app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

// POST route
app.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    if (!SMTP_USER || !SMTP_PASS) {
      return res.status(500).json({ error: "Email credentials are not configured" });
    }

    if (!MAIL_RECIPIENT) {
      return res.status(500).json({ error: "Email recipient is not configured" });
    }

    const mailOptions = {
      from: SMTP_USER || "no-reply@contact-form.local",
      to: MAIL_RECIPIENT,
      subject: `New contact message from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || ""}\n\nMessage:\n${message}`,
    };

    // Prefer SendGrid HTTP API when available because some hosts block SMTP
    if (sgMail) {
      try {
        sgMail.setApiKey(SENDGRID_KEY);
        const sgMsg = {
          to: MAIL_RECIPIENT,
          from: SMTP_USER || "no-reply@contact-form.local",
          subject: mailOptions.subject,
          text: mailOptions.text,
          replyTo: mailOptions.replyTo,
        };
        await sgMail.send(sgMsg);
        console.log("Mail sent via SendGrid API");
        return res.status(200).json({ success: true, message: "Message sent" });
      } catch (sgErr) {
        console.error("SendGrid send failed:", sgErr?.message || sgErr);
        // fall through to SMTP attempts as a fallback
      }
    }

    let lastMailError;
    for (const attemptPort of smtpAttemptPorts) {
      try {
        const transporter = nodemailer.createTransport(createSmtpConfig(attemptPort));
        await transporter.sendMail(mailOptions);
        console.log(`Mail sent using ${SMTP_EFFECTIVE_HOST}:${attemptPort}`);
        lastMailError = null;
        break;
      } catch (sendErr) {
        lastMailError = sendErr;
        console.error(`Mail attempt failed on ${SMTP_EFFECTIVE_HOST}:${attemptPort}`, sendErr?.code || sendErr?.message);
      }
    }

    if (lastMailError) {
      if (isSmtpConnectivityError(lastMailError)) {
        console.warn("SMTP unavailable, recording contact submission locally", {
          host: SMTP_EFFECTIVE_HOST,
          attempts: smtpAttemptPorts,
          name,
          email,
        });

        // Persist the submission locally for later retry/inspection
        try {
          const outPath = path.join(__dirname, "failed_submissions.log");
          const entry = JSON.stringify({ name, email, phone, message, date: new Date().toISOString(), host: SMTP_EFFECTIVE_HOST, attempts: smtpAttemptPorts }) + "\n";
          fs.appendFileSync(outPath, entry, { encoding: "utf8" });
        } catch (fileErr) {
          console.error("Failed to write failed_submissions.log:", fileErr?.message || fileErr);
        }

        return res.status(202).json({
          success: true,
          message: "Message received. Email delivery is temporarily unavailable, but your submission was recorded.",
        });
      }

      throw lastMailError;
    }

    res.status(200).json({ success: true, message: "Message sent" });
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

