import React, { useEffect, useRef, useState } from "react";
import "../Stylesheet.css";
import { FaPaperPlane } from "react-icons/fa";

const API = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function Contact({ isActive }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const successTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  function updateField(field) {
    return (event) => {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextForm = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (!nextForm.name) {
      setError("Name is required.");
      return;
    }

    if (!nextForm.email) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail(nextForm.email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!nextForm.subject) {
      setError("Subject is required.");
      return;
    }

    if (!nextForm.message) {
      setError("Message is required.");
      return;
    }

    if (nextForm.message.length > 2000) {
      setError("Message must be 2000 characters or fewer.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextForm),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to send message.");
      }

      setForm(initialForm);
      setSuccess(responseData.message || "Message sent successfully.");

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      successTimeoutRef.current = setTimeout(() => {
        setSuccess("");
      }, 5000);
    } catch (requestError) {
      setError(requestError?.message || "Error submitting form. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className={`contact ${isActive ? "active" : ""}`} data-page="contact">
      <header>
        <h2 className="h2 article-title">Contact</h2>
      </header>

      <section className="contact-form">
        <h3 className="h3 form-title">Contact Form</h3>

        <form onSubmit={handleSubmit} className="form" data-form noValidate>
          <div className="input-wrapper">
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Full name"
              autoComplete="name"
              value={form.name}
              onChange={updateField("name")}
              maxLength={100}
              required
              data-form-input
              disabled={loading}
            />
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email address"
              autoComplete="email"
              value={form.email}
              onChange={updateField("email")}
              maxLength={254}
              required
              data-form-input
              disabled={loading}
            />
            <input
              type="text"
              name="subject"
              className="form-input"
              placeholder="Subject"
              autoComplete="off"
              value={form.subject}
              onChange={updateField("subject")}
              maxLength={120}
              required
              data-form-input
              disabled={loading}
            />
          </div>

          <textarea
            name="message"
            className="form-input"
            placeholder="Your message"
            autoComplete="off"
            value={form.message}
            onChange={updateField("message")}
            maxLength={2000}
            required
            data-form-input
            disabled={loading}
          />

          {(error || success) && (
            <p className={`form-status ${error ? "error" : "success"}`} role="status" aria-live="polite">
              {error || success}
            </p>
          )}

          <button className="form-btn" type="submit" data-form-btn disabled={loading}>
            {loading ? <span className="contact-spinner" aria-hidden="true" /> : <FaPaperPlane style={{ fontSize: 20, color: "#ffd700" }} />}
            <span>{loading ? "Sending..." : "Send Message"}</span>
          </button>
        </form>
      </section>
    </article>
  );
}

export default Contact;
