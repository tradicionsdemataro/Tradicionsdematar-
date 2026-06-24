import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/navbarComponente/navbar.jsx";
import Footer from "./components/footerComponente/footer.jsx";
import "./css/perfil.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDateInput(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  return isNaN(d) ? "" : d.toISOString().split("T")[0];
}

const DEFAULT_AVATAR = "https://res.cloudinary.com/demo/image/upload/v1690000000/default-avatar.png";
const DEFAULT_BANNER = "https://res.cloudinary.com/demo/image/upload/v1690000000/default-banner.jpg";

// ─── Component ────────────────────────────────────────────────────────────────
export default function Perfil() {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [editMode, setEditMode]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [feedback, setFeedback]   = useState(null); // { type: "success"|"error", msg }
  const [form, setForm]           = useState({});

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const token   = localStorage.getItem("token");
  const userId  = localStorage.getItem("user_id");

  // ── Fetch perfil ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/perfil", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Normalitza: { user }, { data } o l'objecte directe
        const u = data.user ?? data.data ?? data;

        if (!u || !u.email) throw new Error("Resposta invàlida del servidor");

        setUser(u);
        setForm({
          nom:             u.nom             ?? "",
          username:        u.username        ?? "",
          email:           u.email           ?? "",
          descripcion:     u.descripcion     ?? "",
          telefono:        u.telefono        ?? "",
          ubicacion:       u.ubicacion       ?? "",
          fechaNacimiento: fmtDateInput(u.fechaNacimiento),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, token]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("http://localhost:5000/api/auth/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const u = data.user ?? data;
      setUser(u);
      setEditMode(false);
      setFeedback({ type: "success", msg: "Perfil actualitzat correctament." });
    } catch (err) {
      setFeedback({ type: "error", msg: "Error en desar els canvis." });
    } finally {
      setSaving(false);
    }
  };

const handleImageUpload = async (e, field) => {
  const file = e.target.files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append("image", file);
  fd.append("field", field);

  try {
    const res = await fetch("http://localhost:5000/api/auth/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const u = data.user ?? data;

    setUser(u);

    setFeedback({
      type: "success",
      msg: "Imatge actualitzada.",
    });

  } catch (err) {
    setFeedback({
      type: "error",
      msg: "Error pujant la imatge.",
    });
  }
};

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <Navbar />
      <div className="perfil-loading">
        <div className="perfil-spinner" />
        <p>Carregant perfil...</p>
      </div>
      <Footer />
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className="perfil-loading error">
        <i className="ti ti-alert-circle" />
        <p>Error: {error}</p>
      </div>
      <Footer />
    </>
  );

  const isAdmin = user?.rol === "admin";

  return (
    <>
      <Navbar />

      <main className="perfil-page">

        {/* ── BANNER ──────────────────────────────────────── */}
        <div className="perfil-banner-wrap">
          <img
            src={user.banner || DEFAULT_BANNER}
            alt="Banner"
            className="perfil-banner-img"
          />
          <div className="perfil-banner-overlay" />

          {/* Botó canviar banner */}
          <button
            className="perfil-banner-edit-btn"
            onClick={() => bannerInputRef.current?.click()}
            title="Canviar banner"
          >
            <i className="ti ti-camera" /> Canviar banner
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleImageUpload(e, "banner")}
          />
        </div>

        {/* ── PROFILE HEADER ──────────────────────────────── */}
        <div className="perfil-header-wrap">
          <div className="perfil-header-inner">

            {/* Avatar */}
            <div className="perfil-avatar-wrap">
              <img
                src={user.avatar || DEFAULT_AVATAR}
                alt={user.nom}
                className="perfil-avatar"
              />
              <button
                className="perfil-avatar-edit-btn"
                onClick={() => avatarInputRef.current?.click()}
                title="Canviar foto"
              >
                <i className="ti ti-camera" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImageUpload(e, "avatar")}
              />
            </div>

            {/* Info bàsica */}
            <div className="perfil-header-info">
              <div className="perfil-header-name-row">
                <h1 className="perfil-nom">{user.nom}</h1>
                {user.verificado && (
                  <span className="perfil-verified" title="Compte verificat">
                    <i className="ti ti-rosette-discount-check" />
                  </span>
                )}
                {isAdmin && (
                  <span className="perfil-role-badge admin">Admin</span>
                )}
                {!isAdmin && (
                  <span className="perfil-role-badge user">Usuari</span>
                )}
              </div>

              {user.username && (
                <p className="perfil-username">@{user.username}</p>
              )}

              {user.descripcion && !editMode && (
                <p className="perfil-desc">{user.descripcion}</p>
              )}

              <div className="perfil-meta-row">
                {user.ubicacion && (
                  <span className="perfil-meta-item">
                    <i className="ti ti-map-pin" /> {user.ubicacion}
                  </span>
                )}
                {user.telefono && (
                  <span className="perfil-meta-item">
                    <i className="ti ti-phone" /> {user.telefono}
                  </span>
                )}
                {user.fechaNacimiento && (
                  <span className="perfil-meta-item">
                    <i className="ti ti-cake" /> {fmtDate(user.fechaNacimiento)}
                  </span>
                )}
                <span className="perfil-meta-item">
                  <i className="ti ti-calendar" /> Membre des de {fmtDate(user.createdAt)}
                </span>
              </div>
            </div>

            {/* Botó editar */}
            <div className="perfil-header-actions">
              {!editMode ? (
                <button className="perfil-edit-btn" onClick={() => setEditMode(true)}>
                  <i className="ti ti-edit" /> Editar perfil
                </button>
              ) : (
                <div className="perfil-edit-actions">
                  <button
                    className="perfil-save-btn"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Desant..." : <><i className="ti ti-check" /> Desar</>}
                  </button>
                  <button
                    className="perfil-cancel-btn"
                    onClick={() => { setEditMode(false); setFeedback(null); }}
                  >
                    <i className="ti ti-x" /> Cancel·lar
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`perfil-feedback ${feedback.type}`}>
            <i className={`ti ${feedback.type === "success" ? "ti-check" : "ti-alert-circle"}`} />
            {feedback.msg}
          </div>
        )}

        {/* ── CONTINGUT ───────────────────────────────────── */}
        <div className="perfil-body">

          {/* ── EDIT FORM ─────────────────────────────────── */}
          {editMode && (
            <section className="perfil-edit-section">
              <span className="section-index">EDITAR INFORMACIÓ</span>
              <h2 className="perfil-section-title">
                Actualitza el teu <span className="accent-word">perfil</span>
              </h2>

              <div className="perfil-form">

                <div className="perfil-form-row">
                  <div className="perfil-form-group">
                    <label>Nom complet</label>
                    <input
                      type="text"
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      placeholder="El teu nom"
                    />
                  </div>
                  <div className="perfil-form-group">
                    <label>Nom d'usuari</label>
                    <div className="perfil-input-prefix">
                      <span>@</span>
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>

                <div className="perfil-form-row">
                  <div className="perfil-form-group">
                    <label>Correu electrònic</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="nom@exemple.com"
                    />
                  </div>
                  <div className="perfil-form-group">
                    <label>Telèfon</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div className="perfil-form-row">
                  <div className="perfil-form-group">
                    <label>Ubicació</label>
                    <input
                      type="text"
                      name="ubicacion"
                      value={form.ubicacion}
                      onChange={handleChange}
                      placeholder="Mataró, Catalunya"
                    />
                  </div>
                  <div className="perfil-form-group">
                    <label>Data de naixement</label>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={form.fechaNacimiento}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="perfil-form-group full">
                  <label>Descripció <span className="perfil-char-count">{form.descripcion.length}/300</span></label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    maxLength={300}
                    rows={4}
                    placeholder="Explica qui ets..."
                  />
                </div>

              </div>
            </section>
          )}

          {/* ── INFO CARDS (vista lectura) ──────────────────── */}
          {!editMode && (
            <div className="perfil-cards-grid">

              {/* Sobre mi */}
              <section className="perfil-card">
                <div className="perfil-card-header">
                  <i className="ti ti-user" />
                  <h3>Sobre mi</h3>
                </div>
                <div className="perfil-card-body">
                  {user.descripcion ? (
                    <p className="perfil-card-desc">{user.descripcion}</p>
                  ) : (
                    <p className="perfil-card-empty">Sense descripció.</p>
                  )}
                </div>
              </section>

              {/* Informació de contacte */}
              <section className="perfil-card">
                <div className="perfil-card-header">
                  <i className="ti ti-address-book" />
                  <h3>Contacte</h3>
                </div>
                <div className="perfil-card-body">
                  <div className="perfil-info-list">
                    <div className="perfil-info-item">
                      <span className="perfil-info-label">
                        <i className="ti ti-mail" /> Email
                      </span>
                      <span className="perfil-info-value">{user.email}</span>
                    </div>
                    <div className="perfil-info-item">
                      <span className="perfil-info-label">
                        <i className="ti ti-phone" /> Telèfon
                      </span>
                      <span className="perfil-info-value">
                        {user.telefono || <em className="perfil-empty-field">No indicat</em>}
                      </span>
                    </div>
                    <div className="perfil-info-item">
                      <span className="perfil-info-label">
                        <i className="ti ti-map-pin" /> Ubicació
                      </span>
                      <span className="perfil-info-value">
                        {user.ubicacion || <em className="perfil-empty-field">No indicada</em>}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Detalls del compte */}
              <section className="perfil-card">
                <div className="perfil-card-header">
                  <i className="ti ti-shield" />
                  <h3>Compte</h3>
                </div>
                <div className="perfil-card-body">
                  <div className="perfil-info-list">
                    <div className="perfil-info-item">
                      <span className="perfil-info-label">
                        <i className="ti ti-at" /> Username
                      </span>
                      <span className="perfil-info-value">
                        {user.username ? `@${user.username}` : <em className="perfil-empty-field">No definit</em>}
                      </span>
                    </div>
                    <div className="perfil-info-item">
                      <span className="perfil-info-label">
                        <i className="ti ti-cake" /> Nascuda/t el
                      </span>
                      <span className="perfil-info-value">
                        {user.fechaNacimiento ? fmtDate(user.fechaNacimiento) : <em className="perfil-empty-field">No indicat</em>}
                      </span>
                    </div>
                    <div className="perfil-info-item">
                      <span className="perfil-info-label">
                        <i className="ti ti-crown" /> Rol
                      </span>
                      <span className="perfil-info-value" style={{ color: isAdmin ? "var(--yellow)" : "var(--text-muted)" }}>
                        {isAdmin ? "Administrador" : "Usuari"}
                      </span>
                    </div>
                    <div className="perfil-info-item">
                      <span className="perfil-info-label">
                        <i className="ti ti-rosette-discount-check" /> Verificat
                      </span>
                      <span className="perfil-info-value" style={{ color: user.verificado ? "var(--blue)" : "var(--text-muted)" }}>
                        {user.verificado ? "Sí" : "No"}
                      </span>
                    </div>
                    <div className="perfil-info-item">
                      <span className="perfil-info-label">
                        <i className="ti ti-calendar-plus" /> Membre des de
                      </span>
                      <span className="perfil-info-value">{fmtDate(user.createdAt)}</span>
                    </div>
                    <div className="perfil-info-item">
                      <span className="perfil-info-label">
                        <i className="ti ti-refresh" /> Última actualització
                      </span>
                      <span className="perfil-info-value">{fmtDate(user.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Estat del compte */}
              <section className="perfil-card">
                <div className="perfil-card-header">
                  <i className="ti ti-activity" />
                  <h3>Estat</h3>
                </div>
                <div className="perfil-card-body">
                  <div className="perfil-status-row">
                    <div className={`perfil-status-dot ${user.activo ? "active" : "inactive"}`} />
                    <span className="perfil-status-label">
                      Compte {user.activo ? "actiu" : "inactiu"}
                    </span>
                  </div>
                  <p className="perfil-card-empty" style={{ marginTop: "12px" }}>
                    {user.activo
                      ? "El teu compte és actiu i visible a la plataforma."
                      : "El teu compte ha estat desactivat. Contacta amb l'administrador."}
                  </p>
                </div>
              </section>

            </div>
          )}

        </div>

      </main>

      <Footer />
    </>
  );
}