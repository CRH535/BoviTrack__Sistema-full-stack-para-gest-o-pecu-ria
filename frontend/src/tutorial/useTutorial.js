import { useContext } from "react";
import TutorialContext from "./tutorial-context";

export function useTutorial() {
  const contexto = useContext(TutorialContext);

  if (!contexto) {
    throw new Error("useTutorial deve ser usado dentro de TutorialProvider.");
  }

  return contexto;
}
