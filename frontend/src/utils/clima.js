const CONDICOES = [
  { codigos: [0], descricao: "Céu limpo", simbolo: "☀️" },
  { codigos: [1, 2], descricao: "Parcialmente nublado", simbolo: "🌤️" },
  { codigos: [3], descricao: "Nublado", simbolo: "☁️" },
  { codigos: [45, 48], descricao: "Neblina", simbolo: "🌫️" },
  { codigos: [51, 53, 55, 56, 57], descricao: "Chuvisco", simbolo: "🌦️" },
  { codigos: [61, 63, 65, 66, 67], descricao: "Chuva", simbolo: "🌧️" },
  { codigos: [71, 73, 75, 77, 85, 86], descricao: "Neve", simbolo: "🌨️" },
  { codigos: [80, 81, 82], descricao: "Pancadas de chuva", simbolo: "🌦️" },
  { codigos: [95, 96, 99], descricao: "Trovoadas", simbolo: "⛈️" },
];

export function descreverClima(codigo) {
  return CONDICOES.find((condicao) => condicao.codigos.includes(codigo)) ||
    { descricao: "Condição indisponível", simbolo: "🌤️" };
}

export function formatarMedida(valor, unidade) {
  return typeof valor === "number" && Number.isFinite(valor)
    ? `${Math.round(valor)}${unidade}`
    : "—";
}
