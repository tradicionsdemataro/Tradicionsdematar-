import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbarComponente/navbar.jsx";
import Footer from "../components/footerComponente/footer.jsx";
import "./css/eventDetall.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });
}

function tempsRelatiu(raw) {
  if (!raw) return null;
  const diff = Date.now() - new Date(raw).getTime();
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const d    = Math.floor(diff / 86400000);
  if (min < 1)  return "ara mateix";
  if (min < 60) return `fa ${min} min`;
  if (h < 24)   return `fa ${h}h`;
  if (d < 7)    return `fa ${d} dia${d > 1 ? "s" : ""}`;
  return fmtDate(raw);
}

const ESTAT_META = {
  publicat:  { color: "var(--yellow)", label: "Publicat" },
  esborrany: { color: "var(--blue)",   label: "Esborrany" },
  arxivat:   { color: "var(--pink)",   label: "Arxivat" },
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ imgs, idx, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  if (idx === null) return null;

  return (
    <div className="pubd-lb-backdrop" onClick={onClose}>
      <button className="pubd-lb-close" onClick={onClose} aria-label="Tancar">
        <i className="ti ti-x" />
      </button>
      <button className="pubd-lb-arrow pubd-lb-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
        <i className="ti ti-chevron-left" />
      </button>
      <div className="pubd-lb-img-wrap" onClick={(e) => e.stopPropagation()}>
        <img src={imgs[idx]?.url ?? imgs[idx]} alt={`Imatge ${idx + 1}`} />
        <span className="pubd-lb-counter">{idx + 1} / {imgs.length}</span>
      </div>
      <button className="pubd-lb-arrow pubd-lb-next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
        <i className="ti ti-chevron-right" />
      </button>
    </div>
  );
}

