import { formatarDataSemFuso } from "../utils/datas";

const largura = 720;
const altura = 250;
const margem = { topo: 24, direita: 24, base: 45, esquerda: 52 };

function formatarLitros(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

function GraficoProducaoLeite({ dados }) {
  if (!dados.length) {
    return (
      <div className="empty-state milk-chart-empty">
        <p>Registre produções para visualizar a evolução.</p>
      </div>
    );
  }

  const larguraUtil = largura - margem.esquerda - margem.direita;
  const alturaUtil = altura - margem.topo - margem.base;
  const maiorValor = Math.max(...dados.map((item) => item.total_litros), 1);
  const posicaoX = (indice) =>
    dados.length === 1
      ? margem.esquerda + larguraUtil / 2
      : margem.esquerda + (indice / (dados.length - 1)) * larguraUtil;
  const posicaoY = (valor) =>
    margem.topo + alturaUtil - (Number(valor) / maiorValor) * alturaUtil;
  const pontos = dados
    .map((item, indice) => `${posicaoX(indice)},${posicaoY(item.total_litros)}`)
    .join(" ");
  const area = `${margem.esquerda},${margem.topo + alturaUtil} ${pontos} ${
    margem.esquerda + larguraUtil
  },${margem.topo + alturaUtil}`;
  const intervaloRotulos = Math.max(1, Math.ceil(dados.length / 6));

  return (
    <div className="milk-chart-wrapper">
      <svg
        className="milk-chart"
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label="Gráfico da produção diária de leite nos últimos 30 dias"
      >
        <title>Produção de leite por dia</title>

        {[0, 1, 2, 3, 4].map((linha) => {
          const valor = (maiorValor * (4 - linha)) / 4;
          const y = margem.topo + (linha / 4) * alturaUtil;

          return (
            <g key={linha}>
              <line
                x1={margem.esquerda}
                x2={margem.esquerda + larguraUtil}
                y1={y}
                y2={y}
                className="milk-chart-grid"
              />
              <text x={margem.esquerda - 9} y={y + 4} textAnchor="end">
                {formatarLitros(valor)}
              </text>
            </g>
          );
        })}

        <polygon points={area} className="milk-chart-area" />
        <polyline points={pontos} className="milk-chart-line" />

        {dados.map((item, indice) => {
          const mostrarRotulo =
            indice === 0 ||
            indice === dados.length - 1 ||
            indice % intervaloRotulos === 0;

          return (
            <g key={item.data}>
              <circle
                cx={posicaoX(indice)}
                cy={posicaoY(item.total_litros)}
                r="4"
                className="milk-chart-point"
              >
                <title>
                  {formatarDataSemFuso(item.data)}: {formatarLitros(item.total_litros)} L
                </title>
              </circle>
              {mostrarRotulo && (
                <text
                  x={posicaoX(indice)}
                  y={altura - 17}
                  textAnchor="middle"
                >
                  {formatarDataSemFuso(item.data).slice(0, 5)}
                </text>
              )}
            </g>
          );
        })}

        <text
          x="14"
          y={margem.topo + alturaUtil / 2}
          className="milk-chart-axis-title"
          transform={`rotate(-90 14 ${margem.topo + alturaUtil / 2})`}
          textAnchor="middle"
        >
          Litros
        </text>
      </svg>
    </div>
  );
}

export default GraficoProducaoLeite;
