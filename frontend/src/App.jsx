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

const itensMenu = [
  { to: "/", label: "Início", icon: "home", end: true },
  { to: "/propriedades", label: "Propriedades", icon: "farm" },
  { to: "/animais", label: "Animais", icon: "animal" },
  { to: "/lotes", label: "Lotes", icon: "lots" },
  { to: "/vacinas", label: "Vacinas", icon: "vaccine" },
  { to: "/vacinacoes", label: "Vacinações", icon: "calendar" },
  { to: "/despesas", label: "Despesas", icon: "wallet" },
];

function Icone({ nome }) {
  const desenhos = {
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5.5 9.5V21h13V9.5M9 21v-7h6v7" />
      </>
    ),
    farm: (
      <>
        <path d="M3 21V9l9-6 9 6v12" />
        <path d="M7 21v-8h10v8M7 13h10M12 13v8" />
      </>
    ),
    animal: (
      <>
        <path d="M5 8.5C6.5 6 9 5 12 5c4 0 7 2 7 6v4H8c-3 0-5-2-5-4 0-1 .7-2.5 2-2.5Z" />
        <path d="M18 8h3M8 15v5M17 15v5M6 6 4 4M19 10l2-2" />
      </>
    ),
    lots: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18M9 10v10M15 10v10" />
      </>
    ),
    vaccine: (
      <>
        <path d="m14 4 6 6M12 6l6 6M5 13l6 6M13 5 5-3 4 4-3 5M4 20l6-6M3 21l3-1-2-2-1 3Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18m-13 4 2 2 5-5" />
      </>
    ),
    wallet: (
      <>
        <path d="M3 7h16a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V7Z" />
        <path d="M3 7V5a2 2 0 0 1 2-2h13v4m-1 5h4v4h-4a2 2 0 1 1 0-4Z" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21c.5-5 3-7 7-7s6.5 2 7 7m0-10a3.5 3.5 0 1 0 0-7m2 10c2.5.7 3.7 2.8 4 6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5M14 8l4 4-4 4m4-4H8" />
      </>
    ),
  };

  return (
    <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      {desenhos[nome]}
    </svg>
  );
}

function Marca() {
  return (
    <span className="brand">
      <span className="brand-symbol" aria-hidden="true">⌁</span>
      <span><strong>AGRO</strong>CONTROL</span>
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
        <Link className="sidebar-brand" to="/" aria-label="AgroControl - início">
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
              <Icone nome={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {usuario.perfil === "admin" && (
            <NavLink
              to="/usuarios"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <Icone nome="users" />
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
            <Icone nome="logout" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <section className="app-main">
        <header className="topbar">
          <div>
            <strong>Olá, {usuario.nome?.split(" ")[0]}! <span aria-hidden="true">👋</span></strong>
            <small>Bem-vindo ao seu painel AgroControl</small>
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
