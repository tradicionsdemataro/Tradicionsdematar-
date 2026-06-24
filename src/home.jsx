import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/navbarComponente/navbar.jsx';
import Footer from './components/footerComponente/footer.jsx';
import Cookies from './components/cookies/cookies.jsx';

import './css/home.css';
import './css/home-publi.css';


const VideoCard = ({ src, title, desc, cat, catClass, date, duration, featured = false }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  const handleVolume = (e) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setMuted(val === 0);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
  };

  if (featured) {
    return (
      <div
        className="video-card video-card--featured"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="video-thumb video-thumb--featured" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={src}
            muted={muted}
            loop={false}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            className="vc-video"
          />
          <div className={`video-overlay-dark ${playing ? 'dim' : ''}`} />

          {/* Play/Pause central */}
          <button
            className={`video-play-btn video-play-btn--lg ${playing ? 'playing' : ''}`}
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            aria-label={playing ? 'Pausar' : 'Reproduir'}
          >
            <i className={`ti ${playing ? 'ti-player-pause' : 'ti-player-play'}`} />
          </button>

          <span className="video-cat video-cat--blue">{cat}</span>

          {/* Controls bar */}
          <div className={`vc-controls ${showControls || playing ? 'visible' : ''}`}>
            {/* Barra de progrés */}
            <div className="vc-progress" onClick={handleSeek}>
              <div className="vc-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="vc-bar">
              {/* Play/Pause */}
              <button className="vc-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }} aria-label="Play/Pause">
                <i className={`ti ${playing ? 'ti-player-pause' : 'ti-player-play'}`} />
              </button>

              {/* Volum */}
              <div className="vc-volume" onClick={e => e.stopPropagation()}>
                <button className="vc-btn" onClick={toggleMute} aria-label="Silenciar">
                  <i className={`ti ${muted || volume === 0 ? 'ti-volume-3' : volume < 0.5 ? 'ti-volume-2' : 'ti-volume'}`} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolume}
                  className="vc-vol-slider"
                  aria-label="Volum"
                />
              </div>

              <span className="vc-duration">{duration}</span>

              {/* Fullscreen */}
              <button
                className="vc-btn vc-fullscreen"
                onClick={(e) => { e.stopPropagation(); videoRef.current?.requestFullscreen(); }}
                aria-label="Pantalla completa"
              >
                <i className="ti ti-maximize" />
              </button>
            </div>
          </div>
        </div>

        <div className="video-info">
          <h3>{title}</h3>
          {desc && <p>{desc}</p>}
          <div className="video-meta">
            <span><i className="ti ti-calendar" /> {date}</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Compact card ── */
  return (
    <div
      className="video-card video-card--compact"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="video-thumb video-thumb--sm" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={src}
          muted={muted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="vc-video"
        />
        <div className={`video-overlay-dark ${playing ? 'dim' : ''}`} />

        <button
          className={`video-play-btn ${playing ? 'playing' : ''}`}
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          aria-label={playing ? 'Pausar' : 'Reproduir'}
        >
          <i className={`ti ${playing ? 'ti-player-pause' : 'ti-player-play'}`} />
        </button>

        <span className="video-duration">{duration}</span>

        {/* Mini controls */}
        <div className={`vc-controls vc-controls--mini ${showControls || playing ? 'visible' : ''}`}>
          <div className="vc-progress" onClick={handleSeek}>
            <div className="vc-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="vc-bar">
            <button className="vc-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }} aria-label="Play/Pause">
              <i className={`ti ${playing ? 'ti-player-pause' : 'ti-player-play'}`} />
            </button>
            <button className="vc-btn" onClick={toggleMute} aria-label="Silenciar">
              <i className={`ti ${muted ? 'ti-volume-3' : 'ti-volume'}`} />
            </button>
            <button
              className="vc-btn vc-fullscreen"
              onClick={(e) => { e.stopPropagation(); videoRef.current?.requestFullscreen(); }}
              aria-label="Pantalla completa"
            >
              <i className="ti ti-maximize" />
            </button>
          </div>
        </div>
      </div>

      <div className="video-info video-info--sm">
        <span className={`video-cat ${catClass}`}>{cat}</span>
        <h4>{title}</h4>
        <div className="video-meta">
          <span><i className="ti ti-calendar" /> {date}</span>
        </div>
      </div>
    </div>
  );
};

const timelineParagraphs = [
  {
    year: 2015,
    text: "El nostre blog Tradicions de Mataró va començar amb la idea d'explicar la cultura popular de la ciutat.",
    audio: "/audio/2015.mp3",
    img: "/images/timeline/2015.jpg",
    trobans: [
      { titol: "Trobada fundacional al Cafè del Teatre", desc: "Primera reunió de l'equip per definir la línia editorial del blog." }
    ]
  },
  {
    year: 2016,
    text: "Vam publicar les primeres entrades amb fotos i vídeos de la Mostra de Gegants, mostrant la riquesa cultural de Mataró.",
    audio: "/audio/2016.mp3",
    img: "/images/timeline/2016.jpg",
    trobans: [
      { titol: "Mostra de Gegants 2016", desc: "Cobertura completa amb fotografies i vídeos exclusius de la rua." },
      { titol: "Taller de fotografia cultural", desc: "Sessió formativa amb el col·lectiu per millorar la qualitat audiovisual." }
    ]
  },
  {
    year: 2017,
    text: "Comencem a fer reportatges més complets amb entrevistes a experts locals i fotografies exclusives.",
    audio: "/audio/2017.mp3",
    img: "/images/timeline/2017.jpg",
    trobans: [
      { titol: "Entrevista al Museu de Mataró", desc: "Conversa amb l'historiador local sobre les arrels de les festes majors." }
    ]
  },
  {
    year: 2018,
    text: "Creació de contingut original: entrevistes, noves seccions i col·laboració amb artistes locals.",
    audio: "/audio/2018.mp3",
    img: "/images/timeline/2018.jpg",
    trobans: [
      { titol: "Trobada amb artistes locals", desc: "Sessió de col·laboració al Tecla Sala per definir noves seccions." }
    ]
  },
  {
    year: 2019,
    text: "Naixement de la nostra presència a Instagram per connectar amb la comunitat jove.",
    audio: "/audio/2019.mp3",
    img: "/images/timeline/2019.jpg",
    trobans: [
      { titol: "Llançament del compte d'Instagram", desc: "Primera trobada amb seguidors per presentar el nou canal." }
    ]
  },
  {
    year: 2020,
    text: "Any especial amb contingut adaptat des de casa, incloent tutorials i activitats culturals en línia.",
    audio: "/audio/2020.mp3",
    img: "/images/timeline/2020.jpg",
    trobans: [
      { titol: "Trobades virtuals setmanals", desc: "Sessions online amb la comunitat per mantenir el contacte durant el confinament." }
    ]
  },
  {
    year: 2021,
    text: "Cobertura d'actes amb mascareta i formats digitals innovadors per mantenir viva la tradició.",
    audio: "/audio/2021.mp3",
    img: "/images/timeline/2021.jpg",
    trobans: [
      { titol: "Festa Major adaptada", desc: "Trobada a l'aire lliure amb mesures de seguretat i format híbrid." }
    ]
  },
  {
    year: 2022,
    text: "Creixement amb exposicions, col·laboracions i difusió de la cultura popular en mitjans digitals.",
    audio: "/audio/2022.mp3",
    img: "/images/timeline/2022.jpg",
    trobans: [
      { titol: "Exposició 'Memòria Viva'", desc: "Inauguració amb trobada d'entitats culturals de la ciutat." },
      { titol: "Col·laboració amb Ràdio Mataró", desc: "Primera trobada per planificar continguts conjunts." }
    ]
  },
  {
    year: 2023,
    text: "Conte de Sant Jordi i projectes especials amb participació de col·legis i associacions culturals.",
    audio: "/audio/2023.mp3",
    img: "/images/timeline/2023.jpg",
    trobans: [
      { titol: "Sant Jordi als col·legis", desc: "Trobada amb estudiants per presentar el conte commemoratiu." }
    ]
  },
  {
    year: 2024,
    text: "Expansió del contingut audiovisual, amb vídeos documentals i entrevistes en profunditat.",
    audio: "/audio/2024.mp3",
    img: "/images/timeline/2024.jpg",
    trobans: [
      { titol: "Rodatge del documental", desc: "Trobada amb els protagonistes per planificar les entrevistes en profunditat." }
    ]
  },
  {
    year: 2025,
    text: "Estrenem nova marca amb el lema: 'Teixint tradicions, creant futur', reflectint la nostra missió.",
    audio: "/audio/2025.mp3",
    img: "/images/timeline/2025.jpg",
    trobans: [
      { titol: "Presentació de la nova marca", desc: "Esdeveniment públic per donar a conèixer el rebranding i el nou lema." },
      { titol: "Trobada amb col·laboradors", desc: "Reunió per definir els objectius i projectes del 2025." }
    ]
  }
];

const sliderItems = [
  { text: "Vols unir-te a Tradicions Mataró?", link: "/unirte" },
  { text: "Vols contactar amb nosaltres?", link: "/contactar" },
  { text: "Vols saber qui som?", link: "/qui-som" },
];

const imageCarousel = [
  "/images/carrusel1.jpg",
  "/images/carrusel2.jpg",
  "/images/carrusel3.jpg"
];

const featuredArticles = [
  { titol: "La Mostra de Gegants torna amb força", categoria: "Cultura Popular", img: "/images/articles/gegants.jpg", data: "12 Maig 2026" },
  { titol: "Entrevista exclusiva amb els organitzadors de la Festa Major", categoria: "Entrevistes", img: "/images/articles/festamajor.jpg", data: "28 Abril 2026" },
  { titol: "Documental: Els oficis tradicionals de Mataró", categoria: "Audiovisual", img: "/images/articles/oficis.jpg", data: "15 Abril 2026" },
  { titol: "Sant Jordi 2026: el conte commemoratiu", categoria: "Projectes Especials", img: "/images/articles/santjordi.jpg", data: "23 Abril 2026" }
];

const statsData = [
  { numero: "10", label: "Anys de trajectòria" },
  { numero: "150", label: "Reportatges publicats" },
  { numero: "40", label: "Trobades i esdeveniments" },
  { numero: "5K", label: "Seguidors a les xarxes" }
];

const featuredTrobans = [
  { year: 2025, titol: "Presentació de la nova marca", desc: "Esdeveniment públic per donar a conèixer el rebranding i el nou lema." },
  { year: 2024, titol: "Rodatge del documental", desc: "Trobada amb els protagonistes per planificar les entrevistes en profunditat." },
  { year: 2022, titol: "Exposició 'Memòria Viva'", desc: "Inauguració amb trobada d'entitats culturals de la ciutat." },
  { year: 2021, titol: "Festa Major adaptada", desc: "Trobada a l'aire lliure amb mesures de seguretat i format híbrid." },
  { year: 2018, titol: "Trobada amb artistes locals", desc: "Sessió de col·laboració al Tecla Sala per definir noves seccions." },
  { year: 2016, titol: "Mostra de Gegants 2016", desc: "Cobertura completa amb fotografies i vídeos exclusius de la rua." },
];

const galleryItems = [
  { img: "/images/gegants-cercavila.jpg", label: "Mostra de Gegants", year: "2024", className: "g1" },
  { img: "/images/rovafabes2.jpg",        label: "Festa Major",        year: "2023", className: "g2" },
  { img: "/images/mort.jpg",              label: "Mort d'en Pallofa",  year: "2022", className: "g3" },
  { img: "/images/carnaval2.jpg",         label: "Carnaval",           year: "2025", className: "g4" },
  { img: "/images/rovafabes3.jpg",        label: "Carrers de Mataró",  year: "2021", className: "g5" },
  { img: "/images/cercavila2.jpg",        label: "Memòria Viva",       year: "2020", className: "g6" },
];

const galleryStrip = [
  { img: "/images/gegants-cercavila.jpg", label: "Castellers" },
  { img: "/images/rovafabes2.jpg",        label: "Sardanes" },
  { img: "/images/mort.jpg",              label: "Correfoc" },
  { img: "/images/carnaval2.jpg",         label: "Rua de Carnaval" },
  { img: "/images/rovafabes3.jpg",        label: "Gralla" },
  { img: "/images/cercavila2.jpg",        label: "Havaneres" },
];

const videoSideItems = [
  {
    thumb:    "/images/video1.mp4",
    title:    "La Seixantada Dels 60 anys  de la Fundació el Maresme amb la Crida a la Festa",
    cat:      "Cobertura",
    catClass: "video-cat--yellow",
    duration: "6:12",
    date:     "Juny 2026",
  },
  {
    thumb:    "/images/video2.mp4",
    title:    "Mataró celebra Sant Jordi amb una gran Trobada de gegants, gegantes i nans",
    cat:      "Reportatge",
    catClass: "video-cat--pink",
    duration: "4:47",
    date:     "Abril 2026",
  },
  {
    thumb:    "/images/video3.mp4",
    title:    "Carnestoltes Mataró 2026 festa, humor i reivindicació en una rua amb Disbauixa",
    cat:      "Especial",
    catClass: "video-cat--yellow",
    duration: "8:03",
    date:     "Febrer 2026",
  },
   {
    thumb:    "/images/video4.mp4",
    title:    "Gelats Karbú, obert tot l’any: moments de dolçor per compartir i somriure ",
    cat:      "Especial",
    catClass: "video-cat--yellow",
    duration: "8:03",
    date:     "Octubre 2026",
  },
];

const videoReels = [
  { thumb: "/images/cercavila2.jpg",      label: "Cercavila nocturna",  duration: "0:58" },
  { thumb: "/images/carnaval2.jpg",       label: "Foc i música",        duration: "1:12" },
  { thumb: "/images/gegants-cercavila.jpg", label: "Gegants infantils", duration: "0:44" },
  { thumb: "/images/rovafabes3.jpg",      label: "Sardana a la plaça",  duration: "1:05" },
  { thumb: "/images/mort.jpg",            label: "Tarda de carnaval",   duration: "0:37" },
];

const PUBLI_PER_PAGE = 4;

const Home = () => {
  const [showClock, setShowClock] = useState(false);
  const [time, setTime] = useState(new Date());

  const yearsContainerRef = useRef(null);
  const [likedYears, setLikedYears] = useState([]);
  const [currentYear, setCurrentYear] = useState(timelineParagraphs[0].year);
  const [playedYears, setPlayedYears] = useState([]);
  // ── Publicacions state ──────────────────────────────────────────────────
  const [publis, setPublis]             = useState([]);
  const [publiLoading, setPubliLoading] = useState(true);
  const [publiError, setPubliError]     = useState(null);
  const [publiPage, setPubliPage]       = useState(1);
  const [publiHasMore, setPubliHasMore] = useState(true);
  const [likedPosts, setLikedPosts] = useState([]);
  // ── Clock tick ──────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch publicacions ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setPubliLoading(true);
      try {
        const res  = await fetch("http://localhost:5000/publi");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const all  = Array.isArray(data) ? data : (data.publicacions ?? []);
        setPublis(all);
        setPubliHasMore(all.length > PUBLI_PER_PAGE);
      } catch (err) {
        setPubliError(err.message);
      } finally {
        setPubliLoading(false);
      }
    })();
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const visiblePublis  = publis.slice(0, publiPage * PUBLI_PER_PAGE);
  const handleLoadMore = () => {
    const next = publiPage + 1;
    setPubliPage(next);
    if (next * PUBLI_PER_PAGE >= publis.length) setPubliHasMore(false);
  };

  const toggleLikePost = (id) => {
  setLikedPosts(prev =>
    prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
  );
};

  function tempsRelatiu(dateStr) {
  if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);

    if (min < 1) return "ara mateix";
    if (min < 60) return `fa ${min} min`;
    if (h < 24) return `fa ${h}h`;
    if (d < 7) return `fa ${d} dies`;

    return new Date(dateStr).toLocaleDateString("ca-ES");
  }

  const playSequentialAudio = async (years) => {
    for (const year of years) {
      const item = timelineParagraphs.find(p => p.year === year);
      if (!item) continue;
      setCurrentYear(year);
      if (!playedYears.includes(year)) setPlayedYears(prev => [...prev, year]);
      await new Promise(resolve => {
        const audio = new Audio(item.audio);
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play();
      });
    }
  };

  const handleYearClick = (year) => {
    setCurrentYear(year);
    if (yearsContainerRef.current) {
      const container   = yearsContainerRef.current;
      const yearElement = document.getElementById(`year-${year}`);
      if (yearElement) {
        const containerTop = container.getBoundingClientRect().top;
        const elementTop   = yearElement.getBoundingClientRect().top;
        const offset = elementTop - containerTop - container.clientHeight / 2 + yearElement.clientHeight / 2;
        container.scrollBy({ top: offset, behavior: "smooth" });
      }
    }
  };



  const toggleLike = (year) => {
    setLikedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };



  const currentItem = timelineParagraphs.find(p => p.year === currentYear);

  return (
    <>

      <div className={`home-container ${showContent ? 'show' : ''}`}>

        <Navbar />
        <Cookies />

        {/* ===== HERO ===== */}
        <section className="hero-section" style={{ width: "100%", height: "90vh", position: "relative", overflow: "hidden" }}>
          <div className={`clock-section ${showClock ? "open" : ""}`}>
            <button className="clock-close-inline" onClick={() => setShowClock(false)} aria-label="Tancar rellotge">✕</button>
            <div className="clock-time">{time.toLocaleTimeString("ca-ES")}</div>
            <div className="clock-date">{time.toLocaleDateString("ca-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
          </div>

          <div className="video-hero" style={{ width: "100%", height: "100%", position: "relative" }}>
            <div className="video-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.25) 45%, rgba(10,10,10,0.95) 100%)", zIndex: 2 }}></div>
            <video className="video-iframe" src="/images/video-home.mp4" autoPlay muted loop playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none", zIndex: 1, filter: "grayscale(0.35)" }} />
            <div className="hero-text-wrapper">
              <span className="hero-index">EST. 2015</span>
              <h1 className="hero-title">TRADICIONS<br />DE MATARÓ</h1>
              <p className="hero-subtitle">Teixint tradicions, creant futur.</p>
              <button className="hero-arrow-img" onClick={() => setShowClock(true)} aria-label="Obrir rellotge">
                <span className="hero-arrow-line"></span>
                <span className="hero-arrow-label">SCROLL</span>
              </button>
            </div>
          </div>
        </section>

        {/* ===== QUI SOM ===== */}
        <section className="qui-som-monumental">
          <div className="monumental-header">
            <span className="section-index">01 / L'ESSÈNCIA</span>
            <h2 className="monumental-title">
              10 ANYS TEIXINT LA<br />
              <span className="accent-word">MEMÒRIA</span> DE MATARÓ
            </h2>
          </div>
          <div className="monumental-grid">
            <div className="monumental-box span-2">
              <span className="monumental-tag tag-blue"><i className="ti ti-quote"></i> La nostra veu</span>
              <p className="large-intro">
                <span className="accent-quote">"Tradicions de Mataró"</span> no és només un arxiu; és un organisme viu que respira al ritme de la ciutat. Des de 2015, hem documentat cada fil que ens uneix, transformant la tradició en un llenguatge audiovisual contemporani que mira cap al futur.
              </p>
            </div>
            <div className="monumental-box">
              <span className="monumental-tag tag-yellow"><i className="ti ti-target"></i> Propòsit</span>
              <h3>El nostre propòsit</h3>
              <p>Preservar la identitat mataronina. No ens limitem a gravar; capturem l'essència, el sentiment i l'herència que ens defineix com a comunitat.</p>
            </div>
            <div className="monumental-box">
              <span className="monumental-tag tag-pink"><i className="ti ti-eye"></i> Mirada</span>
              <h3>La nostra mirada</h3>
              <p>El nostre equip aposta per un estil documental honest. Creiem que la cultura popular ha de ser accessible, moderna i, sobretot, compartida per totes les generacions.</p>
            </div>
            <div className="monumental-box span-2-wide">
              <div className="big-stat"><span className="number">2015</span><span className="label">L'inici d'un somni</span></div>
              <div className="big-stat"><span className="number">150+</span><span className="label">Reportatges produïts</span></div>
              <div className="big-stat"><span className="number">100%</span><span className="label">Passió per Mataró</span></div>
            </div>
          </div>
        </section>

        {/* ===== TIMELINE ===== */}
        <section className="timeline-section" style={{ backgroundImage: "url(images/timeline-bg.jpg)" }}>
          <div className="timeline-overlay" />
          <div className="timeline-header">
            <span className="section-index light">02 / CRONOLOGIA</span>
            <h2 className="timeline-section-title">Una dècada en moviment</h2>
          </div>
          <div className="timeline-wrapper">
            <div className="timeline-left">
              <div className="timeline-line" />
              <div className="timeline-years" ref={yearsContainerRef}>
                {timelineParagraphs.map(item => (
                  <div
                    key={item.year}
                    id={`year-${item.year}`}
                    className={`timeline-year ${item.year === currentYear ? "active" : ""}`}
                    onClick={() => handleYearClick(item.year)}
                  >
                    <span className="timeline-dot" />
                    <span className="timeline-year-text">{item.year}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="timeline-right">
              <img src={`images/timeline/${currentYear}.jpg`} alt={`Any ${currentYear}`} className="timeline-inner-image" />
              <h2 className="timeline-title">{currentYear}</h2>
              <p className="timeline-text">{currentItem.text}</p>
              <div className="timeline-buttons">
                <button className={`like-btn ${likedYears.includes(currentYear) ? "liked" : ""}`} onClick={() => toggleLike(currentYear)}>Guardar</button>
                <button className="audio-btn" onClick={() => playSequentialAudio([currentYear])}>Escoltar</button>
              </div>
              {currentItem.trobans?.length > 0 && (
                <div className="trobans-wrapper">
                  <h3 className="trobans-title">Trobades d'aquest any</h3>
                  <div className="trobans-list">
                    {currentItem.trobans.map((t, idx) => (
                      <div className="trobans-item" key={idx}>
                        <span className="trobans-number">{String(idx + 1).padStart(2, '0')}</span>
                        <div className="trobans-content">
                          <h4>{t.titol}</h4>
                          <p>{t.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

              {/* ===== GALERIA ===== */}
      <section className="gallery-section">
        <div className="gallery-header">
          <div className="gallery-header-text">
            <span className="section-index">03 / ARXIU VISUAL</span>
            <h2>Fragments de <span className="accent-word">memòria</span></h2>
            <p>Una selecció visual de moments que defineixen la nostra identitat: festes, carrers, gent i tradicions vives de Mataró.</p>
          </div>
          <span className="gallery-counter">
            <strong>{String(galleryItems.length).padStart(2, '0')}</strong> / IMATGES DESTACADES
          </span>
        </div>

        {/* Grid principal — mosaic asimètric */}
        <div className="gallery-grid">
          {galleryItems.map((item, i) => (
            <div className={`gallery-item ${item.className}`} key={i}>
              <img src={item.img} alt={item.label} />
              <div className="gallery-overlay">
                <div className="gallery-item-meta">
                  <span className="gallery-item-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="gallery-item-label">{item.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Strip horitzontal — arxiu extra */}
        <div className="gallery-strip">
          {galleryStrip.map((item, i) => (
            <div className="gallery-strip-item" key={i}>
              <img src={item.img} alt={item.label} />
              <span className="gallery-strip-label">{item.label}</span>
            </div>
          ))}
        </div>

        {/* CTA baix */}
        <div className="gallery-cta">
          <span className="gallery-cta-line" />
          <a href="/galeria" className="gallery-cta-link">
            Veure arxiu complet <i className="ti ti-arrow-right" />
          </a>
          <span className="gallery-cta-line" />
        </div>
      </section>

          {/* ===== VIDEOS ===== */}
      <section className="videos-section">
        <div className="videos-header">
          <div>
            <span className="section-index">04 / AUDIOVISUAL</span>
            <h2 className="videos-title">La <span className="accent-word">cultura</span> en moviment</h2>
            <p className="videos-sub">Documentals, cobertures en directe i reportatges en vídeo sobre les tradicions de Mataró.</p>
          </div>
          <a href="/videos" className="videos-link-all">Veure tots els vídeos <i className="ti ti-arrow-right" /></a>
        </div>

        <div className="videos-grid">
          {/* Featured — primer vídeo a pantalla gran */}
          <VideoCard
            src={videoSideItems[0].thumb}
            title={videoSideItems[0].title}
            desc="Cobertura completa de la Batucada de Mataró amb imatges exclusives."
            cat={videoSideItems[0].cat}
            catClass={videoSideItems[0].catClass}
            date={videoSideItems[0].date}
            duration={videoSideItems[0].duration}
            featured
          />

          {/* Sidebar — resta de vídeos */}
          <div className="video-sidebar">
            {videoSideItems.slice(1).map((v, i) => (
              <VideoCard
                key={i}
                src={v.thumb}
                title={v.title}
                cat={v.cat}
                catClass={v.catClass}
                date={v.date}
                duration={v.duration}
              />
            ))}
          </div>
        </div>

        {/* Reels row */}
        <div className="videos-reels-header">
          <span className="section-index" style={{ marginBottom: 0 }}>MOMENTS CURTS</span>
          <div className="videos-reels-line" />
        </div>
        <div className="videos-reels">
          {videoReels.map((r, i) => (
            <div className="reel-item" key={i}>
              <div className="reel-thumb">
                <img src={r.thumb} alt={r.label} />
                <div className="video-overlay-dark" />
                <span className="reel-duration">{r.duration}</span>
              </div>
              <span className="reel-label">{r.label}</span>
            </div>
          ))}
        </div>
      </section>

        {/* ===== STATS ===== */}
        <section className="stats-section">
          <div className="stats-header">
            <div>
              <span className="section-index light">05 / NÚMEROS</span>
              <h2 className="stats-title">Una dècada <span className="accent-word">en xifres</span></h2>
            </div>
            <p className="stats-sub">Deu anys de feina constant es tradueixen en història documentada, comunitat activa i molts moments compartits.</p>
          </div>
          <div className="stats-grid">
            {statsData.map((s, idx) => (
              <div className="stats-card" key={idx}>
                <div className="stats-card-icon">{String(idx + 1).padStart(2, '0')}</div>
                <div>
                  <span className="stats-number">{s.numero}<span className="stats-plus">+</span></span>
                  <span className="stats-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== MAP CTA ===== */}
        <section className="map-cta-section">
          <div className="map-cta-content">
            <span className="section-index light">06 / MAPA</span>
            <h2>Explora les <span className="accent-word">trobades</span><br />en el territori</h2>
            <p>Descobreix on han passat tots els moments clau del projecte. Navega per anys, llocs i històries d'una dècada de Mataró.</p>
            <div className="map-cta-tags">
              <span className="map-cta-tag">Festes Majors</span>
              <span className="map-cta-tag">Mostra de Gegants</span>
              <span className="map-cta-tag">Sant Jordi</span>
              <span className="map-cta-tag">+40 trobades</span>
            </div>
            <div className="map-cta-buttons">
              <a href="/mapa-trobans" className="map-btn primary">Obrir mapa interactiu</a>
              <a href="/trobans" className="map-btn secondary">Veure totes les trobades</a>
            </div>
          </div>
          <div className="map-visual">
            <img src="/images/mapa.png" alt="Mapa Trobans" />
            <span className="map-visual-pin p1"></span>
            <span className="map-visual-pin p2"></span>
            <span className="map-visual-pin p3"></span>
          </div>
        </section>
        {/* ===== PUBLICACIONES — feed vertical estilo insta ===== */}
        <section className="hpf-section">

          {/* Cabecera */}
          <div className="hpf-header">
            <div className="hpf-header-left">
              <span className="section-index">07 / PUBLICACIONS</span>
              <h2 className="hpf-title">
                Ultimes <span className="hpf-accent">publicacions</span>
              </h2>
              <p className="hpf-subtitle">
                Tot el que hem compartit: reportatges, events i moment de la cultura local.
              </p>
            </div>

            <div className="hpf-profile-pill">
              <div className="hpf-avatar-ring">
                <div className="hpf-avatar-inner">
                  <img src="/images/logo1.png" alt="TM" />
                </div>
              </div>
              <div className="hpf-profile-info">
                <span className="hpf-profile-name">Tradicions Mataró</span>
                <span className="hpf-profile-handle">@tradicionsmataro</span>
              </div>
            </div>
          </div>

          {/* States */}
          {publiLoading ? (
            <div className="hpf-state">
              <div className="hpf-spinner" />
              <span>Carregant publicacions…</span>
            </div>
          ) : publiError ? (
            <div className="hpf-state hpf-err">
              <i className="ti ti-alert-circle" style={{ fontSize: "1.6rem" }} />
              <span>Error: {publiError}</span>
            </div>
          ) : publis.length === 0 ? (
            <div className="hpf-state">
              <i className="ti ti-photo-off" style={{ fontSize: "1.6rem" }} />
              <span>Encara no hi han publicacions.</span>
            </div>
          ) : (
            <>
              {/* Feed */}
              <div className="hpf-feed">
                {visiblePublis.map((p, idx) => {
                  const postId = p.id ?? idx;
                  const liked = likedPosts.includes(postId);
                  const dateStr = p.data ?? p.fecha ?? p.created_at;
                  const imgSrc = p.imatge ?? p.imagen ?? p.img;
                  const titol = p.titol ?? p.titulo ?? p.title ?? "Sin título";
                  const resum = p.resum ?? p.resumen ?? p.excerpt ?? "";
                  const cat = p.categoria ?? p.category ?? "";
                  const likes = p.likes ?? 0;

                  return (
                    <article className="hpf-vpost" key={postId}>

                      {/* Top */}
                      <div className="hpf-vpost-top">
                        <div className="hpf-vpost-user">
                          <div className="hpf-vpost-avatar">
                            <div className="hpf-vpost-avatar-inner">
                              <img src="/images/logo1.png" alt="TM" />
                            </div>
                          </div>

                          <div className="hpf-vpost-meta">
                            <span className="hpf-vpost-username">
                              Tradicions Mataró
                            </span>
                            <span className="hpf-vpost-time">
                              {tempsRelatiu(dateStr)}
                            </span>
                          </div>
                        </div>

                        {cat && (
                          <span className="hpf-vpost-cat">{cat}</span>
                        )}
                      </div>

                      {/* Imagen */}
                      <div className="hpf-vpost-img-wrap">
                        {imgSrc ? (
                          <img src={imgSrc} alt={titol} loading="lazy" />
                        ) : (
                          <div className="hpf-vpost-img-placeholder">
                            <i className="ti ti-photo" />
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="hpf-vpost-body">
                        <h3 className="hpf-vpost-title">{titol}</h3>
                        {resum && (
                          <p className="hpf-vpost-resum">{resum}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="hpf-vpost-actions">
                        <button
                          className="hpf-vpost-action hpf-like"
                          onClick={() => toggleLikePost(postId)}
                        >
                          <i
                            className={`ti ${
                              liked ? "ti-heart-filled" : "ti-heart"
                            }`}
                            style={{
                              color: liked ? "var(--pink)" : undefined,
                            }}
                          />
                          {liked ? likes + 1 : likes}
                        </button>

                        <button className="hpf-vpost-action">
                          <i className="ti ti-message-circle" />
                          {p.comentaris ?? 0}
                        </button>

                        <button className="hpf-vpost-action">
                          <i className="ti ti-send" />
                        </button>

                        <span className="hpf-vpost-spacer" />

                        <a
                          href={`/publicacions/${postId}`}
                          className="hpf-vpost-read"
                        >
                          Leer <i className="ti ti-arrow-right" />
                        </a>
                      </div>

                    </article>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="hpf-footer">
                <div className="hpf-load-wrap">
                  <span className="hpf-count-label">
                    <strong>{visiblePublis.length}</strong> de{" "}
                    <strong>{publis.length}</strong> publicacions
                  </span>

                  {publiHasMore ? (
                    <button
                      className="hpf-load-btn"
                      onClick={handleLoadMore}
                    >
                      Carregar més
                    </button>
                  ) : (
                    <a
                      href="/publicaciones"
                      className="hpf-load-btn"
                    >
                      Veure totes
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </section>

        {/* ===== CTA COMUNITAT ===== */}
        <section className="cta-section">
          <span className="cta-bg-text">UNEIX-TE</span>
          <div className="cta-content">
            <div>
              <span className="section-index light">08 / COMUNITAT</span>
              <h2>
                Vols formar part de<br />
                <span className="accent-word">Tradicions de Mataró</span>?
              </h2>
              <p>Uneix-te a la nostra comunitat, col·labora amb nosaltres o simplement segueix les nostres aventures culturals.</p>
              <div className="cta-buttons">
                <a href="/unirte" className="cta-btn primary">Uneix-te al projecte</a>
                <a href="/contactar" className="cta-btn secondary">Contacta'ns</a>
              </div>
            </div>
            <div className="cta-side-card">
              <div className="cta-side-card-row">
                <span className="cta-side-card-label">Seguidors</span>
                <span className="cta-side-card-value">120+</span>
              </div>
              <div className="cta-side-card-row">
                <span className="cta-side-card-label">Col·laboradors</span>
                <span className="cta-side-card-value">25</span>
              </div>
              <div className="cta-side-card-row">
                <span className="cta-side-card-label">Pròxima trobada</span>
                <span className="cta-side-card-value">Setembre</span>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;