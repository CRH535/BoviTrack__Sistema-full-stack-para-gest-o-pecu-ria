import { useEffect, useState } from "react";
import api from "../services/api";
import { formatarDataSemFuso } from "../utils/datas";
import IconeImagem from "../components/IconeImagem";

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
    { nome: "Propriedades", valor: Number(resumo.propriedades), icon: "propriedades" },
    { nome: "Animais", valor: Number(resumo.animais), icon: "animais" },
    { nome: "Lotes", valor: Number(resumo.lotes), icon: "lotes" },
    { nome: "Vacinas", valor: Number(resumo.vacinas), icon: "vacinas" },
  ];
  const maiorIndicador = Math.max(1, ...indicadores.map((item) => item.valor));

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Gestão pecuária</span>
          <h1>Visão geral do rebanho</h1>
          <p>Acompanhe animais, lotes, vacinações e despesas em um só lugar.</p>
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
            <span className="stat-icon" aria-hidden="true">
              <IconeImagem nome={item.icon} className="stat-icon-image" />
            </span>
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
          <span className="stat-icon" aria-hidden="true">
            <IconeImagem nome="despesas" className="stat-icon-image" />
          </span>
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
              <span aria-hidden="true">
                <IconeImagem nome="proximas-vacinas" className="empty-icon-image" />
              </span>
              <p>Nenhuma vacinação prevista para esta semana.</p>
            </div>
          )}

          <div className="activity-list">
            {proximasVacinacoes.map((vacinacao) => (
              <div className="activity-item" key={vacinacao.id}>
                <span className="activity-icon" aria-hidden="true">
                  <IconeImagem nome="vacinacoes" className="activity-icon-image" />
                </span>
                <div>
                  <strong>{vacinacao.animal}</strong>
                  <small>{vacinacao.vacina}</small>
                </div>
                <time>
                  {vacinacao.proxima_dose
                    ? formatarDataSemFuso(vacinacao.proxima_dose)
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
