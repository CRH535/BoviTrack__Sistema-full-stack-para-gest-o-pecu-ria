import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");
const CHAVES_AUTH_LEGADAS = ["bovitrack_token", "bovitrack_usuario", "agrocontrol_token", "agrocontrol_usuario"];
const ROTAS_SEM_RENOVACAO = new Set(["/auth/login", "/auth/cadastro", "/auth/refresh", "/auth/logout", "/auth/logout-all"]);

// A preferência visual continua no localStorage. Somente artefatos antigos de
// autenticação são removidos durante a migração para token em memória.
for (const chave of CHAVES_AUTH_LEGADAS) localStorage.removeItem(chave);

const api = axios.create({ baseURL: API_URL, withCredentials: true });
let tokenAcesso = null;
let renovacaoEmAndamento = null;
let logoutEmAndamento = false;

export function definirTokenAcesso(token) {
  tokenAcesso = typeof token === "string" && token ? token : null;
}

export function obterTokenAcesso() {
  return tokenAcesso;
}

export function limparTokenAcesso() {
  tokenAcesso = null;
}

export function definirLogoutEmAndamento(valor) {
  logoutEmAndamento = Boolean(valor);
}

function notificarSessaoEncerrada() {
  limparTokenAcesso();
  window.dispatchEvent(new CustomEvent("bovitrack:sessao-encerrada"));
}

function aguardar(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function executarRenovacao(tentativaConcorrente = false) {
  try {
    const resposta = await api.post("/auth/refresh", null, { ignorarRenovacao: true });
    definirTokenAcesso(resposta.data.token);
    return resposta.data;
  } catch (erro) {
    // Outra aba pode ter rotacionado o cookie enquanto esta requisição estava
    // em trânsito. Uma única repetição usa o cookie atualizado pelo browser.
    if (!tentativaConcorrente && erro.response?.status === 409 && erro.response?.data?.codigo === "REFRESH_CONCORRENTE") {
      await aguardar(150);
      return executarRenovacao(true);
    }
    throw erro;
  }
}

export function renovarSessao() {
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = executarRenovacao().finally(() => {
      renovacaoEmAndamento = null;
    });
  }
  return renovacaoEmAndamento;
}

api.interceptors.request.use((config) => {
  if (tokenAcesso && !config.headers.Authorization) config.headers.Authorization = `Bearer ${tokenAcesso}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requisicaoOriginal = error.config;
    const rota = String(requisicaoOriginal?.url || "").split("?")[0];
    const podeRenovar = !logoutEmAndamento && error.response?.status === 401 && requisicaoOriginal &&
      !requisicaoOriginal.ignorarRenovacao && !requisicaoOriginal.tentouRenovar && !ROTAS_SEM_RENOVACAO.has(rota);

    if (!podeRenovar) return Promise.reject(error);
    requisicaoOriginal.tentouRenovar = true;

    try {
      const { token } = await renovarSessao();
      requisicaoOriginal.headers.Authorization = `Bearer ${token}`;
      return api(requisicaoOriginal);
    } catch (erroRenovacao) {
      if ([400, 401, 403].includes(erroRenovacao.response?.status)) notificarSessaoEncerrada();
      return Promise.reject(erroRenovacao);
    }
  },
);

// Mantém as telas compatíveis com paginação server-side: cada resposta do
// backend permanece limitada e este helper reúne as páginas necessárias.
api.getAll = async function getAll(url, config = {}) {
  const acumulado = [];
  let pagina = 1;
  let ultimaResposta;
  do {
    ultimaResposta = await api.get(url, { ...config, params: { ...config.params, page: pagina, limit: 100 } });
    const itens = Array.isArray(ultimaResposta.data) ? ultimaResposta.data : [];
    acumulado.push(...itens);
    pagina += 1;
  } while (ultimaResposta.headers["x-has-more"] === "true" && pagina <= 100);
  return { ...ultimaResposta, data: acumulado };
};

api.getAllNested = async function getAllNested(url, campo, config = {}) {
  let pagina = 1;
  let respostaCombinada;
  const itens = [];
  do {
    const resposta = await api.get(url, { ...config, params: { ...config.params, page: pagina, limit: 100 } });
    if (!respostaCombinada) respostaCombinada = { ...resposta, data: { ...resposta.data } };
    itens.push(...(Array.isArray(resposta.data?.[campo]) ? resposta.data[campo] : []));
    pagina += 1;
    if (resposta.headers["x-has-more"] !== "true") break;
  } while (pagina <= 100);
  respostaCombinada.data[campo] = itens;
  return respostaCombinada;
};

export default api;
