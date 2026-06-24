import React, { useState, useMemo } from 'react';
import Navbar from './components/navbarComponente/navbar.jsx';
import Footer from './components/footerComponente/footer.jsx';

import './css/links.css';

const categories = [
  {
    id: "institucional",
    className: "cat-institucional",
    icon: "🏛️",
    nom: "Institucionals i Cultura",
    accentColor: "var(--yellow)",
    links: [
      { nom: "TV Mataró",       url: "https://www.tvmataro.cat/" },
      { nom: "Cultura Mataró",  url: "https://www.culturamataro.cat/" },
      { nom: "Fundació Iluro",  url: "https://fundacioiluro.cat/" },
      { nom: "Visit Mataró",    url: "https://visitmataro.cat/" },
      { nom: "EMM Mataró",      url: "https://www.emmmataro.cat/" },
      { nom: "Sala Cabanyes",   url: "https://salacabanyes.cat/" },
      { nom: "Capgròs",         url: "https://capgros.elnacional.cat/" },
    ],
  },
  {
    id: "festes",
    className: "cat-festes",
    icon: "🎭",
    nom: "Festes i Tradicions",
    accentColor: "var(--orange)",
    links: [
      { nom: "Pessebres de Mataró",    url: "https://www.pessebresmataro.org/" },
      { nom: "Setmana Santa Mataró",   url: "https://setmanasantamataro.blogspot.com/" },
      { nom: "Armats de Mataró",       url: "https://armatsdemataro.cat/" },
      { nom: "Hermandad Nazareno",     url: "https://hermandadnazareno.blogspot.com/" },
      { nom: "Crist Bona Mort",        url: "https://cristbonamort.blogspot.com/" },
      { nom: "Captiu Dolors Mataró",   url: "https://captiudolorsmataro.blogspot.com/" },
      { nom: "Coronació d'Espines",    url: "https://bonamort.wixsite.com/coronaciodespines" },
      { nom: "Pellofa Oficial",        url: "https://www.pellofaoficial.com/" },
      { nom: "Cercavila.cat",          url: "https://cercavila.cat/" },
      { nom: "Sardanistes Sta. Anna",  url: "https://sardanistesdesantaanna.blogspot.com/" },
    ],
  },
  {
    id: "musica",
    className: "cat-musica",
    icon: "🎶",
    nom: "Música, Colles i Associacions",
    accentColor: "var(--pink)",
    links: [
      { nom: "NEM",                  url: "https://nem.cat/" },
      { nom: "La Gofreria",          url: "https://lagofreria.com/" },
      { nom: "Godrac Mataró",        url: "https://www.godracmataro.cat/" },
      { nom: "GIE Escola",           url: "https://www.giescola.com/" },
      { nom: "Boetukada",            url: "https://boetukadaboetukada.blogspot.com/" },
      { nom: "AV Cirera",            url: "https://www.avcirera.cat/" },
      { nom: "Colla Lucius Marcius", url: "https://collaluciusmarcius.wordpress.com/" },
      { nom: "Mestres del Gai Saber",url: "https://mestresdelgaisaber.cat/" },
      { nom: "CLAP",                 url: "https://www.clap.cat/" },
      { nom: "Casa de la Música",    url: "https://www.casadelamusica.cat/" },
      { nom: "MC Guiu",              url: "https://mcguiu.cat/" },
      { nom: "Oscar Torres Band",    url: "https://www.oscartorresband.es/" },
    ],
  },
  {
    id: "port",
    className: "cat-port",
    icon: "⚓",
    nom: "Port, Marina i Esports",
    accentColor: "var(--blue)",
    links: [
      { nom: "Port Mataró", url: "https://portmataro.org/" },
      { nom: "REM Mataró",  url: "https://remmataro.com/" },
    ],
  },
  {
    id: "llibres",
    className: "cat-llibres",
    icon: "📚",
    nom: "Llibres, Arts i Educació",
    accentColor: "var(--yellow)",
    links: [
      { nom: "Dòria Llibres",        url: "https://www.doriallibres.com/" },
      { nom: "Espai Agrari Mataró",  url: "https://espaiagrarimataro.cat/" },
      { nom: "Rovira Brull",         url: "https://rovirabrull.cat/" },
    ],
  },
  {
    id: "festivals",
    className: "cat-festivals",
    icon: "🎉",
    nom: "Festivals i Esdeveniments",
    accentColor: "var(--pink)",
    links: [
      { nom: "Festa Tardor",       url: "https://www.festatardor.com/" },
      { nom: "Festival 2 Tersos",  url: "https://www.festival2tersos.cat/" },
      { nom: "La Fuerza del Alma", url: "https://lafuerzadelalma.com/" },
      { nom: "Mashup Party",       url: "https://mashupparty.com/" },
    ],
  },
  {
    id: "gegants",
    className: "cat-gegants",
    icon: "🤴",
    nom: "Gegants, Capgrossos i Tradicions Populars",
    accentColor: "var(--orange)",
    links: [
      { nom: "Gegantcat",      url: "https://gegantcat.com/" },
      { nom: "Gegants Mataró", url: "https://www.gegantsmataro.net/" },
      { nom: "Robafaves",      url: "https://www.robafaves.cat/" },
      { nom: "Capgrossos",     url: "https://capgrossos.cat/" },
    ],
  },
  {
    id: "social",
    className: "cat-social",
    icon: "🏢",
    nom: "Fundacions i Suport Social",
    accentColor: "var(--blue)",
    links: [
      { nom: "Fundació Maresme",       url: "http://www.fundaciomaresme.cat/" },
      { nom: "Associació Sempervirens", url: "https://firadelarbremataro.com/" },
    ],
  },
];

