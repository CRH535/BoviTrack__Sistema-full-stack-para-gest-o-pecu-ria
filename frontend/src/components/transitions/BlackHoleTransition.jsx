const PARTICULAS = [
  { angulo: "5deg", distancia: "43vmax", atraso: "-80ms", tamanho: "3px" },
  { angulo: "32deg", distancia: "37vmax", atraso: "-360ms", tamanho: "2px" },
  { angulo: "61deg", distancia: "45vmax", atraso: "-190ms", tamanho: "4px" },
  { angulo: "91deg", distancia: "39vmax", atraso: "-520ms", tamanho: "2px" },
  { angulo: "119deg", distancia: "46vmax", atraso: "-250ms", tamanho: "3px" },
  { angulo: "151deg", distancia: "38vmax", atraso: "-610ms", tamanho: "2px" },
  { angulo: "181deg", distancia: "44vmax", atraso: "-120ms", tamanho: "4px" },
  { angulo: "210deg", distancia: "36vmax", atraso: "-430ms", tamanho: "2px" },
  { angulo: "239deg", distancia: "47vmax", atraso: "-300ms", tamanho: "3px" },
  { angulo: "271deg", distancia: "40vmax", atraso: "-570ms", tamanho: "2px" },
  { angulo: "301deg", distancia: "45vmax", atraso: "-210ms", tamanho: "4px" },
  { angulo: "333deg", distancia: "38vmax", atraso: "-470ms", tamanho: "2px" },
];

function BlackHoleTransition({ fase, destino, aoConcluirFase }) {
  if (fase === "idle") {
    return null;
  }

  const transicaoParaLogin = destino === "/login";
  const mensagem = transicaoParaLogin
    ? fase === "revealing"
      ? "Sessão encerrada. Exibindo a tela de login."
      : "Encerrando sua sessão com segurança."
    : fase === "revealing"
      ? "BoviTrack pronto. Exibindo o seu painel."
      : "Abrindo o BoviTrack e preparando o seu painel.";

  function concluirPeloMarcador(evento) {
    if (
      evento.target === evento.currentTarget &&
      evento.animationName === "black-hole-phase-clock"
    ) {
      aoConcluirFase();
    }
  }

  return (
    <>
      <div
        className={`black-hole-transition black-hole-transition--${fase} ${
          transicaoParaLogin
            ? "black-hole-transition--to-login"
            : "black-hole-transition--to-app"
        }`}
        aria-hidden="true"
      >
        <div className="black-hole-transition__starfield" />

        <div className="black-hole-transition__particles">
          {PARTICULAS.map((particula) => (
            <span
              key={particula.angulo}
              style={{
                "--particle-angle": particula.angulo,
                "--particle-distance": particula.distancia,
                "--particle-delay": particula.atraso,
                "--particle-size": particula.tamanho,
              }}
            />
          ))}
        </div>

        <div className="black-hole-transition__stage">
          <div className="black-hole-transition__halo" />
          <div className="black-hole-transition__disc black-hole-transition__disc--back" />
          <div className="black-hole-transition__core">
            <span />
          </div>
          <div className="black-hole-transition__disc black-hole-transition__disc--front" />
          <img
            className="black-hole-transition__brand-mark"
            src="/favicon.svg"
            alt=""
          />
        </div>

        <span
          className="black-hole-transition__phase-clock"
          onAnimationEnd={concluirPeloMarcador}
        />
      </div>

      <p className="black-hole-transition__status" role="status" aria-live="polite">
        {mensagem}
      </p>
    </>
  );
}

export default BlackHoleTransition;
