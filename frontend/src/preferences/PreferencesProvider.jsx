import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import PreferencesContext from "./preferences-context";

const STORAGE_KEY = "bovitrack_preferences";
const DEFAULT_PREFERENCES = Object.freeze({ theme: "system" });
const THEMES = new Set(["light", "dark", "system"]);

function normalizarPreferencias(valor) {
  if (!valor || typeof valor !== "object") return DEFAULT_PREFERENCES;

  return {
    ...DEFAULT_PREFERENCES,
    ...valor,
    theme: THEMES.has(valor.theme) ? valor.theme : DEFAULT_PREFERENCES.theme,
  };
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
  root.style.backgroundColor = resolvedTheme === "dark" ? "#0c1512" : "#f4f7f5";
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

  const value = useMemo(
    () => ({ preferences, theme, resolvedTheme, setTheme }),
    [preferences, theme, resolvedTheme, setTheme],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
