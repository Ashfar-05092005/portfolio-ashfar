import React from 'react'
import { MdOutlineWorkOutline } from "react-icons/md";
import { MdOutlineSchool } from "react-icons/md";
import "../Stylesheet.css";

const Resume = ({ isActive }) => {
  return (
    <>
     <article className={`resume ${isActive ? 'active' : ''}`} data-page="resume">
        <header>
          <h2 className="h2 article-title">Resume</h2>
        </header>

        <section className="timeline">
          <div className="title-wrapper">
            <div className="icon-box">
              <MdOutlineSchool style={{ fontSize: 30, color:" hsl(45, 54%, 58%)" }}/>
            </div>
            <h3 className="h3">Education</h3>
          </div>

          <ol className="timeline-list">
            <li className="timeline-item">
              <h4 className="h4 timeline-item-title">Bannari Amman Institute of Technology, Sathyamangalam</h4>
              <span>2023 — Present</span>
              <p className="timeline-text">
               Pursuing a Bachelor of Technology in Agricultural Engineering, with coursework in Farm Machinery, Soil & Water Conservation, Irrigation Systems, and Post-Harvest Technology.
              </p>
            </li>

            <li className="timeline-item">
              <h4 className="h4 timeline-item-title">Sanjose Matriculation Higher Secondary School</h4>
              <span>2022 — 2023</span>
              <p className="timeline-text">
                Completed 12th grade (HSC) with a focus on Computer Science and Mathematics.
              </p>
            </li>

            <li className="timeline-item">
              <h4 className="h4 timeline-item-title">Sanjose Matriculation Higher Secondary School</h4>
              <span>2020 — 2021</span>
              <p className="timeline-text">
                Completed 10th grade (SSLC).
              </p>
            </li>
          </ol>
        </section>

        <section className="timeline">
          <div className="title-wrapper">
            <div className="icon-box">
              <MdOutlineWorkOutline  style={{ fontSize: 30, color:" hsl(45, 54%, 58%)" }}/>
            </div>
            <h3 className="h3">Projects</h3>
          </div>

          <ol className="timeline-list">
            <li className="timeline-item">
              <h4 className="h4 timeline-item-title"> PDF</h4>
              <span>Personal Project</span>
              <p className="timeline-text">
                Developed an interactive chatbot capable of answering questions based on the content of uploaded PDF documents, using natural language processing.
              </p>
            </li>

            <li className="timeline-item">
              <h4 className="h4 timeline-item-title">Smart  Summarizer</h4>
              <span>Personal Project</span>
              <p className="timeline-text">
                Created a web application that leverages machine learning models to generate concise summaries of long articles and texts.
              </p>
            </li>

            <li className="timeline-item">
              <h4 className="h4 timeline-item-title">project1</h4>
              <span>Personal Project</span>
              <p className="timeline-text">
               lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </li>
          </ol>

          <section className="resume-download" style={{ textAlign: 'center', margin: '30px 0' }}>
            <a
              href="https://drive.google.com/file/d/1Xo9n8s5l3m2v6Zt7y8u9w0x1y2z3a4b/view?usp=sharing"
              className="form-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ion-icon name="download-outline"></ion-icon>
              <span>Download Resume</span>
            </a>
          </section>

          <section className="skill">
            <h3 className="h3 skills-title">My Skills</h3>

            <ul className="skills-list content-card">
              <li className="skills-item">
                <div className="title-wrapper">
                  <h5 className="h5">Prompting with AI Tools</h5>
                  <data value="85">85%</data>
                </div>
                <div className="skill-progress-bg">
                  <div className="skill-progress-fill" style={{ width: "85%" }}></div>
                </div>
              </li>

              <li className="skills-item">
                <div className="title-wrapper">
                  <h5 className="h5">React</h5>
                  <data value="75">75%</data>
                </div>
                <div className="skill-progress-bg">
                  <div className="skill-progress-fill" style={{ width: "75%" }}></div>
                </div>
              </li>

              <li className="skills-item">
                <div className="title-wrapper">
                  <h5 className="h5"> C Programming</h5>
                  <data value="70">70%</data>
                </div>
                <div className="skill-progress-bg">
                  <div className="skill-progress-fill" style={{ width: "70%" }}></div>
                </div>
              </li>

              <li className="skills-item">
                <div className="title-wrapper">
                  <h5 className="h5">Web Development</h5>
                  <data value="70">70%</data>
                </div>
                <div className="skill-progress-bg">
                  <div className="skill-progress-fill" style={{ width: "70%" }}></div>
                </div>
              </li>
            </ul>
          </section>
        </section>
      </article>
      
    </>
  )
}

export default Resume
