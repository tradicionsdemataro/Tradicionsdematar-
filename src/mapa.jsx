import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "./components/navbarComponente/navbar.jsx";
import Footer from "./components/footerComponente/footer.jsx";
import "./css/mapa.css";

// ─── Fix leaflet icons ────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Categoria config: icono, color, label ───────────────────────────────────
const CATEGORIES = {
  "festa major":        { icon: "/images/cat-festa.png",      color: "#ffd25a", label: "Festa Major"        },
  "concerts":           { icon: "/images/cat-music.png",      color: "#5aa6ff", label: "Concerts"           },
  "espectacle":         { icon: "/images/cat-espectacle.png", color: "#ffd25a", label: "Espectacle"         },
  "tradicions":         { icon: "/images/cat-tradicio.png",   color: "#ff5a2e", label: "Tradicions"         },
  "activitat familiar": { icon: "/images/cat-familia.png",    color: "#ff7fc0", label: "Família"            },
  "nadal":              { icon: "/images/cat-nadal.png",      color: "#ff7fc0", label: "Nadal"              },
  "cinema":             { icon: "/images/cat-cinema.png",     color: "#ff7fc0", label: "Cinema"             },
  "exposicions i +":    { icon: "/images/cat-expo.png",       color: "#5aa6ff", label: "Exposicions"        },
  "default":            { icon: "/images/cat-default.png",    color: "#ffd25a", label: "Esdeveniment"       },
};

function getCat(ambit) {
  if (!ambit) return CATEGORIES["default"];
  return CATEGORIES[ambit.toLowerCase()] ?? CATEGORIES["default"];
}

// ─── Custom DivIcon amb icono de categoria ───────────────────────────────────
function makeCatIcon(ambit, selected = false) {
  const cat  = getCat(ambit);
  const size = selected ? 52 : 42;
  return new L.DivIcon({
    className: "",
    html: `
      <div class="map-pin${selected ? " selected" : ""}" style="--pin-color:${cat.color}">
        <div class="map-pin-bg">
          <img src="${cat.icon}" class="map-pin-icon" alt="${cat.label}"
               onerror="this.style.display='none';this.parentElement.innerHTML='<span class=map-pin-fallback>${cat.label[0]}</span>'" />
        </div>
        <div class="map-pin-needle"></div>
        <div class="map-pin-pulse"></div>
      </div>`,
    iconSize:    [size, size + 10],
    iconAnchor:  [size / 2, size + 10],
    popupAnchor: [0, -(size + 12)],
  });
}

// ─── Normalize event from backend ─────────────────────────────────────────────
function normalizeEvent(e) {
  return {
    id:        e.id ?? e._id,
    titol:     e.titol ?? e.title ?? e.nom ?? "Sense títol",
    descripcio:e.descripcio ?? e.resum ?? e.description ?? "",
    ambit:     e.ambit ?? e.categoria ?? e.category ?? "",
    ubicacio:  e.ubicacio ?? e.lloc ?? e.location ?? "",
    imatge:    e.imatge ?? e.img ?? e.galeria_imatges?.[0]?.url ?? null,
    data:      e.data ?? e.data_inici ?? e.date ?? null,
    data_fi:   e.data_fi ?? null,
    hora:      e.hora ?? null,
    lat:       parseFloat(e.lat ?? e.latitud ?? e.latitude ?? NaN),
    lng:       parseFloat(e.lng ?? e.longitud ?? e.longitude ?? NaN),
    destacat:  e.destacat ?? false,
    tags:      e.tags ?? [],
    organitzador: e.organitzador ?? null,
  };
}

function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Map helpers ──────────────────────────────────────────────────────────────
function MapFlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 16, { duration: 1.2, easeLinearity: 0.25 });
  }, [coords, map]);
  return null;
}

