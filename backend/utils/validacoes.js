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

module.exports = {
  converterId,
  normalizarDataCalendario,
  normalizarDataNascimento,
  normalizarFormaPagamento,
  normalizarNumeroBrinco,
  normalizarProducaoLeiteira,
};

