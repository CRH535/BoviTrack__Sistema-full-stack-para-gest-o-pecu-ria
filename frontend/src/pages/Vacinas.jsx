import { useEffect, useState } from "react";
import api from "../services/api";
import IconeImagem from "../components/IconeImagem";
import VoltarInicio from "../components/VoltarInicio";

function Vacinas() {
  const [vacinas, setVacinas] = useState([]);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarVacinas();
  }, []);

  async function carregarVacinas() {
    try {
      const resposta = await api.get("/vacinas");
      setVacinas(resposta.data);
    } catch (erro) {
      console.error(erro);
      setMensagem("Erro ao carregar vacinas");
    }
  }

  function limparFormulario() {
    setNome("");
    setDescricao("");
    setEditandoId(null);
  }

  async function salvarVacina(evento) {
    evento.preventDefault();

    try {
      const dados = {
        nome,
        descricao,
      };

      if (editandoId) {
        await api.put(`/vacinas/${editandoId}`, dados);
        setMensagem("Vacina atualizada com sucesso!");
      } else {
        await api.post("/vacinas", dados);
        setMensagem("Vacina cadastrada com sucesso!");
      }

      limparFormulario();
      carregarVacinas();
    } catch (erro) {
      console.error(erro);

      setMensagem(erro.response?.data?.mensagem || "Erro ao salvar vacina");
    }
  }

  function editarVacina(vacina) {
    setEditandoId(vacina.id);
    setNome(vacina.nome);
    setDescricao(vacina.descricao || "");
  }

  async function excluirVacina(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta vacina?",
    );

    if (!confirmar) return;

    try {
      await api.delete(`/vacinas/${id}`);

      setVacinas((vacinasAtuais) =>
        vacinasAtuais.filter((vacina) => vacina.id !== id),
      );

      setMensagem("Vacina excluída com sucesso!");
    } catch (erro) {
      console.error(erro);

      setMensagem(erro.response?.data?.mensagem || "Erro ao excluir vacina");
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Saúde animal</span>
          <h1>Vacinas</h1>
          <p>Mantenha organizado o catálogo sanitário.</p>
        </div>
        <VoltarInicio />
      </header>

      {mensagem && <p className="notice">{mensagem}</p>}

      <form className="panel data-form" onSubmit={salvarVacina}>
        <div>
          <label>Nome</label>
          <br />

          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label>Descrição</label>
          <br />

          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">
          {editandoId ? "Salvar alterações" : "Cadastrar"}
        </button>

        {editandoId && (
          <button className="button-secondary" type="button" onClick={limparFormulario}>
            Cancelar
          </button>
        )}
      </form>

      <div className="section-heading">
        <div><span className="eyebrow">Catálogo</span><h2>Vacinas cadastradas</h2></div>
        <span className="count-badge">{vacinas.length}</span>
      </div>

      {vacinas.length === 0 && <div className="empty-state"><p>Nenhuma vacina cadastrada.</p></div>}

      <div className="record-grid">
      {vacinas.map((vacina) => (
        <article className="record-card" key={vacina.id}>
          <span className="record-icon" aria-hidden="true">
            <IconeImagem nome="vacinas" className="record-icon-image" />
          </span>
          <h3>{vacina.nome}</h3>
          <p>{vacina.descricao || "-"}</p>

          <div className="record-actions">
          <button className="button-secondary" type="button" onClick={() => editarVacina(vacina)}>
            Editar
          </button>

          <button className="button-danger" type="button" onClick={() => excluirVacina(vacina.id)}>
            Excluir
          </button>
          </div>
        </article>
      ))}
      </div>
    </div>
  );
}

export default Vacinas;
