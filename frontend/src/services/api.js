import axios from "axios";

const TOKEN_KEY = "agrocontrol_token";
const USER_KEY = "agrocontrol_usuario";
const ROTAS_SEM_RENOVACAO = new Set([
  "/auth/login",
  "/auth/cadastro",
  "/auth/refresh",
  "/auth/logout",
]);

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

let renovacaoEmAndamento = null;

function limparSessaoLocal() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function redirecionarParaLogin() {
  const rotaPublica = ["/login", "/cadastro"].includes(window.location.pathname);

  if (!rotaPublica) {
    window.location.assign("/login");
  }
}

async function renovarToken() {
  if (!renovacaoEmAndamento) {
    const requisicao = api
      .post("/auth/refresh", null, { ignorarRenovacao: true })
      .then((resposta) => {
        const { token, usuario } = resposta.data;

        localStorage.setItem(TOKEN_KEY, token);

        if (usuario) {
          localStorage.setItem(USER_KEY, JSON.stringify(usuario));
        }

        return token;
      });

    renovacaoEmAndamento = requisicao.finally(() => {
      renovacaoEmAndamento = null;
    });
  }

  return renovacaoEmAndamento;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requisicaoOriginal = error.config;
    const rota = requisicaoOriginal?.url;
    const podeRenovar =
      error.response?.status === 401 &&
      requisicaoOriginal &&
      !requisicaoOriginal.ignorarRenovacao &&
      !requisicaoOriginal.tentouRenovar &&
      !ROTAS_SEM_RENOVACAO.has(rota);

    if (!podeRenovar) {
      return Promise.reject(error);
    }

    requisicaoOriginal.tentouRenovar = true;

    try {
      const novoToken = await renovarToken();

      requisicaoOriginal.headers.Authorization = "Bearer " + novoToken;
      return api(requisicaoOriginal);
    } catch (erroRenovacao) {
      const status = erroRenovacao.response?.status;

      if (status === 401 || status === 403) {
        limparSessaoLocal();
        redirecionarParaLogin();
      }

      return Promise.reject(erroRenovacao);
    }
  },
);

export default api;
