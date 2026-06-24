import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "./components/navbarComponente/navbar.jsx";
import Footer from "./components/footerComponente/footer.jsx";
import "./css/events.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });
}

const ESTAT_COLORS = {
  publicat:    "var(--yellow)",
  esborrany:   "var(--blue)",
  arxivat:     "var(--pink)",
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [cerca, setCerca]               = useState("");
  const [estat, setEstat]               = useState("tots");
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
        const res  = await fetch("http://localhost:5000/events");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : (data.events ?? []));
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
    const set = new Set(events.map(p => p.categoria).filter(Boolean));
    return ["tots", ...set];
  }, [events]);

  // ── Filtre ────────────────────────────────────────────────────────────────
  const filtrades = useMemo(() => {
    return events.filter((p) => {
      const q = cerca.toLowerCase();
      const matchCerca     = !q || p.titol?.toLowerCase().includes(q) || p.resum?.toLowerCase().includes(q);
      const matchCategoria = categoriaURL === "tots" || p.categoria === categoriaURL;
      const matchEstat     = estat === "tots" || p.estat === estat;
      return matchCerca && matchCategoria && matchEstat;
    });
  }, [events, cerca, categoriaURL, estat]);

  const resetFiltres = () => {
    setCerca("");
    setEstat("tots");
    setCategoria("tots");
  };

  const hiHaFiltres = cerca || estat !== "tots" || categoriaURL !== "tots";

  return (
    <>
      <Navbar />

      <main className="events-page">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="events-hero">
          <div className="events-hero-inner">
            <span className="section-index light">EVEMTS</span>
            <h1 className="events-title">
              El que<br />
              <span className="accent-word">expliquem</span>.
            </h1>
            <p className="events-subtitle">
              Actes, festes i reportatges sobre la cultura i les tradicions de Mataró.
            </p>
          </div>

          {!loading && (
            <div className="events-hero-stats">
              <div className="events-hero-stat">
                <span className="events-hero-stat-num" style={{ color: "var(--yellow)" }}>
                  {events.length}
                </span>
                <span className="events-hero-stat-label">Events totals</span>
              </div>
              <div className="events-hero-stat">
                <span className="events-hero-stat-num" style={{ color: "var(--blue)" }}>
                  {events.filter(p => p.estat === "publicat").length}
                </span>
                <span className="events-hero-stat-label">Publicades</span>
              </div>
              <div className="events-hero-stat">
                <span className="events-hero-stat-num" style={{ color: "var(--pink)" }}>
                  {categories.length - 1}
                </span>
                <span className="events-hero-stat-label">Categories</span>
              </div>
            </div>
          )}

          <span className="events-bg">Events</span>
        </section>

        {/* ── FILTRES ───────────────────────────────────────── */}
        <section className="events-filters">

          {/* Cerca */}
          <div className="pf-search-box">
            <i className="ti ti-search pf-search-icon" />
            <input
              type="text"
              placeholder="Cerca events..."
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
          <div className="event-cat-pills">
            {categories.map((c) => (
              <button
                key={c}
                className={`event-cat-pill ${categoriaURL === c ? "active" : ""}`}
                onClick={() => setCategoria(c)}
              >
                {c === "tots" ? "Totes" : c}
                <span className="event-cat-pill-count">
                  {c === "tots"
                    ? events.length
                    : events.filter(p => p.categoria === c).length}
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
              <strong>{filtrades.length}</strong> / {events.length}
            </span>
          </div>

        </section>

        {/* ── GRID ──────────────────────────────────────────── */}
        <section className="events-grid-section">

          {loading && (
            <div className="events-state">
              <div className="events-spinner" />
              <p>Carregant events...</p>
            </div>
          )}

          {error && (
            <div className="events-state error">
              <i className="ti ti-alert-circle" style={{ fontSize: "2rem" }} />
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && !error && filtrades.length === 0 && (
            <div className="events-state">
              <i className="ti ti-zoom-cancel" style={{ fontSize: "2rem", opacity: 0.3 }} />
              <p>Cap publicació trobada.</p>
              <button className="pf-reset-btn" onClick={resetFiltres}>Netejar filtres</button>
            </div>
          )}

          {!loading && !error && filtrades.length > 0 && (
            <div className="events-grid">
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
                        <span
                          className="pub-card-estat"
                          style={{ background: estatColor, color: "#0a0a0a" }}
                        >
                          {p.estat}
                        </span>
                      )}
                    </div>

                    <div className="pub-card-body">
                      {p.categoria && (
                        <span className="event-card-cat">{p.categoria}</span>
                      )}
                      <h3 className="pub-card-title">{p.titol}</h3>

                      {p.resum && (
                        <p className="pub-card-resum">{p.resum}</p>
                      )}

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

                      <button className="event-card-btn" onClick={() => navigate(`/events/${p.id}`)}>
                        Llegir més <i className="ti ti-arrow-right" />
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