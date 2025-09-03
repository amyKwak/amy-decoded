"use client";

import Header from "../components/Header";

const Projects = () => {
  return (
    <div className="page-wrapper">
      <Header />
      <div className="links">
        <a href="/projects/pillpal" className="link">
          PillPal
        </a>
      </div>
      <style jsx>{`
        .page-wrapper {
          min-height: 100%;
        }
        .links {
          display: flex;
          width: 100%;
          justify-content: center;
          height: 100vh;
          align-items: center;
        }
        .link {
          font-weight: bold;
          color: var(--color-text);
          font-size: 2rem;
        }
        .link:hover {
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
};

export default Projects;
