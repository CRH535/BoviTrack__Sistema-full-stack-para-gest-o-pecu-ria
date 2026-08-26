import axios from "axios";

const TOKEN_KEY = "bovitrack_token";
const USER_KEY = "bovitrack_usuario";
const TOKEN_KEY_LEGADO = "agrocontrol_token";
const USER_KEY_LEGADO = "agrocontrol_usuario";
const ROTAS_SEM_RENOVACAO = new Set([
  "/auth/login",
  "/auth/cadastro",
  "/auth/refresh",
  "/auth/logout",
]);

function migrarSessaoLegada() {
  const tokenLegado = localStorage.getItem(TOKEN_KEY_LEGADO);
  const usuarioLegado = localStorage.getItem(USER_KEY_LEGADO);

  if (!localStorage.getItem(TOKEN_KEY) && tokenLegado) {
    localStorage.setItem(TOKEN_KEY, tokenLegado);
  }

  if (!localStorage.getItem(USER_KEY) && usuarioLegado) {
    localStorage.setItem(USER_KEY, usuarioLegado);
  }

  localStorage.removeItem(TOKEN_KEY_LEGADO);
  localStorage.removeItem(USER_KEY_LEGADO);
}

migrarSessaoLegada();

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

let renovacaoEmAndamento = null;

function limparSessaoLocal() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY_LEGADO);
  localStorage.removeItem(USER_KEY_LEGADO);
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