const totalLinks = categories.reduce((acc, c) => acc + c.links.length, 0);

function netloc(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url; }
}

// Highlight text that matches query
function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="lk-hl">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const Links = () => {
  const [search, setSearch]       = useState("");
  const [activeCat, setActiveCat] = useState("all");

  // Filtered + searched categories
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .filter(cat => activeCat === "all" || cat.id === activeCat)
      .map(cat => ({
        ...cat,
        links: cat.links.filter(l =>
          !q ||
          l.nom.toLowerCase().includes(q) ||
          netloc(l.url).toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.links.length > 0);
  }, [search, activeCat]);

  const filteredTotal = filtered.reduce((a, c) => a + c.links.length, 0);
  const hasResults    = filtered.length > 0;

  return (
    <div className="links-page">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="links-hero">
        <span className="links-hero-bg-text">LINKS</span>
        <div className="links-hero-inner">
          <span className="links-hero-index">
            <i className="ti ti-link" style={{ marginRight: 8 }} />
            DIRECTORI CULTURAL · MATARÓ
          </span>
          <h1 className="links-hero-title">
            LINKS<br />
            <span className="lh-accent">D'INTERÈS</span>
          </h1>
          <p className="links-hero-desc">
            Una selecció de webs, entitats i recursos relacionats amb la vida cultural de Mataró:
            mitjans locals, associacions, música, patrimoni, tradicions, festivals i projectes educatius.
          </p>
          <div className="links-hero-pills">
            <span className="lh-pill p-yellow"><strong>{categories.length}</strong> categories</span>
            <span className="lh-pill p-blue"><strong>{totalLinks}</strong> links</span>
            <span className="lh-pill p-pink"><i className="ti ti-external-link" /> tots externs</span>
          </div>
        </div>
      </section>

      {/* ===== BUSCADOR + FILTRES (sticky) ===== */}
      <div className="links-controls">

        {/* Search */}
        <div className="lk-search-wrap">
          <i className="ti ti-search lk-search-icon" />
          <input
            className="lk-search-input"
            type="text"
            placeholder="Cerca un recurs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            spellCheck={false}
          />
          {search && (
            <button className="lk-search-clear" onClick={() => setSearch("")} aria-label="Esborrar cerca">
              <i className="ti ti-x" />
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div className="lk-filter-pills">
          <button
            className={`lk-fpill ${activeCat === "all" ? "active" : ""}`}
            onClick={() => setActiveCat("all")}
          >
            Tots
            <span className="lk-fpill-count">{totalLinks}</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`lk-fpill ${activeCat === cat.id ? "active" : ""}`}
              onClick={() => setActiveCat(activeCat === cat.id ? "all" : cat.id)}
              style={activeCat === cat.id ? { "--fpill-accent": cat.accentColor } : {}}
            >
              {cat.icon} {cat.nom}
              <span className="lk-fpill-count">{cat.links.length}</span>
            </button>
          ))}
        </div>

        {/* Resultat count */}
        <div className="lk-results-count">
          {search || activeCat !== "all" ? (
            <span>
              <strong>{filteredTotal}</strong> resultat{filteredTotal !== 1 ? "s" : ""}
              {search && <> per "<em>{search}</em>"</>}
              {activeCat !== "all" && <> · {categories.find(c => c.id === activeCat)?.nom}</>}
            </span>
          ) : (
            <span><strong>{totalLinks}</strong> recursos en total</span>
          )}
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="links-body">
        {!hasResults ? (
          <div className="lk-empty">
            <i className="ti ti-search-off" />
            <p>Cap resultat per "<strong>{search}</strong>"</p>
            <button className="lk-empty-reset" onClick={() => { setSearch(""); setActiveCat("all"); }}>
              Netejar filtres
            </button>
          </div>
        ) : (
          filtered.map(cat => (
            <div key={cat.id} className={`lk-cat ${cat.className}`}>

              {/* Label lateral */}
              <div className="lk-cat-label">
                <span className="lk-cat-icon">{cat.icon}</span>
                <span className="lk-cat-name">{cat.nom}</span>
                <span className="lk-cat-count">{cat.links.length} recurs{cat.links.length !== 1 ? "os" : ""}</span>
                <div className="lk-cat-accent-line" style={{ background: cat.accentColor }} />
              </div>

              {/* Grid */}
              <div className="lk-grid">
                {cat.links.map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lk-card"
                  >
                    <div className="lk-card-text">
                      <span className="lk-card-name">
                        <Highlight text={link.nom} query={search} />
                      </span>
                      <span className="lk-card-url">
                        <Highlight text={netloc(link.url)} query={search} />
                      </span>
                    </div>
                    <i className="ti ti-arrow-up-right lk-card-arrow" />
                  </a>
                ))}
              </div>

            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Links;