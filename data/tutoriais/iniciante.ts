import type { Step } from "react-joyride";

export const etapasGuiaIniciante: Step[] = [
  {
    target: '[data-tour="cabecalho"]',
    title: "Bem-vindo!",
    content:
      "Aqui você aprende logística mudando números e comparando resultados.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: '[data-tour="restaurar-exemplo"]',
    title: "Dados prontos para aprender",
    content:
      "Este botão coloca os números de exemplo de volta no simulador.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: '[data-tour="operacao-atual"]',
    title: "A situação de agora",
    content:
      "A operação atual mostra como as coisas estão neste momento. Pense nela como uma fotografia de hoje.",
    placement: "right",
    skipBeacon: true,
  },
  {
    target: '[data-tour="cenario-simulado"]',
    title: 'A pergunta "e se?"',
    content:
      "O cenário simulado mostra o que pode acontecer quando algum número é alterado.",
    placement: "left",
    skipBeacon: true,
  },
  {
    target: '[data-tour="copiar-cenario"]',
    title: "Comece com dados iguais",
    content:
      "Este botão copia a operação atual. Depois você pode mudar uma informação por vez.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: '[data-tour="pedidos-prazo-simulado"]',
    title: "Um exemplo de mudança",
    content:
      "Neste campo, você pode testar o que acontece quando mais pedidos chegam no prazo.",
    placement: "left",
    skipBeacon: true,
  },
  {
    target: '[data-tour="validacao"]',
    title: "O simulador confere os dados",
    content:
      "Esta área avisa quando algum número não combina com os outros.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: '[data-tour="metas"]',
    title: "Resultados desejados",
    content:
      "As metas mostram onde queremos chegar. Elas podem mudar em cada exercício.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: '[data-tour="reposicao"]',
    title: "Planejamento de reposição",
    content:
      "Esta área ajuda a estudar quanto guardar e quando pode ser hora de comprar.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: '[data-tour="painel-indicadores"]',
    title: "Os números contam uma história",
    content:
      "Os cartões comparam a operação atual com o cenário simulado.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: '[data-tour="indicador-otd"]',
    title: "OTD olha o prazo",
    content:
      "OTD mostra quantos pedidos chegaram dentro do prazo combinado.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: '[data-tour="indicador-otif"]',
    title: "OTIF olha duas coisas",
    content:
      "Para contar no OTIF, o pedido precisa chegar no prazo e completo.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: '[data-tour="indicador-fill-rate"]',
    title: "Quanto foi atendido?",
    content:
      "Fill Rate mostra quanto das unidades pedidas foi atendido.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: '[data-tour="indicador-ruptura"]',
    title: "Quanto ficou faltando?",
    content:
      "Ruptura mostra a parte da demanda que não foi atendida. Quanto menor, melhor.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: '[data-tour="grafico-comparacao"]',
    title: "Compare os resultados",
    content:
      "O gráfico coloca operação atual, cenário simulado e meta lado a lado.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: '[data-tour="modulos-avancados"]',
    title: "Continue aprendendo",
    content:
      "Aqui estão produtos, simulação mensal, desafios, riscos e otimização.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: "body",
    title: "Guia concluído!",
    content:
      "Agora você conhece as partes principais. Explore com calma e altere somente uma informação por vez.",
    placement: "center",
    skipBeacon: true,
  },
];