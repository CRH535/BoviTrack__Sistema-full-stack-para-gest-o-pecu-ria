function converterId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizarFormaPagamento(valor) {
  if (valor === undefined || valor === null) {
    return { valor: null };
  }

  if (typeof valor !== "string") {
    return { erro: "Forma de pagamento invalida" };
  }

  const formaPagamento = valor.trim();

  if (formaPagamento.length > 100) {
    return {
      erro: "A forma de pagamento deve possuir no maximo 100 caracteres",
    };
  }

  return { valor: formaPagamento || null };
}

function normalizarNumeroBrinco(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return { valor: null };
  }

  if (typeof valor !== "string") {
    return { erro: "Numero do brinco invalido" };
  }

  const numeroBrinco = valor.trim();

  if (numeroBrinco.length > 50) {
    return { erro: "O numero do brinco deve possuir no maximo 50 caracteres" };
  }

  return { valor: numeroBrinco || null };
}

function normalizarDataNascimento(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return { valor: null };
  }

  if (typeof valor !== "string") {
    return { erro: "Data de nascimento invalida" };
  }

  const dataNascimento = valor.trim();
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataNascimento);

  if (!partes) {
    return { erro: "Data de nascimento invalida" };
  }

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const dataUtc = new Date(Date.UTC(ano, mes - 1, dia));
  const dataExiste =
    dataUtc.getUTCFullYear() === ano &&
    dataUtc.getUTCMonth() === mes - 1 &&
    dataUtc.getUTCDate() === dia;

  if (!dataExiste || dataNascimento > new Date().toISOString().slice(0, 10)) {
    return { erro: "Data de nascimento invalida" };
  }

  return { valor: dataNascimento };
}

const TURNOS_ORDENHA = new Set([
  "manha",
  "tarde",
  "noite",
  "ordenha_unica",
]);

const TIPOS_PESAGEM = new Set([
  "NASCIMENTO",
  "ROTINA",
  "PRE_DESMAMA",
  "DESMAMA",
  "POS_DESMAMA",
  "SOBREANO",
  "OUTRA",
]);
const METODOS_PESAGEM = new Set(["BALANCA", "FITA", "ESTIMATIVA", "OUTRO"]);
const TIPOS_DESMAMA = new Set([
  "CONVENCIONAL",
  "LADO_A_LADO",
  "ABRUPTA",
  "PRECOCE",
  "TEMPORARIA",
  "CONTROLADA",
  "OUTRA",
]);
const STATUS_DESMAMA = new Set([
  "PLANEJADA",
  "EM_ANDAMENTO",
  "CONCLUIDA",
  "CANCELADA",
]);

function normalizarDataCalendario(valor, campo = "Data") {
  if (typeof valor !== "string") {
    return { erro: `${campo} inválida` };
  }

  const data = valor.trim();
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);

  if (!partes) {
    return { erro: `${campo} inválida` };
  }

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const dataUtc = new Date(Date.UTC(ano, mes - 1, dia));
  const dataExiste =
    dataUtc.getUTCFullYear() === ano &&
    dataUtc.getUTCMonth() === mes - 1 &&
    dataUtc.getUTCDate() === dia;

  return dataExiste ? { valor: data } : { erro: `${campo} inválida` };
}

function normalizarProducaoLeiteira(dados) {
  const data = normalizarDataCalendario(dados.data, "Data da ordenha");
  const turno = typeof dados.turno === "string" ? dados.turno.trim() : "";
  const quantidade = Number(dados.quantidade_litros);

  if (data.erro) return data;

  if (!TURNOS_ORDENHA.has(turno)) {
    return { erro: "Turno inválido" };
  }

  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    return { erro: "A quantidade de leite deve ser um número maior que zero" };
  }

  if (quantidade > 99999999.99) {
    return { erro: "Quantidade de leite acima do limite permitido" };
  }

  if (
    dados.observacao !== undefined &&
    dados.observacao !== null &&
    typeof dados.observacao !== "string"
  ) {
    return { erro: "Observação inválida" };
  }

  const observacao = dados.observacao?.trim() || null;

  if (observacao && observacao.length > 500) {
    return { erro: "A observação deve possuir no máximo 500 caracteres" };
  }

  return {
    valor: {
      data: data.valor,
      turno,
      quantidadeLitros: quantidade,
      observacao,
    },
  };
}

function normalizarTextoOpcional(valor, campo, limite) {
  if (valor === undefined || valor === null || valor === "") return { valor: null };
  if (typeof valor !== "string") return { erro: `${campo} invÃ¡lida` };
  const texto = valor.trim();
  if (texto.length > limite) {
    return { erro: `${campo} deve possuir no mÃ¡ximo ${limite} caracteres` };
  }
  return { valor: texto || null };
}

