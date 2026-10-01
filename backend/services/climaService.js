const { criarOpenMeteoProvider } = require("./openMeteoService");

const CACHE_TTL_MS = 25 * 60 * 1000;
const MAX_CACHE_ENTRIES = 300;
const LIMIARES_ALERTA = { chuvaAmanha: 70, calor: 35, vento: 40 };

function criarClimaService({ provider = criarOpenMeteoProvider(), agora = Date.now } = {}) {
  // Cache por instância: otimização somente, nunca fonte de autorização ou persistência.
  const cache = new Map();

  async function buscarClimaDaPropriedade(propriedade) {
    const chave = `${propriedade.id}:${propriedade.nome}:${propriedade.cidade}:${propriedade.estado}`;
    const existente = cache.get(chave);
    if (existente && existente.expiraEm > agora()) return existente.valor;
    cache.delete(chave);

    const pendente = (async () => {
      const localizacao = await provider.buscarCoordenadas(propriedade.cidade, propriedade.estado);
      const dados = await provider.buscarPrevisao(localizacao.latitude, localizacao.longitude);
      const atual = dados.current;
      const diario = dados.daily;
      const previsao = diario.time.slice(0, 7).map((data, i) => ({
        data,
        temperaturaMaxima: diario.temperature_2m_max?.[i] ?? null,
        temperaturaMinima: diario.temperature_2m_min?.[i] ?? null,
        precipitacao: diario.precipitation_sum?.[i] ?? null,
        probabilidadeChuva: diario.precipitation_probability_max?.[i] ?? null,
        ventoMaximo: diario.wind_speed_10m_max?.[i] ?? null,
        codigoClima: diario.weather_code?.[i] ?? null,
      }));
      const alertas = [];
      if (previsao[1]?.probabilidadeChuva >= LIMIARES_ALERTA.chuvaAmanha) {
        alertas.push("Alta probabilidade de chuva amanhã.");
      }
      if (previsao.some((dia) => dia.temperaturaMaxima >= LIMIARES_ALERTA.calor)) {
        alertas.push("Temperatura elevada prevista nos próximos dias.");
      }
      if (previsao.some((dia) => dia.ventoMaximo >= LIMIARES_ALERTA.vento)) {
        alertas.push("Vento forte previsto nos próximos dias.");
      }
      return {
        propriedade: { id: propriedade.id, nome: propriedade.nome, cidade: propriedade.cidade, estado: propriedade.estado },
        localizacao,
        atual: {
          temperatura: atual.temperature_2m ?? null,
          sensacao: atual.apparent_temperature ?? null,
          umidade: atual.relative_humidity_2m ?? null,
          precipitacao: atual.precipitation ?? null,
          vento: atual.wind_speed_10m ?? null,
          codigoClima: atual.weather_code ?? null,
        },
        previsao,
        alertas,
        atualizadoEm: atual.time || null,
        fonte: "Open-Meteo",
      };
    })();

    cache.set(chave, { valor: pendente, expiraEm: agora() + CACHE_TTL_MS });
    if (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
    try {
      const resultado = await pendente;
      cache.set(chave, { valor: resultado, expiraEm: agora() + CACHE_TTL_MS });
      return resultado;
    } catch (erro) {
      cache.delete(chave);
      throw erro;
    }
  }

  return { buscarClimaDaPropriedade };
}

const climaService = criarClimaService();
module.exports = { ...climaService, criarClimaService };
