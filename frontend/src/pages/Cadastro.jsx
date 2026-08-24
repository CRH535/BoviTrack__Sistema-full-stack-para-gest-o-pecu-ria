import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import api from "../services/api";

function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { autenticado, carregando } = useAuth();
  const navigate = useNavigate();

  if (!carregando && autenticado) {
    return <Navigate to="/" replace />;
  }

  async function criarConta(evento) {
    evento.preventDefault();
    setMensagem("");

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();

    if (!nomeLimpo || !emailLimpo || !senha || !confirmarSenha) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setMensagem("Informe um email válido.");
      return;
    }

    if (senha.length < 8) {
      setMensagem("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagem("As senhas não coincidem.");
      return;
    }

    setEnviando(true);

    try {
      const resposta = await api.post("/auth/cadastro", {
        nome: nomeLimpo,
        email: emailLimpo,
        senha,
      });

      navigate("/login", {
        replace: true,
        state: { mensagem: resposta.data.mensagem },
      });
    } catch (erro) {
      setMensagem(
        erro.response?.data?.mensagem ||
          "Não foi possível criar sua conta. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="auth-visual" aria-hidden="true">
        <div className="auth-visual-content">
          <span className="auth-brand"><strong>AGRO</strong>CONTROL</span>
          <div>
            <span className="auth-kicker">Comece hoje</span>
            <h1>Transforme a rotina da sua propriedade.</h1>
            <p>Organize seu rebanho, suas vacinas e suas despesas com clareza.</p>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="login-card register-card">
        <span className="auth-mobile-brand"><strong>AGRO</strong>CONTROL</span>
        <span className="auth-kicker">Novo no AgroControl?</span>
        <h1>Crie sua conta</h1>
        <p>Cadastre-se e comece a organizar sua propriedade.</p>

        {mensagem && <p className="form-message">{mensagem}</p>}

        <form onSubmit={criarConta}>
          <label htmlFor="cadastro-nome">Nome</label>
          <input
            id="cadastro-nome"
            type="text"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            autoComplete="name"
            maxLength="120"
            required
          />

          <label htmlFor="cadastro-email">Email</label>
          <input
            id="cadastro-email"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            autoComplete="email"
            maxLength="255"
            required
          />

          <label htmlFor="cadastro-senha">Senha</label>
          <input
            id="cadastro-senha"
            type="password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            autoComplete="new-password"
            minLength="8"
            required
          />

          <label htmlFor="cadastro-confirmar-senha">Confirmar senha</label>
          <input
            id="cadastro-confirmar-senha"
            type="password"
            value={confirmarSenha}
            onChange={(evento) => setConfirmarSenha(evento.target.value)}
            autoComplete="new-password"
            minLength="8"
            required
          />

          <button type="submit" disabled={enviando}>
            {enviando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="auth-switch">
          Já possui uma conta? <Link to="/login">Entrar</Link>
        </p>
        </div>
      </section>
    </main>
  );
}

export default Cadastro;
