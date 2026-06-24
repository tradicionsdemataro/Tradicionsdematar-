import "./overlay.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const pagines = [
  {
    nom: "Home",
    url: "/home",
    imatge: "/images/home.png",
    tipusLabel: "Pàgina",
    categoria: "General",
  },
  {
    nom: "About",
    url: "/qui-som",
    imatge: "/images/quisom.png",
    tipusLabel: "Pàgina",
    categoria: "Informació",
  },
  {
    nom: "Contact",
    url: "/contacte",
    imatge: "/images/contacte.png",
    tipusLabel: "Pàgina",
    categoria: "Contacte",
  },
  {
    nom: "Agenda",
    url: "/agenda",
    imatge: "/images/agenda.png",
    tipusLabel: "Agenda",
    categoria: "Activitat familiar",
  },
  {
    nom: "Projectes",
    url: "/projectes",
    imatge: "/images/projectes.png",
    tipusLabel: "Projecte",
    categoria: "Tradicional",
  },
  {
    nom: "Publicacions",
    url: "/publicacions",
    imatge: "/images/publicacions.png",
    tipusLabel: "Publicació",
    categoria: "Exposicions i +",
  },
  {
    nom: "Events",
    url: "/events",
    imatge: "/images/events.png",
    tipusLabel: "Event",
    categoria: "Música",
  },
];

const ambits = [
  "Activitat familiar",
  "Música",
  "Espectacle",
  "Tradicional",
  "Exposicions i +",
  "Festes i tradicions",
  "Cinema",
];

const ubicacions = [
  "Plaça de Santa Anna",
  "Ajuntament de Mataró",
  "M|A|C Presó",
  "Teatre Monumental",
  "Espai Firal del Nou Parc Central",
  "Passeig del Callao",
  "Llar Cabanellas",
];

const ambitClassMap = {
  "Activitat familiar": "ambit--familiar",
  "Música": "ambit--musica",
  "Espectacle": "ambit--espectacle",
  "Tradicional": "ambit--tradicional",
  "Exposicions i +": "ambit--exposicions",
  "Festes i tradicions": "ambit--festes",
  "Cinema": "ambit--cinema",
};

function getAmbitClass(ambit) {
  return ambitClassMap[ambit] || "ambit--tradicional";
}

function formatHora(item) {
  if (item.hora) return item.hora;
  if (item.data_publicacio || item.data) {
    const d = new Date(item.data_publicacio || item.data);
    if (!isNaN(d)) {
      return d.toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" });
    }
  }
  return null;
}

function formatDate(item) {
  const raw = item.data_publicacio || item.data;
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });
}

