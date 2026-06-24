import React, { useState } from "react";
import Navbar from "./components/navbarComponente/navbar.jsx";
import Footer from "./components/footerComponente/footer.jsx";
import "./css/contacte.css";

const Contacte = () => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telefon: "",
    assumpte: "",
    missatge: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus("loading");

    try {
      const res = await fetch("http://localhost:5000/solicituds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error en l'enviament");

      setStatus("success");
      setFormData({
        nom: "",
        email: "",
        telefon: "",
        assumpte: "",
        missatge: "",
      });

      setErrors({});
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const validate = () => {
  const newErrors = {};

  // NOM
  if (!formData.nom.trim()) {
    newErrors.nom = "El nom és obligatori";
  } else if (formData.nom.trim().length < 2) {
    newErrors.nom = "El nom ha de tenir almenys 2 caràcters";
  }

  // EMAIL
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    newErrors.email = "L'email és obligatori";
  } else if (!emailRegex.test(formData.email)) {
    newErrors.email = "Email no vàlid";
  }

  // TELÈFON (opcional però validat si existeix)
  const phoneRegex = /^[0-9+\s]{6,15}$/;
  if (formData.telefon && !phoneRegex.test(formData.telefon)) {
    newErrors.telefon = "Telèfon no vàlid";
  }

  // ASSUMPTE
  if (!formData.assumpte.trim()) {
    newErrors.assumpte = "L'assumpte és obligatori";
  } else if (formData.assumpte.trim().length < 3) {
    newErrors.assumpte = "L'assumpte és massa curt";
  }

  // MISSATGE
  if (!formData.missatge.trim()) {
    newErrors.missatge = "El missatge és obligatori";
  } else if (formData.missatge.trim().length < 10) {
    newErrors.missatge = "El missatge ha de tenir almenys 10 caràcters";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  return (
    <>
      <Navbar />

      <div className="contacte-page">

        {/* ===== HERO ===== */}
        <section className="contacte-hero">
          <div className="contacte-hero-inner">
            <span className="section-index light">CONTACTE</span>
            <h1 className="contacte-title">
              Parlem<span className="accent-word">.</span>
            </h1>
            <p className="contacte-subtitle">
              Tens una proposta, un dubte o vols col·laborar amb nosaltres?
              Escriu-nos i et respondrem el més aviat possible.
            </p>
          </div>

          <span className="contacte-hero-bg">CONTACTE</span>
        </section>

        {/* ===== INFO RÀPIDA — GRID DESTACADA ===== */}
        <section className="contacte-quick">
          <div className="quick-grid">

            <a href="mailto:info@tradicionsdemataro.cat" className="quick-card">
              <span className="quick-icon">@</span>
              <span className="quick-label">Email</span>
              <span className="quick-value">info@tradicionsdemataro.cat</span>
            </a>

            <a href="tel:+34600000000" className="quick-card">
              <span className="quick-icon quick-icon-blue">#</span>
              <span className="quick-label">Telèfon</span>
              <span className="quick-value">+34 600 000 000</span>
            </a>

            <div className="quick-card">
              <span className="quick-icon quick-icon-pink">◎</span>
              <span className="quick-label">Adreça</span>
              <span className="quick-value">Ronda O'Donnell, 08302 Mataró</span>
            </div>

            <div className="quick-card">
              <span className="quick-icon quick-icon-orange">○</span>
              <span className="quick-label">Horari</span>
              <span className="quick-value">Dl–Dv · 10:00–18:00h</span>
            </div>

          </div>
        </section>

        {/* ===== FORMULARI + MAPA ===== */}
        <section className="contacte-main">

          <div className="contacte-form-wrapper">
            <span className="section-index">ENVIA'NS UN MISSATGE</span>
            <h2 className="contacte-form-title">
              Escriu-nos i<br />et respondrem<br />
              <span className="accent-word">aviat</span>.
            </h2>

            <form className="contacte-form" onSubmit={handleSubmit}>
              <div className="form-row">
               <div className="form-group">
                <label htmlFor="nom">Nom</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  placeholder="El teu nom"
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
                  <label htmlFor="assumpte">Assumpte</label>
                  <input
                    type="text"
                    id="assumpte"
                    name="assumpte"
                    placeholder="De què vols parlar?"
                    value={formData.assumpte}
                    onChange={handleChange}
                  />
                  {errors.assumpte && (
                    <span className="form-error">{errors.assumpte}</span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="missatge">Missatge</label>
                <textarea
                  id="missatge"
                  name="missatge"
                  rows="6"
                  placeholder="Explica'ns en què et podem ajudar..."
                  value={formData.missatge}
                  onChange={handleChange}
                ></textarea>

                {errors.missatge && (
                  <span className="form-error">{errors.missatge}</span>
                )}
              </div>

              <div className="contacte-form-footer">
                <button
                  type="submit"
                  className="contacte-submit"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Enviant..." : "Enviar missatge"}
                </button>

                {status === "success" && (
                  <p className="form-feedback success">
                    Missatge enviat correctament. Gràcies per escriure'ns!
                  </p>
                )}

                {status === "error" && (
                  <p className="form-feedback error">
                    Hi ha hagut un error enviant el missatge. Torna-ho a provar.
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="contacte-map-wrapper">
            <div className="contacte-map-label">
              <span>10 / MAPA</span>
            </div>
            <iframe
              title="Mapa Tradicions de Mataró"
              src="https://www.google.com/maps?q=Ronda%20O%27Donnell%2C%20Matar%C3%B3&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

        </section>
      </div>

      <Footer />
    </>
  );
};

export default Contacte;