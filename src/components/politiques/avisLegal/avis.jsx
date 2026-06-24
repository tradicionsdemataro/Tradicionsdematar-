import React from "react";
import Navbar from "../../navbarComponente/navbar.jsx";
import Footer from "../../../components/footerComponente/footer.jsx";
import "./avis.css";

const CreditsSubjecte = () => {
  return (
    <>
      <Navbar />

      <main className="credits-page">

        {/* HERO */}
        <section className="credits-hero">
          <div className="credits-hero-content">
            <span className="section-tag">INFORMACIÓ LEGAL</span>

            <h1>
              Crèdits i
              <br />
              <span>Subjecte</span>
            </h1>

            <p>
              Informació sobre autoria, propietat intel·lectual,
              drets d'ús i identitat editorial de Tradicions de Mataró.
            </p>
          </div>

          <div className="credits-bg-text">
            CREDITS
          </div>
        </section>

        {/* INFO */}
        <section className="credits-container">

          <div className="credits-card">
            <span className="card-label">
              Publicat per Tradicions de Mataró
            </span>

            <h2>Llicència Creative Commons</h2>

            <p>
              Tradicions de Mataró està subjecte a una llicència
              <strong> Creative Commons Reconeixement-NoComercial-SenseObraDerivada 3.0 (CC BY-NC-ND 3.0)</strong>.
            </p>

            <p>
              Es permet la reproducció del contingut sempre que es reconegui
              l'autoria original. No està permès l'ús comercial ni la
              modificació del material publicat.
            </p>

            <a
              href="https://creativecommons.org/licenses/by-nc-nd/3.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="credits-btn"
            >
              Veure llicència completa
            </a>
          </div>

          <div className="credits-grid">

            <article className="info-card">
              <div className="icon-box">
                <i className="ti ti-building" />
              </div>

              <h3>Direcció i Coordinació</h3>

              <p>
                Redacció de Comunicació
              </p>

              <p>
                Ronda O'Donell<br />
                08302 Mataró
              </p>
            </article>

            <article className="info-card">
              <div className="icon-box">
                <i className="ti ti-mail" />
              </div>

              <h3>Contacte</h3>

              <a href="mailto:redacciotradicionsdemataro@gmail.com">
                redacciotradicionsdemataro@gmail.com
              </a>
            </article>

            <article className="info-card">
              <div className="icon-box">
                <i className="ti ti-code" />
              </div>

              <h3>Desenvolupament</h3>

              <p>
                Maquetació i desenvolupament web
                realitzat per Tradicions de Mataró.
              </p>
            </article>

            <article className="info-card">
              <div className="icon-box">
                <i className="ti ti-camera" />
              </div>

              <h3>Fotografies</h3>

              <p>
                Les imatges publicades en aquest lloc web són
                propietat de Tradicions de Mataró.
              </p>
            </article>

          </div>

          <div className="copyright-box">
            <span>© 2015–2025 Tradicions de Mataró</span>

            <h3>
              Teixint tradicions, creant futur
            </h3>

            <p>
              Tots els drets reservats.
            </p>
          </div>

        </section>

      </main>

      <Footer />
    </>
  );
};

export default CreditsSubjecte;