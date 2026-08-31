import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import PreferencesContext from "./preferences-context";

const STORAGE_KEY = "bovitrack_preferences";
const DEFAULT_TUTORIAL_STATE = Object.freeze({
  status: "never_started",
  step: 0,
});
const DEFAULT_PREFERENCES = Object.freeze({
  theme: "system",
  tutorialByUser: Object.freeze({}),
});
const THEMES = new Set(["light", "dark", "system"]);
const TUTORIAL_STATUSES = new Set([
  "never_started",
  "in_progress",
  "completed",
  "skipped",
]);

function normalizarEstadoTutorial(valor) {
  if (!valor || typeof valor !== "object") return DEFAULT_TUTORIAL_STATE;

  return {
    status: TUTORIAL_STATUSES.has(valor.status)
      ? valor.status
      : DEFAULT_TUTORIAL_STATE.status,
    step: Number.isInteger(valor.step) && valor.step >= 0 ? valor.step : 0,
  };
}

function normalizarTutoriaisPorUsuario(valor) {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return {};

  return Object.fromEntries(
    Object.entries(valor)
      .filter(([usuarioId]) => usuarioId.trim().length > 0)
      .map(([usuarioId, estado]) => [usuarioId, normalizarEstadoTutorial(estado)]),
  );
}

function normalizarPreferencias(valor) {
  if (!valor || typeof valor !== "object") return DEFAULT_PREFERENCES;

  return {
    ...DEFAULT_PREFERENCES,
    ...valor,
    theme: THEMES.has(valor.theme) ? valor.theme : DEFAULT_PREFERENCES.theme,
    tutorialByUser: normalizarTutoriaisPorUsuario(valor.tutorialByUser),
  };
}

function salvarPreferencias(preferencias) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferencias));
  } catch {
    // As preferencias continuam validas nesta aba se o armazenamento estiver indisponivel.
  }
}

function lerPreferencias() {
  try {
    const valorSalvo = localStorage.getItem(STORAGE_KEY);
    return valorSalvo
      ? normalizarPreferencias(JSON.parse(valorSalvo))
      : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function obterTemaDoSistema() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function aplicarTema(theme, resolvedTheme) {
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = theme;
  root.style.colorScheme = resolvedTheme;
  root.style.backgroundColor = resolvedTheme === "dark" ? "#1c1c1c" : "#eef0f2";
}

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(lerPreferencias);
  const [systemTheme, setSystemTheme] = useState(obterTemaDoSistema);
  const theme = preferences.theme;
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useLayoutEffect(() => {
    aplicarTema(theme, resolvedTheme);
  }, [theme, resolvedTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const atualizarTemaDoSistema = (evento) => {
      setSystemTheme(evento.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", atualizarTemaDoSistema);
    return () => mediaQuery.removeEventListener("change", atualizarTemaDoSistema);
  }, []);

  useEffect(() => {
    const sincronizarPreferencias = (evento) => {
      if (evento.key !== STORAGE_KEY) return;

      try {
        setPreferences(
          evento.newValue
            ? normalizarPreferencias(JSON.parse(evento.newValue))
            : DEFAULT_PREFERENCES,
        );
      } catch {
        setPreferences(DEFAULT_PREFERENCES);
      }
    };

    window.addEventListener("storage", sincronizarPreferencias);
    return () => window.removeEventListener("storage", sincronizarPreferencias);
  }, []);

  const setTheme = useCallback((novoTema) => {
    if (!THEMES.has(novoTema)) return;

    setPreferences((preferenciasAtuais) => {
      const novasPreferencias = {
        ...preferenciasAtuais,
        theme: novoTema,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(novasPreferencias));
      } catch {
        // O tema continua funcionando nesta aba mesmo se o armazenamento estiver indisponível.
      }

      return novasPreferencias;
    });
  }, []);

  const getTutorialState = useCallback(
    (usuarioId) => {
      if (usuarioId === null || usuarioId === undefined) return DEFAULT_TUTORIAL_STATE;
      return normalizarEstadoTutorial(preferences.tutorialByUser?.[String(usuarioId)]);
    },
    [preferences.tutorialByUser],
  );

  const setTutorialState = useCallback((usuarioId, estado) => {
    if (usuarioId === null || usuarioId === undefined) return;

    const chaveUsuario = String(usuarioId);
    setPreferences((preferenciasAtuais) => {
      const estadoAtual = normalizarEstadoTutorial(
        preferenciasAtuais.tutorialByUser?.[chaveUsuario],
      );
      const alteracao = typeof estado === "function" ? estado(estadoAtual) : estado;
      const proximoEstado = normalizarEstadoTutorial({
        ...estadoAtual,
        ...alteracao,
      });
      const novasPreferencias = {
        ...preferenciasAtuais,
        tutorialByUser: {
          ...preferenciasAtuais.tutorialByUser,
          [chaveUsuario]: proximoEstado,
        },
      };

      salvarPreferencias(novasPreferencias);
      return novasPreferencias;
    });
  }, []);

  const value = useMemo(
    () => ({
      preferences,
      theme,
      resolvedTheme,
      setTheme,
      getTutorialState,
      setTutorialState,
    }),
    [
      preferences,
      theme,
      resolvedTheme,
      setTheme,
      getTutorialState,
      setTutorialState,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
