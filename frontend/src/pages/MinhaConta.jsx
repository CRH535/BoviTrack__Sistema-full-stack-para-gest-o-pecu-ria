import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import ConfirmacaoExclusao from "../components/ConfirmacaoExclusao";
import VoltarInicio from "../components/VoltarInicio";
import api from "../services/api";

function MinhaConta() {
  const { usuario, atualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(usuario.nome || "");
  const [email, setEmail] = useState(usuario.email || "");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  function cancelarEdicao() {
    setNome(usuario.nome || "");
    setEmail(usuario.email || "");
    setEditando(false);
  }

  async function salvarConta(evento) {
    evento.preventDefault();
    setMensagem("");
    setErro(false);
    setSalvando(true);

    try {
      const resposta = await api.put("/usuarios/me", { nome, email });
      atualizarUsuario(resposta.data.usuario);
      setNome(resposta.data.usuario.nome);
      setEmail(resposta.data.usuario.email);
      setMensagem(resposta.data.mensagem);
      setEditando(false);
    } catch (erroRequisicao) {
      setErro(true);
      setMensagem(
        erroRequisicao.response?.data?.mensagem || "Erro ao atualizar conta",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirMinhaConta() {
    setExcluindo(true);
    setMensagem("");
    setErro(false);

    try {
      const resposta = await api.delete("/usuarios/me", {
        data: { confirmacao: "EXCLUIR" },
      });

      await logout();
      navigate("/login", {
        replace: true,
        state: { mensagem: resposta.data.mensagem },
      });
    } catch (erroRequisicao) {
      setErro(true);
      setMensagem(
        erroRequisicao.response?.data?.mensagem ||
          "Não foi possível excluir sua conta",
      );
      setConfirmandoExclusao(false);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="page account-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Perfil</span>
          <h1>Minha Conta</h1>
          <p>Consulte e atualize as informações da sua conta no BoviTrack.</p>
        </div>
        <VoltarInicio />
      </header>

      {mensagem && (
        <p className={`notice${erro ? " notice-error" : ""}`}>{mensagem}</p>
      )}

      <section className="panel account-card">
        <div className="account-heading">
          <span className="user-avatar account-avatar" aria-hidden="true">
            {usuario.nome?.charAt(0).toUpperCase()}
          </span>
          <div>
            <span className="eyebrow">Dados da conta</span>
            <h2>{usuario.nome}</h2>
          </div>
        </div>

        {!editando && (
          <>
            <dl className="account-details">
              <div>
                <dt>Nome</dt>
                <dd>{usuario.nome}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{usuario.email}</dd>
              </div>
              <div>
                <dt>Tipo de conta</dt>
                <dd>{usuario.perfil === "admin" ? "Administrador" : "Usuário"}</dd>
              </div>
            </dl>

            <button type="button" onClick={() => setEditando(true)}>
              Editar informações
            </button>
          </>
        )}

        {editando && (
          <form className="account-form" onSubmit={salvarConta}>
            <div>
              <label htmlFor="account-name">Nome</label>
              <input
                id="account-name"
                type="text"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                maxLength="120"
                required
              />
            </div>
            <div>
              <label htmlFor="account-email">Email</label>
              <input
                id="account-email"
                type="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                maxLength="255"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={cancelarEdicao}
                disabled={salvando}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="panel danger-zone">
        <div>
          <span className="danger-kicker">Zona de perigo</span>
          <h2>Excluir conta</h2>
          <p>
            A exclusão remove permanentemente sua conta e todos os dados
            vinculados a ela. Esta ação não poderá ser desfeita.
          </p>
        </div>

        {usuario.perfil === "usuario" ? (
          <button
            className="button-danger"
            type="button"
            onClick={() => setConfirmandoExclusao(true)}
          >
            Excluir minha conta
          </button>
        ) : (
          <span className="protected-account-badge">
            Conta administrativa protegida
          </span>
        )}
      </section>

      <ConfirmacaoExclusao
        aberto={confirmandoExclusao}
        titulo="Excluir minha conta?"
        mensagem="Todos os seus dados serão removidos permanentemente. Esta ação não poderá ser desfeita."
        confirmacaoExigida="EXCLUIR"
        processando={excluindo}
        onCancelar={() => setConfirmandoExclusao(false)}
        onConfirmar={excluirMinhaConta}
      />
    </div>
  );
}

export default MinhaConta;
