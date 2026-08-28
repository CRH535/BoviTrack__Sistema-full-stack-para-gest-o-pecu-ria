import { useContext } from "react";
import BlackHoleTransitionContext from "./black-hole-transition-context";

export function useBlackHoleTransition() {
  const contexto = useContext(BlackHoleTransitionContext);

  if (!contexto) {
    throw new Error(
      "useBlackHoleTransition deve ser usado dentro de BlackHoleTransitionProvider",
    );
  }

  return contexto;
}
