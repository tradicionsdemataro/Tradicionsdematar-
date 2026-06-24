import React from "react";
import { useState, useRef } from "react";
import Navbar from "./components/navbarComponente/navbar.jsx";
import Footer from "./components/footerComponente/footer.jsx";
import "./css/quisom.css";

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
  { thumb: "/images/cercavila2.jpg", label: "Cercavila nocturna", duration: "0:58" },
  { thumb: "/images/carnaval2.jpg", label: "Foc i música", duration: "1:12" },
  { thumb: "/images/gegants-cercavila.jpg", label: "Gegants infantils", duration: "0:44" },
  { thumb: "/images/rovafabes3.jpg", label: "Sardana a la plaça", duration: "1:05" },
  { thumb: "/images/mort.jpg", label: "Tarda de carnaval", duration: "0:37" },
];

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
      v.play().then(() => setPlaying(true));
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
    if (v?.duration) setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
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

  const Controls = ({ mini = false }) => (
    <div className={`vc-controls ${mini ? 'vc-controls--mini' : ''} ${showControls || playing ? 'visible' : ''}`}>
      <div className="vc-progress" onClick={handleSeek}>
        <div className="vc-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="vc-bar">
        <button className="vc-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }} aria-label="Play/Pause">
          <i className={`ti ${playing ? 'ti-player-pause' : 'ti-player-play'}`} />
        </button>
        <div className="vc-volume" onClick={(e) => e.stopPropagation()}>
          <button className="vc-btn" onClick={toggleMute} aria-label="Silenciar">
            <i className={`ti ${muted || volume === 0 ? 'ti-volume-3' : volume < 0.5 ? 'ti-volume-2' : 'ti-volume'}`} />
          </button>
          {!mini && (
            <input
              type="range"
              min="0" max="1" step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="vc-vol-slider"
              aria-label="Volum"
            />
          )}
        </div>
        {!mini && <span className="vc-duration">{duration}</span>}
        <button
          className="vc-btn vc-fullscreen"
          onClick={(e) => { e.stopPropagation(); videoRef.current?.requestFullscreen(); }}
          aria-label="Pantalla completa"
        >
          <i className="ti ti-maximize" />
        </button>
      </div>
    </div>
  );

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
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            className="vc-video"
          />
          <div className={`video-overlay-dark ${playing ? 'dim' : ''}`} />
          <button
            className={`video-play-btn video-play-btn--lg ${playing ? 'playing' : ''}`}
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            aria-label={playing ? 'Pausar' : 'Reproduir'}
          >
            <i className={`ti ${playing ? 'ti-player-pause' : 'ti-player-play'}`} />
          </button>
          <span className="video-cat video-cat--blue">{cat}</span>
          <Controls />
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
        <Controls mini />
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

const projectes = [
  {
    emoji: "🌴",
    titol: "Mataró Tropical",
    desc: "Descobreix espais i tradicions d'estiu amb un toc fresc i visual. Reels curts i divulgatius des del 2023.",
    url: "https://tradicionsdemataro.blogspot.com/2025/04/perfecte-aqui-tens-lhtml-actualitzat.html",
    img: "/images/tropical.jpg",
  },
  {
    emoji: "🎭",
    titol: "Pellofa",
    desc: "Carnaval amb Pellofes pròpies, amb pregó, esquela, Vella Quaresma i participació ciutadana cada any.",
    url: "https://tradicionsdemataro.blogspot.com/2025/02/dibuix-den-pellofa-lobandarro-2025-per.html",
    img: "/images/carnaval-mataro-2024-2025.jpg",
  },
  {
    emoji: "🦵",
    titol: "Vella Quaresma",
    desc: "Setmanalment, cada Quaresma, traiem una cama a la nostra figura dissenyada pròpiament.",
    url: "https://tradicionsdemataro.blogspot.com/2025/03/dibuix-de-la-vella-quaresma-jeni-per.html",
    img: "/images/vella.jpeg",
  },
  {
    emoji: "🎂",
    titol: "Aniversari del Blog",
    desc: "Cada setembre celebrem l'aniversari del blog amb actes, publicacions i contingut especial.",
    url: "https://tradicionsdemataro.blogspot.com/2025/04/aniversari-del-nostre-blog.html",
    img: "/images/cumple.jpg",
  },
  {
    emoji: "🎄",
    titol: "Calendari d'Advent",
    desc: "Del 1 al 24 de desembre compartim una pregunta cultural diària sobre Mataró.",
    url: "https://tradicionsdemataro.blogspot.com/2024/11/arriba-la-magia-del-nadal-tradicions-de.html",
    img: "/images/calendari.jpg",
  },
  {
    emoji: "📚",
    titol: "Punts de Llibre",
    desc: "Punts de llibre il·lustrats sobre cultura popular, especialment per Sant Jordi. Descàrrega gratuïta.",
    url: "https://tradicionsdemataro.blogspot.com/2025/04/descobreix-els-nostres-punts-de-llibre.html",
    img: "/images/punts-llibre.jpg",
  },
  {
    emoji: "📅",
    titol: "Nadal i Reis",
    desc: "Un apartat dedicat a les edicions anteriors de Nadal i Reis per conservar la memòria festiva de la ciutat.",
    url: "https://tradicionsdemataro.blogspot.com/2026/01/seccions-dedicades-les-edicions.html",
    img: "/images/reis.jpg",
  },
];

