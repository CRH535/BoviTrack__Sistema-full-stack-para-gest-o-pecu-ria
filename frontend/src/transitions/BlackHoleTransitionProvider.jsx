import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BlackHoleTransition from "../components/transitions/BlackHoleTransition";
import BlackHoleTransitionContext from "./black-hole-transition-context";

const FASE_INICIAL = "idle";

function normalizarCaminho(destino) {
  return destino.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
}

function escopoDoDestino(destino) {
  const caminho = normalizarCaminho(destino);

  if (caminho === "/") {
    return "dashboard";
  }

  return caminho === "/login" ? "login" : "route";
}

export function BlackHoleTransitionProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [fase, setFase] = useState(FASE_INICIAL);
  const [destinoAtivo, setDestinoAtivo] = useState("/");
  const faseRef = useRef(FASE_INICIAL);
  const destinoRef = useRef("/");
  const caminhoEsperadoRef = useRef("/");
  const escopoEsperadoRef = useRef("dashboard");
  const destinoProntoRef = useRef(false);
  const coberturaConcluidaRef = useRef(false);
  const operacaoConcluidaRef = useRef(true);
  const navegacaoRealizadaRef = useRef(false);
  const aoNavegarRef = useRef(null);
  const revelacaoAgendadaRef = useRef(false);
  const primeiroFrameRef = useRef(null);
  const segundoFrameRef = useRef(null);

  const transicaoAtiva = fase !== FASE_INICIAL;

  const alterarFase = useCallback((proximaFase) => {
    faseRef.current = proximaFase;
    setFase(proximaFase);
  }, []);

  const cancelarFrames = useCallback(() => {
    if (primeiroFrameRef.current !== null) {
      cancelAnimationFrame(primeiroFrameRef.current);
      primeiroFrameRef.current = null;
    }

    if (segundoFrameRef.current !== null) {
      cancelAnimationFrame(segundoFrameRef.current);
      segundoFrameRef.current = null;
    }

    revelacaoAgendadaRef.current = false;
  }, []);

  const agendarRevelacao = useCallback(() => {
    if (
      faseRef.current !== "covered" ||
      !destinoProntoRef.current ||
      revelacaoAgendadaRef.current
    ) {
      return;
    }

    revelacaoAgendadaRef.current = true;
    primeiroFrameRef.current = requestAnimationFrame(() => {
      primeiroFrameRef.current = null;
      segundoFrameRef.current = requestAnimationFrame(() => {
        segundoFrameRef.current = null;
        revelacaoAgendadaRef.current = false;

        if (faseRef.current === "covered" && destinoProntoRef.current) {
          alterarFase("revealing");
        }
      });
    });
  }, [alterarFase]);

  const navegarQuandoPossivel = useCallback(() => {
    if (
      !coberturaConcluidaRef.current ||
      !operacaoConcluidaRef.current ||
      navegacaoRealizadaRef.current
    ) {
      return;
    }

    navegacaoRealizadaRef.current = true;

    try {
      aoNavegarRef.current?.();
    } finally {
      aoNavegarRef.current = null;
      navigate(destinoRef.current, { replace: true });
    }
  }, [navigate]);

  const iniciarTransicao = useCallback(
    (destino = "/", opcoes = {}) => {
      if (faseRef.current !== FASE_INICIAL) {
        return false;
      }

      cancelarFrames();
      destinoRef.current = destino;
      setDestinoAtivo(destino);
      caminhoEsperadoRef.current = normalizarCaminho(destino);
      escopoEsperadoRef.current = escopoDoDestino(destino);
      destinoProntoRef.current = false;
      coberturaConcluidaRef.current = false;
      operacaoConcluidaRef.current = !opcoes.aguardarOperacao;
      navegacaoRealizadaRef.current = false;
      aoNavegarRef.current = null;

      alterarFase("absorbing");
      return true;
    },
    [alterarFase, cancelarFrames],
  );

  const sinalizarOperacaoConcluida = useCallback(
    (aoNavegar) => {
      if (faseRef.current === FASE_INICIAL) {
        return;
      }

      operacaoConcluidaRef.current = true;
      aoNavegarRef.current = aoNavegar || null;
      navegarQuandoPossivel();
    },
    [navegarQuandoPossivel],
  );

  const sinalizarDestinoPronto = useCallback(
    (escopo) => {
      if (
        faseRef.current === FASE_INICIAL ||
        escopo !== escopoEsperadoRef.current
      ) {
        return;
      }

      destinoProntoRef.current = true;
      agendarRevelacao();
    },
    [agendarRevelacao],
  );

  const concluirFaseVisual = useCallback(() => {
    if (faseRef.current === "absorbing") {
      alterarFase("covered");
      coberturaConcluidaRef.current = true;
      navegarQuandoPossivel();

      return;
    }

    if (faseRef.current === "revealing") {
      cancelarFrames();
      destinoProntoRef.current = false;
      coberturaConcluidaRef.current = false;
      operacaoConcluidaRef.current = true;
      navegacaoRealizadaRef.current = false;
      aoNavegarRef.current = null;
      alterarFase(FASE_INICIAL);

      primeiroFrameRef.current = requestAnimationFrame(() => {
        primeiroFrameRef.current = null;
        document.querySelector(".page-content")?.focus({ preventScroll: true });
      });
    }
  }, [alterarFase, cancelarFrames, navegarQuandoPossivel]);

  useEffect(() => cancelarFrames, [cancelarFrames]);

  useEffect(() => {
    if (faseRef.current !== "covered") {
      return;
    }

    const caminhoAtual = normalizarCaminho(location.pathname);

    if (caminhoAtual === caminhoEsperadoRef.current) {
      return;
    }

    cancelarFrames();
    caminhoEsperadoRef.current = caminhoAtual;
    escopoEsperadoRef.current = escopoDoDestino(caminhoAtual);
    destinoProntoRef.current = false;
  }, [cancelarFrames, location.pathname]);

  useEffect(() => {
    if (!transicaoAtiva) {
      return undefined;
    }

    const overflowAnterior = document.body.style.overflow;
    document.documentElement.classList.add("black-hole-transition-active");
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.classList.remove("black-hole-transition-active");
      document.body.style.overflow = overflowAnterior;
    };
  }, [transicaoAtiva]);

  const valorContexto = useMemo(
    () => ({
      transicaoAtiva,
      iniciarTransicao,
      sinalizarDestinoPronto,
      sinalizarOperacaoConcluida,
    }),
    [
      iniciarTransicao,
      sinalizarDestinoPronto,
      sinalizarOperacaoConcluida,
      transicaoAtiva,
    ],
  );

  return (
    <BlackHoleTransitionContext.Provider value={valorContexto}>
      <div
        className={`black-hole-surface black-hole-surface--${fase}`}
        aria-busy={transicaoAtiva}
        inert={transicaoAtiva ? true : undefined}
      >
        {children}
      </div>
      <BlackHoleTransition
        fase={fase}
        destino={destinoAtivo}
        aoConcluirFase={concluirFaseVisual}
      />
    </BlackHoleTransitionContext.Provider>
  );
}
