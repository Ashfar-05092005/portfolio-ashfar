import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "../Stylesheet.css";
import polymer from "../images/Polymer-01.jpg"; 
import tcs from "../images/tcs certificate.jpg"// Ensure the path is correct
const blogPostsData = [
  {
    id: 1,
    title: "Polymer coated urea fertilizer ",
    category: "agriculture",
    date: "10/1/2025",
    content: "Exploring the intersection of technology and agriculture to create innovative solutions for modern farming challenges.",
    imageUrl: polymer,
    link: "https://jchr.org/index.php/JCHR/article/view/12804"
  },
    {
      id: 2,
      title: "TCS CodeVita Season 13 Certificate",
      category: "Technology",
      date: "10/1/2025",
      content: "This certificate is awarded to individuals who have successfully participated in the TCS CodeVita Season 13 coding competition, demonstrating their programming skills and problem-solving abilities.",
      imageUrl: tcs,
      link: "#"
    }
  
];

const Blog = ({ isActive }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSelectOpen, setSelectOpen] = useState(false);

  const handleFilterClick = (category) => {
    setActiveFilter(category);
  };

  const handleSelectItemClick = (category) => {
    setActiveFilter(category);
    setSelectOpen(false);
  };

  const categories = ['all', 'technology', 'web development', 'agriculture'];

  return (
    <article className={`blog ${isActive ? 'active' : ''}`} data-page="blog">
      <header>
        <h2 className="h2 article-title">Blog</h2>
      </header>

      <section className="blog-posts">
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
          {blogPostsData.map(post => {
            const visible = activeFilter === 'all' || activeFilter === post.category;
            return (
              <li
                className={`project-item ${visible ? 'active' : ''}`}
                data-filter-item
                data-category={post.category}
                key={post.id}
              >
                {post.link ? (
                  <a href={post.link} target="_blank" rel="noopener noreferrer">
                    <figure className="project-img">
                      <div className="project-item-icon-box">
                        <ion-icon name="eye-outline"></ion-icon>
                      </div>
                      <img src={post.imageUrl} alt={post.title} loading="lazy" />
                    </figure>
                    <h3 className="project-title">{post.title}</h3>
                    <p className="project-category">{post.category.charAt(0).toUpperCase() + post.category.slice(1)}</p>
                  </a>
                ) : (
                  // accessible non-link fallback: use a button styled like the card
                  <button
                    type="button"
                    className="project-card-button"
                    onClick={() => { /* add behaviour: open modal / navigate / copy link, etc. */ }}
                    aria-label={`Open ${post.title}`}
                  >
                    <figure className="project-img">
                      <div className="project-item-icon-box">
                        <ion-icon name="eye-outline"></ion-icon>
                      </div>
                      <img src={post.imageUrl} alt={post.title} loading="lazy" />
                    </figure>
                    <h3 className="project-title">{post.title}</h3>
                    <p className="project-category">{post.category.charAt(0).toUpperCase() + post.category.slice(1)}</p>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
};

export default Blog;