function normalizarPesagem(dados) {
  const data = normalizarDataCalendario(dados.data_pesagem, "Data da pesagem");
  const peso = Number(dados.peso_kg);
  const tipo = typeof dados.tipo_pesagem === "string"
    ? dados.tipo_pesagem.trim().toUpperCase()
    : "";
  const metodo = dados.metodo
    ? String(dados.metodo).trim().toUpperCase()
    : null;
  const loteId = dados.lote_id === undefined || dados.lote_id === null || dados.lote_id === ""
    ? null
    : converterId(dados.lote_id);
  const observacao = normalizarTextoOpcional(dados.observacao, "ObservaÃ§Ã£o", 500);

  if (data.erro) return data;
  if (!Number.isFinite(peso) || peso <= 0 || peso > 99999999.99) {
    return { erro: "O peso deve ser um nÃºmero maior que zero e dentro do limite permitido" };
  }
  if (!TIPOS_PESAGEM.has(tipo)) return { erro: "Tipo de pesagem invÃ¡lido" };
  if (metodo && !METODOS_PESAGEM.has(metodo)) return { erro: "MÃ©todo de pesagem invÃ¡lido" };
  if (dados.lote_id && !loteId) return { erro: "Lote invÃ¡lido" };
  if (observacao.erro) return observacao;

  return {
    valor: {
      dataPesagem: data.valor,
      pesoKg: peso,
      tipoPesagem: tipo,
      metodo,
      loteId,
      observacao: observacao.valor,
    },
  };
}

function normalizarDesmama(dados, { permitirConclusao = false } = {}) {
  const dataPlanejada = normalizarDataCalendario(dados.data_planejada, "Data planejada");
  const tipo = typeof dados.tipo_desmama === "string"
    ? dados.tipo_desmama.trim().toUpperCase()
    : "";
  const status = typeof dados.status === "string"
    ? dados.status.trim().toUpperCase()
    : "PLANEJADA";
  const maeId = dados.mae_id === undefined || dados.mae_id === null || dados.mae_id === ""
    ? null
    : converterId(dados.mae_id);
  const loteId = dados.lote_destino_id === undefined || dados.lote_destino_id === null || dados.lote_destino_id === ""
    ? null
    : converterId(dados.lote_destino_id);
  const suplementacao = normalizarTextoOpcional(dados.suplementacao, "SuplementaÃ§Ã£o", 500);
  const observacao = normalizarTextoOpcional(dados.observacao, "ObservaÃ§Ã£o", 1000);

  if (dataPlanejada.erro) return dataPlanejada;
  if (!TIPOS_DESMAMA.has(tipo)) return { erro: "Tipo de desmama invÃ¡lido" };
  if (!STATUS_DESMAMA.has(status)) return { erro: "Status da desmama invÃ¡lido" };
  if (!permitirConclusao && ["CONCLUIDA", "CANCELADA"].includes(status)) {
    return { erro: "Use a aÃ§Ã£o especÃ­fica para concluir ou cancelar a desmama" };
  }
  if (dados.mae_id && !maeId) return { erro: "MÃ£e invÃ¡lida" };
  if (dados.lote_destino_id && !loteId) return { erro: "Lote de destino invÃ¡lido" };
  if (suplementacao.erro || observacao.erro) return suplementacao.erro ? suplementacao : observacao;

  const datas = {};
  for (const [chave, rotulo] of [
    ["data_inicio", "Data de inÃ­cio"],
    ["data_fim", "Data de fim"],
    ["data_desmama", "Data da desmama"],
  ]) {
    if (!dados[chave]) {
      datas[chave] = null;
      continue;
    }
    const resultado = normalizarDataCalendario(dados[chave], rotulo);
    if (resultado.erro) return resultado;
    datas[chave] = resultado.valor;
  }

  if (datas.data_inicio && datas.data_fim && datas.data_fim < datas.data_inicio) {
    return { erro: "A data de fim nÃ£o pode ser anterior Ã  data de inÃ­cio" };
  }

  return {
    valor: {
      dataPlanejada: dataPlanejada.valor,
      dataInicio: datas.data_inicio,
      dataFim: datas.data_fim,
      dataDesmama: datas.data_desmama,
      tipoDesmama: tipo,
      status,
      maeId,
      loteDestinoId: loteId,
      suplementacao: suplementacao.valor,
      observacao: observacao.valor,
    },
  };
}

module.exports = {
  converterId,
  normalizarDataCalendario,
  normalizarDataNascimento,
  normalizarFormaPagamento,
  normalizarNumeroBrinco,
  normalizarDesmama,
  normalizarPesagem,
  normalizarProducaoLeiteira,
};
