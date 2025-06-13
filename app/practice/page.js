"use client";

import { useEffect, useState, useRef } from "react";

const PracticePage = ({ count = 10 }) => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const endpoint = `https://picsum.photos/v2/list?limit=${count}`;
        const response = await fetch(endpoint);
        if (!response.ok)
          throw new Error(`Picsum API error: ${response.status}`);
        const data = await response.json();
        const formatted = data.map((photo) => ({
          id: photo.id,
          url: photo.download_url,
          alt: `Photo by ${photo.author}`,
        }));
        setImages(formatted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [count]);

  const scroll = (offset) => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      containerRef.current.scrollBy({
        left: offset * width,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <div className="state">Loading images...</div>;
  if (error) return <div className="state error">Error: {error}</div>;

  return (
    <div className="carousel">
      <button
        onClick={() => scroll(-1)}
        className="nav-button prev"
        aria-label="Previous"
      >
        &#8592;
      </button>

      <div className="slides" ref={containerRef}>
        {images.map((img) => (
          <div key={img.id} className="slide">
            <img src={img.url} alt={img.alt} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll(1)}
        className="nav-button next"
        aria-label="Next"
      >
        &#8594;
      </button>

      <style jsx>{`
        .state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 256px;
          font-size: 1rem;
        }
        .error {
          color: #e00;
        }
        .carousel {
          position: relative;
          width: 100%;
        }
        .slides {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
        }
        .slide {
          flex-shrink: 0;
          width: 100%;
          scroll-snap-align: start;
        }
        .slide img {
          width: 100%;
          height: auto;
          object-fit: cover;
          border-radius: 8px;
        }
        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.8);
          border: none;
          padding: 8px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
        .nav-button.prev {
          left: 16px;
        }
        .nav-button.next {
          right: 16px;
        }
      `}</style>
    </div>
  );
};

export default PracticePage;
