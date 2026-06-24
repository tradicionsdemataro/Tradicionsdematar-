import React from "react";
import "./index.css";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-glow footer-glow-1"></div>
      <div className="footer-glow footer-glow-2"></div>

      <div className="footer-top">

        <div className="footer-brand">
          <span className="footer-index">TRADICIONS · DE MATARÓ</span>

          <div className="footer-logo-row">
            <img src="/images/logo-footer.png" alt="Tradicions de Mataró" className="footer-logo" />
            <span className="footer-logo-divider" aria-hidden="true"></span>
            <img src="/images/cercavila_logo.svg" alt="Cercavila" className="footer-logo footer-logo-svg" />
          </div>

          <h2 className="footer-headline">
            Teixint <span className="accent-word">tradicions</span>,<br />
            creant <span className="accent-blue">futur</span>.
          </h2>

          <a href="/contacte" className="footer-btn">
            Contacta amb nosaltres
          </a>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Contacte</h3>
          <ul className="footer-list">
            <li>Ronda O'Donnell, 08302 Mataró</li>
            <li>
              <a href="mailto:info@tradicionsdemataro.cat">info@tradicionsdemataro.cat</a>
            </li>
            <li>
              <a href="tel:+34600000000">+34 600 000 000</a>
            </li>
            <li>
              <a href="Horari: Atencio">Dilluns a Divendres: 10:00 – 14:00 i de 16:00  - 20:30</a>
            </li>
            <li>
              <a href="Horari: Atencio">Dissabtes i Diumenges: 08:00 – 14:00 | 16:00 – 20:30</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Navegació</h3>
          <ul className="footer-list">
            <li><a href="/home">Inici</a></li>
            <li><a href="/contacte">Contacte</a></li>
            <li><a href="/politica/privacitat">Política de privacitat</a></li>
            <li><a href="/politica/xarxes">Política de xarxes</a></li>
            <li><a href="/politica/avisLegal">Avìs legal</a></li>
          </ul>
        </div>

        <div className="footer-col footer-social-col">
          <h3 className="footer-col-title">Segueix-nos</h3>

          <div className="social-list">
            <a href="https://www.instagram.com/tradicionsdemataro" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="ti ti-brand-instagram" aria-hidden="true"></i>
              <span>Instagram</span>
            </a>
            <a href="https://www.tiktok.com/@tradicionsdemataro" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="ti ti-brand-tiktok" aria-hidden="true"></i>
              <span>TikTok</span>
            </a>
            <a href="https://www.youtube.com/channel/UCpMtIIlyod3HaPb5Lwl52qw" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="ti ti-brand-youtube" aria-hidden="true"></i>
              <span>YouTube</span>
            </a>
            <a href="https://www.threads.com/login/?next=https%3A%2F%2Fwww.threads.com%2F%40tradicionsdemataro%25C3%25A7%2F" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="ti ti-brand-threads" aria-hidden="true"></i>
              <span>Threads</span>
            </a>
            <a href="https://x.com/mataro_de" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="ti ti-link" aria-hidden="true"></i>
              <span>Twitter</span>
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-mark">
          <span className="footer-mark-icon">TM</span>
          <span className="footer-mark-text">Tradicions de Mataró</span>
        </div>

        <div className="footer-bottom-text">
          <p>© 2015–2026 Tradicions de Mataró</p>
          <span>Tots els drets reservats</span>
        </div>
      </div>

    </footer>
  );
}