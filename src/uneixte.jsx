import React, { useState } from "react";
import Navbar from "./components/navbarComponente/navbar.jsx";
import Footer from "./components/footerComponente/footer.jsx";
import "./css/uneixte.css";

// ─── Dades estàtiques ────────────────────────────────────────────────────────

const BENEFICIS = [
  {
    icon: "🎭",
    titol: "Visibilitat cultural",
    desc: "Forma part d'un projecte referent a Mataró i dóna-li veu als teus projectes i passions.",
  },
  {
    icon: "🤝",
    titol: "Xarxa de contactes",
    desc: "Connecta amb persones, entitats i col·lectius que comparteixen el teu amor per la cultura local.",
  },
  {
    icon: "📽️",
    titol: "Producció audiovisual",
    desc: "Aprèn i participa en la creació de reportatges, vídeos i continguts de qualitat.",
  },
  {
    icon: "🌱",
    titol: "Creixement personal",
    desc: "Desenvolupa habilitats en comunicació, periodisme cultural i gestió de projectes.",
  },
];

const AREAS = [
  {
    icon: "📸",
    titol: "Fotografia i Vídeo",
    desc: "Cobertura d'actes, reportatges i arxiu visual de les tradicions de Mataró.",
    tag: "Producció",
  },
  {
    icon: "✍️",
    titol: "Redacció i Blog",
    desc: "Articles, entrevistes i cròniques sobre cultura popular i patrimoni local.",
    tag: "Comunicació",
  },
  {
    icon: "📱",
    titol: "Xarxes Socials",
    desc: "Gestió de continguts digitals, comunitat i estratègia de difusió.",
    tag: "Digital",
  },
  {
    icon: "🎨",
    titol: "Disseny Gràfic",
    desc: "Cartells, materials visuals i identitat gràfica per a activitats i publicacions.",
    tag: "Disseny",
  },
  {
    icon: "🎙️",
    titol: "Locució i Presentació",
    desc: "Conducció d'actes, entrevistes en directe i presentació de continguts.",
    tag: "Escena",
  },
  {
    icon: "🔧",
    titol: "Organització i Logística",
    desc: "Coordinació d'events, voluntariat i suport en actes culturals al llarg de l'any.",
    tag: "Gestió",
  },
];

