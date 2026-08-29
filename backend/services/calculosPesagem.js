const MILISSEGUNDOS_DIA = 86400000;

function dataUtc(data) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(data || ""));
  if (!partes) return null;
  return Date.UTC(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
}

function calcularIdadeEmDias(dataInicial, dataFinal) {
  const inicio = dataUtc(dataInicial);
  const fim = dataUtc(dataFinal);
  if (inicio === null || fim === null || fim < inicio) return null;
  return Math.round((fim - inicio) / MILISSEGUNDOS_DIA);
}

function calcularGMD(pesoInicial, pesoFinal, dias) {
  const inicial = Number(pesoInicial);
  const final = Number(pesoFinal);
  if (!Number.isFinite(inicial) || !Number.isFinite(final) || !dias || dias <= 0) {
    return null;
  }
  return (final - inicial) / dias;
}

function calcularP205(pesoNascimento, pesoDesmama, idadeDesmamaDias) {
  const gmd = calcularGMD(pesoNascimento, pesoDesmama, idadeDesmamaDias);
  return gmd === null ? null : Number(pesoNascimento) + gmd * 205;
}

function ordenarPesagens(pesagens) {
  return [...pesagens].sort((a, b) => {
    const porData = String(a.data_pesagem).localeCompare(String(b.data_pesagem));
    return porData || Number(a.id) - Number(b.id);
  });
}

function montarResumoPesagens(animal, pesagens) {
  const ordenadas = ordenarPesagens(pesagens);
  const atual = ordenadas.at(-1) || null;
  const anterior = ordenadas.at(-2) || null;
  const nascimento = ordenadas.find((item) => item.tipo_pesagem === "NASCIMENTO") || null;
  const desmama = ordenadas.find((item) => item.tipo_pesagem === "DESMAMA") || null;
  const posDesmama = desmama
    ? [...ordenadas].reverse().find((item) => (
        item.tipo_pesagem === "POS_DESMAMA" && item.data_pesagem > desmama.data_pesagem
      )) || null
    : null;

  const diasRecente = anterior && atual
    ? calcularIdadeEmDias(anterior.data_pesagem, atual.data_pesagem)
    : null;
  const diasNascimento = nascimento && atual
    ? calcularIdadeEmDias(nascimento.data_pesagem, atual.data_pesagem)
    : null;
  const idadeDesmamaDias = nascimento && desmama && animal.data_nascimento
    ? calcularIdadeEmDias(animal.data_nascimento, desmama.data_pesagem)
    : null;
  const diasPosDesmama = desmama && posDesmama
    ? calcularIdadeEmDias(desmama.data_pesagem, posDesmama.data_pesagem)
    : null;

  return {
    peso_atual: atual ? Number(atual.peso_kg) : (animal.peso == null ? null : Number(animal.peso)),
    ultima_pesagem: atual,
    peso_nascimento: nascimento ? Number(nascimento.peso_kg) : null,
    peso_desmama: desmama ? Number(desmama.peso_kg) : null,
    idade_desmama_dias: idadeDesmamaDias,
    variacao_recente: atual && anterior ? Number(atual.peso_kg) - Number(anterior.peso_kg) : null,
    gmd_recente: atual && anterior ? calcularGMD(anterior.peso_kg, atual.peso_kg, diasRecente) : null,
    gmd_desde_nascimento: nascimento && atual
      ? calcularGMD(nascimento.peso_kg, atual.peso_kg, diasNascimento)
      : null,
    gmd_nascimento_desmama: nascimento && desmama
      ? calcularGMD(nascimento.peso_kg, desmama.peso_kg, idadeDesmamaDias)
      : null,
    gmd_pos_desmama: desmama && posDesmama
      ? calcularGMD(desmama.peso_kg, posDesmama.peso_kg, diasPosDesmama)
      : null,
    p205: nascimento && desmama
      ? calcularP205(nascimento.peso_kg, desmama.peso_kg, idadeDesmamaDias)
      : null,
  };
}

module.exports = {
  calcularGMD,
  calcularIdadeEmDias,
  calcularP205,
  montarResumoPesagens,
  ordenarPesagens,
};
