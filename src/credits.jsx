import React from "react";
import Navbar from "./components/navbarComponente/navbar";
import Footer from "./components/footerComponente/footer";
import "./css/credits.css";

export default function Credits() {
  return (
    <>
      <Navbar />

      <main className="credits-page">

        {/* HERO */}
        <section className="credits-hero">
          <div className="credits-hero-inner">
            <span className="section-index light">INFORMACIÓ LEGAL</span>

            <h1 className="credits-title">
              Crèdits i
              <br />
              <span className="accent-word">Subjecte</span>
            </h1>

            <p className="credits-subtitle">
              Informació sobre la titularitat, autoria i condicions d'ús dels
              continguts publicats per Tradicions de Mataró.
            </p>
          </div>

          <span className="credits-bg">CRÈDITS</span>
        </section>

        {/* CONTINGUT */}
        <section className="credits-content">

          <article className="credits-card">
            <span className="credits-label">
              Publicat per Tradicions de Mataró
            </span>

            <h2>Llicència Creative Commons</h2>

            <p>
              "Tradicions de Mataró" està subjecte a una llicència de Creative
              Commons Reconeixement-NoComercial-SenseObraDerivada 3.0
              (CC BY-NC-ND 3.0).
            </p>

            <p>
              Es permet la reproducció de l'obra sempre que es reconegui la
              font original. No es permet l'ús comercial del contingut ni la
              seva modificació. Les obres derivades no estan autoritzades.
            </p>

            <a
              href="https://creativecommons.org/licenses/by-nc-nd/3.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="credits-link"
            >
              Veure la llicència completa →
            </a>
          </article>

          <article className="credits-card">
            <span className="credits-label">Crèdits</span>

            <h2>Direcció i coordinació</h2>

            <div className="credits-info">
              <p>
                <strong>Redacció de Comunicació</strong>
              </p>

              <p>
                Ronda O'Donell<br />
                08302 Mataró, Barcelona
              </p>

              <p>
                <strong>Correu electrònic:</strong><br />
                redacciotradicionsdemataro@gmail.com
              </p>
            </div>
          </article>

          <article className="credits-card">
            <span className="credits-label">Propietat intel·lectual</span>

            <h2>Drets d'autor</h2>

            <p>
              © 2015–2025 Tradicions de Mataró. Tots els drets reservats.
            </p>

            <blockquote>
              Teixint tradicions, creant futur.
            </blockquote>

            <p>
              <strong>Maquetació i desenvolupament web:</strong><br />
              Tradicions de Mataró
            </p>

            <p>
              <strong>Fotografies:</strong><br />
              Les imatges publicades en aquest lloc web són propietat de
              Tradicions de Mataró del Maresme.
            </p>
          </article>

        </section>

      </main>

      <Footer />
    </>
  );
}