const FAQS = [
  {
    q: "Cal tenir experiència prèvia?",
    a: "No és necessari. Valorem sobretot les ganes d'aprendre i la implicació amb la cultura local.",
  },
  {
    q: "Quant de temps cal dedicar-hi?",
    a: "Depèn del rol. En general, demanem una dedicació flexible d'algunes hores setmanals, adaptada als esdeveniments.",
  },
  {
    q: "Es tracta d'un voluntariat remunerat?",
    a: "De moment és una col·laboració voluntària, però obrim portes a formació, experiència real i reconeixement públic.",
  },
  {
    q: "Quan rebré resposta?",
    a: "Normalment contestem en un termini de 7–10 dies laborables. Si no reps resposta, posa't en contacte amb nosaltres per email.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

const Uneixte = () => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telefon: "",
    area: "",
    experiencia: "",
    motivacio: "",
  });
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState("idle"); // idle | loading | success | error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nom.trim() || formData.nom.trim().length < 2) {
      newErrors.nom = "El nom ha de tenir almenys 2 caràcters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email és obligatori";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email no vàlid";
    }

    const phoneRegex = /^[0-9+\s]{6,15}$/;
    if (formData.telefon && !phoneRegex.test(formData.telefon)) {
      newErrors.telefon = "Telèfon no vàlid";
    }

    if (!formData.area) {
      newErrors.area = "Selecciona una àrea";
    }

    if (!formData.motivacio.trim() || formData.motivacio.trim().length < 10) {
      newErrors.motivacio = "La motivació ha de tenir almenys 10 caràcters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");

    try {
      const res = await fetch("http://localhost:5000/solicituds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom:       formData.nom,
          email:     formData.email,
          telefon:   formData.telefon,
          assumpte:  `Uneix-te · ${formData.area}`,
          missatge:  `Experiència: ${formData.experiencia || "No indicada"}\n\nMotivació: ${formData.motivacio}`,
        }),
      });

      if (!res.ok) throw new Error("Error en l'enviament");

      setStatus("success");
      setFormData({ nom: "", email: "", telefon: "", area: "", experiencia: "", motivacio: "" });
      setErrors({});
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <>
      <Navbar />

      <div className="uneixte-page">

        {/* ===== HERO ===== */}
        <section className="uneixte-hero">
          <div className="uneixte-hero-inner">
            <span className="section-index light">UNEIX-TE</span>
            <h1 className="uneixte-title">
              Forma<br />
              part del<br />
              <span className="accent-word">projecte.</span>
            </h1>
            <p className="uneixte-subtitle">
              Busquem persones apassionades per la cultura i les tradicions de Mataró.
              Si vols contribuir, aprendre i créixer amb nosaltres, aquest és el teu lloc.
            </p>
          </div>
          <span className="uneixte-hero-bg">UNEIX-TE</span>
        </section>

        {/* ===== QUICK STATS ===== */}
        <section className="uneixte-quick">
          <div className="uneixte-quick-grid">

            <div className="uneixte-quick-card">
              <span className="uneixte-quick-icon">
                <i className="ti ti-users" />
              </span>
              <span className="uneixte-quick-label">Equip</span>
              <span className="uneixte-quick-value">Voluntaris de Mataró</span>
            </div>

            <div className="uneixte-quick-card">
              <span className="uneixte-quick-icon blue">
                <i className="ti ti-calendar-event" />
              </span>
              <span className="uneixte-quick-label">Actes coberts</span>
              <span className="uneixte-quick-value">+150 reportatges publicats</span>
            </div>

            <div className="uneixte-quick-card">
              <span className="uneixte-quick-icon pink">
                <i className="ti ti-clock" />
              </span>
              <span className="uneixte-quick-label">Dedicació</span>
              <span className="uneixte-quick-value">Flexible · Adaptada als actes</span>
            </div>

            <div className="uneixte-quick-card">
              <span className="uneixte-quick-icon orange">
                <i className="ti ti-map-pin" />
              </span>
              <span className="uneixte-quick-label">On</span>
              <span className="uneixte-quick-value">Mataró i voltants</span>
            </div>

          </div>
        </section>

        {/* ===== BENEFICIS ===== */}
        <section className="uneixte-beneficis">
          <div className="uneixte-beneficis-inner">
            <span className="section-index">QUÈ T'OFERIM</span>
            <h2 className="uneixte-section-title">
              Per què <span className="accent-word">unir-te</span>?
            </h2>

            <div className="beneficis-grid">
              {BENEFICIS.map((b, i) => (
                <div className="benefici-card" key={i}>
                  <span className="benefici-num">0{i + 1}</span>
                  <span className="benefici-icon">{b.icon}</span>
                  <h3>{b.titol}</h3>
                  <p>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== ÀREES ===== */}
        <section className="uneixte-areas">
          <div className="uneixte-areas-inner">
            <span className="section-index light">ÀREES DE COL·LABORACIÓ</span>
            <h2 className="uneixte-section-title">
              On pots <span className="accent-word">aportar</span>?
            </h2>

            <div className="areas-grid">
              {AREAS.map((a, i) => (
                <div className="area-card" key={i}>
                  <span className="area-icon">{a.icon}</span>
                  <h3>{a.titol}</h3>
                  <p>{a.desc}</p>
                  <span className="area-tag">{a.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FORMULARI + INFO ===== */}
        <section className="uneixte-main">

          {/* FORM */}
          <div className="uneixte-form-wrapper">
            <span className="section-index">SOL·LICITUD DE COL·LABORACIÓ</span>
            <h2 className="uneixte-form-title">
              Explica'ns<br />
              qui ets i com<br />
              vols <span className="accent-word">ajudar</span>.
            </h2>

            <form className="uneixte-form" onSubmit={handleSubmit}>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nom">Nom i cognoms</label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    placeholder="El teu nom complet"
                    value={formData.nom}
                    onChange={handleChange}
                  />
                  {errors.nom && <span className="form-error">{errors.nom}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Correu electrònic</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="nom@exemple.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="telefon">Telèfon (opcional)</label>
                  <input
                    type="tel"
                    id="telefon"
                    name="telefon"
                    placeholder="+34 600 000 000"
                    value={formData.telefon}
                    onChange={handleChange}
                  />
                  {errors.telefon && <span className="form-error">{errors.telefon}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="area">Àrea d'interès</label>
                  <select
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Selecciona una àrea</option>
                    {AREAS.map((a) => (
                      <option key={a.titol} value={a.titol}>{a.titol}</option>
                    ))}
                    <option value="Altres">Altres / No ho sé encara</option>
                  </select>
                  {errors.area && <span className="form-error">{errors.area}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="experiencia">Experiència prèvia (opcional)</label>
                <input
                  type="text"
                  id="experiencia"
                  name="experiencia"
                  placeholder="Ex: fotografia amateur, gestió de xarxes, sense experiència..."
                  value={formData.experiencia}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="motivacio">Per què vols unir-te?</label>
                <textarea
                  id="motivacio"
                  name="motivacio"
                  rows="5"
                  placeholder="Explica'ns la teva motivació, disponibilitat o qualsevol cosa que vulguis compartir..."
                  value={formData.motivacio}
                  onChange={handleChange}
                />
                {errors.motivacio && <span className="form-error">{errors.motivacio}</span>}
              </div>

              <div className="uneixte-form-footer">
                <button
                  type="submit"
                  className="uneixte-submit"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Enviant..." : "Enviar sol·licitud"}
                </button>

                {status === "success" && (
                  <p className="uneixte-feedback success">
                    Sol·licitud enviada. Et contactarem aviat!
                  </p>
                )}
                {status === "error" && (
                  <p className="uneixte-feedback error">
                    Hi ha hagut un error. Torna-ho a provar.
                  </p>
                )}
              </div>

            </form>
          </div>

          {/* PANELL INFO + FAQ */}
          <div className="uneixte-info-panel">
            <div>
              <p className="uneixte-info-panel-title">Tens dubtes?</p>
              <p className="uneixte-info-panel-sub">
                Aquí tens les preguntes més freqüents sobre com funciona la col·laboració
                amb Tradicions de Mataró.
              </p>
            </div>

            <hr className="uneixte-info-divider" />

            <div className="faq-list">
              {FAQS.map((f, i) => (
                <div className="faq-item" key={i}>
                  <h4>{f.q}</h4>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>

            <hr className="uneixte-info-divider" />

            <div>
              <p className="uneixte-info-panel-sub">
                Prefereixes escriure'ns directament?
              </p>
              <a
                href="/contacte"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "14px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--yellow)",
                  textDecoration: "none",
                }}
              >
                Vés a Contacte →
              </a>
            </div>
          </div>

        </section>

      </div>

      <Footer />
    </>
  );
};

export default Uneixte;