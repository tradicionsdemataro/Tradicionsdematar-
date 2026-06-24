// overlay.jsx
import React, { useState, useEffect } from "react";
import "./overlay.css";
import SearchContent from "./SearchContent.jsx";

const Overlay = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 450);
  };

  // Tancar amb ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Bloquejar scroll del body quan overlay obert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`search-overlay ${isOpen && !isClosing ? "activo" : ""} ${isClosing ? "cerrando" : ""}`}
    >
      <div className="navbar-clone" />
      <div className="overlay-backdrop" onClick={handleClose} />

      {/* Botó tancar — visible sempre, accessible en mobile */}
      <button
        className="overlay-close"
        onClick={handleClose}
        aria-label="Tancar cerca"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="2" y1="2" x2="14" y2="14" />
          <line x1="14" y1="2" x2="2" y2="14" />
        </svg>
      </button>

      <SearchContent onClose={handleClose} />
    </div>
  );
};

export default Overlay;