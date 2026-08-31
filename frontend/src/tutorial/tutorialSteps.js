export const tutorialSteps = Object.freeze([
  {
    id: "dashboard",
    route: "/",
    target: '[data-tour="dashboard"]',
    title: "Dashboard inicial",
    description:
      "Esta é a visão geral do BoviTrack. Aqui você acompanha os principais números e encontra atalhos para cuidar do rebanho.",
  },
  {
    id: "propriedades",
    route: "/propriedades",
    target: '[data-tour="propriedades"]',
    title: "Propriedades",
    description:
      "Cadastre e administre as propriedades rurais que organizam os demais registros do sistema.",
  },
  {
    id: "animais",
    route: "/animais",
    target: '[data-tour="animais"]',
    title: "Animais e rebanho",
    description:
      "Consulte os animais cadastrados e acesse a ficha individual com os dados de cada um.",
  },
  {
    id: "lotes",
    route: "/lotes",
    target: '[data-tour="lotes"]',
    title: "Organização em lotes",
    description:
      "Use os lotes para organizar o rebanho e gerenciar os vínculos entre animais e grupos de manejo.",
  },
  {
    id: "vacinacoes",
    route: "/vacinacoes",
    target: '[data-tour="vacinacoes"]',
    title: "Vacinações",
    description:
      "Registre aplicações, consulte o histórico sanitário e acompanhe as próximas vacinações.",
  },
  {
    id: "pesagens",
    route: "/pesagens",
    target: '[data-tour="pesagens"]',
    title: "Pesagens e desenvolvimento",
    description:
      "Registre pesagens e acompanhe a evolução de peso dos animais ao longo do tempo.",
  },
  {
    id: "desmamas",
    route: "/desmamas",
    target: '[data-tour="desmamas"]',
    title: "Controle de desmama",
    description:
      "Acompanhe bezerros em aleitamento e registre a conclusão das desmamas com segurança.",
  },
  {
    id: "despesas",
    route: "/despesas",
    target: '[data-tour="despesas"]',
    title: "Despesas",
    description:
      "Registre e consulte os custos da atividade para manter o controle financeiro da propriedade.",
  },
  {
    id: "configuracoes",
    route: "/configuracoes",
    target: '[data-tour="configuracoes"]',
    title: "Configurações",
    description:
      "Altere preferências locais e refaça este tutorial quando quiser em Configurações > Tutorial.",
  },
]);
