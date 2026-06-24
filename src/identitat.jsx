import React from "react";
import Navbar from "./components/navbarComponente/navbar";
import Footer from "./components/footerComponente/footer";
import "./css/identitat.css";

export default function IdentitatCorporativa() {
  const logos = [
    {
      nom: "Tradicions de Mataró Positiu",
      desc: "Versió principal del logotip per a aplicacions sobre fons clars.",
      img: "/images/tradicionslogo3.png",
      pdf: "/pdf/tradicions.pdf",
    },
    {
      nom: "Tradicions de Mataró Negatiu",
      desc: "Versió adaptada per a aplicacions sobre fons foscos.",
      img: "/images/tradicionslogo1.png",
      pdf: "/pdf/tradicions.pdf",
    },
    {
      nom: "Tradicions de Mataró Blanc",
      desc: "Versió monocroma per a aplicacions especials.",
      img: "/images/tradicionslogo2.png",
      pdf: "/pdf/tradicions.pdf",
    },
  ];

  const colors = [
    { hex: "#F2D57E", nom: "Groc Sorra", desc: "Color principal de la identitat visual." },
    { hex: "#1F1E40", nom: "Blau Nit", desc: "Color institucional principal." },
    { hex: "#F2637E", nom: "Rosa Coral", desc: "Color complementari d'accent." },
  ];

  return (
    <>
      <Navbar />

      <main className="identitat-page">

        {/* HERO */}
        <section className="identitat-hero">
          <div className="identitat-hero-inner">
            <span className="section-index light">IDENTITAT CORPORATIVA</span>

            <h1 className="identitat-title">
              Identitat<br />
              <span className="accent-word">Corporativa</span>
            </h1>

            <p className="identitat-subtitle">
              Recursos oficials d'identitat visual per garantir una comunicació coherent i recognoscible.
            </p>
          </div>

          <span className="identitat-bg">BRAND</span>
        </section>

        {/* INTRO */}
        <section className="identitat-section">
          <div className="identitat-card">
            <span className="identitat-label">Publicat per Tradicions de Mataró</span>

            <h2>Identitat Corporativa / Institucional</h2>

            <p>
              Tradicions de Mataró posa a disposició els seus recursos gràfics oficials.
            </p>

            <blockquote>
              Oferim recursos d’identitat visual per garantir coherència en totes les accions.
            </blockquote>
          </div>
        </section>

        {/* LOGOS */}
        <section className="identitat-section">
          <div className="section-heading">
            <span className="section-line"></span>
            <h2>Logotips Oficials</h2>
          </div>

          <div className="logos-grid">
            {logos.map((logo, i) => (
              <article className="logo-card" key={i}>
                <div className="logo-preview">
                  <img src={logo.img} alt={logo.nom} />
                </div>

                <div className="logo-content">
                  <span className="logo-type">LOGOTIP</span>
                  <h3>{logo.nom}</h3>
                  <p>{logo.desc}</p>

                  <a
                    href={logo.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-btn"
                  >
                    VEURE PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* PDF (IMPORTANT) */}
        <section className="identitat-section">
          <div className="section-heading">
            <span className="section-line"></span>
            <h2>Fullet Corporatiu (PDF)</h2>
          </div>

          <div className="pdf-wrapper">
            <div className="pdf-frame">
              <iframe
                src="/pdf/tradicions.pdf"
                title="Fullet Corporatiu"
              />
            </div>

            <div className="pdf-info">
              <h3>Fullet institucional oficial</h3>
              <p>
                Document complet amb identitat, valors i comunicació de Tradicions de Mataró.
              </p>

              <a
                href="/pdf/tradicions.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="download-btn primary"
              >
                OBIR PDF
              </a>
            </div>
          </div>
        </section>

        {/* COLORS */}
        <section className="identitat-section">
          <div className="section-heading">
            <span className="section-line"></span>
            <h2>Colors Corporatius</h2>
          </div>

          <div className="colors-grid">
            {colors.map((c, i) => (
              <article className="color-card" key={i}>
                <div className="color-preview" style={{ background: c.hex }} />
                <div className="color-info">
                  <span className="color-hex">{c.hex}</span>
                  <h3>{c.nom}</h3>
                  <p>{c.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}