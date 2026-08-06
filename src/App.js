import React, { useState } from "react";

import AnimatedCursor from "./AnimatedCursor";
// Import your section components here
import Home from "./components/Home";
import Resume from "./components/Resume";
import Portfolio from "./components/Portfolio";
import Blog from "./components/Blog";
import Contact from "./components/Contact";
import SideBar from "./components/SideBar";
function App() {
 
  const [activePage, setActivePage] = useState("about");

  return (
    <>
     
      <main>
         
        <SideBar />

        <div className="main-content">
          <nav className="navbar">
            <ul className="navbar-list">
              <li className="navbar-item">
                <button
                  className={`navbar-link${activePage === "about" ? " active" : ""}`}
                  onClick={() => setActivePage("about")}
                  data-nav-link
                >
                  About
                </button>
              </li>
              <li className="navbar-item">
                <button
                  className={`navbar-link${activePage === "resume" ? " active" : ""}`}
                  onClick={() => setActivePage("resume")}
                  data-nav-link
                >
                  Resume
                </button>
              </li>
              <li className="navbar-item">
                <button
                  className={`navbar-link${activePage === "portfolio" ? " active" : ""}`}
                  onClick={() => setActivePage("portfolio")}
                  data-nav-link
                >
                  Portfolio
                </button>
              </li>
              <li className="navbar-item">
                <button
                  className={`navbar-link${activePage === "blog" ? " active" : ""}`}
                  onClick={() => setActivePage("blog")}
                  data-nav-link
                >
                  Blog
                </button>
              </li>
              <li className="navbar-item">
                <button
                  className={`navbar-link${activePage === "contact" ? " active" : ""}`}
                  onClick={() => setActivePage("contact")}
                  data-nav-link
                >
                  Contact
                </button>
              </li>
            </ul>
          </nav>

          <div className="page-content">
            <Home isActive={activePage === "about"} />
            <Resume isActive={activePage === "resume"} />
            <Portfolio isActive={activePage === "portfolio"} />
            <Blog isActive={activePage === "blog"} />
            <Contact isActive={activePage === "contact"} />
          </div>
        </div>
      </main>

      <AnimatedCursor
        innerSize={15}
        outerSize={15}
        color="#ffd700"
        outerAlpha={0.4}
        innerScale={0.7}
        outerScale={5}
      />
      
    </>
    
  );
}

export default App;

