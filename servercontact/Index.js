const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_TO,
} = process.env;

const transporter = nodemailer.createTransport(
  SMTP_HOST
    ? {
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT) === 465,
        auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      }
    : {
        service: "gmail",
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

    await transporter.sendMail({
      from: SMTP_USER || "no-reply@contact-form.local",
      to: MAIL_TO,
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

app.listen(4000, () => console.log("Server running on http://localhost:4000"));


