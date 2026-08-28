import { useEffect, useState } from "react";
import api, { definirLogoutEmAndamento } from "../services/api";
import AuthContext from "./auth-context";

const TOKEN_KEY = "bovitrack_token";
const USER_KEY = "bovitrack_usuario";
const TOKEN_KEY_LEGADO = "agrocontrol_token";
const USER_KEY_LEGADO = "agrocontrol_usuario";

function limparSessaoLocal() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY_LEGADO);
  localStorage.removeItem(USER_KEY_LEGADO);
}

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

function lerUsuarioSalvo() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function restaurarSessao() {
      try {
        const resposta = await api.get("/auth/me");
        setUsuario(resposta.data.usuario);
        localStorage.setItem(USER_KEY, JSON.stringify(resposta.data.usuario));
      } catch (erro) {
        const status = erro.response?.status;

        if (status === 401 || status === 403) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY_LEGADO);
          localStorage.removeItem(USER_KEY_LEGADO);
          setUsuario(null);
        } else {
          setUsuario(lerUsuarioSalvo());
        }
      } finally {
        setCarregando(false);
      }
    }

    restaurarSessao();
  }, []);

  async function login(email, senha) {
    const resposta = await api.post("/auth/login", { email, senha });
    const { token, usuario: usuarioAutenticado } = resposta.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuarioAutenticado));
    setUsuario(usuarioAutenticado);
  }

  async function logout({ manterInterface = false } = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    definirLogoutEmAndamento(true);

    if (manterInterface) {
      limparSessaoLocal();
    }

    try {
      await api.post("/auth/logout", null, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    } catch (erro) {
      console.error("Não foi possível confirmar o logout no servidor", erro);
    } finally {
      limparSessaoLocal();

      if (!manterInterface) {
        setUsuario(null);
        definirLogoutEmAndamento(false);
      }
    }
  }

  function finalizarLogoutVisual() {
    setUsuario(null);
    definirLogoutEmAndamento(false);
  }

  function atualizarUsuario(usuarioAtualizado) {
    localStorage.setItem(USER_KEY, JSON.stringify(usuarioAtualizado));
    setUsuario(usuarioAtualizado);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado: Boolean(usuario),
        carregando,
        login,
        logout,
        finalizarLogoutVisual,
        atualizarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
