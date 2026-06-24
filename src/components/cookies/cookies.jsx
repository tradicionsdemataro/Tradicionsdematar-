import React, { useState, useEffect } from "react";
import "./cookies.css";

const Cookies = () => {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookiesAccepted");
    if (!accepted) setVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setVisible(false);
    setShowConfig(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="cookies-bar">
        <p>
          Utilitzem cookies per millorar l'experiència de navegació a{" "}
          <strong>Tradicions de Mataró</strong>.
        </p>

        <div className="cookies-actions">
          <button className="cookies-accept" onClick={acceptCookies}>
            Acceptar
          </button>
          <button
            className="cookies-config"
            onClick={() => setShowConfig(true)}
          >
            Configuració
          </button>
        </div>
      </div>

      {showConfig && (
  <div className="cookies-modal-overlay">
    <div className="cookies-modal privacy">
      <button
        className="cookies-modal-close"
        onClick={() => setShowConfig(false)}
      >
        ✕
      </button>

      <h2>Resum de privacitat</h2>
      <p className="cookies-intro">
        Aquest lloc web utilitza galetes per proporcionar la millor experiència
        d’usuari possible.
      </p>

      <div className="cookies-section">
        <h4>Galetes estrictament necessàries</h4>
        <p>
          Les galetes estrictament necessàries han d’estar sempre activades
          perquè puguem desar les preferències per a la configuració de galetes.
        </p>

        <label className="cookie-toggle disabled">
          <input type="checkbox" checked disabled />
          <span>Activades</span>
        </label>
      </div>

      <div className="cookies-section">
        <h4>Analítica</h4>
        <p>
          Aquest lloc web utilitza Google Analytics per recopilar informació
          anònima com el nombre de visitants del lloc i les pàgines més visitades.
        </p>

        <label className="cookie-toggle">
          <input type="checkbox" />
          <span>Activada</span>
        </label>
      </div>

      <div className="cookies-links">
        <a href="/politica/privacitat">Política de privacitat</a> |{" "}
        <a href="/politica/xarxes">Política de xarxes socials</a> |{" "}
        <a href="/politica/avisLegal">Avís legal</a>
      </div>

      <div className="cookies-modal-actions">
        <button onClick={acceptCookies} className="primary">
          Desa els canvis
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default Cookies;
