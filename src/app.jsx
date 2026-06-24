import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbarComponente/navbar.jsx";
import Home from "./home.jsx";
import Agenda from "./agenda.jsx";
import Equip from "./equip.jsx";
import Priv from "./components/politiques/privacitat/priv.jsx";
import Xarxes from "./components/politiques/xarxes/xarx.jsx";
import Avis from "./components/politiques/avisLegal/avis.jsx";
import Contacte from "./contacte.jsx";
import LoginRegist from "./auth.jsx";
import Mapa from "./mapa.jsx";
import Quisom from "./quisom.jsx";
import Uneixte from "./uneixte.jsx";
import Projectes from "./projectes.jsx";
import Publis from "./publicacions.jsx";
import Events from "./events.jsx";
import Perfil from "./perfil.jsx";
import Links from "./links.jsx";
import ProjecteDetall from './indexPages/projecteDetall.jsx';
import PublicacioDetall from './indexPages/publicacioDetall.jsx';
import EventDetall from './indexPages/eventDetall.jsx';
import Admin from "./admin.jsx";
import Credits from "./credits.jsx";
import Identitat from "./identitat.jsx";
import SessionIniciada from "./protectedRoutes/SessionIniciada";
import ProtectSession from "./protectedRoutes/ProtectSession";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/qui-som" element={<Quisom />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/links" element={<Links />} />
        <Route path="/projectes" element={<Projectes />} />
        <Route path="/projectes/:id" element={<ProjecteDetall />} />
        <Route path="/publicacions" element={<Publis />} />
        <Route path="/publicacions/:id" element={<PublicacioDetall />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetall />} />
        <Route path="/contacte" element={<Contacte />} />
        <Route path="/uneixte" element={<Uneixte />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/identitat" element={<Identitat />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/admin" element={<ProtectSession><Admin /></ProtectSession>}/>
        <Route path="/politica/privacitat" element={<Priv />} />
        <Route path="/politica/xarxes" element={<Xarxes />} />
        <Route path="/politica/avisLegal" element={<Avis />} />
        <Route path="/equip" element={<Equip />} />
        <Route path="/login" element={<SessionIniciada><LoginRegist /></SessionIniciada>}/>
        <Route path="/regist" element={<SessionIniciada><LoginRegist /></SessionIniciada>}/>
        <Route path="/perfil" element={<ProtectSession><Perfil /></ProtectSession>}/>

      </Routes>
    </>
  );
}
