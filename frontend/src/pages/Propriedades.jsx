import { useEffect, useState } from "react";
import api from "../services/api";
import IconeImagem from "../components/IconeImagem";
import VoltarInicio from "../components/VoltarInicio";

function Propriedades() {
  const [propriedades, setPropriedades] = useState([]);

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [area, setArea] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarPropriedades();
  }, []);

  async function carregarPropriedades() {
    try {
      const resposta = await api.get("/propriedades");
      setPropriedades(resposta.data);
    } catch (erro) {
      console.error(erro);
      setMensagem("Erro ao carregar propriedades");
    }
  }

  function limparFormulario() {
    setNome("");
    setCidade("");
    setEstado("");
    setArea("");
    setEditandoId(null);
  }

  async function salvarPropriedade(evento) {
    evento.preventDefault();

    try {
      const dados = {
        nome,
        cidade,
        estado,
        area: Number(area),
      };

      if (editandoId) {
        await api.put(`/propriedades/${editandoId}`, dados);
        setMensagem("Propriedade atualizada com sucesso!");
      } else {
        await api.post("/propriedades", dados);
        setMensagem("Propriedade cadastrada com sucesso!");
      }

      limparFormulario();
      carregarPropriedades();
    } catch (erro) {
      console.error(erro);

      setMensagem(
        erro.response?.data?.mensagem || "Erro ao salvar propriedade",
      );
    }
  }

  function editarPropriedade(propriedade) {
    setEditandoId(propriedade.id);
    setNome(propriedade.nome);
    setCidade(propriedade.cidade);
    setEstado(propriedade.estado);
    setArea(propriedade.area);
  }

  async function excluirPropriedade(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta propriedade?",
    );

    if (!confirmar) {
      return;
    }

    try {
      await api.delete(`/propriedades/${id}`);

      setPropriedades((propriedadesAtuais) =>
        propriedadesAtuais.filter((propriedade) => propriedade.id !== id),
      );

      setMensagem("Propriedade excluída com sucesso!");
    } catch (erro) {
      console.error(erro);

      setMensagem(
        erro.response?.data?.mensagem || "Erro ao excluir propriedade",
      );
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Gestão das propriedades</span>
          <h1>Propriedades</h1>
          <p>Organize as propriedades onde o seu rebanho é manejado.</p>
        </div>
        <VoltarInicio />
      </header>

      {mensagem && <p className="notice">{mensagem}</p>}

      <form className="panel data-form" onSubmit={salvarPropriedade}>
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
          <label>Cidade</label>
          <br />

          <input
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />
        </div>

        <div>
          <label>Estado</label>
          <br />

          <input
            type="text"
            value={estado}
            maxLength="2"
            onChange={(e) => setEstado(e.target.value)}
          />
        </div>

        <div>
          <label>Área (ha)</label>
          <br />

          <input
            type="number"
            step="0.01"
            value={area}
            onChange={(e) => setArea(e.target.value)}
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
        <div>
          <span className="eyebrow">Seus dados</span>
          <h2>Propriedades cadastradas</h2>
        </div>
        <span className="count-badge">{propriedades.length}</span>
      </div>

      {propriedades.length === 0 && <div className="empty-state"><p>Nenhuma propriedade cadastrada.</p></div>}

      <div className="record-grid">
      {propriedades.map((propriedade) => (
        <article className="record-card" key={propriedade.id}>
          <span className="record-icon" aria-hidden="true">
            <IconeImagem nome="propriedades" className="record-icon-image" />
          </span>
          <h3>{propriedade.nome}</h3>

          <p>
            {propriedade.cidade} - {propriedade.estado}
          </p>

          <p>Área: {propriedade.area} ha</p>

          <div className="record-actions">
          <button className="button-secondary" type="button" onClick={() => editarPropriedade(propriedade)}>
            Editar
          </button>

          <button
            className="button-danger"
            type="button"
            onClick={() => excluirPropriedade(propriedade.id)}
          >
            Excluir
          </button>
          </div>
        </article>
      ))}
      </div>
    </div>
  );
}

export default Propriedades;
