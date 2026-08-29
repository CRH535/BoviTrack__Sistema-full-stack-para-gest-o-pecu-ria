import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import IconeImagem from "../components/IconeImagem";
import VoltarInicio from "../components/VoltarInicio";

function obterDataAtualLocal() {
  const agora = new Date();
  const dataLocal = new Date(
    agora.getTime() - agora.getTimezoneOffset() * 60 * 1000,
  );

  return dataLocal.toISOString().slice(0, 10);
}

function formatarDataSemFuso(data) {
  if (!data) return "Não informada";

  const dataIso = String(data).slice(0, 10);
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso);

  if (!partes) return "Não informada";

  return `${partes[3]}/${partes[2]}/${partes[1]}`;
}

function Animais() {
  const [animais, setAnimais] = useState([]);
  const [propriedades, setPropriedades] = useState([]);

  const [nome, setNome] = useState("");
  const [numeroBrinco, setNumeroBrinco] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [sexo, setSexo] = useState("");
  const [peso, setPeso] = useState("");
  const [propriedadeId, setPropriedadeId] = useState("");
  const [maeId, setMaeId] = useState("");

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
    setNumeroBrinco("");
    setDataNascimento("");
    setEspecie("");
    setRaca("");
    setSexo("");
    setPeso("");
    setPropriedadeId("");
    setMaeId("");
    setEditandoId(null);
  }

  async function salvarAnimal(evento) {
    evento.preventDefault();

    try {
      const dados = {
        nome,
        numero_brinco: numeroBrinco,
        data_nascimento: dataNascimento || null,
        especie,
        raca,
        sexo,
        peso: peso ? Number(peso) : null,
        propriedade_id: Number(propriedadeId),
        mae_id: maeId ? Number(maeId) : null,
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
    setNumeroBrinco(animal.numero_brinco || "");
    setDataNascimento(animal.data_nascimento?.slice(0, 10) || "");
    setEspecie(animal.especie);
    setRaca(animal.raca || "");
    setSexo(animal.sexo);
    setPeso(animal.peso || "");
    setPropriedadeId(animal.propriedade_id);
    setMaeId(animal.mae_id || "");
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
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Gestão do rebanho</span>
          <h1>Animais</h1>
          <p>Controle a identificação e os dados do seu rebanho.</p>
        </div>
        <VoltarInicio />
      </header>

      {mensagem && <p className="notice">{mensagem}</p>}

      <form className="panel data-form" onSubmit={salvarAnimal}>
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
          <label>Número do brinco</label>
          <br />

          <input
            type="text"
            maxLength="50"
            value={numeroBrinco}
            onChange={(e) => setNumeroBrinco(e.target.value)}
            placeholder="Ex.: 00125 ou BOV-428"
          />
        </div>

        <div>
          <label>Data de nascimento</label>
          <br />

          <input
            type="date"
            max={obterDataAtualLocal()}
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
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
            onChange={(e) => {
              setPropriedadeId(e.target.value);
              setMaeId("");
            }}
          >
            <option value="">Selecione</option>

            {propriedades.map((propriedade) => (
              <option key={propriedade.id} value={propriedade.id}>
                {propriedade.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Mãe (opcional)</label>
          <br />
          <select
            value={maeId}
            onChange={(e) => setMaeId(e.target.value)}
            disabled={!propriedadeId}
          >
            <option value="">Não informada</option>
            {animais
              .filter((animal) => (
                animal.sexo === "F" &&
                Number(animal.propriedade_id) === Number(propriedadeId) &&
                animal.id !== editandoId
              ))
              .map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.nome} — brinco {animal.numero_brinco || "não informado"}
                </option>
              ))}
          </select>
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
          <span className="eyebrow">Rebanho</span>
          <h2>Animais cadastrados</h2>
        </div>
        <span className="count-badge">{animais.length}</span>
      </div>

      {animais.length === 0 && <div className="empty-state"><p>Nenhum animal cadastrado.</p></div>}

      <div className="record-grid animal-grid">
      {animais.map((animal) => (
        <article className="record-card animal-card" key={animal.id}>
          <div className="animal-card-heading">
            <span className="animal-avatar" aria-hidden="true">
              <IconeImagem nome="animais" className="animal-avatar-image" />
            </span>
            <div>
              <h3>{animal.nome}</h3>
              <span className="tag-badge icon-badge">
                <IconeImagem nome="identificacao" className="badge-icon-image" />
                Brinco {animal.numero_brinco || "não informado"}
              </span>
            </div>
          </div>

          <p>Nascimento: {formatarDataSemFuso(animal.data_nascimento)}</p>
          <p>Espécie: {animal.especie}</p>
          <p>Raça: {animal.raca || "-"}</p>
          <p>Sexo: {animal.sexo}</p>
          <p>Peso: {animal.peso || "-"} kg</p>
          <p>Propriedade: {animal.propriedade || animal.propriedade_id}</p>
          <p>Mãe: {animal.mae ? `${animal.mae} — brinco ${animal.mae_numero_brinco || "não informado"}` : "Não informada"}</p>
          <p>
            {animal.lotes?.length === 1 ? "Lote" : "Lotes"}:{" "}
            {animal.lotes?.length > 0
              ? animal.lotes.map((lote) => lote.nome).join(", ")
              : "Nenhum lote"}
          </p>

          <div className="record-actions">
          <Link className="button-secondary button-link" to={`/animais/${animal.id}`}>
            Ver ficha
          </Link>

          <button className="button-secondary" type="button" onClick={() => editarAnimal(animal)}>
            Editar
          </button>

          <button className="button-danger" type="button" onClick={() => excluirAnimal(animal.id)}>
            Excluir
          </button>
          </div>
        </article>
      ))}
      </div>
    </div>
  );
}

export default Animais;
