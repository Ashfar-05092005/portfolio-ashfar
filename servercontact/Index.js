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

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO } = process.env;
const MAIL_RECIPIENT = MAIL_TO || SMTP_USER;

const transporter = nodemailer.createTransport(
  SMTP_HOST
    ? {
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT) === 465,
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
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.listen(process.env.PORT || 4000, () => console.log("Server is running on port " + (process.env.PORT || 4000)));

