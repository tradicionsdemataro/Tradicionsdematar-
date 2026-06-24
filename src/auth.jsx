import React, { useState } from "react";
import Navbar from "./components/navbarComponente/navbar.jsx";
import "./css/auth.css";

const Auth = () => {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    nom: "",
    email: "",
    password: "",
    password2: "",
  });

  const handleLoginChange = (e) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegisterChange = (e) => {
    setRegisterData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveToLocalStorage = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user_id", data.user.id);
    localStorage.setItem("name", data.user.nom);
    localStorage.setItem("email", data.user.email);
    localStorage.setItem("role", data.user.rol ?? "usuari");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credencials incorrectes");
      }

      saveToLocalStorage(data);
      setStatus("success");
      window.location.href = "/home";

    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.password2) {
      setStatus("error");
      setErrorMsg("Les contrasenyes no coincideixen");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: registerData.nom,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error en el registre");
      }

      saveToLocalStorage(data);
      setStatus("success");
      window.location.href = "/home";

    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <>
      <Navbar />

      <div className="auth-page">

        {/* ===== ESQUERRA — BRAND PANEL ===== */}
        <div className="auth-brand">
          <div className="auth-brand-inner">

            <div className="auth-brand-top">
              <span className="auth-brand-index">EST. 2015</span>
              <h1 className="auth-brand-title">
                TRADICIONS<br />
                DE<br />
                <span className="accent-word">MATARÓ</span>
              </h1>
            </div>

            <div className="auth-brand-quote">
              <p>"Teixint tradicions,<br />creant futur."</p>
            </div>

            <div className="auth-brand-dots">
              <span style={{ background: "var(--yellow)" }}></span>
              <span style={{ background: "var(--blue)" }}></span>
              <span style={{ background: "var(--pink)" }}></span>
              <span style={{ background: "var(--orange)" }}></span>
            </div>

          </div>

          <div className="auth-brand-grid-bg">
            {[...Array(24)].map((_, i) => (
              <span key={i} className="auth-bg-cell"></span>
            ))}
          </div>
        </div>

        {/* ===== DRETA — FORM PANEL ===== */}
        <div className="auth-panel">

          {/* MODE TABS */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => switchMode("login")}
            >
              Accedir
            </button>
            <button
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => switchMode("register")}
            >
              Registrar-se
            </button>
            <span
              className="auth-tab-indicator"
              style={{ transform: mode === "register" ? "translateX(100%)" : "translateX(0)" }}
            ></span>
          </div>

          {/* ===== LOGIN ===== */}
          <div className={`auth-form-block ${mode === "login" ? "visible" : "hidden"}`}>
            <div className="auth-form-header">
              <h2>Benvingut<span className="accent-word">.</span></h2>
              <p>Accedeix al teu compte per continuar.</p>
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-field">
                <label htmlFor="login-email">Correu electrònic</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Contrasenya</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="auth-form-row">
                <a href="/recover" className="auth-link">Has oblidat la contrasenya?</a>
              </div>

              {status === "error" && (
                <p className="auth-feedback error">{errorMsg}</p>
              )}
              {status === "success" && (
                <p className="auth-feedback success">Sessió iniciada correctament!</p>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                <span>{loading ? "Entrant..." : "Accedir"}</span>
                <span className="auth-submit-arrow">→</span>
              </button>
            </form>

            <p className="auth-switch-hint">
              Encara no tens compte?{" "}
              <button className="auth-switch-link" onClick={() => switchMode("register")}>
                Registra't aquí
              </button>
            </p>
          </div>

          {/* ===== REGISTER ===== */}
          <div className={`auth-form-block ${mode === "register" ? "visible" : "hidden"}`}>
            <div className="auth-form-header">
              <h2>Crea un compte<span className="accent-word">.</span></h2>
              <p>Uneix-te a la comunitat de Tradicions de Mataró.</p>
            </div>

            <form className="auth-form" onSubmit={handleRegister}>
              <div className="auth-field">
                <label htmlFor="reg-nom">Nom complet</label>
                <input
                  id="reg-nom"
                  name="nom"
                  type="text"
                  placeholder="El teu nom"
                  value={registerData.nom}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="reg-email">Correu electrònic</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="auth-fields-row">
                <div className="auth-field">
                  <label htmlFor="reg-password">Contrasenya</label>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-password2">Confirma</label>
                  <input
                    id="reg-password2"
                    name="password2"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password2}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
              </div>

              {status === "error" && (
                <p className="auth-feedback error">{errorMsg}</p>
              )}
              {status === "success" && (
                <p className="auth-feedback success">Compte creat! Benvingut/da!</p>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                <span>{loading ? "Registrant..." : "Crear compte"}</span>
                <span className="auth-submit-arrow">→</span>
              </button>
            </form>

            <p className="auth-switch-hint">
              Ja tens compte?{" "}
              <button className="auth-switch-link" onClick={() => switchMode("login")}>
                Accedeix aquí
              </button>
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Auth;