import { useEffect, useState } from "react";
import api from "../services/api";

function Vacinacoes() {
  const [vacinacoes, setVacinacoes] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [vacinas, setVacinas] = useState([]);

  const [animalId, setAnimalId] = useState("");
  const [vacinaId, setVacinaId] = useState("");
  const [dataAplicacao, setDataAplicacao] = useState("");
  const [proximaDose, setProximaDose] = useState("");
  const [observacao, setObservacao] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarVacinacoes();
    carregarAnimais();
    carregarVacinas();
  }, []);

  async function carregarVacinacoes() {
    try {
      const resposta = await api.get("/vacinacoes");
      setVacinacoes(resposta.data);
    } catch (erro) {
      console.error(erro);
      setMensagem("Erro ao carregar vacinações");
    }
  }

  async function carregarAnimais() {
    try {
      const resposta = await api.get("/animais");
      setAnimais(resposta.data);
    } catch (erro) {
      console.error(erro);
    }
  }

  async function carregarVacinas() {
    try {
      const resposta = await api.get("/vacinas");
      setVacinas(resposta.data);
    } catch (erro) {
      console.error(erro);
    }
  }

  function limparFormulario() {
    setAnimalId("");
    setVacinaId("");
    setDataAplicacao("");
    setProximaDose("");
    setObservacao("");
    setEditandoId(null);
  }

  async function salvarVacinacao(evento) {
    evento.preventDefault();

    try {
      const dados = {
        animal_id: Number(animalId),
        vacina_id: Number(vacinaId),
        data_aplicacao: dataAplicacao,
        proxima_dose: proximaDose || null,
        observacao: observacao || null,
      };

      if (editandoId) {
        await api.put(`/vacinacoes/${editandoId}`, dados);
        setMensagem("Vacinação atualizada com sucesso!");
      } else {
        await api.post("/vacinacoes", dados);
        setMensagem("Vacinação cadastrada com sucesso!");
      }

      limparFormulario();
      carregarVacinacoes();
    } catch (erro) {
      console.error(erro);

      setMensagem(erro.response?.data?.mensagem || "Erro ao salvar vacinação");
    }
  }

  function editarVacinacao(vacinacao) {
    setEditandoId(vacinacao.id);
    setAnimalId(vacinacao.animal_id);
    setVacinaId(vacinacao.vacina_id);

    setDataAplicacao(
      vacinacao.data_aplicacao ? vacinacao.data_aplicacao.substring(0, 10) : "",
    );

    setProximaDose(
      vacinacao.proxima_dose ? vacinacao.proxima_dose.substring(0, 10) : "",
    );

    setObservacao(vacinacao.observacao || "");
  }

  async function excluirVacinacao(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta vacinação?",
    );

    if (!confirmar) return;

    try {
      await api.delete(`/vacinacoes/${id}`);

      setVacinacoes((vacinacoesAtuais) =>
        vacinacoesAtuais.filter((vacinacao) => vacinacao.id !== id),
      );

      setMensagem("Vacinação excluída com sucesso!");
    } catch (erro) {
      console.error(erro);

      setMensagem(erro.response?.data?.mensagem || "Erro ao excluir vacinação");
    }
  }

  return (
    <div>
      <h1>Vacinações</h1>

      {mensagem && <p>{mensagem}</p>}

      <form onSubmit={salvarVacinacao}>
        <div>
          <label>Animal</label>
          <br />

          <select
            value={animalId}
            onChange={(e) => setAnimalId(e.target.value)}
          >
            <option value="">Selecione</option>

            {animais.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.nome}
                {animal.numero_brinco
                  ? ` — Brinco ${animal.numero_brinco}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Vacina</label>
          <br />

          <select
            value={vacinaId}
            onChange={(e) => setVacinaId(e.target.value)}
          >
            <option value="">Selecione</option>

            {vacinas.map((vacina) => (
              <option key={vacina.id} value={vacina.id}>
                {vacina.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Data de aplicação</label>
          <br />

          <input
            type="date"
            value={dataAplicacao}
            onChange={(e) => setDataAplicacao(e.target.value)}
          />
        </div>

        <div>
          <label>Próxima dose</label>
          <br />

          <input
            type="date"
            value={proximaDose}
            onChange={(e) => setProximaDose(e.target.value)}
          />
        </div>

        <div>
          <label>Observação</label>
          <br />

          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">
          {editandoId ? "Salvar alterações" : "Registrar vacinação"}
        </button>

        {editandoId && (
          <button type="button" onClick={limparFormulario}>
            Cancelar
          </button>
        )}
      </form>

      <hr />

      <h2>Histórico de vacinações</h2>

      {vacinacoes.length === 0 && <p>Nenhuma vacinação registrada.</p>}

      {vacinacoes.map((vacinacao) => (
        <div key={vacinacao.id}>
          <h3>{vacinacao.animal || `Animal ${vacinacao.animal_id}`}</h3>

          <p>Vacina: {vacinacao.vacina || vacinacao.vacina_id}</p>

          <p>
            Aplicação:{" "}
            {vacinacao.data_aplicacao
              ? new Date(vacinacao.data_aplicacao).toLocaleDateString("pt-BR")
              : "-"}
          </p>

          <p>
            Próxima dose:{" "}
            {vacinacao.proxima_dose
              ? new Date(vacinacao.proxima_dose).toLocaleDateString("pt-BR")
              : "Não informada"}
          </p>

          <p>Observação: {vacinacao.observacao || "-"}</p>

          <button type="button" onClick={() => editarVacinacao(vacinacao)}>
            Editar
          </button>

          <button type="button" onClick={() => excluirVacinacao(vacinacao.id)}>
            Excluir
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Vacinacoes;
