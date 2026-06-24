import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "./components/navbarComponente/navbar.jsx";
import Footer from "./components/footerComponente/footer.jsx";
import "./css/projectes.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });
}

const ESTAT_COLORS = {
  actiu:       "var(--yellow)",
  finalitzat:  "var(--blue)",
  pendent:     "var(--pink)",
};

export default function Projectes() {
  const [projectes, setProjectes]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [cerca, setCerca]           = useState("");
  const [estat, setEstat]           = useState("tots");
  const navigate = useNavigate();

  // ── Llegeix ?categoria= de la URL ────────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaURL = searchParams.get("categoria") || "tots";

  const setCategoria = (val) => {
    if (val === "tots") {
      searchParams.delete("categoria");
    } else {
      searchParams.set("categoria", val);
    }
    setSearchParams(searchParams, { replace: true });
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("http://localhost:5000/projectes");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProjectes(Array.isArray(data) ? data : (data.projectes ?? []));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Categories dinàmiques ─────────────────────────────────────────────────
  const categories = useMemo(() => {
    const set = new Set(projectes.map(p => p.categoria).filter(Boolean));
    return ["tots", ...set];
  }, [projectes]);

  // ── Filtre ────────────────────────────────────────────────────────────────
  const filtrats = useMemo(() => {
    return projectes.filter((p) => {
      const q = cerca.toLowerCase();
      const matchCerca    = !q || p.titol?.toLowerCase().includes(q) || p.resum?.toLowerCase().includes(q);
      const matchCategoria = categoriaURL === "tots" || p.categoria === categoriaURL;
      const matchEstat    = estat === "tots" || p.estat === estat;
      return matchCerca && matchCategoria && matchEstat;
    });
  }, [projectes, cerca, categoriaURL, estat]);

  const resetFiltres = () => {
    setCerca("");
    setEstat("tots");
    setCategoria("tots");
  };

  const hiHaFiltres = cerca || estat !== "tots" || categoriaURL !== "tots";

  return (
    <>
      <Navbar />

      <main className="projectes-page">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="projectes-hero">
          <div className="projectes-hero-inner">
            <span className="section-index light">PROJECTES</span>
            <h1 className="projectes-title">
              El que<br />
              <span className="accent-word">fem</span>.
            </h1>
            <p className="projectes-subtitle">
              Iniciatives culturals per preservar i divulgar les tradicions de Mataró.
            </p>
          </div>

          {!loading && (
            <div className="projectes-hero-stats">
              <div className="projectes-hero-stat">
                <span className="projectes-hero-stat-num" style={{ color: "var(--yellow)" }}>
                  {projectes.length}
                </span>
                <span className="projectes-hero-stat-label">Projectes totals</span>
              </div>
              <div className="projectes-hero-stat">
                <span className="projectes-hero-stat-num" style={{ color: "var(--blue)" }}>
                  {projectes.filter(p => p.estat === "actiu").length}
                </span>
                <span className="projectes-hero-stat-label">Actius ara</span>
              </div>
              <div className="projectes-hero-stat">
                <span className="projectes-hero-stat-num" style={{ color: "var(--pink)" }}>
                  {categories.length - 1}
                </span>
                <span className="projectes-hero-stat-label">Categories</span>
              </div>
            </div>
          )}

          <span className="projectes-bg">PROJECTES</span>
        </section>

        {/* ── FILTRES ───────────────────────────────────────── */}
        <section className="projectes-filters">

          {/* Cerca */}
          <div className="pf-search-box">
            <i className="ti ti-search pf-search-icon" />
            <input
              type="text"
              placeholder="Cerca projectes..."
              value={cerca}
              onChange={(e) => setCerca(e.target.value)}
            />
            {cerca && (
              <button className="pf-search-clear" onClick={() => setCerca("")}>
                <i className="ti ti-x" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="projecte-cat-pills">
            {categories.map((c) => (
              <button
                key={c}
                className={`projecte-cat-pill ${categoriaURL === c ? "active" : ""}`}
                onClick={() => setCategoria(c)}
              >
                {c === "tots" ? "Tots" : c}
                <span className="projecte-cat-pill-count">
                  {c === "tots"
                    ? projectes.length
                    : projectes.filter(p => p.categoria === c).length}
                </span>
              </button>
            ))}
          </div>

          {/* Estat select + reset */}
          <div className="pf-right">
            <div className="pf-select-wrap">
              <i className="ti ti-filter" />
              <select value={estat} onChange={(e) => setEstat(e.target.value)}>
                <option value="tots">Tots els estats</option>
                <option value="actiu">Actiu</option>
                <option value="finalitzat">Finalitzat</option>
                <option value="pendent">Pendent</option>
              </select>
            </div>

            {hiHaFiltres && (
              <button className="pf-reset-btn" onClick={resetFiltres}>
                <i className="ti ti-x" /> Netejar
              </button>
            )}

            <span className="pf-count">
              <strong>{filtrats.length}</strong> / {projectes.length}
            </span>
          </div>

        </section>

        {/* ── GRID ──────────────────────────────────────────── */}
        <section className="projectes-grid-section">

          {loading && (
            <div className="projectes-state">
              <div className="projectes-spinner" />
              <p>Carregant projectes...</p>
            </div>
          )}

          {error && (
            <div className="projectes-state error">
              <i className="ti ti-alert-circle" style={{ fontSize: "2rem" }} />
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && !error && filtrats.length === 0 && (
            <div className="projectes-state">
              <i className="ti ti-zoom-cancel" style={{ fontSize: "2rem", opacity: 0.3 }} />
              <p>Cap projecte trobat.</p>
              <button className="pf-reset-btn" onClick={resetFiltres}>Netejar filtres</button>
            </div>
          )}

          {!loading && !error && filtrats.length > 0 && (
            <div className="projectes-grid">
              {filtrats.map((p, idx) => {
                const img        = p.galeria_imatges?.[0]?.url || p.imatge || null;
                const estatColor = ESTAT_COLORS[p.estat] ?? "var(--text-muted)";

                return (
                  <article className="proj-card" key={p.id ?? idx}>

                    <div className="proj-card-img">
                      {img
                        ? <img src={img} alt={p.titol} />
                        : <div className="proj-card-img-placeholder" />
                      }
                      <div className="proj-card-img-overlay" />

                      {p.estat && (
                        <span
                          className="proj-card-estat"
                          style={{ background: estatColor, color: "#0a0a0a" }}
                        >
                          {p.estat}
                        </span>
                      )}
                    </div>

                    <div className="proj-card-body">
                      {p.categoria && (
                        <span className="proj-card-cat">{p.categoria}</span>
                      )}
                      <h3 className="proj-card-title">{p.titol}</h3>

                      {p.resum && (
                        <p className="proj-card-resum">{p.resum}</p>
                      )}

                      <div className="proj-card-meta">
                        {p.lloc && (
                          <span className="proj-card-meta-item">
                            <i className="ti ti-map-pin" /> {p.lloc}
                          </span>
                        )}
                        {p.data_publicacio && (
                          <span className="proj-card-meta-item">
                            <i className="ti ti-calendar" /> {fmtDate(p.data_publicacio)}
                          </span>
                        )}
                      </div>
                      <button className="proj-card-btn" onClick={() => navigate(`/projectes/${p.id}`)}>
                        Veure projecte <i className="ti ti-arrow-right" />
                      </button>
                    </div>

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