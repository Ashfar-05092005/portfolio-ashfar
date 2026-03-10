import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "../Stylesheet.css"; 
import project1Img from "../images/ai-summary-generator-.png";
import project2Img from "../images/Throught towards development.png";
const projectsData = [
  {
    id: 1,
    title: "Thoughts Towards Development",
    category: "applications",
    imageUrl: project2Img, 
    link: "https://throughts-towards-development.onrender.com",
  },
  {
    id: 2,
    title: "coming soon................",
    category: "web development",
    imageUrl: project1Img,
    link: "#"
  },
  {
    id: 3,
    title: "coming soon................",
    category: "applications",
    imageUrl: project2Img,
    link: "https://throughts-towards-development.onrender.com",
    
  }
];

const Portfolio = ({ isActive }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSelectOpen, setSelectOpen] = useState(false);

  const handleFilterClick = (category) => {
    setActiveFilter(category);
  };

  const handleSelectItemClick = (category) => {
    setActiveFilter(category);
    setSelectOpen(false);
  };

  const categories = ['all', 'applications', 'web development'];

  return (
    <article className={`portfolio ${isActive ? 'active' : ''}`} data-page="portfolio">
      <header>
        <h2 className="h2 article-title">Portfolio</h2>
      </header>

      <section className="projects">
        <ul className="filter-list">
          {categories.map(category => (
            <li className="filter-item" key={category}>
              <button
                className={activeFilter === category ? 'active' : ''}
                onClick={() => handleFilterClick(category)}
                data-filter-btn
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        <div className={`filter-select-box ${isSelectOpen ? 'active' : ''}`}>
          <button className="filter-select" data-select onClick={() => setSelectOpen(!isSelectOpen)}>
            <div className="select-value" data-selecct-value>
              {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
            </div>
            <div className="select-icon">
              <ion-icon name="chevron-down"></ion-icon>
            </div>
          </button>
          <ul className="select-list">
            {categories.map(category => (
              <li className="select-item" key={category}>
                <button onClick={() => handleSelectItemClick(category)} data-select-item>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <ul className="project-list">
          {projectsData.map(project => (
            <li
              className={`project-item ${activeFilter === 'all' || activeFilter === project.category ? 'active' : ''}`}
              data-filter-item
              data-category={project.category}
              key={project.id}
            >
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <figure className="project-img">
                  <div className="project-item-icon-box"> 
                    <ion-icon name="eye-outline"></ion-icon>
                  </div>    
                  <img src={project.imageUrl} alt={project.title} loading="lazy" />
                </figure>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-category">{project.category.charAt(0).toUpperCase() + project.category.slice(1)}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
};

export default Portfolio;