function MapInstance({ onReady }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

const MATARO = [41.5372, 2.4451];

// ─── VIEW MODES ───────────────────────────────────────────────────────────────
const VIEW_MODES = [
  { id: "list",   icon: "ti-list",        label: "Llista"    },
  { id: "grid",   icon: "ti-layout-grid", label: "Graella"   },
  { id: "compact",icon: "ti-menu-2",      label: "Compacte"  },
];

// ─── SORT OPTIONS ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { id: "data",     label: "Per data"       },
  { id: "titol",    label: "Per nom"        },
  { id: "destacat", label: "Destacats"      },
];

export default function Mapa() {
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [selectedId,  setSelectedId]  = useState(null);
  const [flyCoords,   setFlyCoords]   = useState(null);
  const [search,      setSearch]      = useState("");
  const [activeAmbit, setActiveAmbit] = useState("Tots");
  const [viewMode,    setViewMode]    = useState("list");
  const [sortBy,      setSortBy]      = useState("data");
  const [showRadius,  setShowRadius]  = useState(false);
  const [radius,      setRadius]      = useState(500);
  const [mapStyle,    setMapStyle]    = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [highlightDate, setHighlightDate] = useState("");

  const markersRef = useRef({});
  const mapRef     = useRef(null);
  const sidebarRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("http://localhost:5000/events");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const raw  = Array.isArray(data) ? data : (data.events ?? data.publicacions ?? []);
        setEvents(raw.map(normalizeEvent).filter(e => !isNaN(e.lat) && !isNaN(e.lng)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const ambits = ["Tots", ...new Set(events.map(e => e.ambit).filter(Boolean))];

  const filtered = events
    .filter(e => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        e.titol.toLowerCase().includes(q) ||
        e.ubicacio.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q));
      const matchAmbit = activeAmbit === "Tots" || e.ambit === activeAmbit;
      const matchDate  = !highlightDate || (e.data && e.data.startsWith(highlightDate));
      return matchSearch && matchAmbit && matchDate;
    })
    .sort((a, b) => {
      if (sortBy === "data")     return new Date(a.data) - new Date(b.data);
      if (sortBy === "titol")    return a.titol.localeCompare(b.titol);
      if (sortBy === "destacat") return (b.destacat ? 1 : 0) - (a.destacat ? 1 : 0);
      return 0;
    });

  // ── Select & scroll to card ────────────────────────────────────────────────
  const selectEvent = useCallback((ev) => {
    setSelectedId(ev.id);
    setFlyCoords([ev.lat, ev.lng]);
    // scroll sidebar card into view
    setTimeout(() => {
      const el = document.getElementById(`card-${ev.id}`);
      if (el && sidebarRef.current) {
        sidebarRef.current.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
      }
      const m = markersRef.current[ev.id];
      if (m) m.openPopup();
    }, 900);
  }, []);

  const resetFilters = () => {
    setSearch("");
    setActiveAmbit("Tots");
    setHighlightDate("");
    setSortBy("data");
    setSelectedId(null);
    mapRef.current?.flyTo(MATARO, 14, { duration: 1 });
  };

  // ── Map tile URLs ──────────────────────────────────────────────────────────
  const TILE_STYLES = {
    dark:   "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    blue:   "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  };

  const selectedEvent = events.find(e => e.id === selectedId);

  return (
    <>
      <Navbar />

      <div className="mapa-page">

        {/* ─── HERO ─────────────────────────────────────────────────────── */}
        <div className="mapa-hero">
          <div className="mapa-hero-inner">
            <span className="section-index light">MAPA INTERACTIU</span>
            <h1 className="mapa-title">
              Explora els <span className="accent-word">esdeveniments</span>
            </h1>
            <p className="mapa-subtitle">
              {loading ? "Carregant..." : `${events.length} esdeveniments a Mataró`}
            </p>
          </div>

          {/* Hero stats */}
          {!loading && (
            <div className="mapa-hero-stats">
              {Object.entries(
                events.reduce((acc, e) => {
                  const key = e.ambit || "Altres";
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {})
              ).slice(0, 4).map(([cat, count]) => (
                <div key={cat} className="mapa-hero-stat">
                  <img
                    src={getCat(cat).icon}
                    alt={cat}
                    className="mapa-hero-stat-icon"
                    onError={e => e.target.style.display = "none"}
                  />
                  <span className="mapa-hero-stat-count" style={{ color: getCat(cat).color }}>
                    {count}
                  </span>
                  <span className="mapa-hero-stat-label">{getCat(cat).label}</span>
                </div>
              ))}
            </div>
          )}

          <span className="mapa-hero-bg">MAPA</span>
        </div>

        {/* ─── TOOLBAR ──────────────────────────────────────────────────── */}
        <div className="mapa-toolbar">
          <div className="mapa-toolbar-left">
            <button
              className={`mapa-tool-btn ${sidebarOpen ? "active" : ""}`}
              onClick={() => setSidebarOpen(v => !v)}
              title="Sidebar"
            >
              <i className="ti ti-layout-sidebar" />
            </button>

            <div className="mapa-sort-select">
              <i className="ti ti-arrows-sort" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <input
              type="date"
              className="mapa-date-filter"
              value={highlightDate}
              onChange={e => setHighlightDate(e.target.value)}
              title="Filtra per data"
            />

            {(search || activeAmbit !== "Tots" || highlightDate) && (
              <button className="mapa-reset-btn" onClick={resetFilters}>
                <i className="ti ti-x" /> Netejar filtres
              </button>
            )}
          </div>

          <div className="mapa-toolbar-right">
            {/* View mode */}
            <div className="mapa-view-btns">
              {VIEW_MODES.map(v => (
                <button
                  key={v.id}
                  className={`mapa-view-btn ${viewMode === v.id ? "active" : ""}`}
                  onClick={() => setViewMode(v.id)}
                  title={v.label}
                >
                  <i className={`ti ${v.icon}`} />
                </button>
              ))}
            </div>

            {/* Map style */}
            <div className="mapa-style-btns">
              {Object.keys(TILE_STYLES).map(s => (
                <button
                  key={s}
                  className={`mapa-style-btn ${mapStyle === s ? "active" : ""}`}
                  onClick={() => setMapStyle(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Radius toggle */}
            <button
              className={`mapa-tool-btn ${showRadius ? "active" : ""}`}
              onClick={() => setShowRadius(v => !v)}
              title="Radi de cerca"
            >
              <i className="ti ti-circle-dotted" />
            </button>

            {showRadius && (
              <div className="mapa-radius-control">
                <span>{radius}m</span>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={100}
                  value={radius}
                  onChange={e => setRadius(Number(e.target.value))}
                />
              </div>
            )}

            <button
              className="mapa-tool-btn"
              onClick={() => mapRef.current?.locate({ setView: true, maxZoom: 16 })}
              title="La meva ubicació"
            >
              <i className="ti ti-current-location" />
            </button>
          </div>
        </div>

        {/* ─── LAYOUT ───────────────────────────────────────────────────── */}
        <div className={`mapa-layout ${sidebarOpen ? "" : "sidebar-hidden"}`}>

          {/* SIDEBAR */}
          <aside className="mapa-sidebar" ref={sidebarRef}>

            <div className="mapa-search-box">
              <i className="ti ti-search mapa-search-icon" />
              <input
                type="text"
                placeholder="Cerca un esdeveniment..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="mapa-search-clear" onClick={() => setSearch("")}>
                  <i className="ti ti-x" />
                </button>
              )}
            </div>

            {/* CATEGORY FILTER */}
            <div className="mapa-cat-filter">
              <button
                className={`mapa-cat-btn ${activeAmbit === "Tots" ? "active" : ""}`}
                onClick={() => setActiveAmbit("Tots")}
              >
                <span className="mapa-cat-icon-wrap">
                  <i className="ti ti-grid-dots" />
                </span>
                <span>Tots</span>
              </button>

              {ambits.filter(a => a !== "Tots").map(a => {
                const cat = getCat(a);
                const isActive = activeAmbit === a;
                return (
                  <button
                    key={a}
                    className={`mapa-cat-btn ${isActive ? "active" : ""}`}
                    onClick={() => setActiveAmbit(isActive ? "Tots" : a)}
                    style={isActive ? { borderColor: cat.color, color: cat.color } : {}}
                  >
                    <span className="mapa-cat-icon-wrap">
                      <img
                        src={cat.icon}
                        alt={cat.label}
                        className="mapa-cat-icon"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    </span>
                    <span>{cat.label}</span>
                    <span className="mapa-cat-count" style={isActive ? { background: cat.color, color: "#0a0a0a" } : {}}>
                      {events.filter(ev => ev.ambit === a).length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mapa-count">
              <span>{filtered.length}</span> / {events.length} resultats
            </div>

            {/* EVENT LIST */}
            <div className={`mapa-event-list view-${viewMode}`}>
              {loading && (
                <div className="mapa-state">
                  <div className="mapa-spinner" />
                  <p>Carregant...</p>
                </div>
              )}
              {error && <div className="mapa-state error"><p>Error: {error}</p></div>}
              {!loading && !error && filtered.length === 0 && (
                <div className="mapa-state">
                  <i className="ti ti-map-off" style={{ fontSize: "2rem", opacity: 0.3 }} />
                  <p>Cap resultat trobat.</p>
                  <button className="mapa-reset-btn" onClick={resetFilters}>Netejar filtres</button>
                </div>
              )}

              {filtered.map((ev) => {
                const cat        = getCat(ev.ambit);
                const isSelected = selectedId === ev.id;
                return (
                  <div
                    id={`card-${ev.id}`}
                    key={ev.id}
                    className={`mapa-event-card ${isSelected ? "selected" : ""} ${ev.destacat ? "destacat" : ""}`}
                    onClick={() => selectEvent(ev)}
                    style={isSelected ? { borderLeftColor: cat.color } : {}}
                  >
                    {ev.destacat && <span className="mapa-card-badge">Destacat</span>}

                    <div className="mapa-card-cat-icon" style={{ background: cat.color + "22", borderColor: cat.color + "55" }}>
                      <img
                        src={cat.icon}
                        alt={cat.label}
                        onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = `<span style="color:${cat.color};font-weight:700;font-size:1rem">${cat.label[0]}</span>`; }}
                      />
                    </div>

                    <div className="mapa-card-body">
                      {ev.imatge && viewMode !== "compact" && (
                        <div className="mapa-card-img">
                          <img src={ev.imatge} alt={ev.titol} />
                        </div>
                      )}
                      <div className="mapa-card-info">
                        {ev.ambit && (
                          <span className="mapa-card-ambit" style={{ color: cat.color }}>{ev.ambit}</span>
                        )}
                        <h3 className="mapa-card-title">{ev.titol}</h3>
                        {ev.ubicacio && (
                          <p className="mapa-card-location">
                            <i className="ti ti-map-pin" /> {ev.ubicacio}
                          </p>
                        )}
                        {ev.data && (
                          <p className="mapa-card-date">
                            <i className="ti ti-calendar" /> {fmtDate(ev.data)}
                            {ev.data_fi && ev.data_fi !== ev.data && ` → ${fmtDate(ev.data_fi)}`}
                          </p>
                        )}
                        {ev.hora && <span className="mapa-card-hora" style={{ background: cat.color, color: "#0a0a0a" }}>{ev.hora}</span>}
                        {ev.tags.length > 0 && viewMode !== "compact" && (
                          <div className="mapa-card-tags">
                            {ev.tags.slice(0, 3).map(t => (
                              <span key={t} className="mapa-card-tag">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* MAP */}
          <div className="mapa-container">
            <MapContainer
              center={MATARO}
              zoom={14}
              className="leaflet-map"
              zoomControl={false}
            >
              <TileLayer
                key={mapStyle}
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url={TILE_STYLES[mapStyle]}
              />

              <MapFlyTo coords={flyCoords} />
              <MapInstance onReady={m => { mapRef.current = m; }} />

              {/* Radius circle around selected */}
              {showRadius && selectedEvent && (
                <Circle
                  center={[selectedEvent.lat, selectedEvent.lng]}
                  radius={radius}
                  pathOptions={{ color: "#ffd25a", fillColor: "#ffd25a", fillOpacity: 0.08, weight: 1.5, dashArray: "6 4" }}
                />
              )}

              {filtered.map(ev => (
                <Marker
                  key={ev.id}
                  position={[ev.lat, ev.lng]}
                  icon={makeCatIcon(ev.ambit, selectedId === ev.id)}
                  ref={r => { if (r) markersRef.current[ev.id] = r; }}
                  eventHandlers={{ click: () => selectEvent(ev) }}
                >
                  <Popup className="mapa-popup" maxWidth={280}>
                    <div className="popup-inner">
                      {ev.imatge && (
                        <img src={ev.imatge} alt={ev.titol} className="popup-img" />
                      )}
                      <div className="popup-body">
                        <div className="popup-cat" style={{ color: getCat(ev.ambit).color }}>
                          <img
                            src={getCat(ev.ambit).icon}
                            alt={ev.ambit}
                            className="popup-cat-icon"
                            onError={e => e.target.style.display = "none"}
                          />
                          {ev.ambit}
                        </div>
                        <h3 className="popup-title">{ev.titol}</h3>
                        {ev.descripcio && (
                          <p className="popup-desc">{ev.descripcio.slice(0, 120)}…</p>
                        )}
                        {ev.ubicacio && (
                          <p className="popup-location">
                            <i className="ti ti-map-pin" /> {ev.ubicacio}
                          </p>
                        )}
                        {ev.data && (
                          <p className="popup-date" style={{ color: getCat(ev.ambit).color }}>
                            <i className="ti ti-calendar" /> {fmtDate(ev.data)}
                            {ev.hora ? ` · ${ev.hora}` : ""}
                          </p>
                        )}
                        {ev.organitzador && (
                          <p className="popup-org"><i className="ti ti-building" /> {ev.organitzador}</p>
                        )}
                        {ev.tags.length > 0 && (
                          <div className="popup-tags">
                            {ev.tags.map(t => <span key={t} className="popup-tag">{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Zoom controls */}
            <div className="mapa-zoom-controls">
              <button className="mapa-zoom-btn" onClick={() => mapRef.current?.zoomIn()}>+</button>
              <button className="mapa-zoom-btn" onClick={() => mapRef.current?.zoomOut()}>−</button>
              <button className="mapa-zoom-btn mapa-home-btn" title="Centrar" onClick={() => mapRef.current?.flyTo(MATARO, 14, { duration: 1 })}>
                <i className="ti ti-home" />
              </button>
            </div>

            {/* Count badge */}
            <div className="mapa-badge">
              <span>{filtered.length}</span> events visibles
            </div>

            {/* Selected event panel */}
            {selectedEvent && (
              <div className="mapa-selected-panel">
                <div className="mapa-selected-cat" style={{ background: getCat(selectedEvent.ambit).color }}>
                  <img
                    src={getCat(selectedEvent.ambit).icon}
                    alt={selectedEvent.ambit}
                    onError={e => e.target.style.display = "none"}
                  />
                </div>
                <div className="mapa-selected-info">
                  <p className="mapa-selected-ambit" style={{ color: getCat(selectedEvent.ambit).color }}>
                    {selectedEvent.ambit}
                  </p>
                  <p className="mapa-selected-title">{selectedEvent.titol}</p>
                  {selectedEvent.data && (
                    <p className="mapa-selected-date">{fmtDate(selectedEvent.data)}</p>
                  )}
                </div>
                <button className="mapa-selected-close" onClick={() => setSelectedId(null)}>
                  <i className="ti ti-x" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}