import animaisIcon from "../assets/icons/pecuaria/animais.png";
import animaisLotesIcon from "../assets/icons/pecuaria/animais-lotes.png";
import identificacaoIcon from "../assets/icons/pecuaria/identificacao.png";
import lotesIcon from "../assets/icons/pecuaria/lotes.png";
import producaoIcon from "../assets/icons/pecuaria/producao.png";
import proximasVacinasIcon from "../assets/icons/pecuaria/proximas-vacinas.png";
import vacinacoesIcon from "../assets/icons/pecuaria/vacinacoes.png";
import vacinasIcon from "../assets/icons/pecuaria/vacinas.png";
import despesasIcon from "../assets/icons/sistema/despesas.png";
import inicioIcon from "../assets/icons/sistema/inicio.png";
import propriedadesIcon from "../assets/icons/sistema/propriedades.png";
import sairIcon from "../assets/icons/sistema/sair.png";
import usuariosIcon from "../assets/icons/sistema/usuarios.png";

const icones = {
  animais: animaisIcon,
  "animais-lotes": animaisLotesIcon,
  despesas: despesasIcon,
  identificacao: identificacaoIcon,
  inicio: inicioIcon,
  lotes: lotesIcon,
  producao: producaoIcon,
  propriedades: propriedadesIcon,
  "proximas-vacinas": proximasVacinasIcon,
  sair: sairIcon,
  usuarios: usuariosIcon,
  vacinacoes: vacinacoesIcon,
  vacinas: vacinasIcon,
};

function IconeImagem({ nome, className = "" }) {
  const origem = icones[nome];

  if (!origem) return null;

  return (
    <img
      className={`app-image-icon ${className}`.trim()}
      src={origem}
      alt=""
      aria-hidden="true"
      draggable="false"
    />
  );
}

export default IconeImagem;
