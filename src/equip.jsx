import React, { useState, useEffect } from "react";
import Navbar from "./components/navbarComponente/navbar.jsx";
import Footer from "./components/footerComponente/footer.jsx";
import "./css/equip.css";

const membres = [
  { nom: "Carles Rigat", email: "carlesrigat@gmail.com", carrec: "Director" },
  { nom: "Carla Baños", email: "carlabanosna@gmail.com", carrec: "Redacció" },
  { nom: "Carol García", email: "carollunagarcia@gmail.com", carrec: "Redacció" },
  { nom: "Patrin Domenech", email: "patdollo@hotmail.com", carrec: "Col·laboradora" },
  { nom: "Javi Jurado", email: "jaba000@hotmail.com", carrec: "Fotografia" },
  { nom: "Toni Guirao", email: "tnguirao@gmail.com", carrec: "Col·laborador" },
  { nom: "Susana Roca", email: "srocaf@gmail.com", carrec: "Redacció" },
  { nom: "Óscar Ruiz", email: "oscar.rgall258@gmail.com", carrec: "Comunicació" },
  { nom: "Elisenda Roig", email: "roignomse@gmail.com", carrec: "Col·laboradora" },
  { nom: "Aniol Rodríguez", email: "aniolrodriguez@gmail.com", carrec: "Desenvolupador de la web" },
];

const Equip = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
   <>
  <Navbar />

  <main className="equip-page">

    {/* HERO */}

    <section className="equip-hero">
      <div className="equip-hero-inner">

        <span className="section-index light">
          01 / EQUIP
        </span>

        <h1 className="equip-hero-title">
          LES PERSONES<br />
          <span>QUE FAN CULTURA</span>
        </h1>

        <p className="equip-hero-sub">
          Un equip compromès amb la divulgació,
          la cultura popular i la memòria col·lectiva
          de Mataró.
        </p>

      </div>

      <span className="equip-hero-bg">
        EQUIP
      </span>
    </section>

    {/* PRESENTACIÓ */}

    <section className="equip-intro">

      <div className="equip-intro-grid">

        <div>
          <span className="section-index">
            02 / PRESENTACIÓ
          </span>

          <h2>
            Un projecte construït
            <span> entre persones</span>
          </h2>

          <p>
            Tradicions de Mataró és possible gràcies a
            un grup de persones que comparteixen una
            mateixa passió: preservar i difondre la
            cultura popular de la ciutat.
          </p>

          <p>
            El nostre equip combina experiència,
            creativitat i compromís per generar
            continguts culturals de qualitat.
          </p>

        </div>

        <div className="equip-stats">

          <div className="stat-card">
            <span>10+</span>
            <small>Membres</small>
          </div>

          <div className="stat-card">
            <span>2015</span>
            <small>Des de</small>
          </div>

          <div className="stat-card">
            <span>150+</span>
            <small>Reportatges</small>
          </div>

          <div className="stat-card">
            <span>100%</span>
            <small>Cultura local</small>
          </div>

        </div>

      </div>

    </section>

    {/* DEPARTAMENTS */}

    <section className="equip-areas">

      <span className="section-index">
        03 / ÀREES
      </span>

      <h2 className="section-title">
        Com treballem
      </h2>

      <div className="areas-grid">

        <article>
          <span>✍️</span>
          <h3>Redacció</h3>
          <p>Articles, entrevistes i notícies.</p>
        </article>

        <article>
          <span>📸</span>
          <h3>Fotografia</h3>
          <p>Cobertura visual dels actes.</p>
        </article>

        <article>
          <span>🎥</span>
          <h3>Audiovisual</h3>
          <p>Vídeos i reportatges.</p>
        </article>

        <article>
          <span>🌐</span>
          <h3>Digital</h3>
          <p>Xarxes socials i difusió.</p>
        </article>

      </div>

    </section>

    {/* MEMBRES */}

    <section className="equip-team">

      <span className="section-index">
        04 / MEMBRES
      </span>

      <h2 className="section-title">
        El nostre equip
      </h2>

      <div className="equip-grid">

        {membres.map((membre, i) => (

          <article className="member-card" key={i}>

            <div className="member-avatar">
              {membre.nom
                .split(" ")
                .map(x => x[0])
                .slice(0, 2)
                .join("")}
            </div>

            <span className="member-role">
              {membre.carrec}
            </span>

            <h3>{membre.nom}</h3>

            <a href={`mailto:${membre.email}`}>
              {membre.email}
            </a>

          </article>

        ))}

      </div>

    </section>

  

  </main>

  <Footer />
</>
  );
};

export default Equip;
