import React, { useEffect, useState, useCallback, useRef } from "react";
import { Navigate } from "react-router-dom";
import "./css/AdminPanel.css";

const API = "http://localhost:5000";

// ─── Auth ─────────────────────────────────────────────────────────────────────
function useAdminAuth() {
  const [user, setUser]         = useState(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) { setChecking(false); return; }
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { const u = data.user ?? data; setUser((u.rol === "admin" || u.role === "admin") ? u : null); })
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);
  return { user, checking };
}

// ─── apiFetch ─────────────────────────────────────────────────────────────────
function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
    ...opts,
  }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });
}

// ─── apiFetchRaw ──────────────────────────────────────────────────────────────
function apiFetchRaw(path, opts = {}) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
    ...opts,
  }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });
}

// ─── Hook imatges multimedia ──────────────────────────────────────────────────
function useMediaImages() {
  const [images, setImages] = useState([]);
  const load = useCallback(() => {
    apiFetch("/admin/multimedia")
      .then(d => setImages(Array.isArray(d) ? d : (d.images ?? [])))
      .catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);
  return { images, reload: load };
}

// ─── ImagePicker ──────────────────────────────────────────────────────────────
function ImagePicker({ label, value, onChange, required, span, images }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = images.filter(img => img.filename.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className={`adm-field${span ? " adm-field--span" : ""}`}>
      {label && <label className="adm-field__lbl">{label}{required && <span className="adm-field__req"> *</span>}</label>}
      <div className="adm-imgpick-row">
        <input className="adm-inp adm-imgpick-inp" value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder="https://… o selecciona de multimedia" />
        <button type="button" className="adm-btn adm-btn--ghost adm-imgpick-btn" onClick={() => setOpen(o => !o)} title="Seleccionar">
          <i className="ti ti-photo-search" />
        </button>
        {value && (
          <button type="button" className="adm-btn adm-btn--ghost adm-imgpick-btn adm-imgpick-btn--clear" onClick={() => onChange("")} title="Treure">
            <i className="ti ti-x" />
          </button>
        )}
      </div>
      {value && (
        <div className="adm-imgpick-preview">
          <img src={value.startsWith("http") ? value : `${API}${value}`} alt="preview" />
        </div>
      )}
      {open && (
        <div className="adm-imgpick-dropdown">
          <div className="adm-imgpick-search">
            <i className="ti ti-search" />
            <input className="adm-inp" placeholder="Cerca imatge…" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          </div>
          {filtered.length === 0
            ? <div className="adm-imgpick-empty"><i className="ti ti-photo-off" />Sense imatges</div>
            : <div className="adm-imgpick-grid">
                {filtered.map(img => {
                  const url = `${API}${img.url}`;
                  const isSelected = value === url || value === img.url;
                  return (
                    <button key={img.filename} type="button"
                      className={`adm-imgpick-thumb${isSelected ? " adm-imgpick-thumb--active" : ""}`}
                      onClick={() => { onChange(url); setOpen(false); setSearch(""); }} title={img.filename}>
                      <img src={url} alt={img.filename} loading="lazy" />
                      {isSelected && <div className="adm-imgpick-thumb__check"><i className="ti ti-check" /></div>}
                    </button>
                  );
                })}
              </div>}
          <div className="adm-imgpick-foot">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setOpen(false)}>
              <i className="ti ti-x" />Tancar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GaleriaPicker ────────────────────────────────────────────────────────────
function GaleriaPicker({ images, value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = images.filter(img => img.filename.toLowerCase().includes(search.toLowerCase()));

  function toggleImg(img) {
    const url = `${API}${img.url}`;
    const exists = value.some(v => v.url === url || v.url === img.url);
    if (exists) onChange(value.filter(v => v.url !== url && v.url !== img.url));
    else onChange([...value, { url, alt: img.filename.replace(/\.[^.]+$/, "") }]);
  }
  function removeItem(idx) { onChange(value.filter((_, i) => i !== idx)); }
  function updateAlt(idx, alt) { const next = [...value]; next[idx] = { ...next[idx], alt }; onChange(next); }

  return (
    <div className="adm-field adm-field--span">
      <label className="adm-field__lbl">Galeria d'imatges</label>
      {value.length > 0 && (
        <div className="adm-galeria-list">
          {value.map((item, idx) => {
            const src = item.url.startsWith("http") ? item.url : `${API}${item.url}`;
            return (
              <div key={idx} className="adm-galeria-item">
                <img src={src} alt={item.alt} />
                <div className="adm-galeria-item__body">
                  <input className="adm-inp adm-galeria-item__alt" value={item.alt ?? ""} onChange={e => updateAlt(idx, e.target.value)} placeholder="Text alternatiu…" />
                  <span className="adm-galeria-item__url">{item.url}</span>
                </div>
                <button type="button" className="adm-icon-btn adm-icon-btn--delete" onClick={() => removeItem(idx)} title="Treure">
                  <i className="ti ti-x" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setOpen(o => !o)}>
        <i className="ti ti-photo-plus" />
        {open ? "Tancar selector" : `Afegir imatge${value.length > 0 ? ` (${value.length} seleccionades)` : ""}`}
      </button>
      {open && (
        <div className="adm-imgpick-dropdown adm-imgpick-dropdown--galeria">
          <div className="adm-imgpick-search">
            <i className="ti ti-search" />
            <input className="adm-inp" placeholder="Cerca imatge…" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          </div>
          {filtered.length === 0
            ? <div className="adm-imgpick-empty"><i className="ti ti-photo-off" />Sense imatges</div>
            : <div className="adm-imgpick-grid">
                {filtered.map(img => {
                  const url = `${API}${img.url}`;
                  const isSelected = value.some(v => v.url === url || v.url === img.url);
                  return (
                    <button key={img.filename} type="button"
                      className={`adm-imgpick-thumb${isSelected ? " adm-imgpick-thumb--active" : ""}`}
                      onClick={() => toggleImg(img)} title={img.filename}>
                      <img src={url} alt={img.filename} loading="lazy" />
                      {isSelected && <div className="adm-imgpick-thumb__check"><i className="ti ti-check" /></div>}
                    </button>
                  );
                })}
              </div>}
          <div className="adm-imgpick-foot">
            <span className="adm-imgpick-foot__count">{value.length} imatge{value.length !== 1 ? "s" : ""} seleccionada{value.length !== 1 ? "s" : ""}</span>
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setOpen(false)}>
              <i className="ti ti-check" />Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  if (!msg) return null;
  return (
    <div className={`adm-toast adm-toast--${type}`}>
      <i className={`ti ${type === "ok" ? "ti-circle-check" : "ti-alert-circle"}`} />
      <span>{msg}</span>
    </div>
  );
}

// ─── Confirm ──────────────────────────────────────────────────────────────────
function Confirm({ msg, onYes, onNo }) {
  return (
    <div className="adm-overlay">
      <div className="adm-confirm">
        <div className="adm-confirm__icon-wrap"><i className="ti ti-trash-x" /></div>
        <p className="adm-confirm__msg">{msg}</p>
        <p className="adm-confirm__sub">Aquesta acció no es pot desfer.</p>
        <div className="adm-confirm__btns">
          <button className="adm-btn adm-btn--ghost" onClick={onNo}><i className="ti ti-x" />Cancel·lar</button>
          <button className="adm-btn adm-btn--danger" onClick={onYes}><i className="ti ti-trash" />Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent, onClick }) {
  return (
    <div className={`adm-stat${onClick ? " adm-stat--clickable" : ""}`} style={{ "--accent": accent }}
      onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="adm-stat__icon"><i className={`ti ${icon}`} /></div>
      <div className="adm-stat__body">
        <span className="adm-stat__val">{value ?? "—"}</span>
        <span className="adm-stat__lbl">{label}</span>
      </div>
      {onClick && <i className="ti ti-chevron-right adm-stat__arrow" />}
    </div>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────
function VisitsChart({ data }) {
  if (!data?.length) return (
    <div className="adm-chart-empty"><i className="ti ti-chart-bar-off" /><span>Sense dades de visites disponibles</span></div>
  );
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="adm-chart">
      {data.map((d, i) => (
        <div key={i} className="adm-chart__col">
          <div className="adm-chart__bar-wrap">
            <div className="adm-chart__bar" style={{ height: `${(d.count / max) * 100}%` }} title={`${d.count} visites`}>
              <span className="adm-chart__val">{d.count}</span>
            </div>
          </div>
          <span className="adm-chart__lbl">{d.label ?? d.date ?? d.dia}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, icon, children, onClose, wide }) {
  useEffect(() => {
    const k = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className={`adm-modal${wide ? " adm-modal--wide" : ""}`} onClick={e => e.stopPropagation()}>
        <div className="adm-modal__head">
          <div className="adm-modal__title-wrap">
            {icon && <i className={`ti ${icon} adm-modal__title-icon`} />}
            <span className="adm-modal__title">{title}</span>
          </div>
          <button className="adm-modal__close" onClick={onClose} title="Tancar (Esc)"><i className="ti ti-x" /></button>
        </div>
        <div className="adm-modal__body">{children}</div>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, required, span, children }) {
  return (
    <div className={`adm-field${span ? " adm-field--span" : ""}`}>
      <label className="adm-field__lbl">{label}{required && <span className="adm-field__req"> *</span>}</label>
      {children}
    </div>
  );
}

const inp = "adm-inp";
const sel = "adm-sel";
const tex = "adm-tex";

function RowActions({ onView, onEdit, onDelete }) {
  return (
    <div className="adm-row-actions">

      {onView && (
        <button
          type="button"
          className="adm-icon-btn adm-icon-btn--view"
          onClick={onView}
          title="Veure detall"
        >
          <i className="ti ti-eye" aria-hidden="true" />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          className="adm-icon-btn adm-icon-btn--edit"
          onClick={onEdit}
          title="Editar"
        >
          <i className="ti ti-pencil" aria-hidden="true" />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          className="adm-icon-btn adm-icon-btn--delete"
          onClick={onDelete}
          title="Eliminar"
        >
          <i className="ti ti-trash" aria-hidden="true" />
        </button>
      )}

    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ icon, text, onAction, actionLabel }) {
  return (
    <div className="adm-empty-state">
      <i className={`ti ${icon}`} /><span>{text}</span>
      {onAction && <button className="adm-btn adm-btn--primary" onClick={onAction}><i className="ti ti-plus" />{actionLabel}</button>}
    </div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating, large }) {
  return (
    <div className={`adm-stars-row${large ? " adm-stars-row--lg" : ""}`}>
      {[1,2,3,4,5].map(n => (
        <i key={n} className={`ti ${n <= (rating||0) ? "ti-star-filled adm-star--on" : "ti-star"} adm-star${large ? " adm-star--lg" : ""}`} />
      ))}
    </div>
  );
}

function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/(1024*1024)).toFixed(1)} MB`;
}

// ════════════════════════════════════════════════════════════════════
// SECCIONS
// ════════════════════════════════════════════════════════════════════

// ─── Multimedia ───────────────────────────────────────────────────────────────
function SecMultimedia({ toast }) {
  const [images, setImages]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm]     = useState(null);
  const [preview, setPreview]     = useState(null);
  const [search, setSearch]       = useState("");
  const [copied, setCopied]       = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/admin/multimedia")
      .then(d => setImages(Array.isArray(d) ? d : (d.images ?? [])))
      .catch(() => toast("Error carregant imatges", "err"))
      .finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  async function handleUpload(files) {
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("files", f));
    try {
      await apiFetchRaw("/admin/multimedia", { method: "POST", body: fd });
      toast(`${files.length} imatge${files.length > 1 ? "s pujades" : " pujada"} ✓`, "ok");
      load();
    } catch { toast("Error pujant imatges", "err"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function del(filename) {
    try {
      await apiFetchRaw(`/admin/multimedia/${encodeURIComponent(filename)}`, { method: "DELETE" });
      toast("Imatge eliminada ✓", "ok"); load();
    } catch { toast("Error eliminant", "err"); }
    setConfirm(null);
    if (preview?.filename === filename) setPreview(null);
  }

  function copyUrl(img) {
    navigator.clipboard.writeText(`${API}${img.url}`).then(() => {
      setCopied(img.filename);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function onDrop(e) { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }

  const filtered = images.filter(img => img.filename.toLowerCase().includes(search.toLowerCase()));
  const totalSize = images.reduce((a, i) => a + (i.size || 0), 0);

  return (

<div className="adm-sec">
      <div className="adm-sec__head">
        <h2 className="adm-sec__title">
          <i className="ti ti-photo" />Multimedia
          <span className="adm-sec__count">{images.length}</span>
          {images.length > 0 && <span className="adm-sec__avg"><i className="ti ti-database" />{fmtBytes(totalSize)}</span>}
        </h2>
        <div className="adm-sec__actions">
          <div className="adm-search-wrap">
            <i className="ti ti-search adm-search-icon" />
            <input className={`${inp} adm-search-inp`} placeholder="Cerca per nom…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="adm-btn adm-btn--primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <><div className="adm-spin adm-spin--sm" />Pujant…</> : <><i className="ti ti-upload" />Pujar imatges</>}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" multiple style={{ display: "none" }} onChange={e => handleUpload(e.target.files)} />
        </div>
      </div>

      <div className={`adm-dropzone${dragOver ? " adm-dropzone--over" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}>
        <i className="ti ti-cloud-upload" />
        <span>Arrossega imatges aquí o <strong>fes clic per seleccionar</strong></span>
        <span className="adm-dropzone__sub">JPG · PNG · WebP · GIF · SVG · màx. 8 MB per fitxer</span>
      </div>

      {loading
        ? <div className="adm-loading"><div className="adm-spin" /><span>Carregant…</span></div>
        : filtered.length === 0
          ? <EmptyState icon={search ? "ti-photo-search" : "ti-photo-off"}
              text={search ? "Sense resultats" : "Encara no hi ha imatges pujades"}
              onAction={!search ? () => fileRef.current?.click() : null} actionLabel="Pujar primera imatge" />
          : (
            <div className="adm-media-grid">
              {filtered.map(img => (
                <div key={img.filename} className="adm-media-card">
                  <div className="adm-media-thumb" onClick={() => setPreview(img)} title="Veure en gran">
                    <img src={`${API}${img.url}`} alt={img.filename} loading="lazy"
                      onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
                    <div className="adm-media-thumb__fallback" style={{ display: "none" }}><i className="ti ti-photo-off" /></div>
                    <div className="adm-media-thumb__overlay"><i className="ti ti-eye" /></div>
                  </div>
                  <div className="adm-media-info">
                    <span className="adm-media-name" title={img.filename}>{img.filename}</span>
                    <div className="adm-media-meta">
                      <span>{fmtBytes(img.size)}</span>
                      {img.uploadedAt && <span>{new Date(img.uploadedAt).toLocaleDateString("ca-ES")}</span>}
                    </div>
                  </div>
                  <div className="adm-media-actions">
                    <button className={`adm-icon-btn${copied === img.filename ? " adm-icon-btn--copied" : " adm-icon-btn--view"}`}
                      title={copied === img.filename ? "URL copiada!" : "Copiar URL"} onClick={() => copyUrl(img)}>
                      <i className={`ti ${copied === img.filename ? "ti-check" : "ti-link"}`} />
                    </button>
                    <a href={`${API}${img.url}`} target="_blank" rel="noopener noreferrer"
                      className="adm-icon-btn adm-icon-btn--edit" title="Obrir en nova pestanya">
                      <i className="ti ti-external-link" />
                    </a>
                    <button className="adm-icon-btn adm-icon-btn--delete" title="Eliminar" onClick={() => setConfirm({ filename: img.filename })}>
                      <i className="ti ti-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

      {preview && (
        <div className="adm-lightbox" onClick={() => setPreview(null)}>
          <div className="adm-lightbox__box" onClick={e => e.stopPropagation()}>
            <div className="adm-lightbox__head">
              <span className="adm-lightbox__name"><i className="ti ti-photo" />{preview.filename}</span>
              <div className="adm-lightbox__head-actions">
                <button className={`adm-icon-btn${copied === preview.filename ? " adm-icon-btn--copied" : " adm-icon-btn--view"}`}
                  title="Copiar URL" onClick={() => copyUrl(preview)}>
                  <i className={`ti ${copied === preview.filename ? "ti-check" : "ti-link"}`} />
                </button>
                <a href={`${API}${preview.url}`} download={preview.filename} className="adm-icon-btn adm-icon-btn--edit" title="Descarregar">
                  <i className="ti ti-download" />
                </a>
                <button className="adm-icon-btn adm-icon-btn--delete" title="Eliminar"
                  onClick={() => { setPreview(null); setConfirm({ filename: preview.filename }); }}>
                  <i className="ti ti-trash" />
                </button>
                <button className="adm-icon-btn adm-icon-btn--view" title="Tancar" onClick={() => setPreview(null)}>
                  <i className="ti ti-x" />
                </button>
              </div>
            </div>
            <div className="adm-lightbox__img-wrap">
              <img src={`${API}${preview.url}`} alt={preview.filename} />
            </div>
            <div className="adm-lightbox__foot">
              <span><i className="ti ti-database" />{fmtBytes(preview.size)}</span>
              {preview.uploadedAt && <span><i className="ti ti-calendar" />{new Date(preview.uploadedAt).toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" })}</span>}
              <span className="adm-lightbox__url" onClick={() => copyUrl(preview)} title="Fes clic per copiar">
                <i className="ti ti-link" />{API}{preview.url}
              </span>
            </div>
          </div>
        </div>
      )}

      {confirm && <Confirm msg={`Vols eliminar "${confirm.filename}"?`} onYes={() => del(confirm.filename)} onNo={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Editor JSON ──────────────────────────────────────────────────────────────
const JSON_FILES = [
  { key: "events",     label: "Esdeveniments", icon: "ti-calendar-event", route: "/admin/json/events" },
  { key: "projectes",  label: "Projectes",     icon: "ti-folder",         route: "/admin/json/projectes" },
  { key: "publi",      label: "Publicacions",  icon: "ti-file-text",      route: "/admin/json/publi" },
  { key: "resenas",    label: "Ressenyes",     icon: "ti-message-star",   route: "/admin/json/resenas" },
  { key: "solicituds", label: "Sol·licituds",  icon: "ti-users",          route: "/admin/json/solicituds" },
];

function SecEditorJSON({ toast }) {
  const [selected, setSelected]   = useState(null);
  const [content, setContent]     = useState("");
  const [original, setOriginal]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  function validateJSON(str) {
    try { JSON.parse(str); return null; } catch (e) { return e.message; }
  }

  const isDirty = content !== original;
  const errMsg  = content ? validateJSON(content) : null;

  function handleChange(val) {
    setContent(val);
    setLineCount(val.split("\n").length);
    setCharCount(val.length);
  }

  async function loadFile(file) {
    setSelected(file); setLoading(true);
    try {
      const data = await apiFetch(file.route);
      const str  = JSON.stringify(data, null, 2);
      setContent(str); setOriginal(str);
      setLineCount(str.split("\n").length); setCharCount(str.length);
    } catch { toast("Error carregant el fitxer JSON", "err"); setContent(""); setOriginal(""); }
    finally { setLoading(false); }
  }

  async function save() {
    if (errMsg) { toast("El JSON té errors de sintaxi", "err"); return; }
    setSaving(true);
    try {
      const parsed = JSON.parse(content);
      await apiFetch(selected.route, { method: "PUT", body: JSON.stringify(parsed) });
      setOriginal(content);
      toast("Fitxer desat correctament ✓", "ok");
    } catch { toast("Error desant el fitxer", "err"); }
    finally { setSaving(false); }
  }

  function format() {
    try { handleChange(JSON.stringify(JSON.parse(content), null, 2)); }
    catch { toast("No es pot formatar: JSON invàlid", "err"); }
  }

  function copyAll() { navigator.clipboard.writeText(content).then(() => toast("JSON copiat ✓", "ok")); }

  const statusLabel = errMsg ? "Error JSON" : isDirty ? "Modificat" : "Sincronitzat";
  const statusClass = errMsg ? "adm-json-status--err" : isDirty ? "adm-json-status--mod" : "adm-json-status--ok";

  return (
    <div className="adm-sec">
      <div className="adm-sec__head">
        <h2 className="adm-sec__title"><i className="ti ti-code" />Editor JSON</h2>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "1px" }}>
          Edita els fitxers de dades directament
        </span>
      </div>
      <div className="adm-json-layout">
        <div className="adm-json-sidebar">
          <div className="adm-json-sidebar__head">Fitxers de dades</div>
          {JSON_FILES.map(file => (
            <button key={file.key}
              className={`adm-json-file-btn${selected?.key === file.key ? " adm-json-file-btn--active" : ""}`}
              onClick={() => loadFile(file)}>
              <i className={`ti ${file.icon}`} />
              <span>{file.label}</span>
              <span className="adm-json-file-badge">.json</span>
            </button>
          ))}
        </div>
        <div className="adm-json-editor-wrap">
          {!selected ? (
            <div className="adm-json-empty"><i className="ti ti-file-code" /><span>Selecciona un fitxer per editar</span></div>
          ) : loading ? (
            <div className="adm-loading" style={{ minHeight: 340 }}><div className="adm-spin" /><span>Carregant JSON…</span></div>
          ) : (
            <>
              <div className="adm-json-toolbar">
                <span className="adm-json-filename"><i className="ti ti-file-code" />{selected.label}.json</span>
                <span className={`adm-json-status ${statusClass}`}>{statusLabel}</span>
                <button className="adm-btn adm-btn--ghost" onClick={copyAll}><i className="ti ti-copy" />Copiar</button>
                <button className="adm-btn adm-btn--ghost" onClick={format} disabled={!!errMsg}><i className="ti ti-brackets" />Formatar</button>
                {isDirty && <button className="adm-btn adm-btn--ghost" onClick={() => handleChange(original)}><i className="ti ti-refresh" />Descartar</button>}
                <button className="adm-btn adm-btn--primary" onClick={save} disabled={!isDirty || !!errMsg || saving}>
                  {saving ? <><div className="adm-spin adm-spin--sm" />Desant…</> : <><i className="ti ti-device-floppy" />Desar</>}
                </button>
              </div>
              {errMsg && (
                <div className="adm-json-error-msg"><i className="ti ti-alert-circle" /><span>{errMsg}</span></div>
              )}
              <textarea className={`adm-json-textarea${errMsg ? " adm-json-textarea--error" : ""}`}
                value={content} onChange={e => handleChange(e.target.value)}
                spellCheck={false} autoCorrect="off" autoCapitalize="off" />
              <div className="adm-json-meta">
                <span><i className="ti ti-list-numbers" />{lineCount} línies</span>
                <span><i className="ti ti-text-size" />{charCount.toLocaleString()} caràcters</span>
                {!errMsg && content && (() => {
                  try {
                    const d = JSON.parse(content);
                    return <span><i className="ti ti-check" />{Array.isArray(d) ? `${d.length} elements` : `${Object.keys(d).length} claus`}</span>;
                  } catch { return null; }
                })()}
              </div>
              <div className="adm-notice">
                <i className="ti ti-alert-triangle" />
                <div><strong>Atenció:</strong> editar el JSON directament pot corrompre les dades. Assegura't que el JSON sigui vàlid abans de desar.</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Esdeveniments ────────────────────────────────────────────────────────────
const BUIT_EVENT = { titol: "", descripcio: "", data_inici: "", data_fi: "", lloc: "", categoria: "", latitud: "", longitud: "", imatge: "" };

function SecEvents({ toast }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(BUIT_EVENT);
  const [saving, setSaving]   = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch]   = useState("");
  const { images } = useMediaImages();
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/admin/events")
      .then(d => setRows(Array.isArray(d) ? d : (d.events ?? [])))
      .catch(() => toast("Error carregant esdeveniments", "err"))
      .finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm(BUIT_EVENT); setModal({ mode: "create" }); }
  function openEdit(r)  { setForm({ ...BUIT_EVENT, ...r }); setModal({ mode: "edit", id: r._id ?? r.id }); }

  async function save() {
    setSaving(true);
    try {
      if (modal.mode === "create") await apiFetch("/admin/events", { method: "POST", body: JSON.stringify(form) });
      else await apiFetch(`/admin/events/${modal.id}`, { method: "PUT", body: JSON.stringify(form) });
      toast(modal.mode === "create" ? "Esdeveniment creat ✓" : "Actualitzat ✓", "ok");
      setModal(null); load();
    } catch { toast("Error desant", "err"); }
    finally { setSaving(false); }
  }

  async function del(id) {
    try { await apiFetch(`/admin/events/${id}`, { method: "DELETE" }); toast("Eliminat ✓", "ok"); load(); }
    catch { toast("Error eliminant", "err"); }
    setConfirm(null);
  }

  const filtered = rows.filter(r => (r.titol ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="adm-sec">
      <div className="adm-sec__head">
        <h2 className="adm-sec__title"><i className="ti ti-calendar-event" />Esdeveniments<span className="adm-sec__count">{rows.length}</span></h2>
        <div className="adm-sec__actions">
          <div className="adm-search-wrap"><i className="ti ti-search adm-search-icon" />
            <input className={`${inp} adm-search-inp`} placeholder="Cerca per títol…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="adm-btn adm-btn--primary" onClick={openCreate}><i className="ti ti-plus" />Nou Esdeveniment</button>
        </div>
      </div>

      {loading ? <div className="adm-loading"><div className="adm-spin" /><span>Carregant…</span></div>
        : filtered.length === 0 ? <EmptyState icon="ti-calendar-off" text={search ? "Sense resultats" : "Sense esdeveniments"} onAction={!search ? openCreate : null} actionLabel="Nou Esdeveniment" />
        : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr>
                <th><i className="ti ti-text-size" />Títol</th>
                <th><i className="ti ti-tag" />Categoria</th>
                <th><i className="ti ti-calendar" />Data inici</th>
                <th><i className="ti ti-map-pin" />Lloc</th>
                <th className="adm-th-actions">Accions</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id ?? r.id}>
                    <td>
                      <div className="adm-td-main">
                        {r.imatge && <img src={r.imatge.startsWith("http") ? r.imatge : `${API}${r.imatge}`} alt="" className="adm-td-img" />}
                        <div>
                          <span className="adm-td-title">{r.titol}</span>
                          {r.descripcio && <span className="adm-td-sub">{r.descripcio.slice(0, 60)}{r.descripcio.length > 60 ? "…" : ""}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{r.categoria ? <span className="adm-badge">{r.categoria}</span> : <span className="adm-dash">—</span>}</td>
                    <td><div className="adm-td-date"><i className="ti ti-calendar" /><span>{(r.data_inici ?? r.data) ? new Date(r.data_inici ?? r.data).toLocaleDateString("ca-ES") : "—"}</span></div></td>
                    <td>{r.lloc ? <div className="adm-td-loc"><i className="ti ti-map-pin" /><span>{r.lloc}</span></div> : <span className="adm-dash">—</span>}</td>
                    <td><RowActions onEdit={() => openEdit(r)} onDelete={() => setConfirm({ id: r._id ?? r.id, nom: r.titol })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {modal && (
        <Modal title={modal.mode === "create" ? "Nou Esdeveniment" : "Editar Esdeveniment"}
          icon={modal.mode === "create" ? "ti-calendar-plus" : "ti-calendar-event"} onClose={() => setModal(null)}>
          <div className="adm-form-grid">
            <Field label="Títol" required><input className={inp} value={form.titol} onChange={e => f("titol", e.target.value)} placeholder="Nom de l'esdeveniment" /></Field>
            <Field label="Categoria"><input className={inp} value={form.categoria} onChange={e => f("categoria", e.target.value)} placeholder="Festa, Cultura…" /></Field>
            <Field label="Data inici"><input type="datetime-local" className={inp} value={form.data_inici} onChange={e => f("data_inici", e.target.value)} /></Field>
            <Field label="Data fi"><input type="datetime-local" className={inp} value={form.data_fi} onChange={e => f("data_fi", e.target.value)} /></Field>
            <Field label="Lloc"><input className={inp} value={form.lloc} onChange={e => f("lloc", e.target.value)} placeholder="Nom del lloc" /></Field>
            <Field label="Latitud"><input className={inp} type="number" value={form.latitud} onChange={e => f("latitud", e.target.value)} placeholder="41.5389" /></Field>
            <Field label="Longitud"><input className={inp} type="number" value={form.longitud} onChange={e => f("longitud", e.target.value)} placeholder="2.4450" /></Field>
            <Field label="Descripció" span><textarea className={tex} rows={3} value={form.descripcio} onChange={e => f("descripcio", e.target.value)} placeholder="Descripció de l'esdeveniment…" /></Field>
            <ImagePicker label="Imatge" value={form.imatge} onChange={v => f("imatge", v)} images={images} span />
          </div>
          <div className="adm-modal__foot">
            <button className="adm-btn adm-btn--ghost" onClick={() => setModal(null)}><i className="ti ti-x" />Cancel·lar</button>
            <button className="adm-btn adm-btn--primary" onClick={save} disabled={!form.titol || saving}>
              {saving ? <><div className="adm-spin adm-spin--sm" />Desant…</> : <><i className="ti ti-device-floppy" />Desar canvis</>}
            </button>
          </div>
        </Modal>
      )}
      {confirm && <Confirm msg={`Vols eliminar "${confirm.nom}"?`} onYes={() => del(confirm.id)} onNo={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Projectes ────────────────────────────────────────────────────────────────
const BUIT_PROJ = { titol: "", descripcio: "", estat: "actiu", imatge: "", categoria: "", data_inici: "", data_fi: "", responsable: "" };
const ESTATS_PROJ = ["actiu", "finalitzat", "pendent", "cancel·lat"];

function SecProjectes({ toast }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(BUIT_PROJ);
  const [saving, setSaving]   = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch]   = useState("");
  const { images } = useMediaImages();
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/admin/projectes")
      .then(d => setRows(Array.isArray(d) ? d : (d.projectes ?? [])))
      .catch(() => toast("Error carregant projectes", "err"))
      .finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm(BUIT_PROJ); setModal({ mode: "create" }); }
  function openEdit(r)  { setForm({ ...BUIT_PROJ, ...r }); setModal({ mode: "edit", id: r._id ?? r.id }); }

  async function save() {
    setSaving(true);
    try {
      if (modal.mode === "create") await apiFetch("/admin/projectes", { method: "POST", body: JSON.stringify(form) });
      else await apiFetch(`/admin/projectes/${modal.id}`, { method: "PUT", body: JSON.stringify(form) });
      toast("Projecte desat ✓", "ok"); setModal(null); load();
    } catch { toast("Error desant", "err"); }
    finally { setSaving(false); }
  }

  async function del(id) {
    try { await apiFetch(`/admin/projectes/${id}`, { method: "DELETE" }); toast("Eliminat ✓", "ok"); load(); }
    catch { toast("Error eliminant", "err"); }
    setConfirm(null);
  }

  const filtered = rows.filter(r => (r.titol ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="adm-sec">
      <div className="adm-sec__head">
        <h2 className="adm-sec__title"><i className="ti ti-folder" />Projectes<span className="adm-sec__count">{rows.length}</span></h2>
        <div className="adm-sec__actions">
          <div className="adm-search-wrap"><i className="ti ti-search adm-search-icon" />
            <input className={`${inp} adm-search-inp`} placeholder="Cerca per títol…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="adm-btn adm-btn--primary" onClick={openCreate}><i className="ti ti-folder-plus" />Nou Projecte</button>
        </div>
      </div>

      {loading ? <div className="adm-loading"><div className="adm-spin" /><span>Carregant…</span></div>
        : filtered.length === 0 ? <EmptyState icon="ti-folder-off" text={search ? "Sense resultats" : "Sense projectes"} onAction={!search ? openCreate : null} actionLabel="Nou Projecte" />
        : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr>
                <th><i className="ti ti-text-size" />Títol</th>
                <th><i className="ti ti-tag" />Categoria</th>
                <th><i className="ti ti-activity" />Estat</th>
                <th><i className="ti ti-user" />Responsable</th>
                <th className="adm-th-actions">Accions</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id ?? r.id}>
                    <td>
                      <div className="adm-td-main">
                        {r.imatge && <img src={r.imatge.startsWith("http") ? r.imatge : `${API}${r.imatge}`} alt="" className="adm-td-img" />}
                        <div>
                          <span className="adm-td-title">{r.titol}</span>
                          {r.data_inici && <span className="adm-td-sub"><i className="ti ti-calendar" />{new Date(r.data_inici).toLocaleDateString("ca-ES")}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{r.categoria ? <span className="adm-badge">{r.categoria}</span> : <span className="adm-dash">—</span>}</td>
                    <td><span className={`adm-badge adm-badge--estat adm-badge--${r.estat}`}><span className="adm-badge-dot" />{r.estat ?? "—"}</span></td>
                    <td>{r.responsable ? <div className="adm-td-user"><div className="adm-td-avatar">{r.responsable.charAt(0).toUpperCase()}</div><span>{r.responsable}</span></div> : <span className="adm-dash">—</span>}</td>
                    <td><RowActions onEdit={() => openEdit(r)} onDelete={() => setConfirm({ id: r._id ?? r.id, nom: r.titol })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {modal && (
        <Modal title={modal.mode === "create" ? "Nou Projecte" : "Editar Projecte"}
          icon={modal.mode === "create" ? "ti-folder-plus" : "ti-folder"} onClose={() => setModal(null)}>
          <div className="adm-form-grid">
            <Field label="Títol" required><input className={inp} value={form.titol} onChange={e => f("titol", e.target.value)} placeholder="Nom del projecte" /></Field>
            <Field label="Categoria"><input className={inp} value={form.categoria} onChange={e => f("categoria", e.target.value)} placeholder="Tipus de projecte" /></Field>
            <Field label="Estat">
              <select className={sel} value={form.estat} onChange={e => f("estat", e.target.value)}>
                {ESTATS_PROJ.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Responsable"><input className={inp} value={form.responsable} onChange={e => f("responsable", e.target.value)} placeholder="Nom del responsable" /></Field>
            <Field label="Data inici"><input type="date" className={inp} value={form.data_inici} onChange={e => f("data_inici", e.target.value)} /></Field>
            <Field label="Data fi"><input type="date" className={inp} value={form.data_fi} onChange={e => f("data_fi", e.target.value)} /></Field>
            <Field label="Descripció" span><textarea className={tex} rows={3} value={form.descripcio} onChange={e => f("descripcio", e.target.value)} placeholder="Descripció del projecte…" /></Field>
            <ImagePicker label="Imatge" value={form.imatge} onChange={v => f("imatge", v)} images={images} span />
          </div>
          <div className="adm-modal__foot">
            <button className="adm-btn adm-btn--ghost" onClick={() => setModal(null)}><i className="ti ti-x" />Cancel·lar</button>
            <button className="adm-btn adm-btn--primary" onClick={save} disabled={!form.titol || saving}>
              {saving ? <><div className="adm-spin adm-spin--sm" />Desant…</> : <><i className="ti ti-device-floppy" />Desar canvis</>}
            </button>
          </div>
        </Modal>
      )}
      {confirm && <Confirm msg={`Vols eliminar "${confirm.nom}"?`} onYes={() => del(confirm.id)} onNo={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Publicacions ─────────────────────────────────────────────────────────────
const BUIT_PUB = { titol: "", descripcio: "", contingut: "", categoria: "", estat: "esborrany", autor: "", imatge: "", tags: "", temps_lectura: "", data_publicacio: "", galeria_imatges: [] };
const ESTATS_PUB = ["esborrany", "publicat", "arxivat"];

function SecPublicacions({ toast }) {
  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null);
  const [form, setForm]               = useState(BUIT_PUB);
  const [saving, setSaving]           = useState(false);
  const [confirm, setConfirm]         = useState(null);
  const [search, setSearch]           = useState("");
  const [filterEstat, setFilterEstat] = useState("");
  const { images } = useMediaImages();
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/publi")
      .then(d => setRows(Array.isArray(d) ? d : (d.publicacions ?? [])))
      .catch(() => toast("Error carregant publicacions", "err"))
      .finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm(BUIT_PUB); setModal({ mode: "create" }); }
  function openEdit(r) {
    setForm({ ...BUIT_PUB, ...r, tags: Array.isArray(r.tags) ? r.tags.join(", ") : (r.tags ?? ""), galeria_imatges: Array.isArray(r.galeria_imatges) ? r.galeria_imatges : [], data_publicacio: r.data_publicacio ? String(r.data_publicacio).slice(0, 10) : "" });
    setModal({ mode: "edit", id: r._id ?? r.id });
  }

  async function save() {
    setSaving(true);
    const payload = { ...form, tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [], galeria_imatges: form.galeria_imatges ?? [] };
    try {
      await apiFetch(modal.mode === "create" ? "/admin/publi" : `/admin/publi/${modal.id}`, { method: modal.mode === "create" ? "POST" : "PUT", body: JSON.stringify(payload) });
      toast("Publicació desada ✓", "ok"); setModal(null); await load();
    } catch { toast("Error desant", "err"); }
    finally { setSaving(false); }
  }

  async function del(id) {
    try { await apiFetch(`/admin/publi/${id}`, { method: "DELETE" }); toast("Eliminada ✓", "ok"); load(); }
    catch { toast("Error eliminant", "err"); }
    setConfirm(null);
  }

  const filtered = rows.filter(r => (!filterEstat || r.estat === filterEstat) && (r.titol ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="adm-sec">
      <div className="adm-sec__head">
        <h2 className="adm-sec__title"><i className="ti ti-file-text" />Publicacions<span className="adm-sec__count">{rows.length}</span></h2>
        <div className="adm-sec__actions">
          <div className="adm-search-wrap"><i className="ti ti-search adm-search-icon" />
            <input className={`${inp} adm-search-inp`} placeholder="Cerca per títol…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={sel} value={filterEstat} onChange={e => setFilterEstat(e.target.value)}>
            <option value="">Tots els estats</option>
            {ESTATS_PUB.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
          <button className="adm-btn adm-btn--primary" onClick={openCreate}><i className="ti ti-file-plus" />Nova Publicació</button>
        </div>
      </div>

      {loading ? <div className="adm-loading"><div className="adm-spin" /><span>Carregant…</span></div>
        : filtered.length === 0 ? <EmptyState icon="ti-file-off" text={search || filterEstat ? "Sense resultats" : "Sense publicacions"} onAction={!search && !filterEstat ? openCreate : null} actionLabel="Nova Publicació" />
        : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr>
                <th><i className="ti ti-text-size" />Títol</th>
                <th><i className="ti ti-tag" />Categoria</th>
                <th><i className="ti ti-activity" />Estat</th>
                <th><i className="ti ti-user" />Autor/a</th>
                <th><i className="ti ti-photo" />Imatges</th>
                <th><i className="ti ti-clock" />Lectura</th>
                <th className="adm-th-actions">Accions</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id ?? r.id}>
                    <td>
                      <div className="adm-td-main">
                        {r.imatge && <img src={r.imatge.startsWith("http") ? r.imatge : `${API}${r.imatge}`} alt="" className="adm-td-img" />}
                        <div>
                          <span className="adm-td-title">{r.titol}</span>
                          {r.descripcio && <span className="adm-td-sub">{r.descripcio.slice(0, 55)}{r.descripcio.length > 55 ? "…" : ""}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{r.categoria ? <span className="adm-badge">{r.categoria}</span> : <span className="adm-dash">—</span>}</td>
                    <td><span className={`adm-badge adm-badge--estat adm-badge--${r.estat ?? "esborrany"}`}><span className="adm-badge-dot" />{r.estat ?? "esborrany"}</span></td>
                    <td>{r.autor ? <div className="adm-td-user"><div className="adm-td-avatar">{r.autor.charAt(0).toUpperCase()}</div><span>{r.autor}</span></div> : <span className="adm-dash">—</span>}</td>
                    <td>
                      {Array.isArray(r.galeria_imatges) && r.galeria_imatges.length > 0
                        ? <div className="adm-td-galeria-mini">
                            {r.galeria_imatges.slice(0, 3).map((img, i) => { const src = (img.url || "").startsWith("http") ? img.url : `${API}${img.url}`; return <img key={i} src={src} alt={img.alt || ""} />; })}
                            {r.galeria_imatges.length > 3 && <span className="adm-td-galeria-more">+{r.galeria_imatges.length - 3}</span>}
                          </div>
                        : <span className="adm-dash">—</span>}
                    </td>
                    <td>{r.temps_lectura ? <div className="adm-td-date"><i className="ti ti-clock" /><span>{r.temps_lectura} min</span></div> : <span className="adm-dash">—</span>}</td>
                    <td><RowActions onEdit={() => openEdit(r)} onDelete={() => setConfirm({ id: r._id ?? r.id, nom: r.titol })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {modal && (
        <Modal title={modal.mode === "create" ? "Nova Publicació" : "Editar Publicació"} icon={modal.mode === "create" ? "ti-file-plus" : "ti-file-text"} onClose={() => setModal(null)} wide>
          <div className="adm-form-grid">
            <Field label="Títol" required><input className={inp} value={form.titol} onChange={e => f("titol", e.target.value)} placeholder="Títol de la publicació" /></Field>
            <Field label="Autor/a"><input className={inp} value={form.autor} onChange={e => f("autor", e.target.value)} placeholder="Nom de l'autor/a" /></Field>
            <Field label="Categoria"><input className={inp} value={form.categoria} onChange={e => f("categoria", e.target.value)} placeholder="Cultura, Tradicions…" /></Field>
            <Field label="Data de publicació"><input type="date" className={inp} value={form.data_publicacio} onChange={e => f("data_publicacio", e.target.value)} /></Field>
            <Field label="Descripció" span><textarea className={tex} rows={2} value={form.descripcio} onChange={e => f("descripcio", e.target.value)} placeholder="Breu descripció…" /></Field>
            <Field label="Estat">
              <select className={sel} value={form.estat} onChange={e => f("estat", e.target.value)}>
                {ESTATS_PUB.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Temps de lectura (min)"><input type="number" className={inp} value={form.temps_lectura} onChange={e => f("temps_lectura", e.target.value)} placeholder="5" min="1" /></Field>
            <Field label="Tags (separats per comes)" span><input className={inp} value={form.tags} onChange={e => f("tags", e.target.value)} placeholder="tradicio, festa, cultura" /></Field>
            <ImagePicker label="Imatge principal" value={form.imatge} onChange={v => f("imatge", v)} images={images} span />
            <GaleriaPicker images={images} value={form.galeria_imatges} onChange={v => f("galeria_imatges", v)} />
            <Field label="Contingut (HTML)" span><textarea className={tex} rows={8} value={form.contingut} onChange={e => f("contingut", e.target.value)} placeholder="<p>Contingut HTML…</p>" /></Field>
          </div>
          <div className="adm-modal__foot">
            <button className="adm-btn adm-btn--ghost" onClick={() => setModal(null)}><i className="ti ti-x" />Cancel·lar</button>
            <button className="adm-btn adm-btn--primary" onClick={save} disabled={!form.titol || saving}>
              {saving ? <><div className="adm-spin adm-spin--sm" />Desant…</> : <><i className="ti ti-device-floppy" />Desar canvis</>}
            </button>
          </div>
        </Modal>
      )}
      {confirm && <Confirm msg={`Vols eliminar "${confirm.nom}"?`} onYes={() => del(confirm.id)} onNo={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Ressenyes ────────────────────────────────────────────────────────────────
function SecRessenyes({ toast }) {
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [confirm, setConfirm]       = useState(null);
  const [detail, setDetail]         = useState(null);
  const [search, setSearch]         = useState("");
  const [filterStar, setFilterStar] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/resenas")
      .then(data => setRows(Array.isArray(data) ? data : (data.resenas ?? data["reseñas"] ?? [])))
      .catch(() => toast("Error carregant ressenyes", "err"))
      .finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  async function del(id) {
    try { await apiFetch(`/admin/resenas/${id}`, { method: "DELETE" }); toast("Ressenya eliminada ✓", "ok"); load(); }
    catch { toast("Error eliminant", "err"); }
    setConfirm(null);
  }

  const filtered = rows.filter(r => filterStar === 0 || r.rating === filterStar)
    .filter(r => [(r.text ?? ""), (r.autor ?? ""), (r.username ?? "")].join(" ").toLowerCase().includes(search.toLowerCase()));
  const avgRating = rows.length ? (rows.reduce((a, r) => a + (r.rating || 0), 0) / rows.length).toFixed(1) : null;

  return (
    <div className="adm-sec">
      <div className="adm-sec__head">
        <h2 className="adm-sec__title">
          <i className="ti ti-message-star" />Ressenyes
          <span className="adm-sec__count">{rows.length}</span>
          {avgRating && <span className="adm-sec__avg"><i className="ti ti-star-filled" />{avgRating} avg</span>}
        </h2>
        <div className="adm-sec__actions">
          <div className="adm-search-wrap"><i className="ti ti-search adm-search-icon" />
            <input className={`${inp} adm-search-inp`} placeholder="Cerca per autor o text…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={sel} value={filterStar} onChange={e => setFilterStar(Number(e.target.value))}>
            <option value={0}>Totes les estrelles</option>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{"★".repeat(n)} ({n} estrella{n > 1 ? "es" : ""})</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="adm-loading"><div className="adm-spin" /><span>Carregant…</span></div>
        : filtered.length === 0 ? <EmptyState icon="ti-message-off" text={search || filterStar ? "Sense resultats" : "Sense ressenyes"} />
        : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr>
                <th><i className="ti ti-user" />Autor/a</th>
                <th><i className="ti ti-star" />Valoració</th>
                <th><i className="ti ti-message" />Text</th>
                <th><i className="ti ti-calendar" />Data</th>
                <th className="adm-th-actions">Accions</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id ?? r.id}>
                    <td>
                      <div className="adm-td-user">
                        <div className="adm-td-avatar">{(r.autor ?? r.username ?? "U").charAt(0).toUpperCase()}</div>
                        <div>
                          <span className="adm-td-title">{r.autor ?? r.username ?? "—"}</span>
                          {(r.publicacio_id ?? r.publicacioId) && <span className="adm-td-sub"><i className="ti ti-file-text" />Pub. #{r.publicacio_id ?? r.publicacioId}</span>}
                        </div>
                      </div>
                    </td>
                    <td><Stars rating={r.rating} /></td>
                    <td className="adm-td-trunc adm-td-muted">{r.text}</td>
                    <td><div className="adm-td-date"><i className="ti ti-calendar" /><span>{(r.data_creacio ?? r.data ?? r.createdAt) ? new Date(r.data_creacio ?? r.data ?? r.createdAt).toLocaleDateString("ca-ES") : "—"}</span></div></td>
                    <td><RowActions onView={() => setDetail(r)} onDelete={() => setConfirm({ id: r._id ?? r.id, nom: `ressenya de ${r.autor ?? r.username ?? "usuari"}` })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {detail && (
        <Modal title="Detall de la ressenya" icon="ti-message-star" onClose={() => setDetail(null)}>
          <div className="adm-detail-block">
            <div className="adm-detail-row"><span className="adm-detail-lbl">Autor/a</span><div className="adm-td-user"><div className="adm-td-avatar">{(detail.autor ?? detail.username ?? "U").charAt(0).toUpperCase()}</div><strong>{detail.autor ?? detail.username ?? "—"}</strong></div></div>
            <div className="adm-detail-row"><span className="adm-detail-lbl">Valoració</span><div><Stars rating={detail.rating} large /><span className="adm-td-sub">{detail.rating}/5 estrelles</span></div></div>
            <div className="adm-detail-row"><span className="adm-detail-lbl">Publicació</span><strong>#{detail.publicacio_id ?? detail.publicacioId ?? "—"}</strong></div>
            <div className="adm-detail-row"><span className="adm-detail-lbl">Data</span><strong>{(detail.data ?? detail.data_creacio ?? detail.createdAt) ? new Date(detail.data ?? detail.data_creacio ?? detail.createdAt).toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}</strong></div>
            {detail.text && <div className="adm-detail-row adm-detail-row--full"><span className="adm-detail-lbl">Text</span><p className="adm-detail-text">"{detail.text}"</p></div>}
          </div>
          <div className="adm-modal__foot">
            <button className="adm-btn adm-btn--ghost" onClick={() => setDetail(null)}><i className="ti ti-x" />Tancar</button>
            <button className="adm-btn adm-btn--danger" onClick={() => { setDetail(null); setConfirm({ id: detail._id ?? detail.id, nom: `ressenya de ${detail.autor ?? detail.username ?? "usuari"}` }); }}>
              <i className="ti ti-trash" />Eliminar ressenya
            </button>
          </div>
        </Modal>
      )}
      {confirm && <Confirm msg={`Vols eliminar la ${confirm.nom}?`} onYes={() => del(confirm.id)} onNo={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Sol·licituds ─────────────────────────────────────────────────────────────
const ESTATS_SOL = ["pendent", "acceptat", "rebutjat"];
const ESTAT_ICON = { pendent: "ti-clock", acceptat: "ti-circle-check", rebutjat: "ti-circle-x" };

function SecSolicituds({ toast }) {
  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [confirm, setConfirm]         = useState(null);
  const [detail, setDetail]           = useState(null);
  const [search, setSearch]           = useState("");
  const [filterEstat, setFilterEstat] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/solicituds")
      .then(d => setRows(Array.isArray(d) ? d : (d.solicituts ?? d.solicituds ?? [])))
      .catch(() => toast("Error carregant sol·licituds", "err"))
      .finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  async function updateEstat(id, estat) {
    try { await apiFetch(`/admin/solicituds/${id}`, { method: "PATCH", body: JSON.stringify({ estat }) }); toast(`Estat canviat a "${estat}" ✓`, "ok"); load(); }
    catch { toast("Error actualitzant estat", "err"); }
  }

  async function del(id) {
    try { await apiFetch(`/admin/solicituds/${id}`, { method: "DELETE" }); toast("Sol·licitud eliminada ✓", "ok"); load(); }
    catch { toast("Error eliminant", "err"); }
    setConfirm(null);
  }

  const counts = ESTATS_SOL.reduce((acc, e) => ({ ...acc, [e]: rows.filter(r => (r.estat ?? "pendent") === e).length }), {});
  const filtered = rows.filter(r => (!filterEstat || (r.estat ?? "pendent") === filterEstat) && [(r.nom ?? ""), (r.email ?? ""), (r.telefon ?? "")].join(" ").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="adm-sec">
      <div className="adm-sec__head">
        <h2 className="adm-sec__title"><i className="ti ti-users" />Sol·licituds<span className="adm-sec__count">{rows.length}</span></h2>
        <div className="adm-sec__actions">
          <div className="adm-search-wrap"><i className="ti ti-search adm-search-icon" />
            <input className={`${inp} adm-search-inp`} placeholder="Cerca per nom o email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={sel} value={filterEstat} onChange={e => setFilterEstat(e.target.value)}>
            <option value="">Tots ({rows.length})</option>
            {ESTATS_SOL.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)} ({counts[e] ?? 0})</option>)}
          </select>
        </div>
      </div>
      <div className="adm-sol-stats">
        {ESTATS_SOL.map(e => (
          <button key={e} className={`adm-sol-stat adm-sol-stat--${e}${filterEstat === e ? " adm-sol-stat--active" : ""}`} onClick={() => setFilterEstat(filterEstat === e ? "" : e)}>
            <i className={`ti ${ESTAT_ICON[e]}`} /><span className="adm-sol-stat__num">{counts[e] ?? 0}</span>
            <span className="adm-sol-stat__lbl">{e.charAt(0).toUpperCase() + e.slice(1)}</span>
          </button>
        ))}
      </div>

      {loading ? <div className="adm-loading"><div className="adm-spin" /><span>Carregant…</span></div>
        : filtered.length === 0 ? <EmptyState icon="ti-user-off" text={search || filterEstat ? "Sense resultats per al filtre" : "Sense sol·licituds"} />
        : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr>
                <th><i className="ti ti-user" />Persona</th>
                <th><i className="ti ti-mail" />Email</th>
                <th><i className="ti ti-phone" />Telèfon</th>
                <th><i className="ti ti-activity" />Estat</th>
                <th><i className="ti ti-calendar" />Data</th>
                <th className="adm-th-actions">Accions</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id ?? r.id}>
                    <td><div className="adm-td-user"><div className="adm-td-avatar">{(r.nom ?? r.name ?? "?").charAt(0).toUpperCase()}</div><span className="adm-td-title">{r.nom ?? r.name ?? "—"}</span></div></td>
                    <td>{r.email ? <a href={`mailto:${r.email}`} className="adm-td-link"><i className="ti ti-mail" />{r.email}</a> : <span className="adm-dash">—</span>}</td>
                    <td className="adm-td-muted">{r.telefon ?? r.phone ?? "—"}</td>
                    <td>
                      <select className={`adm-sel adm-sel--inline adm-sel--${r.estat ?? "pendent"}`} value={r.estat ?? "pendent"} onChange={e => updateEstat(r._id ?? r.id, e.target.value)}>
                        {ESTATS_SOL.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                      </select>
                    </td>
                    <td><div className="adm-td-date"><i className="ti ti-calendar" /><span>{(r.data_creacio ?? r.createdAt) ? new Date(r.data_creacio ?? r.createdAt).toLocaleDateString("ca-ES") : "—"}</span></div></td>
                    <td><RowActions onView={() => setDetail(r)} onDelete={() => setConfirm({ id: r._id ?? r.id, nom: r.nom ?? r.name ?? "usuari" })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {detail && (
        <Modal title="Detall sol·licitud" icon="ti-user-check" onClose={() => setDetail(null)}>
          <div className="adm-detail-block">
            {[["Nom", detail.nom ?? detail.name], ["Email", detail.email], ["Telèfon", detail.telefon ?? detail.phone], ["Assumpte", detail.assumpte], ["Estat", detail.estat ?? "pendent"], ["Data", (detail.data_creacio ?? detail.createdAt) ? new Date(detail.data_creacio ?? detail.createdAt).toLocaleDateString("ca-ES") : null]].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="adm-detail-row">
                <span className="adm-detail-lbl">{k}</span>
                <strong className={k === "Estat" ? `adm-estat-text adm-estat-text--${v}` : ""}>{v}</strong>
              </div>
            ))}
            {(detail.missatge ?? detail.motivacio ?? detail.message) && (
              <div className="adm-detail-row adm-detail-row--full">
                <span className="adm-detail-lbl">Missatge</span>
                <p className="adm-detail-text">"{detail.missatge ?? detail.motivacio ?? detail.message}"</p>
              </div>
            )}
          </div>
          <div className="adm-modal__foot">
            <button className="adm-btn adm-btn--ghost" onClick={() => setDetail(null)}><i className="ti ti-x" />Tancar</button>
            {detail.email && <a href={`mailto:${detail.email}`} className="adm-btn adm-btn--ghost"><i className="ti ti-mail" />Contactar</a>}
          </div>
        </Modal>
      )}
      {confirm && <Confirm msg={`Vols eliminar la sol·licitud de "${confirm.nom}"?`} onYes={() => del(confirm.id)} onNo={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Usuaris ──────────────────────────────────────────────────────────────────
const ROLS_USER = ["usuario", "admin"];
const BUIT_USER = { nom: "", username: "", email: "", password: "", descripcion: "", avatar: "", banner: "", telefono: "", ubicacion: "", fechaNacimiento: "", rol: "usuario", verificado: false, activo: true };

function SecUsuaris({ toast }) {
  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null);
  const [form, setForm]               = useState(BUIT_USER);
  const [saving, setSaving]           = useState(false);
  const [confirm, setConfirm]         = useState(null);
  const [detail, setDetail]           = useState(null);
  const [search, setSearch]           = useState("");
  const [filterRol, setFilterRol]     = useState("");
  const [filterActiu, setFilterActiu] = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [tab, setTab]                 = useState("basic");
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/admin/users")
      .then(d => setRows(Array.isArray(d) ? d : (d.users ?? [])))
      .catch(() => toast("Error carregant usuaris", "err"))
      .finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm(BUIT_USER); setShowPwd(false); setTab("basic"); setModal({ mode: "create" }); }
  function openEdit(r) { setForm({ ...BUIT_USER, ...r, password: "", fechaNacimiento: r.fechaNacimiento ? String(r.fechaNacimiento).slice(0, 10) : "" }); setShowPwd(false); setTab("basic"); setModal({ mode: "edit", id: r._id ?? r.id }); }

  async function save() {
    if (!form.nom.trim() || !form.email.trim()) { toast("Nom i email són obligatoris", "err"); return; }
    if (modal.mode === "create" && !form.password.trim()) { toast("La contrasenya és obligatòria", "err"); return; }
    setSaving(true);
    const payload = { ...form };
    if (modal.mode === "edit" && !payload.password) delete payload.password;
    try {
      if (modal.mode === "create") await apiFetch("/admin/users", { method: "POST", body: JSON.stringify(payload) });
      else await apiFetch(`/admin/users/${modal.id}`, { method: "PUT", body: JSON.stringify(payload) });
      toast(modal.mode === "create" ? "Usuari creat ✓" : "Usuari actualitzat ✓", "ok");
      setModal(null); load();
    } catch (err) { toast(err?.message ?? "Error desant", "err"); }
    finally { setSaving(false); }
  }

  async function del(id) {
    try { await apiFetch(`/admin/users/${id}`, { method: "DELETE" }); toast("Usuari eliminat ✓", "ok"); load(); }
    catch { toast("Error eliminant", "err"); }
    setConfirm(null);
    if (detail?._id === id || detail?.id === id) setDetail(null);
  }

  const filtered = rows.filter(r => !filterRol || r.rol === filterRol).filter(r => filterActiu === "" || String(r.activo) === filterActiu).filter(r => [r.nom ?? "", r.email ?? "", r.username ?? ""].join(" ").toLowerCase().includes(search.toLowerCase()));
  const totalAdmins = rows.filter(r => r.rol === "admin").length;
  const totalActius = rows.filter(r => r.activo).length;
  const totalVerif  = rows.filter(r => r.verificado).length;
  const rolIcon  = r => r === "admin" ? "ti-shield-check" : "ti-user";
  const rolClass = r => `adm-badge adm-badge--rol-${r ?? "usuario"}`;

  return (
    <div className="adm-sec">
      <div className="adm-sec__head">
        <h2 className="adm-sec__title">
          <i className="ti ti-users-group" />Usuaris
          <span className="adm-sec__count">{rows.length}</span>
          {totalAdmins > 0 && <span className="adm-sec__avg"><i className="ti ti-shield-check" />{totalAdmins} admin</span>}
        </h2>
        <div className="adm-sec__actions">
          <div className="adm-search-wrap"><i className="ti ti-search adm-search-icon" />
            <input className={`${inp} adm-search-inp`} placeholder="Cerca per nom, username o email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={sel} value={filterRol} onChange={e => setFilterRol(e.target.value)}>
            <option value="">Tots els rols</option>
            {ROLS_USER.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <select className={sel} value={filterActiu} onChange={e => setFilterActiu(e.target.value)}>
            <option value="">Tots</option>
            <option value="true">Actius</option>
            <option value="false">Inactius</option>
          </select>
          <button className="adm-btn adm-btn--primary" onClick={openCreate}><i className="ti ti-user-plus" />Nou Usuari</button>
        </div>
      </div>

      <div className="adm-sol-stats">
        <div className="adm-sol-stat adm-sol-stat--acceptat"><i className="ti ti-user-check" /><span className="adm-sol-stat__num">{totalActius}</span><span className="adm-sol-stat__lbl">Actius</span></div>
        <div className="adm-sol-stat adm-sol-stat--rebutjat"><i className="ti ti-user-off" /><span className="adm-sol-stat__num">{rows.length - totalActius}</span><span className="adm-sol-stat__lbl">Inactius</span></div>
        <div className="adm-sol-stat adm-sol-stat--pendent"><i className="ti ti-shield-check" /><span className="adm-sol-stat__num">{totalAdmins}</span><span className="adm-sol-stat__lbl">Administradors</span></div>
        <div className="adm-sol-stat adm-sol-stat--pendent"><i className="ti ti-circle-check" /><span className="adm-sol-stat__num">{totalVerif}</span><span className="adm-sol-stat__lbl">Verificats</span></div>
      </div>

      {loading ? <div className="adm-loading"><div className="adm-spin" /><span>Carregant…</span></div>
        : filtered.length === 0 ? <EmptyState icon={search || filterRol || filterActiu ? "ti-user-search" : "ti-users"} text={search || filterRol || filterActiu ? "Sense resultats per al filtre" : "Sense usuaris"} onAction={!search && !filterRol && filterActiu === "" ? openCreate : null} actionLabel="Nou Usuari" />
        : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr>
                <th><i className="ti ti-user" />Usuari</th>
                <th><i className="ti ti-at" />Username</th>
                <th><i className="ti ti-mail" />Email</th>
                <th><i className="ti ti-shield" />Rol</th>
                <th><i className="ti ti-activity" />Estat</th>
                <th><i className="ti ti-circle-check" />Verificat</th>
                <th><i className="ti ti-calendar" />Registre</th>
                <th className="adm-th-actions">Accions</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => {
                  const id = r._id ?? r.id;
                  const inicial = (r.nom ?? r.email ?? "?").charAt(0).toUpperCase();
                  return (
                    <tr key={id}>
                      <td>
                        <div className="adm-td-user">
                          {r.avatar && !r.avatar.includes("default") ? <img src={r.avatar} alt={r.nom} className="adm-td-avatar-img" /> : <div className="adm-td-avatar">{inicial}</div>}
                          <div><span className="adm-td-title">{r.nom ?? "—"}</span>{r.ubicacion && <span className="adm-td-sub"><i className="ti ti-map-pin" />{r.ubicacion}</span>}</div>
                        </div>
                      </td>
                      <td>{r.username ? <span className="adm-td-username">@{r.username}</span> : <span className="adm-dash">—</span>}</td>
                      <td>{r.email ? <a href={`mailto:${r.email}`} className="adm-td-link"><i className="ti ti-mail" />{r.email}</a> : <span className="adm-dash">—</span>}</td>
                      <td><span className={rolClass(r.rol)}><i className={`ti ${rolIcon(r.rol)}`} />{r.rol ?? "usuario"}</span></td>
                      <td><span className={`adm-status-dot adm-status-dot--${r.activo ? "actiu" : "inactiu"}`}>{r.activo ? "Actiu" : "Inactiu"}</span></td>
                      <td>{r.verificado ? <span className="adm-verif adm-verif--ok"><i className="ti ti-circle-check" />Sí</span> : <span className="adm-verif adm-verif--no"><i className="ti ti-circle-x" />No</span>}</td>
                      <td><div className="adm-td-date"><i className="ti ti-calendar" /><span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("ca-ES") : "—"}</span></div></td>
                      <td><RowActions onView={() => setDetail(r)} onEdit={() => openEdit(r)} onDelete={() => setConfirm({ id, nom: r.nom ?? r.email ?? "usuari" })} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      {modal && (
        <Modal title={modal.mode === "create" ? "Nou Usuari" : "Editar Usuari"} icon={modal.mode === "create" ? "ti-user-plus" : "ti-user-edit"} onClose={() => setModal(null)} wide>
          <div className="adm-modal-tabs">
            {[{ id: "basic", label: "Dades bàsiques", icon: "ti-user" }, { id: "profile", label: "Perfil", icon: "ti-id-badge" }, { id: "perms", label: "Permisos", icon: "ti-shield" }].map(t => (
              <button key={t.id} type="button" className={`adm-modal-tab${tab === t.id ? " adm-modal-tab--active" : ""}`} onClick={() => setTab(t.id)}>
                <i className={`ti ${t.icon}`} />{t.label}
              </button>
            ))}
          </div>
          <div className="adm-form-grid" style={{ marginTop: "16px" }}>
            {tab === "basic" && <>
              <Field label="Nom complet" required><input className={inp} value={form.nom} onChange={e => f("nom", e.target.value)} placeholder="Maria Garcia" /></Field>
              <Field label="Username"><input className={inp} value={form.username} onChange={e => f("username", e.target.value)} placeholder="mariagarcia" /></Field>
              <Field label="Email" required><input type="email" className={inp} value={form.email} onChange={e => f("email", e.target.value)} placeholder="maria@exemple.cat" /></Field>
              <Field label={modal.mode === "create" ? "Contrasenya *" : "Nova contrasenya (opcional)"}>
                <div className="adm-pwd-wrap">
                  <input type={showPwd ? "text" : "password"} className={inp} value={form.password} onChange={e => f("password", e.target.value)} placeholder={modal.mode === "edit" ? "Deixa buit per no canviar…" : "Mínim 6 caràcters"} autoComplete="new-password" />
                  <button type="button" className="adm-pwd-toggle" onClick={() => setShowPwd(s => !s)}><i className={`ti ${showPwd ? "ti-eye-off" : "ti-eye"}`} /></button>
                </div>
              </Field>
              <Field label="Telèfon"><input className={inp} value={form.telefono} onChange={e => f("telefono", e.target.value)} placeholder="+34 600 000 000" /></Field>
              <Field label="Ubicació"><input className={inp} value={form.ubicacion} onChange={e => f("ubicacion", e.target.value)} placeholder="Mataró, Catalunya" /></Field>
              <Field label="Data de naixement"><input type="date" className={inp} value={form.fechaNacimiento} onChange={e => f("fechaNacimiento", e.target.value)} /></Field>
            </>}
            {tab === "profile" && <>
              <Field label="Descripció" span><textarea className={tex} rows={3} value={form.descripcion} onChange={e => f("descripcion", e.target.value)} placeholder="Descripció de l'usuari…" maxLength={300} /></Field>
              <Field label="Avatar (URL)" span>
                <input className={inp} value={form.avatar} onChange={e => f("avatar", e.target.value)} placeholder="https://…/avatar.jpg" />
                {form.avatar && !form.avatar.includes("default") && <div className="adm-user-avatar-preview"><img src={form.avatar} alt="avatar preview" /></div>}
              </Field>
              <Field label="Banner (URL)" span>
                <input className={inp} value={form.banner} onChange={e => f("banner", e.target.value)} placeholder="https://…/banner.jpg" />
                {form.banner && !form.banner.includes("default") && <div className="adm-user-banner-preview"><img src={form.banner} alt="banner preview" /></div>}
              </Field>
            </>}
            {tab === "perms" && <>
              <Field label="Rol">
                <select className={sel} value={form.rol} onChange={e => f("rol", e.target.value)}>
                  {ROLS_USER.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Estat">
                <select className={sel} value={String(form.activo)} onChange={e => f("activo", e.target.value === "true")}>
                  <option value="true">Actiu</option><option value="false">Inactiu</option>
                </select>
              </Field>
              <Field label="Verificat" span>
                <div className="adm-toggle-row">
                  <label className="adm-toggle">
                    <input type="checkbox" checked={form.verificado} onChange={e => f("verificado", e.target.checked)} />
                    <span className="adm-toggle__track" />
                    <span className="adm-toggle__lbl">{form.verificado ? "Compte verificat" : "Compte no verificat"}</span>
                  </label>
                </div>
              </Field>
              <div className="adm-field adm-field--span">
                <div className="adm-notice"><i className="ti ti-info-circle" /><div><strong>Rols disponibles:</strong> <code>usuario</code> per a usuaris normals, <code>admin</code> per a administradors amb accés al panell.</div></div>
              </div>
            </>}
          </div>
          <div className="adm-modal__foot">
            <button className="adm-btn adm-btn--ghost" onClick={() => setModal(null)}><i className="ti ti-x" />Cancel·lar</button>
            <button className="adm-btn adm-btn--primary" onClick={save} disabled={!form.nom.trim() || !form.email.trim() || saving}>
              {saving ? <><div className="adm-spin adm-spin--sm" />Desant…</> : <><i className="ti ti-device-floppy" />Desar canvis</>}
            </button>
          </div>
        </Modal>
      )}

      {detail && (
        <Modal title="Perfil d'usuari" icon="ti-user" onClose={() => setDetail(null)} wide>
          <div className="adm-user-detail-head">
            {detail.banner && !detail.banner.includes("default") && <div className="adm-user-detail-banner"><img src={detail.banner} alt="banner" /></div>}
            <div className="adm-user-detail-meta">
              {detail.avatar && !detail.avatar.includes("default") ? <img src={detail.avatar} alt={detail.nom} className="adm-user-detail-avatar" /> : <div className="adm-user-avatar-lg">{(detail.nom ?? detail.email ?? "?").charAt(0).toUpperCase()}</div>}
              <div className="adm-user-detail-info">
                <div className="adm-user-detail-name">{detail.nom ?? "—"}</div>
                {detail.username && <div className="adm-user-detail-username">@{detail.username}</div>}
                <div className="adm-user-detail-badges">
                  <span className={rolClass(detail.rol)}><i className={`ti ${rolIcon(detail.rol)}`} />{detail.rol ?? "usuario"}</span>
                  <span className={`adm-status-dot adm-status-dot--${detail.activo ? "actiu" : "inactiu"}`}>{detail.activo ? "Actiu" : "Inactiu"}</span>
                  {detail.verificado && <span className="adm-verif adm-verif--ok"><i className="ti ti-circle-check" />Verificat</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="adm-detail-block" style={{ marginTop: "16px" }}>
            <div className="adm-detail-row"><span className="adm-detail-lbl">Email</span><a href={`mailto:${detail.email}`} className="adm-td-link"><i className="ti ti-mail" />{detail.email ?? "—"}</a></div>
            <div className="adm-detail-row"><span className="adm-detail-lbl">Telèfon</span><strong>{detail.telefono || "—"}</strong></div>
            <div className="adm-detail-row"><span className="adm-detail-lbl">Ubicació</span><strong>{detail.ubicacion || "—"}</strong></div>
            <div className="adm-detail-row"><span className="adm-detail-lbl">Data naixement</span><strong>{detail.fechaNacimiento ? new Date(detail.fechaNacimiento).toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}</strong></div>
            <div className="adm-detail-row"><span className="adm-detail-lbl">Registre</span><strong>{detail.createdAt ? new Date(detail.createdAt).toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}</strong></div>
            <div className="adm-detail-row"><span className="adm-detail-lbl">Última actualització</span><strong>{detail.updatedAt ? new Date(detail.updatedAt).toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}</strong></div>
            {detail.descripcion && <div className="adm-detail-row adm-detail-row--full"><span className="adm-detail-lbl">Descripció</span><p className="adm-detail-text">"{detail.descripcion}"</p></div>}
          </div>
          <div className="adm-modal__foot">
            <button className="adm-btn adm-btn--ghost" onClick={() => setDetail(null)}><i className="ti ti-x" />Tancar</button>
            <button className="adm-btn adm-btn--ghost" onClick={() => { setDetail(null); openEdit(detail); }}><i className="ti ti-pencil" />Editar</button>
            <button className="adm-btn adm-btn--danger" onClick={() => { setDetail(null); setConfirm({ id: detail._id ?? detail.id, nom: detail.nom ?? detail.email }); }}><i className="ti ti-trash" />Eliminar</button>
          </div>
        </Modal>
      )}

      {confirm && <Confirm msg={`Vols eliminar l'usuari "${confirm.nom}"?`} onYes={() => del(confirm.id)} onNo={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function SecDashboard({ toast, onNav }) {
  const [stats, setStats]     = useState(null);
  const [visits, setVisits]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([apiFetch("/admin/stats"), apiFetch("/admin/visits")]).then(([s, v]) => {
      if (s.status === "fulfilled") setStats(s.value);
      if (v.status === "fulfilled") { const d = v.value; setVisits(Array.isArray(d) ? d : (d.visits ?? d.visites ?? [])); }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><div className="adm-spin" /><span>Carregant estadístiques…</span></div>;

  return (
    <div className="adm-sec">
      <div className="adm-sec__head"><h2 className="adm-sec__title"><i className="ti ti-layout-dashboard" />Dashboard</h2></div>
      <div className="adm-stats-grid">
        <StatCard icon="ti-eye"            label="Visites totals"  value={stats?.totalVisits     ?? "—"} accent="var(--blue)" />
        <StatCard icon="ti-calendar-event" label="Esdeveniments"   value={stats?.totalEvents     ?? "—"} accent="var(--yellow)" onClick={() => onNav("events")} />
        <StatCard icon="ti-folder"         label="Projectes"       value={stats?.totalProjectes  ?? "—"} accent="var(--pink)"   onClick={() => onNav("projectes")} />
        <StatCard icon="ti-file-text"      label="Publicacions"    value={stats?.totalPubli      ?? "—"} accent="var(--blue)"   onClick={() => onNav("publicacions")} />
        <StatCard icon="ti-message-star"   label="Ressenyes"       value={stats?.totalRessenyes  ?? "—"} accent="var(--yellow)" onClick={() => onNav("ressenyes")} />
        <StatCard icon="ti-users"          label="Sol·licituds"    value={stats?.totalSolicituds ?? "—"} accent="var(--pink)"   onClick={() => onNav("solicituds")} />
        <StatCard icon="ti-users-group"    label="Usuaris"         value={stats?.totalUsers      ?? "—"} accent="var(--blue)"   onClick={() => onNav("usuaris")} />
      </div>
      <div className="adm-card adm-card--chart">
        <div className="adm-card__head">
          <span className="adm-card__title"><i className="ti ti-chart-bar" />Visites per dia</span>
          <span className="adm-card__sub">Últims 30 dies</span>
        </div>
        <VisitsChart data={visits} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// COMPONENT PRINCIPAL
// ════════════════════════════════════════════════════════════════════
const SECTIONS = [
  { id: "dashboard",    label: "Dashboard",     icon: "ti-layout-dashboard" },
  { id: "events",       label: "Esdeveniments", icon: "ti-calendar-event" },
  { id: "projectes",    label: "Projectes",     icon: "ti-folder" },
  { id: "publicacions", label: "Publicacions",  icon: "ti-file-text" },
  { id: "ressenyes",    label: "Ressenyes",     icon: "ti-message-star" },
  { id: "solicituds",   label: "Sol·licituds",  icon: "ti-users" },
  { id: "usuaris",      label: "Usuaris",       icon: "ti-users-group" },
  { id: "multimedia",   label: "Multimedia",    icon: "ti-photo" },
  { id: "editor-json",  label: "Editor JSON",   icon: "ti-code" },
];

export default function AdminPanel() {
  const { user, checking } = useAdminAuth();
  const [active, setActive]     = useState("dashboard");
  const [toast, setToast]       = useState({ msg: "", type: "ok" });
  const [sideOpen, setSideOpen] = useState(false);

  const showToast = useCallback((msg, type = "ok") => setToast({ msg, type }), []);
  const navTo     = useCallback((id) => { setActive(id); setSideOpen(false); }, []);

  if (checking) return <div className="adm-auth-check"><div className="adm-spin" /><span>Verificant permisos…</span></div>;
  if (!user) return <Navigate to="/" replace />;

  const currentSection = SECTIONS.find(s => s.id === active);

  const renderSection = () => {
    switch (active) {
      case "dashboard":    return <SecDashboard    toast={showToast} onNav={navTo} />;
      case "events":       return <SecEvents        toast={showToast} />;
      case "projectes":    return <SecProjectes     toast={showToast} />;
      case "publicacions": return <SecPublicacions  toast={showToast} />;
      case "ressenyes":    return <SecRessenyes     toast={showToast} />;
      case "solicituds":   return <SecSolicituds    toast={showToast} />;
      case "usuaris":      return <SecUsuaris        toast={showToast} />;
      case "multimedia":   return <SecMultimedia    toast={showToast} />;
      case "editor-json":  return <SecEditorJSON    toast={showToast} />;
      default:             return null;
    }
  };

  return (
    <div className="adm-root">
      <aside className={`adm-side${sideOpen ? " adm-side--open" : ""}`}>
        <div className="adm-side__brand">
          <span className="adm-side__logo">TM</span>
          <div>
            <div className="adm-side__name">Tradicions Mataró</div>
            <div className="adm-side__role">Panel d'administració</div>
          </div>
        </div>
        <nav className="adm-nav">
          <div className="adm-nav__section-lbl">Menú principal</div>
          {SECTIONS.map(s => (
            <button key={s.id} className={`adm-nav__item${active === s.id ? " adm-nav__item--active" : ""}`} onClick={() => navTo(s.id)}>
              <i className={`ti ${s.icon}`} /><span>{s.label}</span>
              {active === s.id && <i className="ti ti-chevron-right adm-nav__arrow" />}
            </button>
          ))}
        </nav>
        <div className="adm-side__foot">
          <div className="adm-side__user">
            <div className="adm-side__avatar">{(user.nom ?? user.name ?? user.email ?? "A").charAt(0).toUpperCase()}</div>
            <div className="adm-side__user-info">
              <div className="adm-side__uname">{user.nom ?? user.name ?? user.email}</div>
              <div className="adm-side__urole"><i className="ti ti-shield-check" />Administrador/a</div>
            </div>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-side__view-web">
            <i className="ti ti-world" />Veure web<i className="ti ti-arrow-up-right" />
          </a>
        </div>
      </aside>

      {sideOpen && <div className="adm-side-backdrop" onClick={() => setSideOpen(false)} />}

      <main className="adm-main">
        <header className="adm-topbar">
          <button className="adm-menu-btn" onClick={() => setSideOpen(s => !s)} title="Obrir menú"><i className="ti ti-menu-2" /></button>
          <nav className="adm-topbar__breadcrumb">
            <span className="adm-topbar__bc-home"><i className="ti ti-home" /></span>
            <i className="ti ti-chevron-right adm-topbar__bc-sep" />
            <span className="adm-topbar__bc-current"><i className={`ti ${currentSection?.icon}`} />{currentSection?.label}</span>
          </nav>
          <div className="adm-topbar__right">
            <a href="/" target="_blank" rel="noopener noreferrer" className="adm-topbar__site">
              <i className="ti ti-external-link" /><span>Veure web</span>
            </a>
          </div>
        </header>
        <div className="adm-content">{renderSection()}</div>
      </main>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "ok" })} />
    </div>
  );
}