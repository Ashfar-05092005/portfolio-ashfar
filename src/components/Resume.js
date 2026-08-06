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
              <h4 className="h4 timeline-item-title">Collaboration Analytics Platform</h4>
              <span>Personal Project</span>
              <p className="timeline-text">
                Developed a full-stack Collaboration Analytics Platform using React, Node.js, Express.js, and MongoDB, delivering role-based dashboards (Admin, Team Leader, Team Member) for task, project, issue, and team performance management. Engineered a secure, scalable backend architecture with RESTful APIs, modular routing, authentication/authorization middleware, data validation, and activity logging to support reliable multi-user workflows and auditability.
              </p>
            </li>

            <li className="timeline-item">
              <h4 className="h4 timeline-item-title">Thoughts-Towards-Development</h4>
              <span>Personal Project</span>
              <p className="timeline-text">
                Developed a project focused on organizing and analyzing innovative ideas for sustainable and technological development, aligning concepts with the Sustainable Development Goals (SDGs) and promoting solution-oriented thinking.
              </p>
            </li>

            <li className="timeline-item">
              <h4 className="h4 timeline-item-title">Web-Based Environmental Monitoring and Sustainability Reporting System</h4>
              <span>Personal Project</span>
              <p className="timeline-text">
                Built a Sustainability Outcome Measurement System providing a simple, reliable platform for recording, storing, and reviewing sustainability-related data such as energy consumption, water usage, waste generation, and associated environmental impact metrics. The system supports secure user authentication, role-based access, and basic CRUD operations to manage sustainability records.
              </p>
            </li>
          </ol>

          <section className="resume-download" style={{ textAlign: 'center', margin: '30px 0' }}>
            <a
              href="https://drive.google.com/file/d/1CfidgjDKBzi8afNejqWaAGMdjZHk324L/view?usp=drive_link"
              className="form-btn"
              target="blank"
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