const objectius = [
  { emoji: "📽️", titol: "Reportatges audiovisuals", desc: "Documentem i difonem esdeveniments culturals amb vídeos i imatges pròpies." },
  { emoji: "🎭", titol: "Cobertura d'actes",         desc: "Donem visibilitat a les activitats tradicionals i populars de la ciutat." },
  { emoji: "✍️", titol: "Notícies i entrevistes",    desc: "Apropem la veu de les entitats, figures i protagonistes de la cultura local." },
  { emoji: "🌐", titol: "Difusió i accés",            desc: "Portem les tradicions de Mataró a tothom, amb continguts accessibles i de qualitat." },
];

const valors = [
  { emoji: "🎓", titol: "Respecte per la cultura",  desc: "Preservem i posem en valor les tradicions de Mataró per a les futures generacions." },
  { emoji: "🔥", titol: "Passió per la divulgació", desc: "Comuniquem amb entusiasme i rigor, apropant la cultura a tothom." },
  { emoji: "🤝", titol: "Compromís comunitari",      desc: "Arrelats a Mataró, treballem amb i per la ciutat." },
  { emoji: "💡", titol: "Innovació i modernitat",    desc: "Utilitzem eines actuals per mantenir la tradició viva i atractiva." },
  { emoji: "👐", titol: "Accessibilitat i inclusió", desc: "Som un espai obert i proper on tothom hi té cabuda." },
  { emoji: "🧵", titol: "Col·laboració i xarxa",     desc: "Creem vincles entre persones, entitats i projectes per teixir cultura junts." },
];

