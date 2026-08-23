import { useEffect, useState } from "react";
import api from "../services/api";

function Despesas() {
  const [despesas, setDespesas] = useState([]);
  const [propriedades, setPropriedades] = useState([]);

  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [propriedadeId, setPropriedadeId] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarDespesas();
    carregarPropriedades();
  }, []);

  async function carregarDespesas() {
    try {
      const resposta = await api.get("/despesas");
      setDespesas(resposta.data);
    } catch (erro) {
      console.error(erro);
      setMensagem("Erro ao carregar despesas");
    }
  }

  async function carregarPropriedades() {
    try {
      const resposta = await api.get("/propriedades");
      setPropriedades(resposta.data);
    } catch (erro) {
      console.error(erro);
    }
  }

  function limparFormulario() {
    setDescricao("");
    setCategoria("");
    setValor("");
    setData("");
    setPropriedadeId("");
    setEditandoId(null);
  }

  async function salvarDespesa(evento) {
    evento.preventDefault();

    try {
      const dados = {
        descricao,
        categoria,
        valor: Number(valor),
        data,
        propriedade_id: Number(propriedadeId),
      };

      if (editandoId) {
        await api.put(`/despesas/${editandoId}`, dados);
        setMensagem("Despesa atualizada com sucesso!");
      } else {
        await api.post("/despesas", dados);
        setMensagem("Despesa cadastrada com sucesso!");
      }

      limparFormulario();
      carregarDespesas();
    } catch (erro) {
      console.error(erro);

      setMensagem(erro.response?.data?.mensagem || "Erro ao salvar despesa");
    }
  }

  function editarDespesa(despesa) {
    setEditandoId(despesa.id);
    setDescricao(despesa.descricao);
    setCategoria(despesa.categoria);
    setValor(despesa.valor);
    setData(despesa.data ? despesa.data.substring(0, 10) : "");
    setPropriedadeId(despesa.propriedade_id);
  }

  async function excluirDespesa(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta despesa?",
    );

    if (!confirmar) return;

    try {
      await api.delete(`/despesas/${id}`);

      setDespesas((despesasAtuais) =>
        despesasAtuais.filter((despesa) => despesa.id !== id),
      );

      setMensagem("Despesa excluída com sucesso!");
    } catch (erro) {
      console.error(erro);

      setMensagem(erro.response?.data?.mensagem || "Erro ao excluir despesa");
    }
  }

  return (
    <div>
      <h1>Despesas</h1>

      {mensagem && <p>{mensagem}</p>}

      <form onSubmit={salvarDespesa}>
        <div>
          <label>Descrição</label>
          <br />

          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div>
          <label>Categoria</label>
          <br />

          <input
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>

        <div>
          <label>Valor</label>
          <br />

          <input
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>

        <div>
          <label>Data</label>
          <br />

          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        <div>
          <label>Propriedade</label>
          <br />

          <select
            value={propriedadeId}
            onChange={(e) => setPropriedadeId(e.target.value)}
          >
            <option value="">Selecione</option>

            {propriedades.map((propriedade) => (
              <option key={propriedade.id} value={propriedade.id}>
                {propriedade.nome}
              </option>
            ))}
          </select>
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

      <h2>Despesas cadastradas</h2>

      {despesas.length === 0 && <p>Nenhuma despesa cadastrada.</p>}

      {despesas.map((despesa) => (
        <div key={despesa.id}>
          <h3>{despesa.descricao}</h3>

          <p>Categoria: {despesa.categoria}</p>

          <p>Valor: R$ {Number(despesa.valor).toFixed(2)}</p>

          <p>
            Data:{" "}
            {despesa.data
              ? new Date(despesa.data).toLocaleDateString("pt-BR")
              : "-"}
          </p>

          <p>Propriedade: {despesa.propriedade || despesa.propriedade_id}</p>

          <button type="button" onClick={() => editarDespesa(despesa)}>
            Editar
          </button>

          <button type="button" onClick={() => excluirDespesa(despesa.id)}>
            Excluir
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Despesas;
