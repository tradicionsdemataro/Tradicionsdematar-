import React from "react";
import Navbar from "../../navbarComponente/navbar.jsx";
import Footer from "../../../components/footerComponente/footer.jsx";

import "./priv.css";

const PoliticasPrivacitat = () => {
  return (
    <>
      <Navbar />

      <main className="priv">

        {/* HERO */}
        <header className="priv-hero">
          <div className="priv-hero-inner">

            <span className="priv-kicker">
              POLÍTICA LEGAL
            </span>

            <h1>
              Política de
              <span> Privacitat</span>
            </h1>

            <p>
              Informació clara sobre com es gestionen les dades, cookies i la navegació
              dins del web de Tradicions de Mataró.
            </p>

          </div>

          <div className="priv-bg">DATA</div>
        </header>

        {/* CONTENT */}
        <section className="priv-content">

          {/* INTRO CARD */}
          <article className="priv-card highlight">
            <h2>Resum</h2>
            <p>
              Aquest lloc web utilitza cookies pròpies i de tercers per millorar
              l’experiència de l’usuari, analitzar l’ús del web i garantir el correcte funcionament.
            </p>
          </article>

          {/* GRID */}
          <div className="priv-grid">

            <article className="priv-box">
              <h3>Cookies</h3>
              <p>Arxius que recorden preferències i sessions de navegació.</p>
            </article>

            <article className="priv-box">
              <h3>Analítica</h3>
              <p>Permeten entendre com s’utilitza el lloc web.</p>
            </article>

            <article className="priv-box">
              <h3>Control</h3>
              <p>L’usuari pot eliminar-les des del navegador en qualsevol moment.</p>
            </article>

          </div>

          {/* TEXT BLOCK */}
          <article className="priv-card">
            <h2>Què és una cookie?</h2>
            <p>
              Una cookie és un fitxer petit que s’emmagatzema al dispositiu de l’usuari
              per recordar informació bàsica de navegació.
            </p>
          </article>

          <article className="priv-card">
            <h2>Ús de la informació</h2>
            <p>
              Les dades recollides s’utilitzen exclusivament amb finalitats tècniques
              i estadístiques per millorar el servei.
            </p>
          </article>

          {/* FOOTER */}
          <footer className="priv-footer">
            <span>© 2015–2025 Tradicions de Mataró</span>
            <h3>Teixint tradicions, creant futur</h3>
          </footer>

        </section>

      </main>
            <Footer />
      
    </>
  );
};

export default PoliticasPrivacitat;