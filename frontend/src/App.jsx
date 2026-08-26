import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminRoute from "./auth/AdminRoute";
import Dashboard from "./pages/Dashboard";
import Propriedades from "./pages/Propriedades";
import Animais from "./pages/Animais";
import FichaAnimal from "./pages/FichaAnimal";
import Lotes from "./pages/Lotes";
import Vacinas from "./pages/Vacinas";
import Vacinacoes from "./pages/Vacinacoes";
import Despesas from "./pages/Despesas";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Usuarios from "./pages/Usuarios";
import IconeImagem from "./components/IconeImagem";

const itensMenu = [
  { to: "/", label: "Início", icon: "inicio", end: true },
  { to: "/propriedades", label: "Propriedades", icon: "propriedades" },
  { to: "/animais", label: "Animais", icon: "animais" },
  { to: "/lotes", label: "Lotes", icon: "lotes" },
  { to: "/vacinas", label: "Vacinas", icon: "vacinas" },
  { to: "/vacinacoes", label: "Vacinações", icon: "vacinacoes" },
  { to: "/despesas", label: "Despesas", icon: "despesas" },
];

function Marca() {
  return (
    <span className="brand">
      <span className="brand-symbol" aria-hidden="true">⌁</span>
      <span><strong>BOVI</strong>TRACK</span>
    </span>
  );
}

function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function sair() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="sidebar-brand" to="/" aria-label="BoviTrack - início">
          <Marca />
        </Link>

        <nav className="nav-links" aria-label="Menu principal">
          {itensMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <IconeImagem nome={item.icon} className="nav-icon-image" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {usuario.perfil === "admin" && (
            <NavLink
              to="/usuarios"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <IconeImagem nome="usuarios" className="nav-icon-image" />
              <span>Usuários</span>
            </NavLink>
          )}
        </nav>

        <div className="nav-user">
          <span className="user-avatar" aria-hidden="true">
            {usuario.nome?.charAt(0).toUpperCase()}
          </span>
          <span className="user-details">
            <strong>{usuario.nome}</strong>
            <small>{usuario.perfil === "admin" ? "Administrador" : "Usuário"}</small>
          </span>
          <button className="logout-button" type="button" onClick={sair} title="Sair">
            <IconeImagem nome="sair" className="nav-icon-image" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <section className="app-main">
        <header className="topbar">
          <div>
            <strong>Olá, {usuario.nome?.split(" ")[0]}! <span aria-hidden="true">👋</span></strong>
            <small>Seu rebanho organizado em um só lugar</small>
          </div>
          <div className="topbar-user">
            <span className="topbar-dot" aria-hidden="true" />
            <span>{usuario.perfil === "admin" ? "Visão administrativa" : "Minha propriedade"}</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="propriedades" element={<Propriedades />} />
          <Route path="animais" element={<Animais />} />
          <Route path="animais/:id" element={<FichaAnimal />} />
          <Route path="lotes" element={<Lotes />} />
          <Route path="vacinas" element={<Vacinas />} />
          <Route path="vacinacoes" element={<Vacinacoes />} />
          <Route path="despesas" element={<Despesas />} />
          <Route element={<AdminRoute />}>
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