export default function QuiSom() {
  return (
    <>
      <Navbar />

      <main className="qs-page">

        {/* ── HERO ───────────────────────────────────────── */}
        <section className="qs-hero">
          <div className="qs-hero-inner">
            <span className="section-index light">01 / QUI SOM</span>
            <h1 className="qs-hero-title">
              TEIXINT<br />
              <span className="accent-word">TRADICIONS</span>
            </h1>
            <p className="qs-hero-sub">
              Publicat per <strong>Tradicions de Mataró</strong>
            </p>
          </div>
          <span className="qs-hero-bg">QUI SOM</span>
        </section>

        {/* ── TEXT + STATS ───────────────────────────────── */}
        <section className="qs-text-section">
          <div className="qs-text-grid">
            <div className="qs-text-main">
              <span className="section-index">02 / EL PROJECTE</span>
              <h2 className="qs-text-title">
                Un projecte <span className="accent-word">independent</span><br />
                nascut a Mataró
              </h2>
              <div className="qs-prose">
                <p>
                  Tradicions de Mataró és un projecte de divulgació cultural nascut a la
                  ciutat de Mataró, impulsat per persones compromeses amb la cultura popular
                  i el patrimoni local.
                </p>
                <p>
                  Som un <strong>mitjà digital independent i sense ànim de lucre</strong> que aposta
                  per la difusió de la cultura mataronina a través de reportatges audiovisuals,
                  entrevistes, cròniques i continguts informatius de qualitat.
                </p>
                <p>
                  Tradicions de Mataró no vol ser només un espai informatiu, sinó també un
                  <strong> punt de trobada</strong> per a totes aquelles persones que estimen la cultura
                  local i volen contribuir a mantenir-la viva, alhora que la projectem cap al futur.
                </p>
              </div>
              <a
                href="https://tradicionsdemataro.blogspot.com/2025/12/tradicions-de-mataro-ofereix-contingut.html"
                className="qs-link-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Llegir més al blog →
              </a>
            </div>

            <div className="qs-stats-col">
              <div className="qs-stat-card">
                <span className="qs-stat-num" style={{ color: "var(--yellow)" }}>2015</span>
                <span className="qs-stat-label">Any de fundació</span>
              </div>
              <div className="qs-stat-card">
                <span className="qs-stat-num" style={{ color: "var(--blue)" }}>150+</span>
                <span className="qs-stat-label">Reportatges publicats</span>
              </div>
              <div className="qs-stat-card">
                <span className="qs-stat-num" style={{ color: "var(--pink)" }}>100%</span>
                <span className="qs-stat-label">Cultura local</span>
              </div>
              <div className="qs-stat-card">
                <span className="qs-stat-num" style={{ color: "var(--orange)" }}>10+</span>
                <span className="qs-stat-label">Anys de trajectòria</span>
              </div>
            </div>
          </div>
        </section>

          {/* ── FRANJA VISUAL ──────────────────────────────── */}
        <div className="qs-img-strip">
          <div className="qs-img-strip-item">
            <img src="/images/rovafabes.jpg" alt="Les Santes" />
            <div className="qs-img-strip-overlay">
              <span className="qs-strip-label">Les Santes</span>
            </div>
          </div>
          <div className="qs-img-strip-item">
            <img src="/images/carnaval-mataro-2024-2025.jpg" alt="Carnestoltes" />
            <div className="qs-img-strip-overlay">
              <span className="qs-strip-label">Carnestoltes</span>
            </div>
          </div>
          <div className="qs-img-strip-item">
            <img src="/images/carroses.jpg" alt="Cultura Popular" />
            <div className="qs-img-strip-overlay">
              <span className="qs-strip-label">Cultura Popular</span>
            </div>
          </div>
          <div className="qs-img-strip-item qs-img-strip-wide">
            <img src="/images/10anys.jpg" alt="Exposició Memòria Viva" />
            <div className="qs-img-strip-overlay qs-img-strip-overlay-left">
              <span className="section-index" style={{ marginBottom: 0 }}>ARXIU VISUAL</span>
              <p>Més de 10 anys documentant<br />la memòria de Mataró</p>
            </div>
          </div>
        </div>

        {/* ── TRAJECTÒRIA ────────────────────────────────── */}
        <section className="qs-trajectory">
          <span className="section-index">03 / TRAJECTÒRIA</span>
          <h2 className="qs-section-title">La nostra <span className="accent-word">trajectòria</span></h2>

          <div className="qs-trajectory-body">
            <div className="qs-trajectory-text">
              <p>
                El projecte es va iniciar el <strong>19 de setembre de 2015</strong> i, des d'aleshores,
                ha anat creixent tant en continguts com en equip humà.
              </p>
              <p>
                Al llarg dels anys hem realitzat reportatges sobre actes culturals, entrevistes
                amb protagonistes de la vida cultural de la ciutat i cobertures especials de
                festes i tradicions emblemàtiques com <strong>Les Santes</strong>, el <strong>Carnestoltes</strong>
                {" "}o altres celebracions singulars de la ciutat.
              </p>
              <p>
                Cada projecte, cada vídeo i cada article reflecteix el nostre compromís amb la
                qualitat i la veracitat de la informació, així com amb la
                <strong> preservació de la memòria col·lectiva de Mataró</strong>.
              </p>
              <a
                href="https://tradicionsdemataro.blogspot.com/p/infografia-del-nostre-blog-tradicions.html"
                className="qs-link-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Veure infografia del blog →
              </a>
            </div>

            <div className="qs-timeline">
              {[
                { year: "2015", text: "Naixement del projecte, 19 de setembre.", img: "/images/timeline/2015.jpg" },
                { year: "2018", text: "Nous formats audiovisuals i equip ampliat.", img: "/images/timeline/2018.jpg" },
                { year: "2020", text: "Activitats culturals digitals durant el confinament.", img: "/images/timeline/2020.jpg" },
                { year: "2023", text: "Projectes escolars, Sant Jordi i Mataró Tropical.", img: "/images/timeline/2023.jpg" },
                { year: "2025", text: "Nova marca i nou lema: teixint tradicions, creant futur.", img: "/images/timeline/2025.jpg" },
              ].map((item, i) => (
                <div className="qs-tl-item" key={i}>
                  <span className="qs-tl-year">{item.year}</span>
                  <div className="qs-tl-dot" />
                  <div className="qs-tl-right">
                    <p className="qs-tl-text">{item.text}</p>
                    {item.img && (
                      <div className="qs-tl-img">
                        <img src={item.img} alt={item.year} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VÍDEOS ─────────────────────────────────────── */}
      <section className="videos-section qs-videos">
        <div className="videos-header">
          <div>
            <span className="section-index">04 / AUDIOVISUAL</span>
            <h2 className="videos-title">La <span className="accent-word">cultura</span> en moviment</h2>
            <p className="videos-sub">Documentals, cobertures en directe i reportatges sobre les tradicions de Mataró.</p>
          </div>
          <a href="/videos" className="videos-link-all">Veure tots els vídeos <i className="ti ti-arrow-right" /></a>
        </div>

        <div className="videos-grid">
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

        {/* ── OBJECTIUS ──────────────────────────────────── */}
        <section className="qs-objectius">
          <span className="section-index light">05 / OBJECTIUS</span>
          <h2 className="qs-section-title">
            🎥 Preservar, difondre i <span className="accent-word">compartir</span>
          </h2>
          <p className="qs-section-sub">la cultura popular i festiva de la nostra ciutat</p>

          <div className="qs-obj-grid">
            {objectius.map((o, i) => (
              <div className="qs-obj-card" key={i}>
                <span className="qs-obj-emoji">{o.emoji}</span>
                <h3>{o.titol}</h3>
                <p>{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── VALORS ─────────────────────────────────────── */}
        <section className="qs-valors">
          <span className="section-index">06 / VALORS</span>
          <h2 className="qs-section-title">🌱 El que <span className="accent-word">ens defineix</span></h2>

          <div className="qs-val-grid">
            {valors.map((v, i) => (
              <div className="qs-val-card" key={i}>
                <div className="qs-val-top">
                  <span className="qs-val-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="qs-val-emoji">{v.emoji}</span>
                </div>
                <h3>{v.titol}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROJECTES ──────────────────────────────────── */}
        <section className="qs-projectes">
          <span className="section-index light">07 / PROJECTES</span>
          <h2 className="qs-section-title">📌 Projectes <span className="accent-word">destacats</span></h2>

          <div className="qs-proj-grid">
            {projectes.map((p, i) => (
              <div className="qs-proj-card" key={i}>
                <div className="qs-proj-img">
                  <img src={p.img} alt={p.titol} />
                  <span className="qs-proj-emoji-badge">{p.emoji}</span>
                </div>
                <div className="qs-proj-body">
                  <h3>{p.titol}</h3>
                  <p>{p.desc}</p>
                </div>
                <a
                  href={p.url}
                  className="qs-proj-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visita →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRESENT I FUTUR ────────────────────────────── */}
        <section className="qs-futur">
          <span className="qs-futur-bg">FUTUR</span>

          <div className="qs-futur-layout">
            <div className="qs-futur-inner">
              <span className="section-index light">08 / PRESENT I FUTUR</span>
              <h2 className="qs-futur-title">
                Creant <span className="accent-word">futur</span>
              </h2>
              <p>
                Actualment, Tradicions de Mataró continua evolucionant i adaptant-se als nous
                formats i canals de comunicació. Apostem per la innovació, la qualitat audiovisual
                i la creativitat, explorant noves maneres d'arribar a la ciutadania.
              </p>
              <p>
                El nostre objectiu és seguir sent un referent en la difusió de la cultura
                mataronina, consolidant Tradicions de Mataró com un espai viu, participatiu i
                inspirador, que connecti passat i futur, tradició i modernitat.
              </p>
              <p className="qs-futur-lema">
                <strong>Tradicions de Mataró: teixint tradicions, creant futur.</strong>
              </p>
              <a
                href="https://tradicionsdemataro.blogspot.com/2025/03/descobreix-el-flyer-de-tradicions-de.html"
                className="qs-link-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Descobreix el nostre flyer →
              </a>
            </div>

            {/* imatge ambient */}
            <div className="qs-futur-img">
              <img src="/images/futur.jpg" alt="Tradicions de Mataró futur" />
              <div className="qs-futur-img-caption">
                <span className="section-index" style={{ marginBottom: 0, borderBottom: "none" }}>2025</span>
                <p>Nova marca · Nova etapa</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}