import { useEffect, useState } from "react";
import api from "../services/api";
import { formatarDataSemFuso } from "../utils/datas";
import IconeImagem from "../components/IconeImagem";
import VoltarInicio from "../components/VoltarInicio";

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
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Agenda sanitária</span>
          <h1>Vacinações</h1>
          <p>Registre aplicações e acompanhe as próximas doses.</p>
        </div>
        <VoltarInicio />
      </header>

      {mensagem && <p className="notice">{mensagem}</p>}

      <form className="panel data-form" onSubmit={salvarVacinacao}>
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
          <button className="button-secondary" type="button" onClick={limparFormulario}>
            Cancelar
          </button>
        )}
      </form>

      <div className="section-heading">
        <div><span className="eyebrow">Histórico</span><h2>Vacinações registradas</h2></div>
        <span className="count-badge">{vacinacoes.length}</span>
      </div>

      {vacinacoes.length === 0 && <div className="empty-state"><p>Nenhuma vacinação registrada.</p></div>}

      <div className="record-grid vaccination-grid">
      {vacinacoes.map((vacinacao) => (
        <article className="record-card vaccination-card" key={vacinacao.id}>
          <span className="record-icon" aria-hidden="true">
            <IconeImagem nome="vacinacoes" className="record-icon-image" />
          </span>
          <h3>{vacinacao.animal || `Animal ${vacinacao.animal_id}`}</h3>

          <p>Vacina: {vacinacao.vacina || vacinacao.vacina_id}</p>

          <p>
            Aplicação:{" "}
            {vacinacao.data_aplicacao
              ? formatarDataSemFuso(vacinacao.data_aplicacao)
              : "-"}
          </p>

          <p>
            Próxima dose:{" "}
            {vacinacao.proxima_dose
              ? formatarDataSemFuso(vacinacao.proxima_dose)
              : "Não informada"}
          </p>

          <p>Observação: {vacinacao.observacao || "-"}</p>

          <div className="record-actions">
          <button className="button-secondary" type="button" onClick={() => editarVacinacao(vacinacao)}>
            Editar
          </button>

          <button className="button-danger" type="button" onClick={() => excluirVacinacao(vacinacao.id)}>
            Excluir
          </button>
          </div>
        </article>
      ))}
      </div>
    </div>
  );
}

export default Vacinacoes;
