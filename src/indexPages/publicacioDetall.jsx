import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbarComponente/navbar.jsx";
import Footer from "../components/footerComponente/footer.jsx";
import "./css/publicacioDetall.css";

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

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
}

// ─── Estreles ─────────────────────────────────────────────────────────────────
function Estreles({ valor, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="res-estreles">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`res-estrela ${(hover || valor) >= n ? "activa" : ""}`}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}
          aria-label={`${n} estreles`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

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
export default function PublicacioDetall() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [pub, setPub]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [lbIdx, setLbIdx]         = useState(null);
  const [liked, setLiked]         = useState(false);
  const [ressenyes, setRessenyes] = useState([]);
  const [expanded, setExpanded]   = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [rating, setRating]       = useState(0);
  const [text, setText]           = useState("");
  const [posting, setPosting]     = useState(false);
  const [postErr, setPostErr]     = useState(null);

  const token = getToken();

  // ── Fetch ressenyes ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRessenyes = async () => {
      try {
        const res = await fetch(`http://localhost:5000/resenas/${id}`);
        if (!res.ok) { setRessenyes([]); return; }
        const data = await res.json();
        const lista = data?.reseñas ?? data?.ressenyes ?? data ?? [];
        setRessenyes(Array.isArray(lista) ? lista : []);
      } catch (err) {
        console.error(err);
        setRessenyes([]);
      }
    };
    fetchRessenyes();
  }, [id]);

  // ── Fetch publicació ───────────────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      try {
        let res = await fetch(`http://localhost:5000/publi/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPub(data.publicacio ?? data);
          return;
        }
        res = await fetch("http://localhost:5000/publi");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data  = await res.json();
        const all   = Array.isArray(data) ? data : (data.publicacions ?? []);
        const trobat = all.find(p => String(p.id) === String(id) || p.slug === id);
        if (!trobat) throw new Error("Publicació no trobada");
        setPub(trobat);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Enviar ressenya ────────────────────────────────────────────────────────
  async function handleEnviar() {
    if (!text.trim() || !rating) return;
    setPosting(true);
    setPostErr(null);
    try {
      const res = await fetch(`http://localhost:5000/resenas/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, rating }),
      });
      if (!res.ok) throw new Error("Error en enviar la ressenya");
      const nova = await res.json();
      setRessenyes(prev => [nova?.ressenya ?? nova, ...prev]);
      setShowForm(false);
      setText("");
      setRating(0);
    } catch (err) {
      setPostErr(err.message);
    } finally {
      setPosting(false);
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const imgs    = pub?.galeria_imatges ?? (pub?.imatge ? [{ url: pub.imatge }] : []);
  const heroImg = imgs[0]?.url ?? imgs[0] ?? null;
  const estat   = pub?.estat ? (ESTAT_META[pub.estat] ?? { color: "var(--text-muted)", label: pub.estat }) : null;
  const dateStr = pub?.data_publicacio ?? pub?.data ?? pub?.created_at;
  const visibles = expanded ? ressenyes : ressenyes.slice(0, 3);
  const mitjana  = ressenyes.length > 0
    ? (ressenyes.reduce((acc, r) => acc + (r.rating || 0), 0) / ressenyes.length).toFixed(1)
    : null;

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
        <span>Carregant publicació…</span>
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
        <span>{error ?? "Publicació no trobada"}</span>
        <button className="pubd-back-btn" onClick={() => navigate("/publicacions")}>
          <i className="ti ti-arrow-left" /> Tornar a publicacions
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
          <Link to="/publicacions" className="pubd-bc-link">
            <i className="ti ti-arrow-left" /> Publicacions
          </Link>
          <span className="pubd-bc-sep">/</span>
          {pub.categoria && (
            <>
              <Link to={`/publicacions?categoria=${pub.categoria}`} className="pubd-bc-link pubd-bc-cat">
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
              {pub.categoria && <span className="pubd-cat-badge">{pub.categoria}</span>}
              {estat && (
                <span className="pubd-estat-badge" style={{ background: estat.color }}>
                  {estat.label}
                </span>
              )}
            </div>

            <h1 className="pubd-hero-title">{pub.titol}</h1>

            {pub.resum && <p className="pubd-hero-resum">{pub.resum}</p>}

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
              {pub.visualitzacions && (
                <span className="pubd-meta-item">
                  <i className="ti ti-eye" /> {pub.visualitzacions} visualitzacions
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── BODY: article + sidebar ──────────────────────── */}
        <div className="pubd-body">

          {/* ── Columna article ── */}
          <article className="pubd-article">

            {pub.contingut && (
              <div className="pubd-rich-text" dangerouslySetInnerHTML={{ __html: pub.contingut }} />
            )}

            {!pub.contingut && pub.resum && (
              <div className="pubd-rich-text"><p>{pub.resum}</p></div>
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
                <div className="pubd-tags">
                  {pub.tags.map((tag, i) => (
                    <span key={i} className="pubd-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Accions */}
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

              <button className="pubd-back-btn pubd-back-inline" onClick={() => navigate("/publicacions")}>
                <i className="ti ti-arrow-left" /> Tornar
              </button>
            </div>

          </article>

          {/* ── Sidebar ── */}
          <aside className="pubd-sidebar">

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
                {pub.autor && (
                  <div className="pubd-info-row">
                    <span className="pubd-info-label">Autor/a</span>
                    <span className="pubd-info-val">{pub.autor}</span>
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

            <button className="pubd-back-btn" onClick={() => navigate("/publicacions")}>
              <i className="ti ti-arrow-left" /> Tornar a publicacions
            </button>

          </aside>

        </div>

        {/* ── RESSENYES — fora del grid, a ample complet ── */}
        <section className="pubd-res-section">
          <div className="pubd-res-inner">

            {/* Header */}
            <div className="pubd-res-header">
              <div className="pubd-res-header-left">
                <div>
                  <div className="pubd-res-label">Ressenyes</div>
                  <div className="pubd-res-big-num">{ressenyes.length}</div>
                </div>
                {mitjana && (
                  <div className="pubd-res-stars-avg">
                    <span className="pubd-res-avg-val">{mitjana}</span>
                    <Estreles valor={Math.round(parseFloat(mitjana))} readonly />
                  </div>
                )}
              </div>

              {token && !showForm && (
                <button className="pubd-res-write-btn" onClick={() => setShowForm(true)}>
                  <i className="ti ti-pencil" /> Escriu una ressenya
                </button>
              )}
            </div>

            {/* Llista */}
            {ressenyes.length > 0 && (
              <div className="pubd-res-list">
                {visibles.map((r, i) => (
                  <article key={r._id ?? i} className="pubd-res-card">
                    <div className="pubd-res-card-top">
                      <div className="pubd-res-author-block">
                        <div className="pubd-res-avatar">
                          {(r.autor ?? r.username ?? "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="pubd-res-author">{r.autor ?? r.username ?? "Usuari"}</div>
                          <div className="pubd-res-date">{fmtDate(r.data ?? r.createdAt)}</div>
                        </div>
                      </div>
                      {r.rating && (
                        <div className="pubd-res-rating-right">
                          <Estreles valor={r.rating} readonly />
                          <span className="pubd-res-rating-num">{r.rating} / 5</span>
                        </div>
                      )}
                    </div>
                    <p className="pubd-res-text">{r.text}</p>
                  </article>
                ))}
              </div>
            )}

            {ressenyes.length === 0 && (
              <div className="pubd-res-empty">
                <i className="ti ti-message-off" />
                <span>Encara no hi ha ressenyes. Sigues el primer!</span>
              </div>
            )}

            {ressenyes.length > 3 && (
              <button className="pubd-res-more" onClick={() => setExpanded(e => !e)}>
                {expanded ? "Veure menys" : `Veure les ${ressenyes.length - 3} restants`}
                <i className={`ti ${expanded ? "ti-chevron-up" : "ti-chevron-down"}`} />
              </button>
            )}

            {/* Formulari */}
            {token && showForm && (
              <div className="pubd-res-form">
                <div className="pubd-res-form-head">
                  <span className="pubd-res-form-title">La teva ressenya</span>
                  <button
                    type="button"
                    className="pubd-res-close"
                    onClick={() => { setShowForm(false); setText(""); setRating(0); setPostErr(null); }}
                  >
                    <i className="ti ti-x" />
                  </button>
                </div>

                <Estreles valor={rating} onChange={setRating} />

                <textarea
                  className="pubd-res-textarea"
                  placeholder="Comparteix la teva opinió sobre aquesta publicació..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  maxLength={400}
                  disabled={posting}
                />

                {postErr && (
                  <div className="pubd-res-error">
                    <i className="ti ti-alert-circle" /> {postErr}
                  </div>
                )}

                <div className="pubd-res-form-actions">
                  <span className="pubd-res-char">{text.length} / 400</span>
                  <button
                    type="button"
                    className="pubd-res-cancel"
                    onClick={() => { setShowForm(false); setText(""); setRating(0); setPostErr(null); }}
                  >
                    Cancel·lar
                  </button>
                  <button
                    className="pubd-res-submit"
                    onClick={handleEnviar}
                    disabled={!text.trim() || !rating || posting}
                  >
                    {posting
                      ? <><div className="pubd-res-spinner" /> Enviant…</>
                      : <><i className="ti ti-send" /> Publicar ressenya</>
                    }
                  </button>
                </div>
              </div>
            )}

          </div>
        </section>

      </main>

      <Lightbox imgs={imgs} idx={lbIdx} onClose={closeLb} onPrev={prevLb} onNext={nextLb} />

      <Footer />
    </>
  );
}