import { NavLink, Route, Routes } from "react-router-dom";
import { BarChart3, Clapperboard, FileSearch, History, Settings, SlidersHorizontal } from "lucide-react";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalysisPage } from "./pages/AnalysisPage";
import { PlaybackPage } from "./pages/PlaybackPage";
import { ProfilesPage } from "./pages/ProfilesPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";

const nav = [
  { to: "/", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/playback", label: "Reprodução", icon: Clapperboard },
  { to: "/analysis", label: "Análise", icon: FileSearch },
  { to: "/profiles", label: "Perfis", icon: SlidersHorizontal },
  { to: "/history", label: "Histórico", icon: History },
  { to: "/settings", label: "Configurações", icon: Settings },
];

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">C</span>
          <span><strong>clearplay</strong><small>AI · FILTRAGEM INTELIGENTE</small></span>
        </div>
        <nav className="nav">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
        <p className="sidebar-foot">Fase 1 · Fundação. Nenhum dado fictício é exibido como real.</p>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/playback" element={<PlaybackPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
