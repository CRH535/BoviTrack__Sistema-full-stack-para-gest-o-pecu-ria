const assert = require("node:assert/strict");
const {
  calcularGMD,
  calcularIdadeEmDias,
  calcularP205,
  montarResumoPesagens,
} = require("../services/calculosPesagem");
const { normalizarDesmama, normalizarPesagem } = require("../utils/validacoes");

function proximo(nome, teste) {
  teste();
  console.log(`OK ${nome}`);
}

proximo("datas DATE são calculadas sem fuso horário", () => {
  assert.equal(calcularIdadeEmDias("2026-01-01", "2026-08-26"), 237);
  assert.equal(calcularIdadeEmDias("2026-02-28", "2026-12-31"), 306);
});

proximo("GMD e P205 seguem as fórmulas zootécnicas informadas", () => {
  assert.equal(Number(calcularGMD(32, 190, 210).toFixed(3)), 0.752);
  assert.equal(Number(calcularP205(32, 190, 210).toFixed(1)), 186.2);
});

proximo("resumo usa somente pesagem NASCIMENTO como peso ao nascer", () => {
  const resumo = montarResumoPesagens(
    { data_nascimento: "2026-01-01", peso: 35 },
    [
      { id: 1, data_pesagem: "2026-01-10", peso_kg: 40, tipo_pesagem: "ROTINA" },
      { id: 2, data_pesagem: "2026-08-01", peso_kg: 180, tipo_pesagem: "DESMAMA" },
    ],
  );
  assert.equal(resumo.peso_nascimento, null);
  assert.equal(resumo.p205, null);
});

proximo("peso inválido e tipo não permitido são rejeitados", () => {
  assert.ok(normalizarPesagem({ data_pesagem: "2026-08-26", peso_kg: 0, tipo_pesagem: "ROTINA" }).erro);
  assert.ok(normalizarPesagem({ data_pesagem: "2026-08-26", peso_kg: 100, tipo_pesagem: "INVALIDA" }).erro);
});

proximo("desmama temporária aceita período e preserva data pura", () => {
  const resultado = normalizarDesmama({
    data_planejada: "2026-08-26",
    data_inicio: "2026-08-26",
    data_fim: "2026-08-30",
    tipo_desmama: "TEMPORARIA",
    status: "EM_ANDAMENTO",
  });
  assert.equal(resultado.valor.dataInicio, "2026-08-26");
  assert.equal(resultado.valor.dataFim, "2026-08-30");
});

console.log("Cálculos e validações de pesagens/desmamas validados com sucesso.");
