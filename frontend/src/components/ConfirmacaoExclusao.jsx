import { useEffect, useState } from "react";

function ConfirmacaoExclusao({
  aberto,
  titulo,
  mensagem,
  confirmacaoExigida,
  processando = false,
  onCancelar,
  onConfirmar,
}) {
  const [confirmacao, setConfirmacao] = useState("");

  useEffect(() => {
    if (!aberto) return undefined;

    function fecharComEscape(evento) {
      if (evento.key === "Escape" && !processando) {
        setConfirmacao("");
        onCancelar();
      }
    }

    document.addEventListener("keydown", fecharComEscape);
    return () => document.removeEventListener("keydown", fecharComEscape);
  }, [aberto, onCancelar, processando]);

  if (!aberto) return null;

  const confirmacaoValida =
    !confirmacaoExigida || confirmacao === confirmacaoExigida;

  function cancelar() {
    if (processando) return;

    setConfirmacao("");
    onCancelar();
  }

  function confirmar(evento) {
    evento.preventDefault();

    if (confirmacaoValida && !processando) {
      setConfirmacao("");
      onConfirmar();
    }
  }

  return (
    <div className="dialog-backdrop">
      <section
        className="panel confirmation-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
      >
        <span className="danger-kicker">Ação permanente</span>
        <h2 id="confirmation-dialog-title">{titulo}</h2>
        <p>{mensagem}</p>

        <form onSubmit={confirmar}>
          {confirmacaoExigida && (
            <div className="confirmation-field">
              <label htmlFor="confirmation-text">
                Digite <strong>{confirmacaoExigida}</strong> para confirmar
              </label>
              <input
                id="confirmation-text"
                type="text"
                value={confirmacao}
                onChange={(evento) => setConfirmacao(evento.target.value)}
                autoComplete="off"
                autoFocus
                disabled={processando}
              />
            </div>
          )}

          <div className="confirmation-actions">
            <button
              className="button-secondary"
              type="button"
              onClick={cancelar}
              disabled={processando}
            >
              Cancelar
            </button>
            <button
              className="button-danger"
              type="submit"
              disabled={!confirmacaoValida || processando}
            >
              {processando ? "Excluindo..." : "Confirmar exclusão"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ConfirmacaoExclusao;
