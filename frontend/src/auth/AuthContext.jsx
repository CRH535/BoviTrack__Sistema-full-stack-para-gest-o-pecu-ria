import { useEffect, useState } from "react";
import api from "../services/api";
import AuthContext from "./auth-context";

const TOKEN_KEY = "agrocontrol_token";
const USER_KEY = "agrocontrol_usuario";

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

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (erro) {
      console.error("Não foi possível confirmar o logout no servidor", erro);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUsuario(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ usuario, autenticado: Boolean(usuario), carregando, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
