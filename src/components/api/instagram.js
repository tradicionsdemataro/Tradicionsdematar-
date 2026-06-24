import React, { useEffect, useRef } from "react";

const InstagramEmbed = ({ posts }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Carrega el script només si encara no existeix
    if (!window.instgrm) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = () => {
        window.instgrm.Embeds.process();
      };
      document.body.appendChild(script);
    } else {
      // Ja existeix, només processa els nous embed blocks
      window.instgrm.Embeds.process();
    }
  }, [posts]);

  return (
    <div ref={containerRef} className="instagram-grid">
      {posts.map((post) => (
        <div key={post.id} className="instagram-card">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={post.url}
            data-instgrm-version="14"
          ></blockquote>
        </div>
      ))}
    </div>
  );
};

export default InstagramEmbed;
