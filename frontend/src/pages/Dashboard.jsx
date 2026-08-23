import { useEffect, useState } from "react";
import api from "../services/api";

const resumoInicial = {
  propriedades: 0,
  animais: 0,
  lotes: 0,
  vacinas: 0,
  total_despesas: 0,
};

function Dashboard() {
  const [resumo, setResumo] = useState(resumoInicial);
  const [proximasVacinacoes, setProximasVacinacoes] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const resposta = await api.get("/dashboard");
        setResumo(resposta.data.resumo);
        setProximasVacinacoes(resposta.data.proximas_vacinacoes);
      } catch (erroCarregamento) {
        console.error(erroCarregamento);
        setErro("Erro ao carregar o dashboard");
      }
    }

    carregarDashboard();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Visão geral do AgroControl</p>

      {erro && <p>{erro}</p>}

      <hr />
      <h2>Resumo</h2>

      <div><h3>Propriedades</h3><strong>{resumo.propriedades}</strong></div>
      <div><h3>Animais</h3><strong>{resumo.animais}</strong></div>
      <div><h3>Lotes</h3><strong>{resumo.lotes}</strong></div>
      <div><h3>Vacinas</h3><strong>{resumo.vacinas}</strong></div>
      <div>
        <h3>Total de despesas</h3>
        <strong>R$ {Number(resumo.total_despesas).toFixed(2)}</strong>
      </div>

      <hr />
      <h2>Próximas vacinações</h2>
      <p>Doses previstas para os próximos 7 dias.</p>

      {proximasVacinacoes.length === 0 && (
        <p>Nenhuma vacinação prevista para esta semana.</p>
      )}

      {proximasVacinacoes.map((vacinacao) => (
        <div key={vacinacao.id}>
          <h3>{vacinacao.animal}</h3>
          <p>Vacina: {vacinacao.vacina}</p>
          <p>
            Próxima dose:{" "}
            {vacinacao.proxima_dose
              ? new Date(vacinacao.proxima_dose).toLocaleDateString("pt-BR")
              : "-"}
          </p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
