const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const TIMEOUT_MS = 6000;

const ESTADOS = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul",
  RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
};

class ErroClima extends Error {
  constructor(codigo, status) {
    super(codigo);
    this.name = "ErroClima";
    this.codigo = codigo;
    this.status = status;
  }
}

function normalizar(valor) {
  return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim().toLocaleLowerCase("pt-BR");
}

function criarOpenMeteoProvider({ fetchImpl = globalThis.fetch, timeoutMs = TIMEOUT_MS } = {}) {
  async function obterJson(url) {
    try {
      const resposta = await fetchImpl(url, {
        signal: AbortSignal.timeout(timeoutMs),
        headers: { Accept: "application/json" },
      });
      if (!resposta.ok) throw new ErroClima("CLIMA_INDISPONIVEL", 503);
      return await resposta.json();
    } catch (erro) {
      if (erro instanceof ErroClima) throw erro;
      if (erro.name === "TimeoutError" || erro.name === "AbortError") {
        throw new ErroClima("CLIMA_TIMEOUT", 504);
      }
      throw new ErroClima("CLIMA_INDISPONIVEL", 503);
    }
  }

  async function buscarCoordenadas(cidade, estado) {
    const nomeEstado = ESTADOS[String(estado || "").trim().toUpperCase()];
    if (!cidade?.trim() || !nomeEstado) throw new ErroClima("LOCALIZACAO_NAO_ENCONTRADA", 404);

    async function consultar(nome) {
      const url = new URL(GEOCODING_URL);
      url.searchParams.set("name", nome);
      url.searchParams.set("countryCode", "BR");
      url.searchParams.set("language", "pt");
      url.searchParams.set("count", "100");
      const dados = await obterJson(url);
      return Array.isArray(dados.results) ? dados.results : [];
    }

    const cidadeNormalizada = normalizar(cidade);
    function encontrar(resultados) {
      return resultados.find((item) => item.country_code === "BR" &&
        normalizar(item.admin1) === normalizar(nomeEstado) &&
        normalizar(item.name) === cidadeNormalizada &&
        Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
    }

    let local = encontrar(await consultar(`${cidade.trim()}, ${nomeEstado}`));
    // A busca simples cobre cidades que o geocoder não encontra com qualificadores.
    if (!local) local = encontrar(await consultar(cidade.trim()));
    if (!local) throw new ErroClima("LOCALIZACAO_NAO_ENCONTRADA", 404);
    return { nome: local.name, estado: local.admin1, latitude: local.latitude, longitude: local.longitude };
  }

  async function buscarPrevisao(latitude, longitude) {
    const url = new URL(FORECAST_URL);
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m");
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code");
    const dados = await obterJson(url);
    if (!dados.current || !Array.isArray(dados.daily?.time) || dados.daily.time.length === 0) {
      throw new ErroClima("CLIMA_INDISPONIVEL", 503);
    }
    return dados;
  }

  return { buscarCoordenadas, buscarPrevisao };
}

module.exports = { criarOpenMeteoProvider, ErroClima };
