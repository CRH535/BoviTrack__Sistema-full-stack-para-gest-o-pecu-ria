const assert = require("node:assert/strict");
// O controller cria o pool no import, mas estes testes injetam um banco falso e
// nunca abrem conexão. A URL local permite executar o teste sem .env real.
process.env.DATABASE_URL ||= "postgresql://teste:teste@127.0.0.1:5432/teste";
const { criarOpenMeteoProvider, ErroClima } = require("../services/openMeteoService");
const { criarClimaService } = require("../services/climaService");
const { criarConsultarClima } = require("../controllers/climaController");

const propriedade = { id: 7, nome: "Fazenda Teste", cidade: "Patos de Minas", estado: "MG" };
const previsao = {
  current: { time: "2026-10-01T12:00", temperature_2m: 26, apparent_temperature: 27,
    relative_humidity_2m: 58, precipitation: 0, weather_code: 1, wind_speed_10m: 14 },
  daily: { time: ["2026-10-01", "2026-10-02"], temperature_2m_max: [29, 35],
    temperature_2m_min: [18, 19], precipitation_sum: [0, 7],
    precipitation_probability_max: [20, 80], wind_speed_10m_max: [15, 42], weather_code: [1, 61] },
};

function resposta(dados, status = 200) {
  return { ok: status === 200, json: async () => dados };
}

function criarRes() {
  return {
    statusCode: 200,
    status(codigo) { this.statusCode = codigo; return this; },
    json(dados) { this.dados = dados; return this; },
  };
}

async function executar() {
  let chamadas = 0;
  const provider = criarOpenMeteoProvider({ fetchImpl: async (url) => {
    chamadas += 1;
    const parsed = new URL(url);
    if (parsed.hostname.startsWith("geocoding")) {
      assert.equal(parsed.searchParams.get("countryCode"), "BR");
      return resposta({ results: [
        { name: "Patos de Minas", admin1: "São Paulo", country_code: "BR", latitude: 1, longitude: 1 },
        { name: "Patos de Minas", admin1: "Minas Gerais", country_code: "BR", latitude: -18.57, longitude: -46.51 },
      ] });
    }
    assert.equal(parsed.searchParams.get("forecast_days"), "7");
    return resposta(previsao);
  } });
  const local = await provider.buscarCoordenadas(propriedade.cidade, propriedade.estado);
  assert.equal(local.latitude, -18.57, "geocoding respeita o estado");
  const service = criarClimaService({ provider });
  const [a, b] = await Promise.all([
    service.buscarClimaDaPropriedade(propriedade),
    service.buscarClimaDaPropriedade(propriedade),
  ]);
  assert.deepEqual(a, b);
  assert.equal(a.previsao[1].data, "2026-10-02", "data permanece YYYY-MM-DD");
  assert.equal(a.alertas.length, 3, "avisos derivados da previsão");
  assert.equal(chamadas, 3, "duas consultas simultâneas compartilham a mesma busca");
  await service.buscarClimaDaPropriedade(propriedade);
  assert.equal(chamadas, 3, "segunda consulta usa cache");

  const ausente = criarOpenMeteoProvider({ fetchImpl: async () => resposta({ results: [] }) });
  await assert.rejects(ausente.buscarCoordenadas("Cidade inexistente", "MG"),
    (erro) => erro instanceof ErroClima && erro.codigo === "LOCALIZACAO_NAO_ENCONTRADA");

  const indisponivel = criarOpenMeteoProvider({ fetchImpl: async () => resposta({}, 503) });
  await assert.rejects(indisponivel.buscarPrevisao(1, 2),
    (erro) => erro.codigo === "CLIMA_INDISPONIVEL");
  const timeout = criarOpenMeteoProvider({ fetchImpl: async () => { throw Object.assign(new Error(), { name: "TimeoutError" }); } });
  await assert.rejects(timeout.buscarPrevisao(1, 2), (erro) => erro.codigo === "CLIMA_TIMEOUT");

  for (const [perfil, usuarioId, propriedadeVisivel, esperado] of [
    ["usuario", 4, propriedade, 200],
    ["admin", 1, propriedade, 200],
    ["usuario", 5, null, 404],
  ]) {
    let chamadasClima = 0;
    const banco = { query: async (sql, parametros) => {
      assert.match(sql, /usuario_id = \$3/);
      assert.deepEqual(parametros, ["7", perfil, usuarioId]);
      return { rows: propriedadeVisivel ? [propriedadeVisivel] : [] };
    } };
    const handler = criarConsultarClima({ banco, buscarClima: async () => {
      chamadasClima += 1;
      return a;
    } });
    const res = criarRes();
    await handler({ params: { id: "7" }, usuario: { perfil, id: usuarioId } }, res);
    assert.equal(res.statusCode, esperado);
    assert.equal(chamadasClima, esperado === 200 ? 1 : 0, "IDOR não chama provider");
  }

  console.log("OK clima: autorização, geocoding, forecast, timeout, erro e cache");
}

executar().catch((erro) => { console.error(erro); process.exitCode = 1; });
