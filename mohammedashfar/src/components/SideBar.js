import React, { useState } from "react";
import myImage from "../images/IMG_20250110_153018_214.JPG";
import {
  IoMailOutline,
  IoPhonePortraitOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoChevronDown,
  IoLogoLinkedin,
  IoLogoGithub,
} from "react-icons/io5";
import { BsAwardFill } from "react-icons/bs";

function SideBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
     <div id='stars1'></div>
      <div id='stars2'></div>
      <div id='stars3'></div>
    <aside className={`sidebar${sidebarOpen ? " active" : ""}`} data-sidebar>
      <div className="sidebar-info">
        <figure className="avatar-box">
          <img src={myImage} alt="Ashfar" width="80" />
        </figure>

        <div className="info-content">
          <h1 className="name" title="Ashfar">Mohammed Ashfar</h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span className="title">Web Developer</span>
            <span className="title">Agronomist</span>
          </div>
        </div>

        <button
          className="info_more-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span>{sidebarOpen ? "Hide Contacts" : "Show Contacts"}</span>
          <IoChevronDown
            className={`chevron-icon${sidebarOpen ? " rotated" : ""}`}
          />
        </button>
      </div>

      <div className={`sidebar-info_more${sidebarOpen ? " active" : ""}`}>
        <div className="separator"></div>
        <ul className="contacts-list">
          <li className="contact-item">
            <div className="icon-box"><IoMailOutline /></div>
            <div className="contact-info">
              <p className="contact-title">Email</p>
              <a
                href="mailto:mohammedashfar050092005@gmail.com"
                className="contact-link"
              >
                mohammedashfar050092005@gmail.com
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box"><IoPhonePortraitOutline /></div>
            <div className="contact-info">
              <p className="contact-title">Phone</p>
              <a href="tel:+9191XXXXXX557" className="contact-link">91******557</a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box"><IoCalendarOutline /></div>
            <div className="contact-info">
              <p className="contact-title">Birthday</p>
              <time dateTime="2005-09-05">September 05, 2005</time>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box"><IoLocationOutline /></div>
            <div className="contact-info">
              <p className="contact-title">Location</p>
              <address>Mettupalayam, Tamil Nadu, India</address>
            </div>
          </li>
        </ul>

        <div className="separator"></div>
        <ul className="social-list">
          <li className="social-item">
            <a
              href="https://www.linkedin.com/in/mohammed-ashfar-meeran-b4a492311"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoLinkedin />
            </a>
          </li>

          <li className="social-item">
            <a
              href="https://github.com/Ashfar-05092005"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoGithub />
            </a>
          </li>

          <li className="social-item">
            <a
              href="https://leetcode.com/u/Ashfar-05092005/"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BsAwardFill />
            </a>
          </li>
        </ul>
      </div>
    </aside>
    </>
  );
}

export default SideBar;


