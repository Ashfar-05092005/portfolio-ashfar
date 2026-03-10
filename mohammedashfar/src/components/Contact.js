  import React, { useState } from "react";
import "../Stylesheet.css";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";
const API = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

const Contact = ({ isActive }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function addPerson(e) {
    e.preventDefault();

    // simple validations
    if (!form.name) {
      setError("Name is required");
      return;
    } else if (!form.email) {
      setError("Email is required");
      return;
    } else if (!/^\d{10}$/.test(form.phone)) {
      setError("Enter a valid 10-digit phone number");
      return;
    } else if (!form.message) {
      setError("Message is required");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!API) {
        setError("API URL is not configured. Set REACT_APP_API_URL in .env");
        return;
      }

      await axios.post(`${API}/contact`, {
        ...form,
        phone: Number(form.phone),
      });

      setForm({ name: "", email: "", phone: "", message: "" });
      setSuccess("Message sent successfully!");
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      const serverMessage = err?.response?.data?.error;
      const fallbackMessage = err?.message || "Error submitting form. Please try again.";
      setError(serverMessage || fallbackMessage);
      console.error("Error submitting form:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className={`contact ${isActive ? 'active' : ''}`} data-page="contact">
      <header>
        <h2 className="h2 article-title">Contact</h2>
      </header>

      <section className="contact-form">
        <h3 className="h3 form-title">Contact Form</h3>

        <form onSubmit={addPerson} className="form" data-form>
          <div className="input-wrapper">
            <input
              type="text"
              name="fullname"
              className="form-input"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              data-form-input
              disabled={loading}
            />
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              data-form-input
              disabled={loading}
            />
            <input
              type="tel"
              name="phone"
              className="form-input center"
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              data-form-input
              disabled={loading}
            />
            {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
            {success && <p style={{ color: "rgb(170, 255, 0)", marginBottom: "10px" }}>{success}</p>}
          </div>

          <textarea
            name="message"
            className="form-input"
            placeholder="Your Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            data-form-input
            disabled={loading}
          ></textarea>

          <button className="form-btn" type="submit" data-form-btn disabled={loading}>
            <FaPaperPlane style={{ fontSize: 20, color:"#ffd700" }}/>
            <span>{loading ? "Sending..." : "Send Message"}</span>
          </button>
        </form>
      </section>
    </article>
  );
};

export default Contact;
