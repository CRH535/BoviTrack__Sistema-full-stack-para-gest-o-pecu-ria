import { useEffect, useState } from "react";
import api from "../services/api";

function Animais() {
  const [animais, setAnimais] = useState([]);
  const [propriedades, setPropriedades] = useState([]);

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [sexo, setSexo] = useState("");
  const [peso, setPeso] = useState("");
  const [propriedadeId, setPropriedadeId] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarAnimais();
    carregarPropriedades();
  }, []);

  async function carregarAnimais() {
    try {
      const resposta = await api.get("/animais");
      setAnimais(resposta.data);
    } catch (erro) {
      console.error(erro);
      setMensagem("Erro ao carregar animais");
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
    setNome("");
    setEspecie("");
    setRaca("");
    setSexo("");
    setPeso("");
    setPropriedadeId("");
    setEditandoId(null);
  }

  async function salvarAnimal(evento) {
    evento.preventDefault();

    try {
      const dados = {
        nome,
        especie,
        raca,
        sexo,
        peso: peso ? Number(peso) : null,
        propriedade_id: Number(propriedadeId),
      };

      if (editandoId) {
        await api.put(`/animais/${editandoId}`, dados);
        setMensagem("Animal atualizado com sucesso!");
      } else {
        await api.post("/animais", dados);
        setMensagem("Animal cadastrado com sucesso!");
      }

      limparFormulario();
      carregarAnimais();
    } catch (erro) {
      console.error(erro);

      setMensagem(erro.response?.data?.mensagem || "Erro ao salvar animal");
    }
  }

  function editarAnimal(animal) {
    setEditandoId(animal.id);
    setNome(animal.nome);
    setEspecie(animal.especie);
    setRaca(animal.raca || "");
    setSexo(animal.sexo);
    setPeso(animal.peso || "");
    setPropriedadeId(animal.propriedade_id);
  }

  async function excluirAnimal(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este animal?",
    );

    if (!confirmar) {
      return;
    }

    try {
      await api.delete(`/animais/${id}`);

      setAnimais((animaisAtuais) =>
        animaisAtuais.filter((animal) => animal.id !== id),
      );

      setMensagem("Animal excluído com sucesso!");
    } catch (erro) {
      console.error(erro);

      setMensagem(erro.response?.data?.mensagem || "Erro ao excluir animal");
    }
  }

  return (
    <div>
      <h1>Animais</h1>

      {mensagem && <p>{mensagem}</p>}

      <form onSubmit={salvarAnimal}>
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
          <label>Espécie</label>
          <br />

          <input
            type="text"
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
          />
        </div>

        <div>
          <label>Raça</label>
          <br />

          <input
            type="text"
            value={raca}
            onChange={(e) => setRaca(e.target.value)}
          />
        </div>

        <div>
          <label>Sexo</label>
          <br />

          <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="">Selecione</option>
            <option value="M">Macho</option>
            <option value="F">Fêmea</option>
          </select>
        </div>

        <div>
          <label>Peso</label>
          <br />

          <input
            type="number"
            step="0.01"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
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

      <h2>Animais cadastrados</h2>

      {animais.length === 0 && <p>Nenhum animal cadastrado.</p>}

      {animais.map((animal) => (
        <div key={animal.id}>
          <h3>{animal.nome}</h3>

          <p>Espécie: {animal.especie}</p>
          <p>Raça: {animal.raca || "-"}</p>
          <p>Sexo: {animal.sexo}</p>
          <p>Peso: {animal.peso || "-"} kg</p>
          <p>Propriedade: {animal.propriedade || animal.propriedade_id}</p>
          <p>
            {animal.lotes?.length === 1 ? "Lote" : "Lotes"}:{" "}
            {animal.lotes?.length > 0
              ? animal.lotes.map((lote) => lote.nome).join(", ")
              : "Nenhum lote"}
          </p>

          <button type="button" onClick={() => editarAnimal(animal)}>
            Editar
          </button>

          <button type="button" onClick={() => excluirAnimal(animal.id)}>
            Excluir
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Animais;
