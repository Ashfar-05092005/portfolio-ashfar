const express = require("express");
const nodemailer = require("nodemailer");
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
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = (process.env.SMTP_USER || "").trim();
// Gmail app passwords are often pasted with spaces; normalize before auth.
const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s+/g, "").trim();
const MAIL_TO = (process.env.MAIL_TO || "").trim();
const MAIL_RECIPIENT = MAIL_TO || SMTP_USER;

const transporter = nodemailer.createTransport(
  SMTP_HOST
    ? {
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        pool: true,
        maxConnections: 2,
        maxMessages: 50,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      }
    : {
        service: "gmail",
        pool: true,
        maxConnections: 2,
        maxMessages: 50,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      }
);

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

    await transporter.sendMail({
      from: SMTP_USER || "no-reply@contact-form.local",
      to: MAIL_RECIPIENT,
      subject: `New contact message   from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || ""}\n\nMessage:\n${message}`,
    });

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

