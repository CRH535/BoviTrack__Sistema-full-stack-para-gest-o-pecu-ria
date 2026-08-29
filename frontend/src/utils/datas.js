export function formatarDataSemFuso(data, valorPadrao = "-") {
  if (!data) return valorPadrao;

  const dataIso = String(data).slice(0, 10);
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso);

  if (!partes) return valorPadrao;

  return `${partes[3]}/${partes[2]}/${partes[1]}`;
}

export function obterDataAtualLocal() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function calcularDiasEntreDatas(dataInicial, dataFinal) {
  const extrair = (data) => {
    const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(data || ""));
    return partes
      ? Date.UTC(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]))
      : null;
  };
  const inicio = extrair(dataInicial);
  const fim = extrair(dataFinal);
  if (inicio === null || fim === null || fim < inicio) return null;
  return Math.round((fim - inicio) / 86400000);
}
