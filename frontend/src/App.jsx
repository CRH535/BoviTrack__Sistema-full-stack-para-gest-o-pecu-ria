import {
  Link,
  Navigate,
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
import Lotes from "./pages/Lotes";
import Vacinas from "./pages/Vacinas";
import Vacinacoes from "./pages/Vacinacoes";
import Despesas from "./pages/Despesas";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Usuarios from "./pages/Usuarios";

function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <nav className="main-nav">
        <h2>AgroControl</h2>

        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/propriedades">Propriedades</Link>
          <Link to="/animais">Animais</Link>
          <Link to="/lotes">Lotes</Link>
          <Link to="/vacinas">Vacinas</Link>
          <Link to="/vacinacoes">Vacinações</Link>
          <Link to="/despesas">Despesas</Link>
          {usuario.perfil === "admin" && <Link to="/usuarios">Usuários</Link>}
        </div>

        <div className="nav-user">
          <span>{usuario.nome}</span>
          <small>{usuario.perfil === "admin" ? "Admin" : "Usuário"}</small>
          <button type="button" onClick={sair}>
            Sair
          </button>
        </div>
      </nav>

      <hr />
      <main className="page-content">
        <Outlet />
      </main>
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
