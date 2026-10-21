"use client";

import {
  AlertTriangle,
  Award,
  Bot,
  CheckCircle2,
  Copy,
  Dice5,
  Gauge,
  Play,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type Metrics = {
  otif: number;
  fillRate: number;
  ruptura: number;
  leadTime: number;
  custoLogistico: number;
  estoqueMedio: number;
  acuracidade: number;
};

type DecisionId =
  | "safety-stock"
  | "express-transport"
  | "supplier-review"
  | "inventory-count"
  | "warehouse-capacity"
  | "forecast-review";

type Decision = {
  id: DecisionId;
  nome: string;
  descricao: string;
  custoAdicional: number;
  changes: Partial<Metrics>;
};

type Challenge = {
  id: string;
  nome: string;
  descricao: string;
  initial: Metrics;
  targets: {
    otifMin: number;
    fillRateMin: number;
    rupturaMax: number;
    leadTimeMax: number;
    custoMax: number;
    estoqueMax: number;
    acuracidadeMin: number;
  };
};

type Risk = {
  id: string;
  nome: string;
  categoria: string;
  probabilidade: number;
  impacto: number;
  planoAcao: string;
  responsavel: string;
};

type ScoreWeights = {
  servico: number;
  custo: number;
  estoque: number;
  risco: number;
};

type OptimizationResult = {
  decisions: Decision[];
  metrics: Metrics;
  score: number;
  costIncrease: number;
};

type SavedRun = {
  id: string;
  savedAt: string;
  challengeName: string;
  decisions: DecisionId[];
  metrics: Metrics;
  score: number;
};

const DECISIONS: Decision[] = [
  {
    id: "safety-stock",
    nome: "Aumentar estoque de segurança",
    descricao:
      "Aumenta a disponibilidade, mas eleva o estoque médio e o custo.",
    custoAdicional: 3500,
    changes: {
      fillRate: 2.5,
      otif: 1.5,
      ruptura: -2,
      estoqueMedio: 350,
      custoLogistico: 3500,
    },
  },
  {
    id: "express-transport",
    nome: "Contratar transporte expresso",
    descricao:
      "Reduz o prazo e melhora a pontualidade das entregas.",
    custoAdicional: 6000,
    changes: {
      otif: 3,
      leadTime: -2,
      custoLogistico: 6000,
    },
  },
  {
    id: "supplier-review",
    nome: "Revisar fornecedor",
    descricao:
      "Reduz atrasos e melhora a disponibilidade no médio prazo.",
    custoAdicional: 1800,
    changes: {
      otif: 2,
      fillRate: 1,
      ruptura: -1,
      leadTime: -1,
      custoLogistico: 1800,
    },
  },
  {
    id: "inventory-count",
    nome: "Implantar contagem cíclica",
    descricao:
      "Melhora a acuracidade e reduz divergências de estoque.",
    custoAdicional: 1200,
    changes: {
      acuracidade: 3,
      fillRate: 0.5,
      custoLogistico: 1200,
    },
  },
  {
    id: "warehouse-capacity",
    nome: "Aumentar capacidade operacional",
    descricao:
      "Eleva a capacidade de processamento e reduz atrasos.",
    custoAdicional: 4500,
    changes: {
      otif: 2,
      fillRate: 1,
      leadTime: -1,
      custoLogistico: 4500,
    },
  },
  {
    id: "forecast-review",
    nome: "Revisar previsão de demanda",
    descricao:
      "Melhora o equilíbrio entre estoque, atendimento e ruptura.",
    custoAdicional: 900,
    changes: {
      fillRate: 1.5,
      ruptura: -1.5,
      estoqueMedio: -100,
      custoLogistico: 900,
    },
  },
];

const CHALLENGES: Challenge[] = [
  {
    id: "ecommerce",
    nome: "Pico de demanda no e-commerce",
    descricao:
      "A operação enfrenta aumento da demanda, atrasos e ruptura.",
    initial: {
      otif: 88,
      fillRate: 91,
      ruptura: 9,
      leadTime: 8,
      custoLogistico: 26000,
      estoqueMedio: 1600,
      acuracidade: 94,
    },
    targets: {
      otifMin: 95,
      fillRateMin: 97,
      rupturaMax: 3,
      leadTimeMax: 6,
      custoMax: 38000,
      estoqueMax: 2200,
      acuracidadeMin: 97,
    },
  },
  {
    id: "distribution-center",
    nome: "Centro de distribuição congestionado",
    descricao:
      "A capacidade está limitada e os pedidos acumulam atrasos.",
    initial: {
      otif: 90,
      fillRate: 95,
      ruptura: 5,
      leadTime: 9,
      custoLogistico: 30000,
      estoqueMedio: 1900,
      acuracidade: 96,
    },
    targets: {
      otifMin: 96,
      fillRateMin: 97,
      rupturaMax: 3,
      leadTimeMax: 6,
      custoMax: 42000,
      estoqueMax: 2400,
      acuracidadeMin: 98,
    },
  },
  {
    id: "supplier",
    nome: "Fornecedor instável",
    descricao:
      "Variações no prazo de fornecimento reduzem o nível de serviço.",
    initial: {
      otif: 86,
      fillRate: 92,
      ruptura: 8,
      leadTime: 11,
      custoLogistico: 24000,
      estoqueMedio: 1400,
      acuracidade: 97,
    },
    targets: {
      otifMin: 94,
      fillRateMin: 96,
      rupturaMax: 4,
      leadTimeMax: 7,
      custoMax: 36000,
      estoqueMax: 2100,
      acuracidadeMin: 97,
    },
  },
];

const INITIAL_RISKS: Risk[] = [
  {
    id: "risk-1",
    nome: "Atraso do fornecedor",
    categoria: "Suprimentos",
    probabilidade: 4,
    impacto: 5,
    planoAcao:
      "Homologar fornecedor alternativo e revisar o prazo contratado.",
    responsavel: "Compras",
  },
  {
    id: "risk-2",
    nome: "Ruptura de item crítico",
    categoria: "Estoque",
    probabilidade: 3,
    impacto: 5,
    planoAcao:
      "Revisar ponto de reposição e estoque de segurança.",
    responsavel: "Planejamento",
  },
  {
    id: "risk-3",
    nome: "Divergência de inventário",
    categoria: "Armazém",
    probabilidade: 3,
    impacto: 3,
    planoAcao:
      "Implantar contagem cíclica e análise de divergências.",
    responsavel: "Inventário",
  },
];

const INITIAL_WEIGHTS: ScoreWeights = {
  servico: 35,
  custo: 25,
  estoque: 20,
  risco: 20,
};

function clamp(
  value: number,
  minimum: number,
  maximum: number
) {
  return Math.min(
    maximum,
    Math.max(minimum, value)
  );
}

function formatNumber(
  value: number,
  decimals = 1
) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function getRiskScore(risk: Risk) {
  return (
    clamp(risk.probabilidade, 1, 5) *
    clamp(risk.impacto, 1, 5)
  );
}

function getRiskLevel(score: number) {
  if (score >= 17) {
    return {
      nome: "Crítico",
      className:
        "border-red-300 bg-red-100 text-red-800",
    };
  }

  if (score >= 10) {
    return {
      nome: "Alto",
      className:
        "border-orange-300 bg-orange-100 text-orange-800",
    };
  }

  if (score >= 5) {
    return {
      nome: "Moderado",
      className:
        "border-amber-300 bg-amber-100 text-amber-800",
    };
  }

  return {
    nome: "Baixo",
    className:
      "border-emerald-300 bg-emerald-100 text-emerald-800",
  };
}

function applyDecisions(
  initial: Metrics,
  decisions: Decision[]
) {
  const metrics = { ...initial };

  decisions.forEach((decision) => {
    Object.entries(decision.changes).forEach(
      ([key, change]) => {
        const metricKey = key as keyof Metrics;

        metrics[metricKey] += change ?? 0;
      }
    );
  });

  return {
    otif: clamp(metrics.otif, 0, 100),
    fillRate: clamp(
      metrics.fillRate,
      0,
      100
    ),
    ruptura: clamp(
      metrics.ruptura,
      0,
      100
    ),
    leadTime: Math.max(
      0,
      metrics.leadTime
    ),
    custoLogistico: Math.max(
      0,
      metrics.custoLogistico
    ),
    estoqueMedio: Math.max(
      0,
      metrics.estoqueMedio
    ),
    acuracidade: clamp(
      metrics.acuracidade,
      0,
      100
    ),
  };
}

function calculateScore(
  metrics: Metrics,
  challenge: Challenge,
  weights: ScoreWeights,
  averageRiskScore: number
) {
  const target = challenge.targets;

  const serviceScore =
    ((clamp(
      metrics.otif / target.otifMin,
      0,
      1
    ) +
      clamp(
        metrics.fillRate /
          target.fillRateMin,
        0,
        1
      ) +
      clamp(
        metrics.acuracidade /
          target.acuracidadeMin,
        0,
        1
      ) +
      clamp(
        target.rupturaMax /
          Math.max(metrics.ruptura, 0.1),
        0,
        1
      ) +
      clamp(
        target.leadTimeMax /
          Math.max(metrics.leadTime, 0.1),
        0,
        1
      )) /
      5) *
    100;

  const costScore =
    clamp(
      target.custoMax /
        Math.max(
          metrics.custoLogistico,
          1
        ),
      0,
      1
    ) * 100;

  const inventoryScore =
    clamp(
      target.estoqueMax /
        Math.max(metrics.estoqueMedio, 1),
      0,
      1
    ) * 100;

  const riskScore =
    clamp(
      1 -
        Math.max(
          averageRiskScore - 1,
          0
        ) /
          24,
      0,
      1
    ) * 100;

  const weightTotal =
    weights.servico +
      weights.custo +
      weights.estoque +
      weights.risco || 1;

  const total =
    (serviceScore * weights.servico +
      costScore * weights.custo +
      inventoryScore * weights.estoque +
      riskScore * weights.risco) /
    weightTotal;

  return {
    total: clamp(total, 0, 100),
    serviceScore,
    costScore,
    inventoryScore,
    riskScore,
  };
}

function MetricCard({
  title,
  before,
  after,
  format,
  lowerIsBetter = false,
}: {
  title: string;
  before: number;
  after: number;
  format: (value: number) => string;
  lowerIsBetter?: boolean;
}) {
  const difference = after - before;

  const improved = lowerIsBetter
    ? difference < 0
    : difference > 0;

  const unchanged =
    Math.abs(difference) < 0.0001;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {format(after)}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
        <span className="text-slate-500">
          Inicial: {format(before)}
        </span>

        <span
          className={`flex items-center gap-1 font-semibold ${
            unchanged
              ? "text-slate-500"
              : improved
                ? "text-emerald-700"
                : "text-red-700"
          }`}
        >
          {!unchanged &&
            (difference > 0 ? (
              <TrendingUp size={15} />
            ) : (
              <TrendingDown size={15} />
            ))}

          {unchanged
            ? "Sem mudança"
            : `${difference > 0 ? "+" : ""}${format(
                difference
              )}`}
        </span>
      </div>
    </article>
  );
}

