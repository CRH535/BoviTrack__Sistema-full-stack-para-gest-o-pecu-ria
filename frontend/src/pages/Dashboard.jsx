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

  const indicadores = [
    { nome: "Propriedades", valor: Number(resumo.propriedades), icon: "⌂" },
    { nome: "Animais", valor: Number(resumo.animais), icon: "◉" },
    { nome: "Lotes", valor: Number(resumo.lotes), icon: "▦" },
    { nome: "Vacinas", valor: Number(resumo.vacinas), icon: "+" },
  ];
  const maiorIndicador = Math.max(1, ...indicadores.map((item) => item.valor));

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Painel de gestão</span>
          <h1>Visão geral</h1>
          <p>Acompanhe os principais números da sua operação.</p>
        </div>
        <span className="status-badge"><span /> Sistema atualizado</span>
      </header>

      {erro && <p className="notice notice-error">{erro}</p>}

      <section className="stats-grid" aria-label="Resumo do sistema">
        {indicadores.map((item) => (
          <article className="stat-card" key={item.nome}>
            <div>
              <span>{item.nome}</span>
              <strong>{item.valor}</strong>
              <small>Registros cadastrados</small>
            </div>
            <span className="stat-icon" aria-hidden="true">{item.icon}</span>
          </article>
        ))}

        <article className="stat-card stat-card-finance">
          <div>
            <span>Despesas totais</span>
            <strong>R$ {Number(resumo.total_despesas).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</strong>
            <small>Valor acumulado</small>
          </div>
          <span className="stat-icon" aria-hidden="true">$</span>
        </article>
      </section>

      <section className="dashboard-panels">
        <article className="panel overview-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Resumo geral</span>
              <h2>Distribuição dos registros</h2>
            </div>
            <span className="panel-chip">Dados atuais</span>
          </div>

          <div className="metric-chart">
            {indicadores.map((item) => (
              <div className="metric-row" key={item.nome}>
                <span>{item.nome}</span>
                <div className="metric-track">
                  <span style={{ width: `${(item.valor / maiorIndicador) * 100}%` }} />
                </div>
                <strong>{item.valor}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Agenda sanitária</span>
              <h2>Próximas vacinações</h2>
            </div>
            <span className="panel-chip">7 dias</span>
          </div>

          {proximasVacinacoes.length === 0 && (
            <div className="empty-state compact-empty">
              <span aria-hidden="true">✓</span>
              <p>Nenhuma vacinação prevista para esta semana.</p>
            </div>
          )}

          <div className="activity-list">
            {proximasVacinacoes.map((vacinacao) => (
              <div className="activity-item" key={vacinacao.id}>
                <span className="activity-icon" aria-hidden="true">+</span>
                <div>
                  <strong>{vacinacao.animal}</strong>
                  <small>{vacinacao.vacina}</small>
                </div>
                <time>
                  {vacinacao.proxima_dose
                    ? new Date(vacinacao.proxima_dose).toLocaleDateString("pt-BR")
                    : "-"}
                </time>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;
