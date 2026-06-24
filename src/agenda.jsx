import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/navbarComponente/navbar.jsx";
import Footer from "./components/footerComponente/footer.jsx";
import "./css/agenda.css";

const FEATURES = [
  {
    emoji: "🎪",
    titol: "Festes populars",
    desc: "Gegants, cercaviles, tradicions úniques i tot tipus d'actes culturals de Mataró.",
    color: "var(--yellow)",
  },
  {
    emoji: "🎭",
    titol: "Esdeveniments culturals",
    desc: "Teatre, música i activitats familiars, amb cobertura completa de Tradicions de Mataró.",
    color: "var(--blue)",
  },
  {
    emoji: "🗺️",
    titol: "Per tot Catalunya",
    desc: "Assistim i cobrim esdeveniments per garantir que la cultura local arribi a tothom.",
    color: "var(--pink)",
  },
];

const STATS = [
  { num: "150+", label: "Actes coberts",    color: "var(--yellow)" },
  { num: "10+",  label: "Anys d'activitat", color: "var(--blue)"   },
  { num: "365",  label: "Dies a l'any",     color: "var(--pink)"   },
];

const Agenda = () => {
  const [showContent, setShowContent] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  const scrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Navbar />

      <div className={`agenda-page ${showContent ? "show" : ""}`}>

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="agenda-hero">
          <div className="agenda-hero-inner">
            <span className="section-index light">AGENDA</span>
            <h1 className="agenda-hero-title">
              CALENDARI<br />
              <span className="accent-word">CULTURAL</span>
            </h1>
            <p className="agenda-hero-sub">
              Tots els esdeveniments de Tradicions de Mataró al teu abast
            </p>
            <button className="agenda-hero-btn" onClick={scrollToCalendar}>
              Veure el calendari <span className="agenda-hero-btn-arrow">↓</span>
            </button>
          </div>

          {/* Stats flotants */}
          <div className="agenda-hero-stats">
            {STATS.map((s, i) => (
              <div className="agenda-hero-stat" key={i}>
                <span className="agenda-hero-stat-num" style={{ color: s.color }}>{s.num}</span>
                <span className="agenda-hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <span className="agenda-hero-bg">AGENDA</span>
        </section>

        {/* ── INTRO + IMATGE ────────────────────────────────── */}
        <section className="agenda-intro">
          <div className="agenda-intro-inner">

            <div className="agenda-intro-text-col">
              <span className="section-index">01 / AGENDA</span>
              <h2 className="agenda-intro-title">
                Estigues al dia<br />
                de tot el que passa<br />
                a <span className="accent-word">Mataró</span>
              </h2>
              <p className="agenda-intro-body">
                A Tradicions de Mataró t'oferim tota la informació sobre les festes,
                celebracions i activitats culturals que no et pots perdre.
                Consulta el nostre calendari i afegeix els esdeveniments al teu diari.
              </p>
              <button className="agenda-intro-cta" onClick={scrollToCalendar}>
                Anar al calendari →
              </button>
            </div>

            <div className="agenda-intro-img-col">
              <div className="agenda-intro-img-frame">
                <img src="/images/gegants-cercavila.jpg" alt="Tradicions de Mataró" />
                <div className="agenda-intro-img-overlay" />
              </div>
              <div className="agenda-intro-img-badge">
                <span className="agenda-intro-img-badge-num">2015</span>
                <span className="agenda-intro-img-badge-label">Fundació</span>
              </div>
            </div>

          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────── */}
        <section className="agenda-features">
          {FEATURES.map((f, i) => (
            <div className="agenda-feat-card" key={i}>
              <span className="agenda-feat-num">0{i + 1}</span>
              <span className="agenda-feat-emoji">{f.emoji}</span>
              <div className="agenda-feat-line" style={{ background: f.color }} />
              <h3 style={{ color: f.color }}>{f.titol}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </section>

        {/* ── CALENDAR ──────────────────────────────────────── */}
        <section className="agenda-calendar-section" ref={calendarRef}>
          <div className="agenda-calendar-header">
            <span className="section-index light">02 / CALENDARI</span>
            <h2 className="agenda-calendar-title">
              Tots els <span className="accent-word">esdeveniments</span>
            </h2>
            <p className="agenda-calendar-sub">
              Fes clic a qualsevol acte per veure'n els detalls i afegir-lo al teu calendari.
            </p>
          </div>

          <div className="agenda-calendar-wrapper">
            <div className="agenda-calendar-topbar">
              <span className="agenda-calendar-dot" style={{ background: "var(--yellow)" }} />
              <span className="agenda-calendar-dot" style={{ background: "var(--blue)" }} />
              <span className="agenda-calendar-dot" style={{ background: "var(--pink)" }} />
              <span className="agenda-calendar-label">GOOGLE CALENDAR · TRADICIONS DE MATARÓ</span>
            </div>
            <iframe
              src="https://calendar.google.com/calendar/embed?height=1200&wkst=2&ctz=Europe%2FMadrid&mode=MONTH&hl=ca&src=dHJhZGljaW9uc2RlbWF0YXJvQGdtYWlsLmNvbQ&color=%23ffd25a"
              frameBorder="0"
              scrolling="no"
              title="Calendari Tradicions Mataró"
              loading="lazy"
              className="agenda-iframe"
            />
          </div>
        </section>

    

      </div>

      <Footer />
    </>
  );
};

export default Agenda;