// ─── Component principal ──────────────────────────────────────────────────────
export default function EventDetall() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [pub, setPub]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lbIdx, setLbIdx]     = useState(null);
  const [liked, setLiked]     = useState(false);

  // Fetch — intenta /publi/:id, fallback a /publi i filtra
  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      try {
        let res = await fetch(`http://localhost:5000/events/${id}`);

        if (res.ok) {
          const data = await res.json();
          setPub(data.event ?? data);
          return;
        }

        // Fallback: agafa tots i filtra
        res = await fetch("http://localhost:5000/events");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const all  = Array.isArray(data) ? data : (data.events ?? []);
        const trobat = all.find(p => String(p.id) === String(id) || p.slug === id);
        if (!trobat) throw new Error("Event no trobat");
        setPub(trobat);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Galeria
  const imgs    = pub?.galeria_imatges ?? (pub?.imatge ? [{ url: pub.imatge }] : []);
  const heroImg = imgs[0]?.url ?? imgs[0] ?? null;
  const estat   = pub?.estat ? (ESTAT_META[pub.estat] ?? { color: "var(--text-muted)", label: pub.estat }) : null;
  const dateStr = pub?.data;

  const openLb = (i) => setLbIdx(i);
  const closeLb = () => setLbIdx(null);
  const prevLb  = () => setLbIdx(i => (i - 1 + imgs.length) % imgs.length);
  const nextLb  = () => setLbIdx(i => (i + 1) % imgs.length);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <Navbar />
      <div className="pubd-fullstate">
        <div className="pubd-spinner" />
        <span>Carregant event…</span>
      </div>
      <Footer />
    </>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !pub) return (
    <>
      <Navbar />
      <div className="pubd-fullstate pubd-fullstate--err">
        <i className="ti ti-alert-circle" />
        <span>{error ?? "Event no trobat"}</span>
        <button className="pubd-back-btn" onClick={() => navigate("/events")}>
          <i className="ti ti-arrow-left" /> Tornar a events
        </button>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />

      <main className="pubd-page">

        {/* ── BREADCRUMB ──────────────────────────────────── */}
        <div className="pubd-breadcrumb">
          <Link to="/events" className="pubd-bc-link">
            <i className="ti ti-arrow-left" /> Events
          </Link>
          <span className="pubd-bc-sep">/</span>
          {pub.categoria && (
            <>
              <Link to={`/events?categoria=${pub.categoria}`} className="pubd-bc-link pubd-bc-cat">
                {pub.categoria}
              </Link>
              <span className="pubd-bc-sep">/</span>
            </>
          )}
          <span className="pubd-bc-current">{pub.titol}</span>
        </div>

        {/* ── HERO ────────────────────────────────────────── */}
        <section className="pubd-hero">
          {heroImg && (
            <>
              <img className="pubd-hero-img" src={heroImg} alt={pub.titol} />
              <div className="pubd-hero-overlay" />
            </>
          )}

          <div className="pubd-hero-content">
            <div className="pubd-hero-top">
              {pub.categoria && (
                <span className="pubd-cat-badge">{pub.categoria}</span>
              )}
              {estat && (
                <span className="pubd-estat-badge" style={{ background: estat.color }}>
                  {estat.label}
                </span>
              )}
            </div>

            <h1 className="pubd-hero-title">{pub.titol}</h1>

            {pub.resum && (
              <p className="pubd-hero-resum">{pub.resum}</p>
            )}

            {/* Meta bar */}
            <div className="pubd-hero-meta">
              {pub.autor && (
                <span className="pubd-meta-item">
                  <i className="ti ti-user" /> {pub.autor}
                </span>
              )}
              {dateStr && (
                <span className="pubd-meta-item">
                  <i className="ti ti-calendar" /> {fmtDate(dateStr)}
                  <span className="pubd-meta-rel">({tempsRelatiu(dateStr)})</span>
                </span>
              )}
              {pub.temps_lectura && (
                <span className="pubd-meta-item">
                  <i className="ti ti-clock" /> {pub.temps_lectura} min de lectura
                </span>
              )}
              {pub.visualitzacions != null && (
                <span className="pubd-meta-item">
                  <i className="ti ti-eye" /> {pub.visualitzacions} visualitzacions
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── BODY ────────────────────────────────────────── */}
        <div className="pubd-body">

          {/* ── Columna article ── */}
          <article className="pubd-article">

            {/* Cos de l'article */}
            {pub.descripcio && (
              <div
                className="pubd-rich-text"
                dangerouslySetInnerHTML={{ __html: pub.descripcio }}
              />
            )}

            {/* Fallback si no hi ha contingut ric */}
            {!pub.contingut && pub.resum && (
              <div className="pubd-rich-text">
                <p>{pub.resum}</p>
              </div>
            )}

            {/* Galeria */}
            {imgs.length > 1 && (
              <section className="pubd-section">
                <h2 className="pubd-section-title">
                  <span className="pubd-section-idx">Galeria</span>
                  <span className="pubd-section-count">{imgs.length} imatges</span>
                </h2>
                <div className="pubd-gallery">
                  {imgs.map((img, i) => (
                    <div
                      key={i}
                      className={`pubd-gallery-item ${i === 0 ? "pubd-gallery-item--featured" : ""}`}
                      onClick={() => openLb(i)}
                    >
                      <img src={img?.url ?? img} alt={`Imatge ${i + 1}`} loading="lazy" />
                      <div className="pubd-gallery-overlay">
                        <i className="ti ti-zoom-in" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {pub.tags?.length > 0 && (
              <div className="pubd-tags-row">
                <i className="ti ti-tag pubd-tags-icon" />
                {pub.tags.map((tag, i) => (
                  <span key={i} className="pubd-tag">{tag}</span>
                ))}
              </div>
            )}

            {/* Accions — like + compartir */}
            <div className="pubd-actions">
              <button
                className={`pubd-action-btn pubd-like ${liked ? "pubd-liked" : ""}`}
                onClick={() => setLiked(l => !l)}
              >
                <i className={`ti ${liked ? "ti-heart-filled" : "ti-heart"}`} />
                {liked ? (pub.likes ?? 0) + 1 : (pub.likes ?? 0)} m'agrada
              </button>

              <button
                className="pubd-action-btn"
                onClick={() => navigator.share?.({ title: pub.titol, url: window.location.href })}
              >
                <i className="ti ti-share" /> Compartir
              </button>

              <button className="pubd-back-btn pubd-back-inline" onClick={() => navigate("/events")}>
                <i className="ti ti-arrow-left" /> Tornar
              </button>
            </div>

          </article>

          {/* ── Sidebar ── */}
          <aside className="pubd-sidebar">

            {/* Dades */}
            <div className="pubd-sidebar-card">
              <h3 className="pubd-sidebar-title">Informació</h3>
              <div className="pubd-info-rows">

                {estat && (
                  <div className="pubd-info-row">
                    <span className="pubd-info-label">Estat</span>
                    <span className="pubd-info-val pubd-info-estat" style={{ color: estat.color }}>
                      <span className="pubd-estat-dot" style={{ background: estat.color }} />
                      {estat.label}
                    </span>
                  </div>
                )}
                {pub.categoria && (
                  <div className="pubd-info-row">
                    <span className="pubd-info-label">Categoria</span>
                    <span className="pubd-info-val">{pub.categoria}</span>
                  </div>
                )}
                {pub.organitzador && (
                  <div className="pubd-info-row">
                    <span className="pubd-info-label">Organitzador/a</span>
                    <span className="pubd-info-val">{pub.organitzador}</span>
                  </div>
                )}
                {dateStr && (
                  <div className="pubd-info-row">
                    <span className="pubd-info-label">Publicat</span>
                    <span className="pubd-info-val">{fmtDate(dateStr)}</span>
                  </div>
                )}
                {pub.data_modificacio && (
                  <div className="pubd-info-row">
                    <span className="pubd-info-label">Actualitzat</span>
                    <span className="pubd-info-val">{fmtDate(pub.data_modificacio)}</span>
                  </div>
                )}
                {pub.temps_lectura && (
                  <div className="pubd-info-row">
                    <span className="pubd-info-label">Lectura</span>
                    <span className="pubd-info-val">{pub.temps_lectura} min</span>
                  </div>
                )}
                {pub.visualitzacions !== undefined && (
                  <div className="pubd-info-row">
                    <span className="pubd-info-label">Visites</span>
                    <span className="pubd-info-val">{pub.visualitzacions}</span>
                  </div>
                )}
                {pub.likes !== undefined && (
                  <div className="pubd-info-row">
                    <span className="pubd-info-label">M'agrada</span>
                    <span className="pubd-info-val" style={{ color: "var(--pink)" }}>
                      {liked ? pub.likes + 1 : pub.likes}
                    </span>
                  </div>
                )}

              </div>
            </div>

            {/* Tags sidebar */}
            {pub.tags?.length > 0 && (
              <div className="pubd-sidebar-card">
                <h3 className="pubd-sidebar-title">Etiquetes</h3>
                <div className="pubd-tags">
                  {pub.tags.map((tag, i) => (
                    <span key={i} className="pubd-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Enllaços */}
            {pub.enllacos?.length > 0 && (
              <div className="pubd-sidebar-card">
                <h3 className="pubd-sidebar-title">Enllaços relacionats</h3>
                <div className="pubd-ext-links">
                  {pub.enllacos.map((e, i) => (
                    <a key={i} href={e.url ?? e} target="_blank" rel="noopener noreferrer" className="pubd-ext-link">
                      <i className="ti ti-external-link" />
                      {e.nom ?? e.url ?? e}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Botó tornar */}
            <button className="pubd-back-btn" onClick={() => navigate("/events")}>
              <i className="ti ti-arrow-left" /> Tornar a events
            </button>

          </aside>

        </div>

      </main>

      <Lightbox imgs={imgs} idx={lbIdx} onClose={closeLb} onPrev={prevLb} onNext={nextLb} />

      <Footer />
    </>
  );
}