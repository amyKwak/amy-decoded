"use client";
import { useEffect, useState } from "react";

const endpoint = "https://www.reddit.com/r/pics/hot.json?limit=10";

const Practice = () => {
  const [images, setImages] = useState([]);

  const fetchImages = async () => {
    const response = await fetch(endpoint);
    console.log(response);
    if (response.ok) {
      const json = await response.json();
      const pics = json.data.children
        .map((post) => {
          return { id: post.data.id, url: post.data.url };
        })
        .filter((image) => image.url.includes(".jpeg"));

      setImages(pics);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="body">
      <h1>Slider</h1>
      <div className="slider">
        <div className="slides">
          {images.map((image) => {
            const { id, url } = image;
            return (
              <div key={id} className="slide">
                <img src={url} />
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .body {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .slider {
          width: 100%;
        }

        .slides {
          display: flex;
          max-height: 500px;
          overflow-x: auto;
        }

        .slide img {
        }
      `}</style>
    </div>
  );
};

export default Practice;
