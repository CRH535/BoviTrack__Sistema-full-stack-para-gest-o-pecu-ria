import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import TutorialDialog from "../components/tutorial/TutorialDialog";
import TutorialOverlay from "../components/tutorial/TutorialOverlay";
import { usePreferences } from "../preferences/usePreferences";
import TutorialContext from "./tutorial-context";
import { tutorialSteps } from "./tutorialSteps";

const PHASE_IDLE = "idle";

function clampStep(step) {
  if (!Number.isInteger(step)) return 0;
  return Math.min(Math.max(step, 0), tutorialSteps.length - 1);
}

export function TutorialProvider({ children }) {
  const { usuario } = useAuth();
  const { getTutorialState, setTutorialState } = usePreferences();
  const location = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState(PHASE_IDLE);
  const [stepIndex, setStepIndex] = useState(0);
  const [toast, setToast] = useState("");
  const phaseRef = useRef(PHASE_IDLE);
  const activeUserRef = useRef(usuario?.id ?? null);
  const previousFocusRef = useRef(null);

  const changePhase = useCallback((nextPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const rememberFocus = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      previousFocusRef.current = document.activeElement;
    }
  }, []);

  const restoreFocus = useCallback(() => {
    requestAnimationFrame(() => {
      const previous = previousFocusRef.current;
      if (previous?.isConnected) {
        previous.focus();
      } else {
        document.querySelector(".page-content")?.focus();
      }
      previousFocusRef.current = null;
    });
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 4800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const currentUserId = usuario?.id ?? null;
    if (activeUserRef.current === currentUserId) return;

    activeUserRef.current = currentUserId;
    setStepIndex(0);
    changePhase(PHASE_IDLE);
    setToast("");
    previousFocusRef.current = null;
  }, [changePhase, usuario?.id]);

  useEffect(() => {
    if (!usuario || phaseRef.current !== PHASE_IDLE) return undefined;

    const persistedState = getTutorialState(usuario.id);
    if (persistedState.status === "in_progress") {
      const frame = requestAnimationFrame(() => {
        rememberFocus();
        setStepIndex(clampStep(persistedState.step));
        changePhase("tour");
      });
      return () => cancelAnimationFrame(frame);
    }

    if (persistedState.status !== "never_started" || location.pathname !== "/") {
      return undefined;
    }

    let cancelled = false;
    let frame = 0;
    const waitForDashboard = () => {
      if (cancelled) return;
      const transitionActive = document.documentElement.classList.contains(
        "black-hole-transition-active",
      );
      const dashboardReady = document.querySelector('[data-tour="dashboard"]');

      if (!transitionActive && dashboardReady) {
        rememberFocus();
        changePhase("welcome");
        return;
      }
      frame = requestAnimationFrame(waitForDashboard);
    };

    frame = requestAnimationFrame(waitForDashboard);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [
    changePhase,
    getTutorialState,
    location.pathname,
    rememberFocus,
    usuario,
  ]);

  useEffect(() => {
    if (phase !== "tour") return;
    const expectedRoute = tutorialSteps[stepIndex].route;
    if (location.pathname !== expectedRoute) navigate(expectedRoute);
  }, [location.pathname, navigate, phase, stepIndex]);

  useEffect(() => {
    const tutorialActive = phase !== PHASE_IDLE;
    const appShell = document.querySelector(".app-shell");
    if (!tutorialActive || !appShell) return undefined;

    appShell.setAttribute("inert", "");
    return () => appShell.removeAttribute("inert");
  }, [location.pathname, phase]);

  const startTutorial = useCallback(() => {
    if (!usuario) return;
    rememberFocus();
    setStepIndex(0);
    setTutorialState(usuario.id, { status: "in_progress", step: 0 });
    changePhase("tour");
  }, [changePhase, rememberFocus, setTutorialState, usuario]);

  const restartTutorial = useCallback(() => {
    startTutorial();
  }, [startTutorial]);

  const skipWelcome = useCallback(() => {
    if (!usuario) return;
    setTutorialState(usuario.id, { status: "skipped", step: 0 });
    changePhase(PHASE_IDLE);
    showToast(
      "Sem problemas. Você pode fazer o tutorial quando quiser em Configurações > Tutorial.",
    );
    restoreFocus();
  }, [changePhase, restoreFocus, setTutorialState, showToast, usuario]);

  const goToStep = useCallback(
    (nextStep) => {
      if (!usuario) return;
      const normalizedStep = clampStep(nextStep);
      setStepIndex(normalizedStep);
      setTutorialState(usuario.id, {
        status: "in_progress",
        step: normalizedStep,
      });
    },
    [setTutorialState, usuario],
  );

  const nextStep = useCallback(() => {
    if (stepIndex === tutorialSteps.length - 1) {
      changePhase("completion");
      return;
    }
    goToStep(stepIndex + 1);
  }, [changePhase, goToStep, stepIndex]);

  const previousStep = useCallback(() => {
    goToStep(stepIndex - 1);
  }, [goToStep, stepIndex]);

  const skipStep = useCallback(() => {
    goToStep(stepIndex + 1);
  }, [goToStep, stepIndex]);

  const requestExit = useCallback(() => {
    changePhase("exit-confirmation");
  }, [changePhase]);

  const continueTutorial = useCallback(() => {
    changePhase("tour");
  }, [changePhase]);

  const exitTutorial = useCallback(() => {
    if (!usuario) return;
    setTutorialState(usuario.id, { status: "skipped", step: stepIndex });
    changePhase(PHASE_IDLE);
    showToast(
      "Tutorial encerrado. Você pode refazê-lo em Configurações > Tutorial.",
    );
    restoreFocus();
  }, [
    changePhase,
    restoreFocus,
    setTutorialState,
    showToast,
    stepIndex,
    usuario,
  ]);

  const completeTutorial = useCallback(() => {
    if (!usuario) return;
    setTutorialState(usuario.id, {
      status: "completed",
      step: tutorialSteps.length - 1,
    });
    changePhase(PHASE_IDLE);
    navigate("/");
    showToast("Tutorial concluído! Você pode revê-lo em Configurações > Tutorial.");
    restoreFocus();
  }, [changePhase, navigate, restoreFocus, setTutorialState, showToast, usuario]);

  const contextValue = useMemo(
    () => ({
      restartTutorial,
      tutorialActive: phase !== PHASE_IDLE,
      tutorialStatus: usuario ? getTutorialState(usuario.id).status : "never_started",
    }),
    [getTutorialState, phase, restartTutorial, usuario],
  );

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}

      {phase === "welcome" && (
        <TutorialDialog
          eyebrow="Bem-vindo ao BoviTrack"
          title="Conheça o BoviTrack"
          description="Em poucos passos vamos mostrar onde ficam as principais ferramentas para você gerenciar seu rebanho. Quer fazer um tutorial rápido?"
          onEscape={skipWelcome}
          actions={[
            {
              label: "Agora não",
              variant: "ghost",
              onClick: skipWelcome,
            },
            {
              label: "Iniciar tutorial",
              onClick: startTutorial,
              autoFocus: true,
            },
          ]}
        />
      )}

      {phase === "tour" && (
        <TutorialOverlay
          key={tutorialSteps[stepIndex].id}
          step={tutorialSteps[stepIndex]}
          stepIndex={stepIndex}
          totalSteps={tutorialSteps.length}
          onPrevious={previousStep}
          onNext={nextStep}
          onSkip={skipStep}
          onExit={requestExit}
        />
      )}

      {phase === "exit-confirmation" && (
        <TutorialDialog
          eyebrow="Tutorial do BoviTrack"
          title="Deseja sair do tutorial?"
          description="Você poderá fazê-lo novamente a qualquer momento em Configurações > Tutorial."
          onEscape={continueTutorial}
          actions={[
            {
              label: "Sair do tutorial",
              variant: "danger",
              onClick: exitTutorial,
            },
            {
              label: "Continuar tutorial",
              onClick: continueTutorial,
              autoFocus: true,
            },
          ]}
        />
      )}

      {phase === "completion" && (
        <TutorialDialog
          eyebrow="Visita guiada finalizada"
          title="Tutorial concluído!"
          description="Agora você já conhece as principais ferramentas do BoviTrack. Se quiser rever alguma coisa, inicie novamente em Configurações > Tutorial."
          actions={[
            {
              label: "Concluir",
              onClick: completeTutorial,
              autoFocus: true,
            },
          ]}
        />
      )}

      {toast &&
        createPortal(
          <div className="tutorial-toast" role="status" aria-live="polite">
            {toast}
          </div>,
          document.body,
        )}
    </TutorialContext.Provider>
  );
}
