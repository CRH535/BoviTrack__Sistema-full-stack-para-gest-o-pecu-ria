import { useRef, useState } from "react";

function PasswordInput({ rotulo = "senha", ...inputProps }) {
  const [visivel, setVisivel] = useState(false);
  const inputRef = useRef(null);
  const acao = `${visivel ? "Ocultar" : "Mostrar"} ${rotulo.toLowerCase()}`;

  function alternarVisibilidade() {
    setVisivel((valor) => !valor);
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className="password-field">
      <input
        {...inputProps}
        ref={inputRef}
        type={visivel ? "text" : "password"}
      />
      <button
        className="password-toggle"
        type="button"
        aria-label={acao}
        aria-pressed={visivel}
        onClick={alternarVisibilidade}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
          <path
            d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          {visivel && (
            <path d="M3 21 21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </button>
    </div>
  );
}

export default PasswordInput;
