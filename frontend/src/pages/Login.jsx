import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState(location.state?.mensagem || "");
  const [mensagemSucesso, setMensagemSucesso] = useState(
    Boolean(location.state?.mensagem),
  );
  const [enviando, setEnviando] = useState(false);
  const { autenticado, carregando, login } = useAuth();

  if (!carregando && autenticado) {
    return <Navigate to="/" replace />;
  }

  async function entrar(evento) {
    evento.preventDefault();
    setMensagem("");
    setMensagemSucesso(false);
    setEnviando(true);

    try {
      await login(email, senha);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (erro) {
      setMensagem(erro.response?.data?.mensagem || "Erro ao realizar login");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>AgroControl</h1>
        <p>Entre para acessar seus dados.</p>

        {mensagem && (
          <p className={`form-message${mensagemSucesso ? " success-message" : ""}`}>
            {mensagem}
          </p>
        )}

        <form onSubmit={entrar}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-switch">
          Ainda não tem uma conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
