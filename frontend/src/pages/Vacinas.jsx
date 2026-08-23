import { useEffect, useState } from "react";
import api from "../services/api";

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
    <div>
      <h1>Vacinas</h1>

      {mensagem && <p>{mensagem}</p>}

      <form onSubmit={salvarVacina}>
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
          <button type="button" onClick={limparFormulario}>
            Cancelar
          </button>
        )}
      </form>

      <hr />

      <h2>Vacinas cadastradas</h2>

      {vacinas.length === 0 && <p>Nenhuma vacina cadastrada.</p>}

      {vacinas.map((vacina) => (
        <div key={vacina.id}>
          <h3>{vacina.nome}</h3>
          <p>{vacina.descricao || "-"}</p>

          <button type="button" onClick={() => editarVacina(vacina)}>
            Editar
          </button>

          <button type="button" onClick={() => excluirVacina(vacina.id)}>
            Excluir
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Vacinas;
