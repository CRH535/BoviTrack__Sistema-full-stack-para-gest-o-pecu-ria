import { Link } from "react-router-dom";

function VoltarInicio({ className = "" }) {
  return (
    <Link
      className={`button-secondary button-link back-home-button ${className}`.trim()}
      to="/"
      aria-label="Voltar ao Dashboard Inicial"
    >
      <span className="back-home-icon" aria-hidden="true">←</span>
      Voltar ao Início
    </Link>
  );
}

export default VoltarInicio;
