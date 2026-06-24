import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbarComponente/navbar.jsx";
import Footer from "../components/footerComponente/footer.jsx";
import "./css/projecteDetall.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });
}

const ESTAT_META = {
  actiu:      { color: "var(--yellow)", label: "Actiu" },
  finalitzat: { color: "var(--blue)",   label: "Finalitzat" },
  pendent:    { color: "var(--pink)",   label: "Pendent" },
};

// Lightbox senzill per a la galeria
function Lightbox({ imgs, idx, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")    onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight")onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  if (idx === null) return null;

  return (
    <div className="pd-lb-backdrop" onClick={onClose}>
      <button className="pd-lb-close" onClick={onClose} aria-label="Tancar">
        <i className="ti ti-x" />
      </button>
      <button className="pd-lb-arrow pd-lb-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Anterior">
        <i className="ti ti-chevron-left" />
      </button>
      <div className="pd-lb-img-wrap" onClick={(e) => e.stopPropagation()}>
        <img src={imgs[idx]?.url ?? imgs[idx]} alt={`Imatge ${idx + 1}`} />
        <span className="pd-lb-counter">{idx + 1} / {imgs.length}</span>
      </div>
      <button className="pd-lb-arrow pd-lb-next" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Següent">
        <i className="ti ti-chevron-right" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProjecteDetall() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [projecte, setProjecte]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [lbIdx, setLbIdx]         = useState(null);

  // Fetch — agafa tots i filtra per id (evita necessitar ruta /projectes/:id al backend)
  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      try {
        // Prova primer la ruta individual
        let res = await fetch(`http://localhost:5000/projectes/${id}`);

        if (res.ok) {
          const data = await res.json();
          setProjecte(data.projecte ?? data);
          return;
        }

        // Fallback: agafa tots i filtra
        res = await fetch("http://localhost:5000/projectes");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const all  = Array.isArray(data) ? data : (data.projectes ?? []);

        // Busca per id numèric o per string
        const trobat = all.find(p =>
          String(p.id) === String(id) ||
          p.slug === id
        );

        if (!trobat) throw new Error("Projecte no trobat");
        setProjecte(trobat);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Galeria
  const imgs = projecte?.galeria_imatges ?? (projecte?.imatge ? [{ url: projecte.imatge }] : []);
  const heroImg = imgs[0]?.url ?? imgs[0] ?? null;
  const estat   = projecte?.estat ? (ESTAT_META[projecte.estat] ?? { color: "var(--text-muted)", label: projecte.estat }) : null;

  // Lightbox handlers
  const openLb  = (i)  => setLbIdx(i);
  const closeLb = ()   => setLbIdx(null);
  const prevLb  = ()   => setLbIdx(i => (i - 1 + imgs.length) % imgs.length);
  const nextLb  = ()   => setLbIdx(i => (i + 1) % imgs.length);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <Navbar />
      <div className="pd-fullstate">
        <div className="pd-spinner" />
        <span>Carregant projecte…</span>
      </div>
      <Footer />
    </>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !projecte) return (
    <>
      <Navbar />
      <div className="pd-fullstate pd-fullstate--err">
        <i className="ti ti-alert-circle" />
        <span>{error ?? "Projecte no trobat"}</span>
        <button className="pd-back-btn" onClick={() => navigate("/projectes")}>
          <i className="ti ti-arrow-left" /> Tornar als projectes
        </button>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />

      <main className="pd-page">

        {/* ── BREADCRUMB ──────────────────────────────────── */}
        <div className="pd-breadcrumb">
          <Link to="/projectes" className="pd-bc-link">
            <i className="ti ti-arrow-left" /> Projectes
          </Link>
          <span className="pd-bc-sep">/</span>
          <span className="pd-bc-current">{projecte.titol}</span>
        </div>

        {/* ── HERO ────────────────────────────────────────── */}
        <section className="pd-hero">
          {heroImg && (
            <>
              <img className="pd-hero-img" src={heroImg} alt={projecte.titol} />
              <div className="pd-hero-overlay" />
            </>
          )}

          <div className="pd-hero-content">
            <div className="pd-hero-top">
              {projecte.categoria && (
                <span className="pd-cat-badge">{projecte.categoria}</span>
              )}
              {estat && (
                <span className="pd-estat-badge" style={{ background: estat.color }}>
                  {estat.label}
                </span>
              )}
            </div>

            <h1 className="pd-hero-title">{projecte.titol}</h1>

            {projecte.resum && (
              <p className="pd-hero-resum">{projecte.resum}</p>
            )}

            <div className="pd-hero-meta">
              {projecte.lloc && (
                <span className="pd-meta-item">
                  <i className="ti ti-map-pin" /> {projecte.lloc}
                </span>
              )}
              {projecte.data_publicacio && (
                <span className="pd-meta-item">
                  <i className="ti ti-calendar" /> {fmtDate(projecte.data_publicacio)}
                </span>
              )}
              {projecte.data_fi && (
                <span className="pd-meta-item">
                  <i className="ti ti-calendar-off" /> Fi: {fmtDate(projecte.data_fi)}
                </span>
              )}
              {projecte.responsable && (
                <span className="pd-meta-item">
                  <i className="ti ti-user" /> {projecte.responsable}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── BODY ────────────────────────────────────────── */}
        <div className="pd-body">

          {/* ── Columna principal ── */}
          <div className="pd-main">

            {/* Descripció llarga */}
            {projecte.descripcio && (
              <section className="pd-section">
                <h2 className="pd-section-title">
                  <span className="pd-section-idx">01</span>
                  Descripció
                </h2>
                <div
                  className="pd-rich-text"
                  dangerouslySetInnerHTML={{ __html: projecte.descripcio }}
                />
              </section>
            )}

            {/* Objectius */}
            {projecte.objectius?.length > 0 && (
              <section className="pd-section">
                <h2 className="pd-section-title">
                  <span className="pd-section-idx">02</span>
                  Objectius
                </h2>
                <ul className="pd-objectius">
                  {projecte.objectius.map((o, i) => (
                    <li key={i} className="pd-objectiu-item">
                      <span className="pd-obj-dot" />
                      {o}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Participants / equip */}
            {projecte.participants?.length > 0 && (
              <section className="pd-section">
                <h2 className="pd-section-title">
                  <span className="pd-section-idx">03</span>
                  Participants
                </h2>
                <div className="pd-participants">
                  {projecte.participants.map((p, i) => (
                    <div key={i} className="pd-participant-card">
                      {p.avatar && (
                        <img src={p.avatar} alt={p.nom} className="pd-participant-avatar" />
                      )}
                      {!p.avatar && (
                        <div className="pd-participant-avatar pd-participant-avatar--placeholder">
                          <i className="ti ti-user" />
                        </div>
                      )}
                      <span className="pd-participant-nom">{p.nom ?? p}</span>
                      {p.rol && <span className="pd-participant-rol">{p.rol}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Galeria */}
            {imgs.length > 0 && (
              <section className="pd-section">
                <h2 className="pd-section-title">
                  <span className="pd-section-idx">04</span>
                  Galeria
                  <span className="pd-section-count">{imgs.length} imatges</span>
                </h2>
                <div className="pd-gallery">
                  {imgs.map((img, i) => (
                    <div
                      key={i}
                      className={`pd-gallery-item ${i === 0 ? "pd-gallery-item--featured" : ""}`}
                      onClick={() => openLb(i)}
                    >
                      <img src={img?.url ?? img} alt={`Imatge ${i + 1}`} loading="lazy" />
                      <div className="pd-gallery-overlay">
                        <i className="ti ti-zoom-in" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Documents / arxius */}
            {projecte.documents?.length > 0 && (
              <section className="pd-section">
                <h2 className="pd-section-title">
                  <span className="pd-section-idx">05</span>
                  Documents
                </h2>
                <div className="pd-docs">
                  {projecte.documents.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url ?? doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pd-doc-card"
                    >
                      <i className="ti ti-file-description pd-doc-icon" />
                      <span className="pd-doc-name">{doc.nom ?? `Document ${i + 1}`}</span>
                      <i className="ti ti-download pd-doc-dl" />
                    </a>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ── Sidebar ── */}
          <aside className="pd-sidebar">

            {/* Dades clau */}
            <div className="pd-sidebar-card">
              <h3 className="pd-sidebar-title">Dades del projecte</h3>

              <div className="pd-info-rows">
                {estat && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Estat</span>
                    <span className="pd-info-val pd-info-estat" style={{ color: estat.color }}>
                      <span className="pd-estat-dot" style={{ background: estat.color }} />
                      {estat.label}
                    </span>
                  </div>
                )}
                {projecte.categoria && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Categoria</span>
                    <span className="pd-info-val">{projecte.categoria}</span>
                  </div>
                )}
                {projecte.lloc && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Lloc</span>
                    <span className="pd-info-val">{projecte.lloc}</span>
                  </div>
                )}
                {projecte.data_publicacio && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Inici</span>
                    <span className="pd-info-val">{fmtDate(projecte.data_publicacio)}</span>
                  </div>
                )}
                {projecte.data_fi && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Fi</span>
                    <span className="pd-info-val">{fmtDate(projecte.data_fi)}</span>
                  </div>
                )}
                {projecte.responsable && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Responsable</span>
                    <span className="pd-info-val">{projecte.responsable}</span>
                  </div>
                )}
                {projecte.pressupost && (
                  <div className="pd-info-row">
                    <span className="pd-info-label">Pressupost</span>
                    <span className="pd-info-val">{projecte.pressupost}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {projecte.tags?.length > 0 && (
              <div className="pd-sidebar-card">
                <h3 className="pd-sidebar-title">Etiquetes</h3>
                <div className="pd-tags">
                  {projecte.tags.map((tag, i) => (
                    <span key={i} className="pd-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Enllaços externs */}
            {projecte.enllacos?.length > 0 && (
              <div className="pd-sidebar-card">
                <h3 className="pd-sidebar-title">Enllaços</h3>
                <div className="pd-links-list">
                  {projecte.enllacos.map((e, i) => (
                    <a
                      key={i}
                      href={e.url ?? e}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pd-ext-link"
                    >
                      <i className="ti ti-external-link" />
                      {e.nom ?? e.url ?? e}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Botó tornar */}
            <button className="pd-back-btn" onClick={() => navigate("/projectes")}>
              <i className="ti ti-arrow-left" />
              Tornar als projectes
            </button>

          </aside>

        </div>

      </main>

      {/* Lightbox */}
      <Lightbox imgs={imgs} idx={lbIdx} onClose={closeLb} onPrev={prevLb} onNext={nextLb} />

      <Footer />
    </>
  );
}