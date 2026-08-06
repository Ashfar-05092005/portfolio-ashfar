import React from "react";

function Navbar({ activePage, setActivePage }) {
  return (
    <div className="navbar-container">
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <button
            className={`navbar-link${activePage === "about" ? " active" : ""}`}
            onClick={() => setActivePage("about")}
          >
            About
          </button>
        </li>

        <li className="navbar-item">
          <button
            className={`navbar-link${activePage === "resume" ? " active" : ""}`}
            onClick={() => setActivePage("resume")}
          >
            Resume
          </button>
        </li>

        <li className="navbar-item">
          <button
            className={`navbar-link${activePage === "portfolio" ? " active" : ""}`}
            onClick={() => setActivePage("portfolio")}
          >
            Portfolio
          </button>
        </li>

        <li className="navbar-item">
          <button
            className={`navbar-link${activePage === "blog" ? " active" : ""}`}
            onClick={() => setActivePage("blog")}
          >
            Blog
          </button>
        </li>

        <li className="navbar-item">
          <button
            className={`navbar-link${activePage === "contact" ? " active" : ""}`}
            onClick={() => setActivePage("contact")}
          >
            Contact
          </button>
        </li>
      </ul>
    </nav>
    </div>
  );
}

export default Navbar;
