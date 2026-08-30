import { useEffect, useRef, useState } from "react";
import api, {
  definirLogoutEmAndamento,
  definirTokenAcesso,
  limparTokenAcesso,
  obterTokenAcesso,
  renovarSessao,
} from "../services/api";
import AuthContext from "./auth-context";

const CANAL_AUTH = "bovitrack-auth";
const CHAVE_EVENTO_AUTH = "bovitrack_auth_event";
const CHAVE_LOGOUT_PENDENTE = "bovitrack_logout_pending";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const canalRef = useRef(null);

  useEffect(() => {
    const encerrarLocalmente = () => {
      limparTokenAcesso();
      setUsuario(null);
      setCarregando(false);
    };

    const canal = "BroadcastChannel" in window ? new BroadcastChannel(CANAL_AUTH) : null;
    canalRef.current = canal;
    if (canal) canal.onmessage = (evento) => {
      if (evento.data?.tipo === "logout") encerrarLocalmente();
    };
    const receberStorage = (evento) => {
      if (evento.key === CHAVE_EVENTO_AUTH && evento.newValue) encerrarLocalmente();
    };
    window.addEventListener("bovitrack:sessao-encerrada", encerrarLocalmente);
    window.addEventListener("storage", receberStorage);

    async function restaurarSessao() {
      try {
        if (localStorage.getItem(CHAVE_LOGOUT_PENDENTE)) {
          await api.post("/auth/logout", null, { ignorarRenovacao: true });
          localStorage.removeItem(CHAVE_LOGOUT_PENDENTE);
          encerrarLocalmente();
          return;
        }
        await renovarSessao();
        const resposta = await api.get("/auth/me");
        setUsuario(resposta.data.usuario);
      } catch (erro) {
        if (![400, 401, 403].includes(erro.response?.status)) {
          console.error("Não foi possível restaurar a sessão");
        }
        encerrarLocalmente();
      } finally {
        setCarregando(false);
      }
    }

    restaurarSessao();
    return () => {
      window.removeEventListener("bovitrack:sessao-encerrada", encerrarLocalmente);
      window.removeEventListener("storage", receberStorage);
      canal?.close();
    };
  }, []);

  function avisarOutrasAbas() {
    canalRef.current?.postMessage({ tipo: "logout" });
    localStorage.setItem(CHAVE_EVENTO_AUTH, String(Date.now()));
    localStorage.removeItem(CHAVE_EVENTO_AUTH);
  }

  async function login(email, senha) {
    const resposta = await api.post("/auth/login", { email, senha });
    localStorage.removeItem(CHAVE_LOGOUT_PENDENTE);
    definirTokenAcesso(resposta.data.token);
    setUsuario(resposta.data.usuario);
  }

  async function logout({ manterInterface = false } = {}) {
    const token = obterTokenAcesso();
    definirLogoutEmAndamento(true);
    limparTokenAcesso();
    avisarOutrasAbas();
    localStorage.setItem(CHAVE_LOGOUT_PENDENTE, "1");

    try {
      await api.post("/auth/logout", null, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      localStorage.removeItem(CHAVE_LOGOUT_PENDENTE);
    } catch {
      // A sessão local já foi encerrada e não é reativada por uma falha de rede.
      console.error("Não foi possível confirmar o logout no servidor");
    } finally {
      if (!manterInterface) {
        setUsuario(null);
        definirLogoutEmAndamento(false);
      }
    }
  }

  async function logoutTodosDispositivos() {
    await api.post("/auth/logout-all");
    localStorage.removeItem(CHAVE_LOGOUT_PENDENTE);
    limparTokenAcesso();
    avisarOutrasAbas();
    setUsuario(null);
  }

  function finalizarLogoutVisual() {
    setUsuario(null);
    definirLogoutEmAndamento(false);
  }

  function atualizarUsuario(usuarioAtualizado) {
    setUsuario(usuarioAtualizado);
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      autenticado: Boolean(usuario),
      carregando,
      login,
      logout,
      logoutTodosDispositivos,
      finalizarLogoutVisual,
      atualizarUsuario,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
