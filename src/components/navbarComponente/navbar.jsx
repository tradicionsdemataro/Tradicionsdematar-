import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './index.css';
import Overlay from './Overlay/overlay.jsx';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);
  const [searchOpen, setSearchOpen] = useState(false);
  const token = localStorage.getItem("token");
  const [ categorias, setCategorias ] = useState([]);
  const [categoriesPubli, setCategoriesPubli] = useState([]);
  const [categoriesEvents, setCategoriesEvents] = useState([]);

  const [user, setUser ] = useState(null);

  const DEFAULT_AVATAR =
  "/images/default.jpg";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);

    window.addEventListener('resize', handleResize);

    const fetchCategorias = async () => {
      try {
        const res = await fetch("http://localhost:5000/projectes");
        const data = await res.json();

        const categoriesUniques = [
          ...new Set(data.projectes.map(projecte => projecte.categoria))
        ];

        setCategorias(categoriesUniques);

        console.log(categoriesUniques);
      } catch (error) {
        console.error("Error carregant categories:", error);
      }
    };

    const fetchCategoriesPubli = async () => {
      try {
        const res = await fetch("http://localhost:5000/publi");
        const data = await res.json();

        console.log("PUBLICACIONS:", data);

        const categoriesUniques = [
          ...new Set(
            (Array.isArray(data) ? data : data.publicacions || [])
              .map(publi => publi.categoria)
              .filter(Boolean)
          )
        ];

        setCategoriesPubli(categoriesUniques);

      } catch (error) {
        console.error("Error carregant categories de publicacions:", error);
      }
    };

    const fetchCategoriesEvents = async () => {
      try {
        const res = await fetch("http://localhost:5000/events");
        const data = await res.json();

        const eventsArray = Array.isArray(data)
          ? data
          : data.events || data.data || [];

        console.log("EVENTS RAW:", data);
        console.log("EVENTS ARRAY:", eventsArray);

        const categoriesUniques = [
          ...new Set(
            eventsArray
              .map(e => e.categoria || e.category || e.type)
              .filter(Boolean)
          )
        ];

        setCategoriesEvents(categoriesUniques);
      } catch (error) {
        console.error("Error carregant categories events:", error);
      }
    };

      const fetchUser = async () => {
      if (!token) return;

      try {
        const res = await fetch(
          "http://localhost:5000/api/auth/perfil",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        const u = data.user ?? data.data ?? data;

        setUser(u);
      } catch (err) {
        console.error("Error carregant usuari:", err);
      }
    };

    fetchUser();

    fetchCategoriesPubli();

    fetchCategoriesEvents();

    fetchCategorias();

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

  document.addEventListener('keydown', handleEsc);

  return () => {
    document.removeEventListener('keydown', handleEsc);
  };
}, []);

  return (
    <div className="page-container">
      {!isMobile && (
        <div className="yellow-container desktop-only">
          <img src="/images/logo2.jpg" alt="Logo 1" />
          <img src="/images/logo3.png" alt="Logo 2" />
          <img src="/images/logo4.png" alt="Logo 3" />
          <img src="/images/logo5.png" alt="Logo 4" />
          <img src="/images/logo6.png" alt="Logo 5" />
          <img src="/images/logo7.png" alt="Logo 6" />
        </div>
      )}

      <nav className={`navbar ${menuOpen ? 'menu-open' : ''}`}>
        {isMobile && (
          <button
            className="menu-toggle mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        )}

        {!isMobile && (
          <ul className="nav-options desktop-only">
            <div className="search-container">
              <button
                type="button"
                className="search-toggle"
                onClick={() => setSearchOpen(true)}
              >
                <img src="/images/search.png" alt="Buscar" />
              </button>
            </div>

            <li className="dropdown">
              <button className="dropbtn">PÀGINES ▾</button>
              <div className="dropdown-content">
                <Link to="/home">HOME</Link>
                <Link to="/qui-som">QUI SOM</Link>
                <Link to="/mapa">MAPA D'EVENTS</Link>
                <Link to="/agenda">AGENDA</Link>
                <Link to="/identitat">IDENTITAT CORPORETIVA</Link>
                <Link to="/credits">CRÈDITS I SUBJECTE</Link>
                <Link to="/links">LINKS D'INTERÈS</Link>
                
              </div>
            </li>



            <li className="dropdown">
              <button className="dropbtn">EQUIP ▾</button>
              <div className="dropdown-content">
                <Link to="/equip">EQUIP</Link>
                <Link to="/uneixte">UNEIXTE</Link>
              </div>
            </li>
            <li className="dropdown">
              <button className="dropbtn">PROJECTES ▾</button>

              <div className="dropdown-content">
                <Link to="/projectes">TOTS</Link>

                {categorias.map((categoria) => (
                  <Link
                    key={categoria}
                    to={`/projectes?categoria=${encodeURIComponent(categoria)}`}
                  >
                    {categoria}
                  </Link>
                ))}
              </div>
            </li>
            <li className="dropdown">
            <button className="dropbtn">PUBLICACIONS ▾</button>

            <div className="dropdown-content">
              <Link to="/publicacions">TOTES</Link>

              {categoriesPubli.map((categoria) => (
                <Link
                  key={categoria}
                  to={`/publicacions?categoria=${encodeURIComponent(categoria)}`}
                >
                  {categoria}
                </Link>
              ))}
            </div>
          </li>
          <li className="dropdown">
                <button className="dropbtn">EVENTS ▾</button>

                <div className="dropdown-content">
                  <Link to="/events">TOTS</Link>

                  {categoriesEvents.map((categoria) => (
                    <Link
                      key={categoria}
                      to={`/events?categoria=${encodeURIComponent(categoria)}`}
                    >
                      {categoria}
                    </Link>
                  ))}
                </div>
              </li>
            <li><Link to="/contacte">CONTACTE</Link></li>

         <li className="dropdown">
                <button className="dropbtn">SOCIALS ▾</button>

                <div className="dropdown-content socials-dropdown">
                  <a
                    href="https://www.instagram.com/tradicionsdemataro"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png"
                      alt="Instagram"
                      className="social-icon"
                    />
                    Instagram
                  </a>

                  <a
                    href="https://www.tiktok.com/@tradicionsdemataro"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/3046/3046125.png"
                      alt="TikTok"
                      className="social-icon"
                    />
                    TikTok
                  </a>

                  <a
                    href="https://www.youtube.com/channel/UCpMtIIlyod3HaPb5Lwl52qw"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
                      alt="YouTube"
                      className="social-icon"
                    />
                    YouTube
                  </a>

                  <a
                    href="https://twitter.com/tradicionsdemataro"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
                      alt="Twitter"
                      className="social-icon"
                    />
                    Twitter
                  </a>

                  <a
                    href="https://www.threads.com/login/?next=https%3A%2F%2Fwww.threads.com%2F%40tradicionsdemataro%C3%A7%2F"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/5968/5968958.png"
                      alt="Threads"
                      className="social-icon"
                    />
                    Threads
                  </a>

                  <div className="spotify-divider">
                    Playlist oficial
                  </div>


                  <div className="spotify-embed">
                    <iframe
                      src="https://open.spotify.com/embed/playlist/0PnwUnk7lRYI1h4q8RT9XJ?utm_source=generator&theme=0"
                      width="100%"
                      height="352"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      title="Playlist de Tradicions de Mataró"
                    />
                  </div>
                </div>
              </li>
                {!token ? (
                  <li>
                    <Link to="/login">LOGIN</Link>
                  </li>
                ) : (
                <li className="dropdown profile-dropdown">
                  <button className="profile-btn">

                    <img
                      src={user?.avatar || DEFAULT_AVATAR}
                      alt="Perfil"
                      className="navbar-avatar"
                    />

                  </button>

                  <div className="dropdown-content profile-menu">
                    <Link to="/perfil">
                      <i className="ti ti-user" /> Perfil
                    </Link>

                    <Link
                      className="logout-dropdown-btn"
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/";
                      }}
                    >
                      <i className="ti ti-logout" /> Tancar sessió
                    </Link>
                  </div>
                </li>
                )}
                </ul>
              )}

          {isMobile && menuOpen && (
            <div className="mobile-menu open">
              <button className="close-menu" onClick={() => setMenuOpen(false)}>✕</button>

              <button
                type="button"
                className="search-toggle mobile-search-toggle"
                onClick={() => {
                  setSearchOpen(true);
                  setMenuOpen(false);
                }}
              >
                <img src="/images/search.png" alt="Buscar" />
              </button>

              <div className="yellow-container">
                <img src="/images/logo2.jpg" alt="Logo 1" />
                <img src="/images/logo3.png" alt="Logo 2" />
                <img src="/images/logo4.png" alt="Logo 3" />
                <img src="/images/logo5.png" alt="Logo 4" />
                <img src="/images/logo6.png" alt="Logo 5" />
                <img src="/images/logo7.png" alt="Logo 6" />
              </div>

              <ul className="mobile-options">

                {/* PÀGINES */}
                <li className="dropdown">
                  <button className="dropbtn">PÀGINES</button>
                  <div className="dropdown-content">
                  <Link to="/home">HOME</Link>
                  <Link to="/qui-som">QUI SOM</Link>
                  <Link to="/mapa">MAPA D'EVENTS</Link>
                  <Link to="/agenda">AGENDA</Link>
                  <Link to="/identitat">IDENTITAT CORPORETIVA</Link>
                  <Link to="/credits">CRÈDITS I SUBJECTE</Link>
                  <Link to="/links">LINKS D'INTERÈS</Link>
              </div>
                </li>

                {/* CONTACTE */}

                {/* EQUIP */}
                <li className="dropdown">
                  <button className="dropbtn">EQUIP</button>
                  <div className="dropdown-content">
                    <Link to="/equip">EQUIP</Link>
                    <Link to="/uneixte">UNEIXTE</Link>
                  </div>
                </li>
                <li className="dropdown">
                  <button className="dropbtn">PROJECTES ▾</button>

                  <div className="dropdown-content">
                    <Link to="/projectes">TOTS</Link>

                    {categorias.map((categoria) => (
                      <Link
                        key={categoria}
                        to={`/projectes?categoria=${encodeURIComponent(categoria)}`}
                      >
                        {categoria}
                      </Link>
                    ))}
                  </div>
                </li>
                 <li className="dropdown">
                <button className="dropbtn">PUBLICACIONS ▾</button>

                <div className="dropdown-content">
                  <Link to="/publicacions">TOTES</Link>

                  {categoriesPubli.map((categoria) => (
                    <Link
                      key={categoria}
                      to={`/publicacions?categoria=${encodeURIComponent(categoria)}`}
                    >
                      {categoria}
                    </Link>
                  ))}
                </div>
              </li>
              <li className="dropdown">
                <button className="dropbtn">EVENTS ▾</button>

                <div className="dropdown-content">
                  <Link to="/events">TOTS</Link>

                  {categoriesEvents.map((categoria) => (
                    <Link
                      key={categoria}
                      to={`/events?categoria=${encodeURIComponent(categoria)}`}
                    >
                      {categoria}
                    </Link>
                  ))}
                </div>
              </li>
                <li><Link to="/contacte">CONTACTE</Link></li>

               <li className="dropdown">
                <button className="dropbtn">SOCIALS ▾</button>

                  <div className="dropdown-content socials-dropdown">
                    <a
                      href="https://www.instagram.com/tradicionsdemataro"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png"
                        alt="Instagram"
                        className="social-icon"
                      />
                      Instagram
                    </a>

                    <a
                      href="https://www.tiktok.com/@tradicionsdemataro"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/3046/3046125.png"
                        alt="TikTok"
                        className="social-icon"
                      />
                      TikTok
                    </a>

                    <a
                      href="https://www.youtube.com/channel/UCpMtIIlyod3HaPb5Lwl52qw"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
                        alt="YouTube"
                        className="social-icon"
                      />
                      YouTube
                    </a>

                    <a
                      href="https://twitter.com/tradicionsdemataro"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
                        alt="Twitter"
                        className="social-icon"
                      />
                      Twitter
                    </a>

                    <a
                      href="https://www.threads.com/login/?next=https%3A%2F%2Fwww.threads.com%2F%40tradicionsdemataro%C3%A7%2F"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/5968/5968958.png"
                        alt="Threads"
                        className="social-icon"
                      />
                      Threads
                    </a>
                  <div className="spotify-divider">
                    Playlist oficial
                  </div>

                  <div className="spotify-embed">
                    <iframe
                      src="https://open.spotify.com/embed/playlist/0PnwUnk7lRYI1h4q8RT9XJ?utm_source=generator&theme=0"
                      width="100%"
                      height="352"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      title="Playlist de Tradicions de Mataró"
                    />
                  </div>
                </div>
              </li>
              {/* LOGIN */}
              <li><Link to="/login">LOGIN</Link></li>

            </ul>
              </div>
            )}

      </nav>
      {searchOpen && (
        <Overlay
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
};

export default Navbar;