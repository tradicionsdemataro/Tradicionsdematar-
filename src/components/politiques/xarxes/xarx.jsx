import React from "react";
import Navbar from "../../navbarComponente/navbar.jsx";
import Footer from "../../../components/footerComponente/footer.jsx";

import "./xarx.css";

const PoliticaXarxes = () => {
  return (
    <>
      <Navbar />

      <main className="xarxes-page">

        {/* HERO */}
        <section className="xarxes-hero">
          <div className="xarxes-hero-content">
            <span className="xarxes-tag">POLÍTICA · XARXES SOCIALS</span>

            <h1>
              Xarxes socials i <span>Privacitat</span>
            </h1>

            <p>
              Informació sobre com gestionem la presència digital,
              interaccions i dades a les nostres xarxes socials.
            </p>
          </div>

          <div className="xarxes-bg-text">SOCIAL</div>
        </section>

        {/* CONTENT */}
        <section className="xarxes-container">

          <div className="xarxes-card">
            <h2>Informació general</h2>
            <p>
              Tradicions de Mataró utilitza les xarxes socials com a canal
              d’informació cultural, difusió d’activitats i comunicació amb la ciutadania.
            </p>
          </div>

          <div className="xarxes-grid">

            <article className="xarxes-box">
              <h3>Ús de dades</h3>
              <p>
                Les dades es tracten únicament per respondre interaccions,
                consultes i difusió d’activitats.
              </p>
            </article>

            <article className="xarxes-box">
              <h3>Finalitat</h3>
              <p>
                Informar sobre esdeveniments, cultura i activitats locals
                relacionades amb Mataró.
              </p>
            </article>

            <article className="xarxes-box">
              <h3>Control de l’usuari</h3>
              <p>
                L’usuari pot configurar la privacitat del seu perfil
                en qualsevol moment.
              </p>
            </article>

            <article className="xarxes-box">
              <h3>Menors</h3>
              <p>
                No ens fem responsables de l’ús de xarxes per menors sense supervisió legal.
              </p>
            </article>

          </div>

          <div className="xarxes-card highlight">
            <h2>Drets de l’usuari</h2>
            <ul>
              <li>Accés i rectificació de dades</li>
              <li>Eliminació de dades personals</li>
              <li>Oposició al tractament</li>
              <li>Reclamació davant l’AEPD</li>
            </ul>

            <p>
              Contacte: tradicionsdemataro@gmail.com
            </p>
          </div>

          <div className="xarxes-footer">
            <p>© 2015–2025 Tradicions de Mataró</p>
            <h3>Teixint tradicions, creant futur</h3>
          </div>

        </section>

      </main>
       <Footer />
      
    </>
  );
};

export default PoliticaXarxes;