export function formatarDataSemFuso(data, valorPadrao = "-") {
  if (!data) return valorPadrao;

  const dataIso = String(data).slice(0, 10);
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso);

  if (!partes) return valorPadrao;

  return `${partes[3]}/${partes[2]}/${partes[1]}`;
}
