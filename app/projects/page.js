"use client";

const Projects = () => {
  return (
    <div className="page">
      <a href="/projects/pillpal" className="link">
        PillPal
      </a>
      <style jsx>{`
        .page {
          max-width: 500px;
          min-height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto;
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
