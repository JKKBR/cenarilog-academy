export type IdTutorialIntermediario =
  | "pedidos-incompletos"
  | "falta-produtos"
  | "hora-repor"
  | "produtos-importantes";

export type TutorialIntermediario = {
  id: IdTutorialIntermediario;
  titulo: string;
  setor: string;
  historia: string;
  objetivo: string;
  pistas: string[];
  aprendizados: string[];
  vantagens: string[];
  desvantagens: string[];
  proximoTutorial?: IdTutorialIntermediario;
};

export const tutoriaisIntermediarios: TutorialIntermediario[] = [
  {
    id: "pedidos-incompletos",
    titulo: "Pedidos no prazo, mas incompletos",
    setor: "Atendimento e expedição",
    historia:
      "A Artesanatos Lucia’s aumentou o número de pedidos. Muitas entregas chegam no prazo, mas alguns clientes não recebem todos os produtos solicitados.",
    objetivo:
      "Descubra por que o OTD está melhor que o OTIF e melhore o OTIF do cenário simulado.",
    pistas: [
      "Um pedido pode chegar no prazo e ainda estar incompleto?",
      "Compare OTD e OTIF. OTD olha o prazo. OTIF também verifica se o pedido chegou completo.",
      'Observe o campo "Pedidos no prazo e completos" no cenário simulado.',
    ],
    aprendizados: [
      "OTD mede a pontualidade das entregas.",
      "OTIF considera prazo e pedido completo.",
      "Melhorar somente o prazo não garante um pedido completo.",
    ],
    vantagens: [
      "Pedidos completos podem melhorar o atendimento.",
      "A comparação entre OTD e OTIF ajuda a localizar o problema.",
    ],
    desvantagens: [
      "Aumentar o indicador no simulador não explica sozinho como a melhoria será realizada.",
      "A mudança precisa considerar estoque, separação e conferência.",
    ],
    proximoTutorial: "falta-produtos",
  },
  {
    id: "falta-produtos",
    titulo: "Produtos estão faltando",
    setor: "Estoque e separação",
    historia:
      "A procura aumentou e algumas unidades solicitadas não foram atendidas. A loja precisa reduzir a falta de produtos.",
    objetivo:
      "Aumente o Fill Rate e reduza a ruptura sem alterar vários campos ao mesmo tempo.",
    pistas: [
      "Compare as unidades solicitadas com as unidades atendidas.",
      "Fill Rate mostra o que foi atendido. Ruptura mostra o que ficou faltando.",
      'Observe o campo "Unidades atendidas" no cenário simulado.',
    ],
    aprendizados: [
      "Fill Rate mede a parte atendida.",
      "Ruptura mede a parte que ficou faltando.",
      "Fill Rate e ruptura devem ser observados juntos.",
    ],
    vantagens: [
      "Reduzir a ruptura pode melhorar o atendimento.",
      "Mais unidades atendidas podem elevar o Fill Rate.",
    ],
    desvantagens: [
      "Manter mais produtos pode elevar o estoque e o custo.",
      "O resultado depende da disponibilidade física real.",
    ],
    proximoTutorial: "hora-repor",
  },
  {
    id: "hora-repor",
    titulo: "Está na hora de comprar?",
    setor: "Compras e reposição",
    historia:
      "Com mais produtos e pedidos, a Artesanatos Lucia’s precisa identificar o momento adequado para realizar uma nova compra.",
    objetivo:
      "Analise o estoque disponível e compare com o ponto de reposição.",
    pistas: [
      "Observe quanto pode ser consumido durante o prazo de entrega.",
      "O ponto de reposição reúne a demanda durante a espera e o estoque de segurança.",
      "Compare o estoque disponível com o ponto de reposição.",
    ],
    aprendizados: [
      "Lead time representa o tempo de espera.",
      "Estoque de segurança funciona como uma reserva.",
      "Ponto de reposição ajuda a decidir quando comprar.",
    ],
    vantagens: [
      "A reposição planejada pode reduzir a falta de produtos.",
      "O estoque de segurança protege contra algumas variações.",
    ],
    desvantagens: [
      "Comprar cedo demais pode aumentar o estoque.",
      "Comprar tarde demais pode provocar ruptura.",
    ],
    proximoTutorial: "produtos-importantes",
  },
  {
    id: "produtos-importantes",
    titulo: "Quais produtos precisam de mais atenção?",
    setor: "Cadastro e planejamento",
    historia:
      "A quantidade de produtos cresceu. A equipe precisa organizar o controle sem tratar todos os itens da mesma maneira.",
    objetivo:
      "Use a Curva ABC para reconhecer os produtos de maior impacto financeiro.",
    pistas: [
      "Observe o valor anual de consumo dos produtos.",
      "Os produtos A representam uma parte importante do valor analisado.",
      "Um produto C ainda pode ser necessário para a operação funcionar.",
    ],
    aprendizados: [
      "A Curva ABC organiza produtos pelo impacto financeiro.",
      "Itens A costumam exigir acompanhamento mais próximo.",
      "A classe financeira não substitui a análise da importância operacional.",
    ],
    vantagens: [
      "A classificação ajuda a definir prioridades.",
      "Produtos de maior impacto podem receber controle mais frequente.",
    ],
    desvantagens: [
      "Um item barato ainda pode ser crítico.",
      "A classificação depende da qualidade dos dados cadastrados.",
    ],
  },
];