export default function ChallengeOptimizer() {
  const [challengeId, setChallengeId] =
    useState(CHALLENGES[0].id);

  const [selectedDecisionIds, setSelectedDecisionIds] =
    useState<DecisionId[]>([]);

  const [weights, setWeights] =
    useState<ScoreWeights>(INITIAL_WEIGHTS);

  const [risks, setRisks] =
    useState<Risk[]>(INITIAL_RISKS);

  const [savedRuns, setSavedRuns] =
    useState<SavedRun[]>([]);

  const [message, setMessage] =
    useState("");

  const [riskForm, setRiskForm] =
    useState<Omit<Risk, "id">>({
      nome: "",
      categoria: "",
      probabilidade: 3,
      impacto: 3,
      planoAcao: "",
      responsavel: "",
    });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        "logsim-pro-v3-runs"
      );

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setSavedRuns(parsed);
        }
      }
    } catch {
      setMessage(
        "Não foi possível carregar os resultados salvos."
      );
    }
  }, []);

  const challenge =
    CHALLENGES.find(
      (item) => item.id === challengeId
    ) ?? CHALLENGES[0];

  const selectedDecisions = useMemo(
    () =>
      DECISIONS.filter((decision) =>
        selectedDecisionIds.includes(
          decision.id
        )
      ),
    [selectedDecisionIds]
  );

  const simulatedMetrics = useMemo(
    () =>
      applyDecisions(
        challenge.initial,
        selectedDecisions
      ),
    [challenge, selectedDecisions]
  );

  const averageRiskScore = useMemo(() => {
    if (risks.length === 0) {
      return 1;
    }

    return (
      risks.reduce(
        (total, risk) =>
          total + getRiskScore(risk),
        0
      ) / risks.length
    );
  }, [risks]);

  const score = useMemo(
    () =>
      calculateScore(
        simulatedMetrics,
        challenge,
        weights,
        averageRiskScore
      ),
    [
      simulatedMetrics,
      challenge,
      weights,
      averageRiskScore,
    ]
  );

  const constraints = useMemo(
    () => [
      {
        nome: "OTIF mínimo",
        atual: simulatedMetrics.otif,
        alvo: challenge.targets.otifMin,
        passed:
          simulatedMetrics.otif >=
          challenge.targets.otifMin,
        text: `${formatNumber(
          simulatedMetrics.otif
        )}% / ${formatNumber(
          challenge.targets.otifMin
        )}%`,
      },
      {
        nome: "Fill Rate mínimo",
        atual: simulatedMetrics.fillRate,
        alvo:
          challenge.targets.fillRateMin,
        passed:
          simulatedMetrics.fillRate >=
          challenge.targets.fillRateMin,
        text: `${formatNumber(
          simulatedMetrics.fillRate
        )}% / ${formatNumber(
          challenge.targets.fillRateMin
        )}%`,
      },
      {
        nome: "Ruptura máxima",
        atual: simulatedMetrics.ruptura,
        alvo:
          challenge.targets.rupturaMax,
        passed:
          simulatedMetrics.ruptura <=
          challenge.targets.rupturaMax,
        text: `${formatNumber(
          simulatedMetrics.ruptura
        )}% / ${formatNumber(
          challenge.targets.rupturaMax
        )}%`,
      },
      {
        nome: "Lead time máximo",
        atual: simulatedMetrics.leadTime,
        alvo:
          challenge.targets.leadTimeMax,
        passed:
          simulatedMetrics.leadTime <=
          challenge.targets.leadTimeMax,
        text: `${formatNumber(
          simulatedMetrics.leadTime
        )} / ${formatNumber(
          challenge.targets.leadTimeMax
        )} dias`,
      },
      {
        nome: "Custo máximo",
        atual:
          simulatedMetrics.custoLogistico,
        alvo: challenge.targets.custoMax,
        passed:
          simulatedMetrics.custoLogistico <=
          challenge.targets.custoMax,
        text: `${formatCurrency(
          simulatedMetrics.custoLogistico
        )} / ${formatCurrency(
          challenge.targets.custoMax
        )}`,
      },
      {
        nome: "Estoque máximo",
        atual:
          simulatedMetrics.estoqueMedio,
        alvo:
          challenge.targets.estoqueMax,
        passed:
          simulatedMetrics.estoqueMedio <=
          challenge.targets.estoqueMax,
        text: `${formatNumber(
          simulatedMetrics.estoqueMedio,
          0
        )} / ${formatNumber(
          challenge.targets.estoqueMax,
          0
        )} un.`,
      },
    ],
    [challenge, simulatedMetrics]
  );

  const completedConstraints =
    constraints.filter(
      (constraint) => constraint.passed
    ).length;

  const optimizerResults =
    useMemo<OptimizationResult[]>(() => {
      const combinations: Decision[][] = [];

      for (
        let mask = 0;
        mask < 1 << DECISIONS.length;
        mask++
      ) {
        const combination =
          DECISIONS.filter(
            (_, index) =>
              mask & (1 << index)
          );

        if (combination.length > 4) {
          continue;
        }

        combinations.push(combination);
      }

      return combinations
        .map((decisions) => {
          const metrics = applyDecisions(
            challenge.initial,
            decisions
          );

          const resultScore =
            calculateScore(
              metrics,
              challenge,
              weights,
              averageRiskScore
            ).total;

          return {
            decisions,
            metrics,
            score: resultScore,
            costIncrease:
              metrics.custoLogistico -
              challenge.initial
                .custoLogistico,
          };
        })
        .sort((first, second) => {
          if (
            Math.abs(
              second.score - first.score
            ) > 0.01
          ) {
            return (
              second.score - first.score
            );
          }

          return (
            first.costIncrease -
            second.costIncrease
          );
        })
        .slice(0, 5);
    }, [
      challenge,
      weights,
      averageRiskScore,
    ]);

  function toggleDecision(
    id: DecisionId
  ) {
    setSelectedDecisionIds(
      (previous) =>
        previous.includes(id)
          ? previous.filter(
              (decisionId) =>
                decisionId !== id
            )
          : [...previous, id]
    );
  }

  function applyOptimization(
    result: OptimizationResult
  ) {
    setSelectedDecisionIds(
      result.decisions.map(
        (decision) => decision.id
      )
    );

    setMessage(
      "Combinação do otimizador aplicada."
    );
  }

  function addRisk() {
    if (!riskForm.nome.trim()) {
      setMessage(
        "Informe o nome do risco."
      );
      return;
    }

    setRisks((previous) => [
      ...previous,
      {
        id: generateId(),
        nome: riskForm.nome.trim(),
        categoria:
          riskForm.categoria.trim() ||
          "Geral",
        probabilidade: clamp(
          riskForm.probabilidade,
          1,
          5
        ),
        impacto: clamp(
          riskForm.impacto,
          1,
          5
        ),
        planoAcao:
          riskForm.planoAcao.trim(),
        responsavel:
          riskForm.responsavel.trim(),
      },
    ]);

    setRiskForm({
      nome: "",
      categoria: "",
      probabilidade: 3,
      impacto: 3,
      planoAcao: "",
      responsavel: "",
    });

    setMessage("Risco adicionado.");
  }

  function removeRisk(id: string) {
    setRisks((previous) =>
      previous.filter(
        (risk) => risk.id !== id
      )
    );
  }

  function saveRun() {
    const saved: SavedRun = {
      id: generateId(),
      savedAt:
        new Date().toLocaleString(
          "pt-BR"
        ),
      challengeName: challenge.nome,
      decisions: [
        ...selectedDecisionIds,
      ],
      metrics: { ...simulatedMetrics },
      score: score.total,
    };

    const updated = [
      saved,
      ...savedRuns,
    ].slice(0, 10);

    setSavedRuns(updated);

    localStorage.setItem(
      "logsim-pro-v3-runs",
      JSON.stringify(updated)
    );

    setMessage(
      "Resultado do desafio salvo."
    );
  }

  function resetChallenge() {
    setSelectedDecisionIds([]);
    setWeights(INITIAL_WEIGHTS);
    setMessage(
      "Decisões e pesos restaurados."
    );
  }

  return (
    <section className="mt-8 space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-violet-600 p-3">
              <Trophy size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                LogSim Pro 3.0
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                Desafios, decisões, riscos e otimização de cenários
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetChallenge}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800"
          >
            <RotateCcw size={17} />
            Restaurar desafio
          </button>
        </div>

        {message && (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-blue-700 bg-blue-950 p-4 text-sm text-blue-100">
            <span>{message}</span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center gap-3">
            <Target className="text-violet-700" />

            <div>
              <h2 className="text-xl font-bold">
                Modo de desafios
              </h2>

              <p className="text-sm text-slate-500">
                Escolha uma situação logística
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {CHALLENGES.map(
              (challengeOption) => (
                <button
                  key={challengeOption.id}
                  type="button"
                  onClick={() => {
                    setChallengeId(
                      challengeOption.id
                    );
                    setSelectedDecisionIds(
                      []
                    );
                  }}
                  className={`rounded-2xl border p-5 text-left transition ${
                    challengeId ===
                    challengeOption.id
                      ? "border-violet-500 bg-violet-50 ring-4 ring-violet-100"
                      : "border-slate-200 hover:border-violet-300"
                  }`}
                >
                  <p className="font-bold text-slate-900">
                    {challengeOption.nome}
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {
                      challengeOption.descricao
                    }
                  </p>
                </button>
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Award className="text-violet-700" />

            <div>
              <p className="text-sm font-semibold text-slate-600">
                Pontuação geral
              </p>

              <p className="text-5xl font-bold text-violet-700">
                {formatNumber(
                  score.total,
                  0
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-violet-600 transition-all"
              style={{
                width: `${score.total}%`,
              }}
            />
          </div>

          <p className="mt-4 text-sm text-slate-600">
            {completedConstraints} de{" "}
            {constraints.length} restrições
            atendidas.
          </p>

          <button
            type="button"
            onClick={saveRun}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-700"
          >
            <Save size={17} />
            Salvar resultado
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Zap className="text-amber-600" />

          <div>
            <h2 className="text-xl font-bold">
              Decisões operacionais
            </h2>

            <p className="text-sm text-slate-500">
              Selecione ações e veja o impacto estimado
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DECISIONS.map((decision) => {
            const selected =
              selectedDecisionIds.includes(
                decision.id
              );

            return (
              <button
                key={decision.id}
                type="button"
                onClick={() =>
                  toggleDecision(
                    decision.id
                  )
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  selected
                    ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-slate-900">
                    {decision.nome}
                  </p>

                  {selected && (
                    <CheckCircle2
                      size={20}
                      className="shrink-0 text-blue-700"
                    />
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {decision.descricao}
                </p>

                <p className="mt-4 text-sm font-semibold text-blue-700">
                  Impacto de custo:{" "}
                  {formatCurrency(
                    decision.custoAdicional
                  )}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="OTIF"
          before={challenge.initial.otif}
          after={simulatedMetrics.otif}
          format={(value) =>
            `${formatNumber(value)}%`
          }
        />

        <MetricCard
          title="Fill Rate"
          before={
            challenge.initial.fillRate
          }
          after={simulatedMetrics.fillRate}
          format={(value) =>
            `${formatNumber(value)}%`
          }
        />

        <MetricCard
          title="Ruptura"
          before={
            challenge.initial.ruptura
          }
          after={simulatedMetrics.ruptura}
          lowerIsBetter
          format={(value) =>
            `${formatNumber(value)}%`
          }
        />

        <MetricCard
          title="Lead time"
          before={
            challenge.initial.leadTime
          }
          after={simulatedMetrics.leadTime}
          lowerIsBetter
          format={(value) =>
            `${formatNumber(value)} dias`
          }
        />

        <MetricCard
          title="Custo logístico"
          before={
            challenge.initial
              .custoLogistico
          }
          after={
            simulatedMetrics.custoLogistico
          }
          lowerIsBetter
          format={formatCurrency}
        />

        <MetricCard
          title="Estoque médio"
          before={
            challenge.initial.estoqueMedio
          }
          after={
            simulatedMetrics.estoqueMedio
          }
          lowerIsBetter
          format={(value) =>
            `${formatNumber(value, 0)} un.`
          }
        />

        <MetricCard
          title="Acuracidade"
          before={
            challenge.initial.acuracidade
          }
          after={
            simulatedMetrics.acuracidade
          }
          format={(value) =>
            `${formatNumber(value)}%`
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Restrições do desafio
          </h2>

          <div className="mt-5 space-y-3">
            {constraints.map(
              (constraint) => (
                <div
                  key={constraint.nome}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
                    constraint.passed
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {constraint.passed ? (
                      <CheckCircle2 className="text-emerald-700" />
                    ) : (
                      <AlertTriangle className="text-red-700" />
                    )}

                    <span className="font-semibold text-slate-800">
                      {constraint.nome}
                    </span>
                  </div>

                  <span className="text-sm text-slate-600">
                    {constraint.text}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Gauge className="text-blue-700" />

            <h2 className="text-xl font-bold">
              Pesos da pontuação
            </h2>
          </div>

          <div className="mt-5 space-y-5">
            {(
              Object.keys(
                weights
              ) as Array<
                keyof ScoreWeights
              >
            ).map((key) => (
              <label
                key={key}
                className="block"
              >
                <div className="mb-2 flex justify-between text-sm">
                  <span className="capitalize text-slate-700">
                    {key}
                  </span>

                  <span className="font-semibold">
                    {weights[key]}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={weights[key]}
                  onChange={(event) =>
  setWeights((previous) => ({
    ...previous,
    [key]: Number(event.target.value),
  }))
}
                  
                  className="w-full"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-blue-50 p-3">
              Serviço:{" "}
              <strong>
                {formatNumber(
                  score.serviceScore,
                  0
                )}
              </strong>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              Custo:{" "}
              <strong>
                {formatNumber(
                  score.costScore,
                  0
                )}
              </strong>
            </div>

            <div className="rounded-xl bg-violet-50 p-3">
              Estoque:{" "}
              <strong>
                {formatNumber(
                  score.inventoryScore,
                  0
                )}
              </strong>
            </div>

            <div className="rounded-xl bg-amber-50 p-3">
              Risco:{" "}
              <strong>
                {formatNumber(
                  score.riskScore,
                  0
                )}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-red-700" />

          <div>
            <h2 className="text-xl font-bold">
              Matriz de risco
            </h2>

            <p className="text-sm text-slate-500">
              Probabilidade × impacto, usando escala de 1 a 5
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-2">
          {[5, 4, 3, 2, 1].map(
            (probability) =>
              [1, 2, 3, 4, 5].map(
                (impact) => {
                  const matrixScore =
                    probability * impact;

                  const level =
                    getRiskLevel(
                      matrixScore
                    );

                  const cellRisks =
                    risks.filter(
                      (risk) =>
                        risk.probabilidade ===
                          probability &&
                        risk.impacto ===
                          impact
                    );

                  return (
                    <div
                      key={`${probability}-${impact}`}
                      className={`min-h-24 rounded-xl border p-2 ${level.className}`}
                    >
                      <p className="text-xs font-bold">
                        P{probability} × I
                        {impact} ={" "}
                        {matrixScore}
                      </p>

                      {cellRisks.map(
                        (risk) => (
                          <p
                            key={risk.id}
                            className="mt-1 rounded bg-white/70 px-1.5 py-1 text-xs"
                          >
                            {risk.nome}
                          </p>
                        )
                      )}
                    </div>
                  );
                }
              )
          )}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {risks.map((risk) => {
              const riskScore =
                getRiskScore(risk);

              const level =
                getRiskLevel(riskScore);

              return (
                <article
                  key={risk.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        {risk.nome}
                      </p>

                      <p className="text-xs text-slate-500">
                        {risk.categoria} ·{" "}
                        {risk.responsavel ||
                          "Sem responsável"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${level.className}`}
                    >
                      {level.nome} ·{" "}
                      {riskScore}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {risk.planoAcao ||
                      "Plano de ação não informado."}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      removeRisk(risk.id)
                    }
                    className="mt-3 flex items-center gap-1 text-xs font-semibold text-red-700"
                  >
                    <Trash2 size={14} />
                    Excluir risco
                  </button>
                </article>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-bold">
              Adicionar risco
            </h3>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={riskForm.nome}
                onChange={(event) =>
                  setRiskForm(
                    (previous) => ({
                      ...previous,
                      nome: event.target.value,
                    })
                  )
                }
                placeholder="Nome do risco"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              />

              <input
                type="text"
                value={riskForm.categoria}
                onChange={(event) =>
                  setRiskForm(
                    (previous) => ({
                      ...previous,
                      categoria:
                        event.target.value,
                    })
                  )
                }
                placeholder="Categoria"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              />

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  Probabilidade
                  <select
                    value={
                      riskForm.probabilidade
                    }
                    onChange={(event) =>
                      setRiskForm(
                        (previous) => ({
                          ...previous,
                          probabilidade:
                            Number(
                              event.target
                                .value
                            ),
                        })
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  >
                    {[1, 2, 3, 4, 5].map(
                      (value) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {value}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="text-sm">
                  Impacto
                  <select
                    value={
                      riskForm.impacto
                    }
                    onChange={(event) =>
                      setRiskForm(
                        (previous) => ({
                          ...previous,
                          impacto: Number(
                            event.target
                              .value
                          ),
                        })
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  >
                    {[1, 2, 3, 4, 5].map(
                      (value) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {value}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>

              <input
                type="text"
                value={
                  riskForm.responsavel
                }
                onChange={(event) =>
                  setRiskForm(
                    (previous) => ({
                      ...previous,
                      responsavel:
                        event.target.value,
                    })
                  )
                }
                placeholder="Responsável"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              />

              <textarea
                value={riskForm.planoAcao}
                onChange={(event) =>
                  setRiskForm(
                    (previous) => ({
                      ...previous,
                      planoAcao:
                        event.target.value,
                    })
                  )
                }
                placeholder="Plano de ação"
                rows={4}
                className="w-full rounded-xl border border-slate-300 p-3"
              />

              <button
                type="button"
                onClick={addRisk}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
              >
                <Plus size={17} />
                Adicionar risco
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Bot className="text-cyan-700" />

          <div>
            <h2 className="text-xl font-bold">
              Otimizador de cenário
            </h2>

            <p className="text-sm text-slate-600">
              Melhores combinações segundo os pesos atuais
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {optimizerResults.map(
            (result, index) => (
              <article
                key={`${index}-${result.decisions
                  .map(
                    (decision) =>
                      decision.id
                  )
                  .join("-")}`}
                className="rounded-xl border border-cyan-200 bg-white p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {index === 0 ? (
                        <Sparkles className="text-violet-700" />
                      ) : (
                        <Dice5 className="text-cyan-700" />
                      )}

                      <p className="font-bold">
                        Opção {index + 1} ·{" "}
                        {formatNumber(
                          result.score,
                          0
                        )} pontos
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {result.decisions
                        .map(
                          (decision) =>
                            decision.nome
                        )
                        .join(" + ") ||
                        "Nenhuma decisão"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Acréscimo de custo:{" "}
                      {formatCurrency(
                        result.costIncrease
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      applyOptimization(
                        result
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800"
                  >
                    <Play size={16} />
                    Aplicar
                  </button>
                </div>
              </article>
            )
          )}
        </div>

        <p className="mt-5 text-xs leading-relaxed text-slate-500">
          O otimizador compara combinações
          predefinidas. Os impactos das decisões
          são parâmetros ilustrativos criados para
          o simulador e devem ser ajustados com
          dados reais antes de qualquer decisão
          operacional.
        </p>
      </div>

      {savedRuns.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Histórico de desafios
          </h2>

          <div className="mt-5 grid gap-3">
            {savedRuns.map((run) => (
              <div
                key={run.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-bold">
                    {run.challengeName}
                  </p>

                  <p className="text-xs text-slate-500">
                    {run.savedAt} ·{" "}
                    {run.decisions.length}{" "}
                    decisões
                  </p>
                </div>

                <p className="text-2xl font-bold text-violet-700">
                  {formatNumber(
                    run.score,
                    0
                  )}{" "}
                  pontos
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}