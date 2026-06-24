import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "./components/navbarComponente/navbar.jsx";
import Footer from "./components/footerComponente/footer.jsx";
import "./css/publicacions.css";
import "./css/comentaris.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });
}

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
}
function getUserName() {
  return localStorage.getItem("username") || localStorage.getItem("name") || sessionStorage.getItem("username") || "Usuari";
}

const ESTAT_COLORS = {
  publicat:  "var(--yellow)",
  esborrany: "var(--blue)",
  arxivat:   "var(--pink)",
};

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

// ─── Ressenyes d'una publicació ───────────────────────────────────────────────
function ResenyesCard({ publicacioId }) {
  const token = getToken();

  const [ressenyes, setRessenyes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [text, setText]           = useState("");
  const [rating, setRating]       = useState(0);
  const [posting, setPosting]     = useState(false);
  const [postErr, setPostErr]     = useState(null);
  const [expanded, setExpanded]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`http://localhost:5000/resenas/${publicacioId}`);
        if (!res.ok) return;
        const data = await res.json();
        setRessenyes(Array.isArray(data) ? data : (data.ressenyes ?? []));
      } catch {}
      finally { setLoading(false); }
    })();
  }, [publicacioId]);

  const mitjana = ressenyes.length
    ? (ressenyes.reduce((a, r) => a + (r.rating ?? 0), 0) / ressenyes.length).toFixed(1)
    : null;

  const handleEnviar = async () => {
    if (!text.trim() || !rating || posting) return;
    setPosting(true);
    setPostErr(null);
    try {
      const res = await fetch(`http://localhost:5000/resenas/${publicacioId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ text: text.trim(), rating }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || `HTTP ${res.status}`);
      }
      const nova = await res.json();
      setRessenyes(prev => [nova, ...prev]);
      setText("");
      setRating(0);
      setShowForm(false);
    } catch (err) {
      setPostErr(err.message);
    } finally {
      setPosting(false);
    }
  };

  const visibles = expanded ? ressenyes : ressenyes.slice(0, 2);
  const [open, setOpen]       = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="res-section">

      {/* ── Capçalera sempre visible / toggle ── */}
      <button className="res-toggle" onClick={() => setOpen(o => !o)}>
        <span className="res-toggle-left">
          <i className="ti ti-message-star" />
          <span className="res-label-inline">Ressenyes</span>
          {!loading && ressenyes.length > 0 && (
            <span className="res-badge">{ressenyes.length}</span>
          )}
        </span>
        <span className="res-toggle-right">
          {mitjana && (
            <span className="res-mitjana">
              <span className="res-mitjana-num">{mitjana}</span>
              <span className="res-estrela-static">★</span>
            </span>
          )}
          <i className={`ti ${open ? "ti-chevron-up" : "ti-chevron-down"} res-chevron`} />
        </span>
      </button>

      {/* ── Contingut col·lapsable ── */}
      {open && (
        <div className="res-body">

          {/* Llista */}
          {!loading && ressenyes.length > 0 && (
            <ul className="res-llista">
              {visibles.map((r, i) => (
                <li key={r._id ?? i} className="res-item">
                  <div className="res-item-top">
                    <span className="res-item-autor">{r.autor ?? r.username ?? "Usuari"}</span>
                    {r.rating && <Estreles valor={r.rating} readonly />}
                  </div>
                  <p className="res-item-text">{r.text}</p>
                  <span className="res-item-data">{fmtDate(r.data ?? r.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}

          {!loading && ressenyes.length === 0 && (
            <p className="res-empty">Encara no hi ha ressenyes.</p>
          )}

          {ressenyes.length > 2 && (
            <button className="res-veure-mes" onClick={() => setExpanded(e => !e)}>
              {expanded ? "Veure menys" : `Veure les ${ressenyes.length - 2} restants`}
              <i className={`ti ${expanded ? "ti-chevron-up" : "ti-chevron-down"}`} />
            </button>
          )}

          {/* Botó escriure / form */}
          {token && !showForm && (
            <button className="res-write-btn" onClick={() => setShowForm(true)}>
              <i className="ti ti-pencil" /> Escriu una ressenya
            </button>
          )}

          {token && showForm && (
            <div className="res-form">
              <div className="res-form-top">
                <Estreles valor={rating} onChange={setRating} />
                <button className="res-form-cancel" onClick={() => { setShowForm(false); setText(""); setRating(0); setPostErr(null); }}>
                  <i className="ti ti-x" />
                </button>
              </div>
              <textarea
                className="res-textarea"
                placeholder="Escriu la teva ressenya..."
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                maxLength={400}
                disabled={posting}
                autoFocus
              />
              {postErr && (
                <span className="res-error">
                  <i className="ti ti-alert-circle" /> {postErr}
                </span>
              )}
              <button
                className="res-submit"
                onClick={handleEnviar}
                disabled={!text.trim() || !rating || posting}
              >
                {posting
                  ? <><div className="res-spinner" /> Enviant...</>
                  : <><i className="ti ti-send" /> Publicar</>
                }
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Publicacions() {
  const [publicacions, setPublicacions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [cerca, setCerca]               = useState("");
  const [estat, setEstat]               = useState("tots");
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaURL = searchParams.get("categoria") || "tots";

  const setCategoria = (val) => {
    if (val === "tots") searchParams.delete("categoria");
    else searchParams.set("categoria", val);
    setSearchParams(searchParams, { replace: true });
  };

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("http://localhost:5000/publi");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPublicacions(Array.isArray(data) ? data : (data.publicacions ?? []));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(publicacions.map(p => p.categoria).filter(Boolean));
    return ["tots", ...set];
  }, [publicacions]);

  const filtrades = useMemo(() => {
    return publicacions.filter((p) => {
      const q = cerca.toLowerCase();
      const matchCerca     = !q || p.titol?.toLowerCase().includes(q) || p.resum?.toLowerCase().includes(q);
      const matchCategoria = categoriaURL === "tots" || p.categoria === categoriaURL;
      const matchEstat     = estat === "tots" || p.estat === estat;
      return matchCerca && matchCategoria && matchEstat;
    });
  }, [publicacions, cerca, categoriaURL, estat]);

  const resetFiltres = () => { setCerca(""); setEstat("tots"); setCategoria("tots"); };
  const hiHaFiltres  = cerca || estat !== "tots" || categoriaURL !== "tots";

  return (
    <>
      <Navbar />

      <main className="publicacions-page">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="publicacions-hero">
          <div className="publicacions-hero-inner">
            <span className="section-index light">PUBLICACIONS</span>
            <h1 className="publicacions-title">
              El que<br />
              <span className="accent-word">expliquem</span>.
            </h1>
            <p className="publicacions-subtitle">
              Articles, cròniques i reportatges sobre la cultura i les tradicions de Mataró.
            </p>
          </div>

          {!loading && (
            <div className="publicacions-hero-stats">
              <div className="publicacions-hero-stat">
                <span className="publicacions-hero-stat-num" style={{ color: "var(--yellow)" }}>
                  {publicacions.length}
                </span>
                <span className="publicacions-hero-stat-label">Publicacions totals</span>
              </div>
              <div className="publicacions-hero-stat">
                <span className="publicacions-hero-stat-num" style={{ color: "var(--blue)" }}>
                  {publicacions.filter(p => p.estat === "publicat").length}
                </span>
                <span className="publicacions-hero-stat-label">Publicades</span>
              </div>
              <div className="publicacions-hero-stat">
                <span className="publicacions-hero-stat-num" style={{ color: "var(--pink)" }}>
                  {categories.length - 1}
                </span>
                <span className="publicacions-hero-stat-label">Categories</span>
              </div>
            </div>
          )}

          <span className="publicacions-bg">PUBLI</span>
        </section>

        {/* ── FILTRES ───────────────────────────────────────── */}
        <section className="publicacions-filters">

          <div className="pf-search-box">
            <i className="ti ti-search pf-search-icon" />
            <input
              type="text"
              placeholder="Cerca publicacions..."
              value={cerca}
              onChange={(e) => setCerca(e.target.value)}
            />
            {cerca && (
              <button className="pf-search-clear" onClick={() => setCerca("")}>
                <i className="ti ti-x" />
              </button>
            )}
          </div>

          <div className="pf-cat-pills">
            {categories.map((c) => (
              <button
                key={c}
                className={`pf-cat-pill ${categoriaURL === c ? "active" : ""}`}
                onClick={() => setCategoria(c)}
              >
                {c === "tots" ? "Totes" : c}
                <span className="pf-cat-pill-count">
                  {c === "tots"
                    ? publicacions.length
                    : publicacions.filter(p => p.categoria === c).length}
                </span>
              </button>
            ))}
          </div>

          <div className="pf-right">
            <div className="pf-select-wrap">
              <i className="ti ti-filter" />
              <select value={estat} onChange={(e) => setEstat(e.target.value)}>
                <option value="tots">Tots els estats</option>
                <option value="publicat">Publicat</option>
                <option value="esborrany">Esborrany</option>
                <option value="arxivat">Arxivat</option>
              </select>
            </div>

            {hiHaFiltres && (
              <button className="pf-reset-btn" onClick={resetFiltres}>
                <i className="ti ti-x" /> Netejar
              </button>
            )}

            <span className="pf-count">
              <strong>{filtrades.length}</strong> / {publicacions.length}
            </span>
          </div>

        </section>

        {/* ── GRID ──────────────────────────────────────────── */}
        <section className="publicacions-grid-section">

          {loading && (
            <div className="publicacions-state">
              <div className="publicacions-spinner" />
              <p>Carregant publicacions...</p>
            </div>
          )}

          {error && (
            <div className="publicacions-state error">
              <i className="ti ti-alert-circle" style={{ fontSize: "2rem" }} />
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && !error && filtrades.length === 0 && (
            <div className="publicacions-state">
              <i className="ti ti-zoom-cancel" style={{ fontSize: "2rem", opacity: 0.3 }} />
              <p>Cap publicació trobada.</p>
              <button className="pf-reset-btn" onClick={resetFiltres}>Netejar filtres</button>
            </div>
          )}

          {!loading && !error && filtrades.length > 0 && (
            <div className="publicacions-grid">
              {filtrades.map((p, idx) => {
                const img        = p.galeria_imatges?.[0]?.url || p.imatge || null;
                const estatColor = ESTAT_COLORS[p.estat] ?? "var(--text-muted)";

                return (
                  <article className="pub-card" key={p.id ?? idx}>

                    <div className="pub-card-img">
                      {img
                        ? <img src={img} alt={p.titol} />
                        : <div className="pub-card-img-placeholder" />
                      }
                      <div className="pub-card-img-overlay" />
                      {p.estat && (
                        <span className="pub-card-estat" style={{ background: estatColor, color: "#0a0a0a" }}>
                          {p.estat}
                        </span>
                      )}
                    </div>

                    <div className="pub-card-body">
                      {p.categoria && <span className="pub-card-cat">{p.categoria}</span>}
                      <h3 className="pub-card-title">{p.titol}</h3>
                      {p.resum && <p className="pub-card-resum">{p.resum}</p>}

                      <div className="pub-card-meta">
                        {p.autor && (
                          <span className="pub-card-meta-item">
                            <i className="ti ti-user" /> {p.autor}
                          </span>
                        )}
                        {(p.data_publicacio ?? p.data) && (
                          <span className="pub-card-meta-item">
                            <i className="ti ti-calendar" /> {fmtDate(p.data_publicacio ?? p.data)}
                          </span>
                        )}
                      </div>

                      <button className="pub-card-btn" onClick={() => navigate(`/publicacions/${p.id}`)}>
                        Llegir més <i className="ti ti-arrow-right" />
                      </button>
                    </div>

                    {/* ── RESSENYES ── */}
                    <ResenyesCard publicacioId={p._id ?? p.id} />

                  </article>
                );
              })}
            </div>
          )}

        </section>

      </main>

      <Footer />
    </>
  );
}