export default function SearchContent({ onClose }) {
  const navigate = useNavigate();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedAmbits, setSelectedAmbits] = useState([]);
  const [selectedUbicacions, setSelectedUbicacions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [events, setEvents] = useState([]);
  const [publicacions, setPublicacions] = useState([]);
  const [projectes, setProjectes] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeFilterCount =
    selectedAmbits.length +
    selectedUbicacions.length +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0) +
    (startTime ? 1 : 0) +
    (endTime ? 1 : 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsRes, pubRes, projRes] = await Promise.all([
          fetch("http://localhost:5000/events"),
          fetch("http://localhost:5000/publi"),
          fetch("http://localhost:5000/projectes"),
        ]);
        const eventsData = await eventsRes.json();
        const pubData = await pubRes.json();
        const projData = await projRes.json();
        setEvents(eventsData.events || []);
        setPublicacions(pubData.publicacions || []);
        setProjectes(projData.projectes || []);
      } catch (err) {
        console.error("Error carregant dades:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleArrayItem = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  const results = [
    ...pagines.map((p) => ({
      type: "page",
      titol: p.nom,
      url: p.url,
      imatge: p.imatge,
      tipusLabel: p.tipusLabel,
      categoria: p.categoria,
    })),
    ...events.map((e) => ({
      ...e,
      type: "event",
      tipusLabel: "Event",
      url: `/events/${e.id || e._id}`,
    })),
    ...publicacions.map((p) => ({
      ...p,
      type: "publicacio",
      tipusLabel: "Publicació",
      url: `/publicacions/${p.id || p._id}`,
    })),
    ...projectes.map((p) => ({
      ...p,
      type: "projecte",
      tipusLabel: "Projecte",
      url: `/projectes/${p.id || p._id}`,
    })),
  ];

  const filteredResults = results.filter((item) =>
    (item.titol || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClick = (item) => {
    if (item.url) {
      navigate(item.url);
      if (onClose) onClose();
    }
  };

  return (
    <div className="search-content">
      {/* ── MOBILE TOPBAR ── */}
      <div className="mobile-topbar">
        <div className="mobile-search-wrap">
          <svg className="mobile-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="mobile-search-input"
            placeholder="Cerca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className="mobile-clear-btn" onClick={() => setSearchQuery("")} aria-label="Esborrar">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="2" x2="14" y2="14" /><line x1="14" y1="2" x2="2" y2="14" />
              </svg>
            </button>
          )}
        </div>

        <button
          className={`mobile-filter-toggle ${filtersOpen ? "active" : ""}`}
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-label="Filtres"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* ── FILTERS DRAWER (mobile) / SIDEBAR (desktop) ── */}
      <aside className={`filters-sidebar ${filtersOpen ? "filters-open" : ""}`}>
        <div className="filters-sidebar-inner">
          <div className="filters-header-row">
            <h2 className="filters-title">Filtres</h2>
            <button
              className="filters-close-btn"
              onClick={() => setFiltersOpen(false)}
              aria-label="Tancar filtres"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="2" x2="14" y2="14" /><line x1="14" y1="2" x2="2" y2="14" />
              </svg>
            </button>
          </div>
          <div className="filters-divider" />

          {/* DATES */}
          <div className="filter-section">
            <h3 className="filter-heading">Dates</h3>
            <div className="date-range-container">
              <label>Des de:<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
              <label>Fins a:<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
            </div>
          </div>

          {/* HORA */}
          <div className="filter-section">
            <h3 className="filter-heading">Hora</h3>
            <div className="time-range-container">
              <label>Des de:<input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label>
              <label>Fins a:<input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></label>
            </div>
          </div>

          {/* ÀMBITS */}
          <div className="filter-section">
            <h3 className="filter-heading">Àmbits</h3>
            <div className="checkbox-container">
              {ambits.map((item, index) => (
                <div className="checkbox-item" key={index}>
                  <input
                    type="checkbox"
                    id={`ambit-${index}`}
                    checked={selectedAmbits.includes(item)}
                    onChange={() => toggleArrayItem(item, selectedAmbits, setSelectedAmbits)}
                  />
                  <label htmlFor={`ambit-${index}`}>
                    <span className="img-box" />
                    <span className="text-box">{item}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* UBICACIÓ */}
          <div className="filter-section">
            <h3 className="filter-heading">Ubicació</h3>
            <div className="checkbox-container">
              {ubicacions.map((item, index) => (
                <div className="checkbox-item" key={index}>
                  <input
                    type="checkbox"
                    id={`ubicacio-${index}`}
                    checked={selectedUbicacions.includes(item)}
                    onChange={() => toggleArrayItem(item, selectedUbicacions, setSelectedUbicacions)}
                  />
                  <label htmlFor={`ubicacio-${index}`}>
                    <span className="img-box" />
                    <span className="text-box">{item}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* CTA aplicar filtres (mobile) */}
          {activeFilterCount > 0 && (
            <button
              className="filters-apply-btn"
              onClick={() => setFiltersOpen(false)}
            >
              Veure {filteredResults.length} resultats
            </button>
          )}
        </div>
      </aside>

      {/* Overlay fosc darrere el drawer en mobile */}
      {filtersOpen && (
        <div className="filters-backdrop" onClick={() => setFiltersOpen(false)} />
      )}

      {/* ── RESULTS AREA ── */}
      <div className="results-area">
        {/* Search visible només en desktop (en mobile ja està al topbar) */}
        <div className="results-search desktop-only">
          <input
            type="text"
            placeholder="Cerca resultats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="results-grid">
          {loading && <p className="loading">Carregant...</p>}

          {!loading && filteredResults.length === 0 && (
            <p className="no-results">No hi ha resultats</p>
          )}

          {filteredResults.map((item) => {
            const hora = formatHora(item);
            const data = formatDate(item);
            const ambit = item.ambit || item.categoria;
            const tipus = item.tipusLabel;

            return (
              <div
                key={item.id || item._id || item.url}
                className="card"
                onClick={() => handleClick(item)}
              >
                <div className="card-image">
                  <img
                    src={item.imatge || item.img || "/images/placeholder.jpg"}
                    alt={item.titol}
                  />
                  <div className="badges">
                    {tipus && <span className="badge-audiencia badge-tipus">{tipus}</span>}
                    {hora && <span className="badge-hora">{hora}</span>}
                    {ambit && <span className={`badge-audiencia ${getAmbitClass(ambit)}`}>{ambit}</span>}
                  </div>
                  <span className="card-title">{item.titol}</span>
                </div>

                <div className="card-info">
                  {data && <span className="card-date">{data}</span>}
                  <p>{item.descripcio}</p>
                  {item.ubicacio && <span className="card-location">{item.ubicacio}</span>}
                  {item.type === "page" && <p>Pàgina del sistema</p>}
                  <button className="btn-detall">Mes detall</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}