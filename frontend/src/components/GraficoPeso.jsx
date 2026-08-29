import { calcularDiasEntreDatas, formatarDataSemFuso } from "../utils/datas";

const largura = 760;
const altura = 270;
const margem = { topo: 24, direita: 24, base: 48, esquerda: 58 };

function GraficoPeso({ dados, dataNascimento }) {
  if (!dados.length) {
    return <div className="empty-state growth-chart-empty"><p>Registre pesagens para visualizar a evolução do peso.</p></div>;
  }

  const pesos = dados.map((item) => Number(item.peso_kg));
  const minimo = Math.max(0, Math.min(...pesos) * 0.88);
  const maximo = Math.max(...pesos) * 1.08 || 1;
  const intervalo = Math.max(1, maximo - minimo);
  const larguraUtil = largura - margem.esquerda - margem.direita;
  const alturaUtil = altura - margem.topo - margem.base;
  const x = (indice) => dados.length === 1
    ? margem.esquerda + larguraUtil / 2
    : margem.esquerda + (indice / (dados.length - 1)) * larguraUtil;
  const y = (peso) => margem.topo + alturaUtil - ((Number(peso) - minimo) / intervalo) * alturaUtil;
  const pontos = dados.map((item, indice) => `${x(indice)},${y(item.peso_kg)}`).join(" ");
  const area = `${margem.esquerda},${margem.topo + alturaUtil} ${pontos} ${margem.esquerda + larguraUtil},${margem.topo + alturaUtil}`;

  return (
    <div className="growth-chart-wrapper">
      <svg className="growth-chart" viewBox={`0 0 ${largura} ${altura}`} role="img" aria-label="Gráfico de evolução do peso do animal">
        <title>Peso do animal ao longo do tempo</title>
        {[0, 1, 2, 3, 4].map((linha) => {
          const peso = maximo - (linha / 4) * intervalo;
          const posicaoY = margem.topo + (linha / 4) * alturaUtil;
          return (
            <g key={linha}>
              <line x1={margem.esquerda} x2={margem.esquerda + larguraUtil} y1={posicaoY} y2={posicaoY} className="growth-chart-grid" />
              <text x={margem.esquerda - 9} y={posicaoY + 4} textAnchor="end">{peso.toFixed(0)}</text>
            </g>
          );
        })}
        <polygon points={area} className="growth-chart-area" />
        <polyline points={pontos} className="growth-chart-line" />
        {dados.map((item, indice) => {
          const idade = dataNascimento ? calcularDiasEntreDatas(dataNascimento, item.data) : null;
          return (
            <g key={item.id}>
              <circle cx={x(indice)} cy={y(item.peso_kg)} r="5" className="growth-chart-point">
                <title>{formatarDataSemFuso(item.data)} — {Number(item.peso_kg).toLocaleString("pt-BR")} kg — {item.tipo_pesagem}{idade === null ? "" : ` — ${idade} dias de idade`}</title>
              </circle>
              {(indice === 0 || indice === dados.length - 1 || indice % Math.max(1, Math.ceil(dados.length / 6)) === 0) && (
                <text x={x(indice)} y={altura - 18} textAnchor="middle">{formatarDataSemFuso(item.data).slice(0, 5)}</text>
              )}
            </g>
          );
        })}
        <text x="15" y={margem.topo + alturaUtil / 2} transform={`rotate(-90 15 ${margem.topo + alturaUtil / 2})`} textAnchor="middle" className="growth-chart-axis-title">Peso (kg)</text>
      </svg>
    </div>
  );
}

export default GraficoPeso;
