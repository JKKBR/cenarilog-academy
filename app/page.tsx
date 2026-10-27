"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BarChart3,
  Calculator,
  CheckCircle2,
  Copy,
  RotateCcw,
  Save,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Truck,
  Warehouse,
  AlertCircle,
  Download,
  FileJson,
  Upload,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ProductsModule, {
  type ResumoCurvaABC,
} from "@/components/ProductsModule";
import MonthlySimulation from "../components/MonthlySimulation";
import ChallengeOptimizer from "../components/ChallengeOptimizer";
import GuiaInterativo from "@/components/guia/GuiaInterativo";

import {
  tutoriaisIntermediarios,
  type IdTutorialIntermediario,
  type TutorialIntermediario,
} from "@/data/tutoriais/intermediario";

import RelatorioIntermediario, {
  type DadosRelatorioIntermediario,
} from "@/components/guia/intermediario/RelatorioIntermediario";



type OperationData = {
  demanda: number;
  estoqueMedio: number;
  pedidosTotais: number;
  pedidosNoPrazo: number;
  pedidosCompletosNoPrazo: number;
  unidadesSolicitadas: number;
  unidadesAtendidas: number;
  leadTime: number;
  itensConferidos: number;
  itensCorretos: number;
  custoLogistico: number;
  demandaDiariaMedia: number;
  demandaDiariaMaxima: number;
  leadTimeMaximo: number;
  estoqueDisponivel: number;
};

type Targets = {
  otif: number;
  otd: number;
  fillRate: number;
  leadTime: number;
  acuracidade: number;
  ruptura: number;
};

type KPIResults = {
  otif: number;
  otd: number;
  fillRate: number;
  giro: number;
  ruptura: number;
  leadTime: number;
  acuracidade: number;
  custoPorPedido: number;
  estoqueSeguranca: number;
  demandaDuranteLeadTime: number;
  pontoReposicao: number;
  precisaRepor: boolean;
};

type SavedScenario = {
  nome: string;
  data: string;
  operation: OperationData;
};

type LogSimBackup = {
  version: 1;
  exportedAt: string;
  current: OperationData;
  simulated: OperationData;
  targets: Targets;
  scenarioName: string;
  observations: string;
  savedScenarios: SavedScenario[];
};

const resumoCurvaABCInicial: ResumoCurvaABC = {
  totalProdutos: 0,
  quantidadeClasseA: 0,
  quantidadeClasseB: 0,
  quantidadeClasseC: 0,
  valorAnualTotal: 0,
  possuiClassificacaoCompleta: false,
};


const initialCurrent: OperationData = {
  demanda: 5000,
  estoqueMedio: 1500,
  pedidosTotais: 1000,
  pedidosNoPrazo: 940,
  pedidosCompletosNoPrazo: 900,
  unidadesSolicitadas: 5000,
  unidadesAtendidas: 4700,
  leadTime: 7,
  itensConferidos: 1000,
  itensCorretos: 970,
  custoLogistico: 24000,
  demandaDiariaMedia: 180,
  demandaDiariaMaxima: 240,
  leadTimeMaximo: 10,
  estoqueDisponivel: 1600,
};

const initialSimulated: OperationData = {
  demanda: 5500,
  estoqueMedio: 1700,
  pedidosTotais: 1000,
  pedidosNoPrazo: 970,
  pedidosCompletosNoPrazo: 950,
  unidadesSolicitadas: 5500,
  unidadesAtendidas: 5300,
  leadTime: 5,
  itensConferidos: 1000,
  itensCorretos: 990,
  custoLogistico: 26000,
  demandaDiariaMedia: 190,
  demandaDiariaMaxima: 230,
  leadTimeMaximo: 7,
  estoqueDisponivel: 1800,
};

const initialTargets: Targets = {
  otif: 95,
  otd: 95,
  fillRate: 97,
  leadTime: 6,
  acuracidade: 98,
  ruptura: 3,
};
type CenarioIntermediario = {
  atual: OperationData;
  simulado: OperationData;
  metas: Targets;
  mensagemInicial: string;
  alvoVisual: string;
};

const cenariosIntermediarios: Partial<
  Record<IdTutorialIntermediario, CenarioIntermediario>
> = {
  "pedidos-incompletos": {
    atual: {
      ...initialCurrent,
      demanda: 4200,
      estoqueMedio: 1300,
      pedidosTotais: 1000,
      pedidosNoPrazo: 960,
      pedidosCompletosNoPrazo: 880,
      unidadesSolicitadas: 4200,
      unidadesAtendidas: 4050,
      leadTime: 6,
      itensConferidos: 800,
      itensCorretos: 776,
      custoLogistico: 22000,
    },
    simulado: {
      ...initialCurrent,
      demanda: 4200,
      estoqueMedio: 1300,
      pedidosTotais: 1000,
      pedidosNoPrazo: 960,
      pedidosCompletosNoPrazo: 880,
      unidadesSolicitadas: 4200,
      unidadesAtendidas: 4050,
      leadTime: 6,
      itensConferidos: 800,
      itensCorretos: 776,
      custoLogistico: 22000,
    },
    metas: {
      otif: 95,
      otd: 95,
      fillRate: 96,
      leadTime: 6,
      acuracidade: 97,
      ruptura: 4,
    },
    mensagemInicial:
      "Compare OTD e OTIF. Depois, melhore os pedidos entregues no prazo e completos.",
    alvoVisual:
      '[data-tour="pedidos-completos-simulado"]',
  },

  "falta-produtos": {
    atual: {
      ...initialCurrent,
      demanda: 5000,
      estoqueMedio: 1200,
      pedidosTotais: 900,
      pedidosNoPrazo: 850,
      pedidosCompletosNoPrazo: 810,
      unidadesSolicitadas: 5000,
      unidadesAtendidas: 4500,
      leadTime: 7,
      itensConferidos: 750,
      itensCorretos: 720,
      custoLogistico: 23000,
    },
    simulado: {
      ...initialCurrent,
      demanda: 5000,
      estoqueMedio: 1200,
      pedidosTotais: 900,
      pedidosNoPrazo: 850,
      pedidosCompletosNoPrazo: 810,
      unidadesSolicitadas: 5000,
      unidadesAtendidas: 4500,
      leadTime: 7,
      itensConferidos: 750,
      itensCorretos: 720,
      custoLogistico: 23000,
    },
    metas: {
      otif: 94,
      otd: 94,
      fillRate: 97,
      leadTime: 6,
      acuracidade: 97,
      ruptura: 3,
    },
    mensagemInicial:
      "Compare unidades solicitadas e unidades atendidas. Tente alcançar Fill Rate de 97% e ruptura máxima de 3%.",
    alvoVisual:
      '[data-tour="unidades-atendidas-simulado"]',
  },

  "hora-repor": {
    atual: {
      ...initialCurrent,
      demanda: 4800,
      estoqueMedio: 1250,
      demandaDiariaMedia: 180,
      demandaDiariaMaxima: 240,
      leadTime: 7,
      leadTimeMaximo: 10,
      estoqueDisponivel: 1450,
    },
    simulado: {
      ...initialCurrent,
      demanda: 4800,
      estoqueMedio: 1250,
      demandaDiariaMedia: 180,
      demandaDiariaMaxima: 240,
      leadTime: 7,
      leadTimeMaximo: 10,
      estoqueDisponivel: 1450,
    },
    metas: {
      ...initialTargets,
      leadTime: 6,
    },
    mensagemInicial:
      "Observe o estoque disponível e compare com o ponto de reposição.",
    alvoVisual: '[data-tour="reposicao"]',
  },
};

function safeDivide(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return 0;
  }

  if (denominator <= 0) {
    return 0;
  }

  return numerator / denominator;
}

function calculateKPIs(data: OperationData): KPIResults {
  const otif =
    safeDivide(
      data.pedidosCompletosNoPrazo,
      data.pedidosTotais
    ) * 100;

  const otd =
    safeDivide(
      data.pedidosNoPrazo,
      data.pedidosTotais
    ) * 100;

  const fillRate =
    safeDivide(
      data.unidadesAtendidas,
      data.unidadesSolicitadas
    ) * 100;

  const ruptura = Math.max(
    0,
    safeDivide(
      data.unidadesSolicitadas - data.unidadesAtendidas,
      data.unidadesSolicitadas
    ) * 100
  );

  const giro = safeDivide(
    data.demanda,
    data.estoqueMedio
  );

  const acuracidade =
    safeDivide(
      data.itensCorretos,
      data.itensConferidos
    ) * 100;

  const custoPorPedido = safeDivide(
    data.custoLogistico,
    data.pedidosTotais
  );

  const demandaDuranteLeadTime =
    data.demandaDiariaMedia * data.leadTime;

  const estoqueSeguranca = Math.max(
    0,
    data.demandaDiariaMaxima * data.leadTimeMaximo -
    data.demandaDiariaMedia * data.leadTime
  );

  const pontoReposicao =
    demandaDuranteLeadTime + estoqueSeguranca;

  const precisaRepor =
    data.estoqueDisponivel <= pontoReposicao;

  return {
    otif,
    otd,
    fillRate,
    giro,
    ruptura,
    leadTime: data.leadTime,
    acuracidade,
    custoPorPedido,
    estoqueSeguranca,
    demandaDuranteLeadTime,
    pontoReposicao,
    precisaRepor,
  };
}
function validateOperation(
  data: OperationData,
  title: string
) {
  const errors: string[] = [];

  if (data.pedidosNoPrazo > data.pedidosTotais) {
    errors.push(
      `${title}: pedidos entregues no prazo não podem superar o total de pedidos.`
    );
  }

  if (
    data.pedidosCompletosNoPrazo >
    data.pedidosNoPrazo
  ) {
    errors.push(
      `${title}: pedidos completos no prazo não podem superar os pedidos entregues no prazo.`
    );
  }

  if (
    data.pedidosCompletosNoPrazo >
    data.pedidosTotais
  ) {
    errors.push(
      `${title}: pedidos completos no prazo não podem superar o total de pedidos.`
    );
  }

  if (
    data.unidadesAtendidas >
    data.unidadesSolicitadas
  ) {
    errors.push(
      `${title}: unidades atendidas não podem superar as unidades solicitadas.`
    );
  }

  if (data.itensCorretos > data.itensConferidos) {
    errors.push(
      `${title}: itens corretos não podem superar os itens conferidos.`
    );
  }

  if (
    data.demandaDiariaMaxima <
    data.demandaDiariaMedia
  ) {
    errors.push(
      `${title}: a demanda diária máxima deve ser igual ou maior que a demanda média.`
    );
  }

  if (data.leadTimeMaximo < data.leadTime) {
    errors.push(
      `${title}: o lead time máximo deve ser igual ou maior que o lead time médio.`
    );
  }

  if (data.pedidosTotais <= 0) {
    errors.push(
      `${title}: o total de pedidos deve ser maior que zero.`
    );
  }

  if (data.unidadesSolicitadas <= 0) {
    errors.push(
      `${title}: as unidades solicitadas devem ser maiores que zero.`
    );
  }

  if (data.itensConferidos <= 0) {
    errors.push(
      `${title}: os itens conferidos devem ser maiores que zero.`
    );
  }

  return errors;
}

function formatNumber(value: number, decimals = 1) {
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

function percentageStatus(
  value: number,
  target: number,
  lowerIsBetter = false
) {
  if (lowerIsBetter) {
    if (value <= target) return "good";
    if (value <= target * 1.2) return "warning";
    return "bad";
  }

  if (value >= target) return "good";
  if (value >= target * 0.9) return "warning";
  return "bad";
}

function statusClasses(status: string) {
  if (status === "good") {
    return {
      card: "border-emerald-200 bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-700",
      value: "text-emerald-700",
      label: "Meta alcançada",
    };
  }

  if (status === "warning") {
    return {
      card: "border-amber-200 bg-amber-50",
      icon: "bg-amber-100 text-amber-700",
      value: "text-amber-700",
      label: "Atenção",
    };
  }

  return {
    card: "border-red-200 bg-red-50",
    icon: "bg-red-100 text-red-700",
    value: "text-red-700",
    label: "Fora da meta",
  };
}

function NumberInput({
  label,
  name,
  value,
  suffix,
  tourId,
  onChange,
}: {
  label: string;
  name: keyof OperationData;
  value: number;
  suffix?: string;
  tourId?: string;
  onChange: (
    name: keyof OperationData,
    value: number
  ) => void;
}) {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value;

    setInputValue(newValue);

    if (newValue === "") {
      return;
    }

    const numericValue = Number(newValue);

    if (Number.isFinite(numericValue)) {
      onChange(name, Math.max(0, numericValue));
    }
  }

  function handleBlur() {
    if (inputValue.trim() === "") {
      setInputValue("0");
      onChange(name, 0);
      return;
    }

    const numericValue = Number(inputValue);

    if (!Number.isFinite(numericValue)) {
      setInputValue(String(value));
      return;
    }

    const validValue = Math.max(0, numericValue);

    setInputValue(String(validValue));
    onChange(name, validValue);
  }

  return (
    <label
      data-tour={tourId}
      className="block"
    >
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <div className="relative">
        <input
          type="number"
          min="0"
          step="1"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={(event) => event.target.select()}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-14 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        {suffix && (
          <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function TargetInput({
  label,
  value,
  onChange,
  suffix = "%",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value;

    setInputValue(newValue);

    if (newValue === "") {
      return;
    }

    const numericValue = Number(newValue);

    if (Number.isFinite(numericValue)) {
      onChange(Math.max(0, numericValue));
    }
  }

  function handleBlur() {
    if (inputValue.trim() === "") {
      setInputValue("0");
      onChange(0);
      return;
    }

    const numericValue = Number(inputValue);

    if (!Number.isFinite(numericValue)) {
      setInputValue(String(value));
      return;
    }

    const validValue = Math.max(0, numericValue);

    setInputValue(String(validValue));
    onChange(validValue);
  }

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>

      <div className="relative">
        <input
          type="number"
          min="0"
          step="1"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={(event) => event.target.select()}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {suffix}
        </span>
      </div>
    </label>
  );
}

function KPICard({
  title,
  current,
  simulated,
  target,
  format,
  tourId,
  lowerIsBetter = false,
}: {
  title: string;
  current: number;
  simulated: number;
  target?: number;
  format: (value: number) => string;
  tourId?: string;
  lowerIsBetter?: boolean;
}) {
  const variation = simulated - current;

  const status =
    target === undefined
      ? "good"
      : percentageStatus(simulated, target, lowerIsBetter);

  const styles = statusClasses(status);

  const improved = lowerIsBetter ? variation < 0 : variation > 0;
  const unchanged = Math.abs(variation) < 0.0001;

  return (
    <article
      data-tour={tourId}
      className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-600">{title}</p>

          <p className={`mt-2 text-3xl font-bold ${styles.value}`}>
            {format(simulated)}
          </p>
        </div>

        <div className={`rounded-xl p-2.5 ${styles.icon}`}>
          {status === "good" ? (
            <CheckCircle2 size={20} />
          ) : (
            <TriangleAlert size={20} />
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
        <div>
          <p className="text-xs text-slate-500">Atual</p>
          <p className="text-sm font-semibold text-slate-700">
            {format(current)}
          </p>
        </div>

        <div className="text-right">
          <div
            className={`flex items-center justify-end gap-1 text-sm font-semibold ${unchanged
              ? "text-slate-500"
              : improved
                ? "text-emerald-700"
                : "text-red-700"
              }`}
          >
            {!unchanged &&
              (variation > 0 ? (
                <TrendingUp size={15} />
              ) : (
                <TrendingDown size={15} />
              ))}

            {unchanged
              ? "Sem variação"
              : `${variation > 0 ? "+" : ""}${format(variation)}`}
          </div>

          {target !== undefined && (
            <p className="mt-1 text-xs text-slate-500">
              {styles.label} · Meta {format(target)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [current, setCurrent] =
    useState<OperationData>(initialCurrent);

  const [simulated, setSimulated] =
    useState<OperationData>(initialSimulated);

  const [targets, setTargets] = useState<Targets>(initialTargets);

  const [scenarioName, setScenarioName] = useState(
    "Cenário otimizado"
  );

  const [savedScenarios, setSavedScenarios] = useState<
    SavedScenario[]
  >([]);

  const [message, setMessage] = useState("");
  const [observations, setObservations] = useState("");



  const [
    atividadeIntermediaria,
    setAtividadeIntermediaria,
  ] = useState<TutorialIntermediario | null>(null);

  const [
    resumoCurvaABC,
    setResumoCurvaABC,
  ] = useState<ResumoCurvaABC>(
    resumoCurvaABCInicial
  );

  const [
    atividadeIntermediariaConcluida,
    setAtividadeIntermediariaConcluida,
  ] = useState(false);

  const [
    relatorioIntermediario,
    setRelatorioIntermediario,
  ] = useState<DadosRelatorioIntermediario | null>(
    null
  );

  const [
    mostrarRelatorioIntermediario,
    setMostrarRelatorioIntermediario,
  ] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        "logsim-pro-scenarios"
      );

      if (stored) {
        setSavedScenarios(JSON.parse(stored));
      }
    } catch {
      setMessage("Não foi possível carregar os cenários salvos.");
    }
  }, []);

  const tratarAtualizacaoCurvaABC =
    useCallback(
      (novoResumo: ResumoCurvaABC) => {
        setResumoCurvaABC(
          (resumoAnterior) => {
            const resumoNaoMudou =
              resumoAnterior.totalProdutos ===
              novoResumo.totalProdutos &&
              resumoAnterior.quantidadeClasseA ===
              novoResumo.quantidadeClasseA &&
              resumoAnterior.quantidadeClasseB ===
              novoResumo.quantidadeClasseB &&
              resumoAnterior.quantidadeClasseC ===
              novoResumo.quantidadeClasseC &&
              resumoAnterior.valorAnualTotal ===
              novoResumo.valorAnualTotal &&
              resumoAnterior.possuiClassificacaoCompleta ===
              novoResumo.possuiClassificacaoCompleta;

            return resumoNaoMudou
              ? resumoAnterior
              : novoResumo;
          }
        );
      },
      []
    );

  const currentKPIs = useMemo(
    () => calculateKPIs(current),
    [current]
  );

  const simulatedKPIs = useMemo(
    () => calculateKPIs(simulated),
    [simulated]
  );
  const objetivoIntermediarioAtingido =
    useMemo(() => {
      if (!atividadeIntermediaria) {
        return false;
      }

      switch (atividadeIntermediaria.id) {
        case "pedidos-incompletos":
          return (
            simulatedKPIs.otif >= targets.otif &&
            simulatedKPIs.otd >= targets.otd
          );

        case "falta-produtos":
          return (
            simulatedKPIs.fillRate >=
            targets.fillRate &&
            simulatedKPIs.ruptura <=
            targets.ruptura
          );

        case "hora-repor":
          return !simulatedKPIs.precisaRepor;

        case "produtos-importantes":
          return (
            resumoCurvaABC.totalProdutos >= 3 &&
            resumoCurvaABC.quantidadeClasseA >= 1 &&
            resumoCurvaABC.quantidadeClasseB >= 1 &&
            resumoCurvaABC.quantidadeClasseC >= 1 &&
            resumoCurvaABC.possuiClassificacaoCompleta
          );

        default:
          return false;
      }
    }, [
      atividadeIntermediaria,
      simulatedKPIs,
      targets,
    ]);


  const validationErrors = useMemo(() => {
    return [
      ...validateOperation(current, "Operação atual"),
      ...validateOperation(
        simulated,
        "Cenário simulado"
      ),
    ];
  }, [current, simulated]);

  const hasValidationErrors =
    validationErrors.length > 0;


  const chartData = [
    {
      indicador: "OTIF",
      Atual: Number(currentKPIs.otif.toFixed(1)),
      Simulado: Number(simulatedKPIs.otif.toFixed(1)),
      Meta: targets.otif,
    },
    {
      indicador: "OTD",
      Atual: Number(currentKPIs.otd.toFixed(1)),
      Simulado: Number(simulatedKPIs.otd.toFixed(1)),
      Meta: targets.otd,
    },
    {
      indicador: "Fill Rate",
      Atual: Number(currentKPIs.fillRate.toFixed(1)),
      Simulado: Number(simulatedKPIs.fillRate.toFixed(1)),
      Meta: targets.fillRate,
    },
    {
      indicador: "Acuracidade",
      Atual: Number(currentKPIs.acuracidade.toFixed(1)),
      Simulado: Number(simulatedKPIs.acuracidade.toFixed(1)),
      Meta: targets.acuracidade,
    },
  ];

  function updateCurrent(
    name: keyof OperationData,
    value: number
  ) {
    setCurrent((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function updateSimulated(
    name: keyof OperationData,
    value: number
  ) {
    setSimulated((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function iniciarProblemaIntermediario(
    tutorial: TutorialIntermediario
  ) {
    setAtividadeIntermediaria(tutorial);
    setAtividadeIntermediariaConcluida(false);

    const cenario =
      cenariosIntermediarios[tutorial.id];

    if (!cenario) {
      if (
        tutorial.id ===
        "produtos-importantes"
      ) {
        setMessage(
          "Analise a Curva ABC e identifique produtos nas classes A, B e C."
        );

        setScenarioName(
          `Artesanatos Lucia’s - ${tutorial.titulo}`
        );

        setObservations(
          `Atividade intermediária: ${tutorial.titulo}\n\nObjetivo: ${tutorial.objetivo}`
        );

        window.setTimeout(() => {
          document
            .querySelector(
              '[data-tour="atividade-curva-abc"]'
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
        }, 150);

        return;
      }

      setMessage(
        "Este problema ainda não possui um cenário conectado."
      );

      return;
    }

    setCurrent({ ...cenario.atual });
    setSimulated({ ...cenario.simulado });
    setTargets({ ...cenario.metas });

    setScenarioName(
      `Artesanatos Lucia’s - ${tutorial.titulo}`
    );

    setObservations(
      `Atividade intermediária: ${tutorial.titulo}\n\nObjetivo: ${tutorial.objetivo}`
    );

    setMessage(cenario.mensagemInicial);

    localStorage.setItem(
      "cenarilog-academy-v4-1-atividade-atual",
      tutorial.id
    );

    window.setTimeout(() => {
      document
        .querySelector(cenario.alvoVisual)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 150);
  }

  function obterPistasUtilizadas(
    tutorialId: IdTutorialIntermediario
  ) {
    const chaveProgresso =
      "cenarilog-academy-v4-1-progresso-intermediario";

    try {
      const progressoSalvo =
        localStorage.getItem(chaveProgresso);

      if (!progressoSalvo) {
        return 0;
      }

      const progresso = JSON.parse(
        progressoSalvo
      );

      if (!Array.isArray(progresso)) {
        return 0;
      }

      const registro = progresso.find(
        (item) =>
          item.tutorialId === tutorialId
      );

      return typeof registro?.pistasVisualizadas ===
        "number"
        ? registro.pistasVisualizadas
        : 0;
    } catch {
      return 0;
    }
  }

  function criarIndicadoresRelatorio(
    tutorialId: IdTutorialIntermediario
  ): DadosRelatorioIntermediario["indicadores"] {
    switch (tutorialId) {
      case "pedidos-incompletos":
        return [
          {
            nome: "OTD",
            antes: currentKPIs.otd,
            depois: simulatedKPIs.otd,
            unidade: "%",
          },
          {
            nome: "OTIF",
            antes: currentKPIs.otif,
            depois: simulatedKPIs.otif,
            unidade: "%",
          },
        ];

      case "falta-produtos":
        return [
          {
            nome: "Fill Rate",
            antes: currentKPIs.fillRate,
            depois: simulatedKPIs.fillRate,
            unidade: "%",
          },
          {
            nome: "Ruptura",
            antes: currentKPIs.ruptura,
            depois: simulatedKPIs.ruptura,
            unidade: "%",
            menorMelhor: true,
          },
          {
            nome: "Unidades atendidas",
            antes: current.unidadesAtendidas,
            depois: simulated.unidadesAtendidas,
            unidade: "un.",
          },
        ];

      case "hora-repor":
        return [
          {
            nome: "Lead time",
            antes: currentKPIs.leadTime,
            depois: simulatedKPIs.leadTime,
            unidade: "dias",
            menorMelhor: true,
          },
          {
            nome: "Estoque disponível",
            antes: current.estoqueDisponivel,
            depois: simulated.estoqueDisponivel,
            unidade: "un.",
          },
          {
            nome: "Ponto de reposição",
            antes: currentKPIs.pontoReposicao,
            depois: simulatedKPIs.pontoReposicao,
            unidade: "un.",
            menorMelhor: true,
          },
        ];

      case "produtos-importantes":
        return [
          {
            nome: "Produtos analisados",
            antes: 0,
            depois:
              resumoCurvaABC.totalProdutos,
            unidade: "un.",
          },
          {
            nome: "Produtos Classe A",
            antes: 0,
            depois:
              resumoCurvaABC.quantidadeClasseA,
            unidade: "un.",
          },
          {
            nome: "Produtos Classe B",
            antes: 0,
            depois:
              resumoCurvaABC.quantidadeClasseB,
            unidade: "un.",
          },
          {
            nome: "Produtos Classe C",
            antes: 0,
            depois:
              resumoCurvaABC.quantidadeClasseC,
            unidade: "un.",
          },
          {
            nome: "Valor anual analisado",
            antes: 0,
            depois:
              resumoCurvaABC.valorAnualTotal,
            unidade: "R$",
          },
        ];

      default:
        return [];
    }
  }

  function criarPontosFortes(
    tutorialId: IdTutorialIntermediario
  ) {
    switch (tutorialId) {
      case "pedidos-incompletos":
        return [
          "Você comparou OTD e OTIF.",
          "Você identificou que prazo e completude são condições diferentes.",
          "Você atingiu a meta de OTIF.",
        ];

      case "falta-produtos":
        return [
          "Você comparou unidades solicitadas e atendidas.",
          "Você observou Fill Rate e ruptura em conjunto.",
          "Você reduziu a falta de produtos no cenário.",
        ];

      case "hora-repor":
        return [
          "Você comparou estoque disponível e ponto de reposição.",
          "Você analisou o efeito do prazo sobre a reposição.",
          "Você encontrou uma condição adequada para a atividade.",
        ];

      case "produtos-importantes":
        return [
          "Você analisou os produtos pelo valor anual de consumo.",
          "Você identificou produtos nas classes A, B e C.",
          "Você reconheceu que produtos de maior impacto exigem acompanhamento mais próximo.",
        ];

      default:
        return [
          "Você concluiu o problema proposto.",
        ];
    }
  }

  function criarPontosParaPraticar(
    tutorialId: IdTutorialIntermediario,
    pistasUtilizadas: number
  ) {
    const pontos =
      pistasUtilizadas === 0
        ? [
          "Explique a solução com suas próprias palavras.",
        ]
        : [
          "Repita a atividade usando menos pistas.",
        ];

    switch (tutorialId) {
      case "pedidos-incompletos":
        pontos.push(
          "Observe como estoque, separação e conferência podem afetar o OTIF."
        );
        break;

      case "falta-produtos":
        pontos.push(
          "Compare o ganho de atendimento com o possível aumento do estoque."
        );
        break;

      case "hora-repor":
        pontos.push(
          "Teste diferentes valores de lead time, estoque e demanda diária."
        );
        break;

      case "produtos-importantes":
        pontos.push(
          "Teste diferentes demandas e custos para observar como a classificação ABC muda."
        );

        pontos.push(
          "Lembre que um produto Classe C ainda pode ser importante para a operação."
        );
        break;
    }

    return pontos;
  }



  function concluirProblemaIntermediario() {
    if (
      !atividadeIntermediaria ||
      !objetivoIntermediarioAtingido
    ) {
      return;
    }

    setAtividadeIntermediariaConcluida(true);

    const chaveProgresso =
      "cenarilog-academy-v4-1-progresso-intermediario";

    try {
      const progressoSalvo =
        localStorage.getItem(chaveProgresso);

      const progressoAtual = progressoSalvo
        ? JSON.parse(progressoSalvo)
        : [];

      const lista = Array.isArray(progressoAtual)
        ? progressoAtual
        : [];

      const atualizado = [
        ...lista.filter(
          (item) =>
            item.tutorialId !==
            atividadeIntermediaria.id
        ),
        {
          tutorialId:
            atividadeIntermediaria.id,
          iniciadoEm:
            lista.find(
              (item) =>
                item.tutorialId ===
                atividadeIntermediaria.id
            )?.iniciadoEm ??
            new Date().toISOString(),
          pistasVisualizadas:
            lista.find(
              (item) =>
                item.tutorialId ===
                atividadeIntermediaria.id
            )?.pistasVisualizadas ?? 0,
          concluido: true,
          concluidoEm: new Date().toISOString(),
        },
      ];

      localStorage.setItem(
        chaveProgresso,
        JSON.stringify(atualizado)
      );
    } catch {
      setMessage(
        "A atividade foi concluída, mas o progresso não pôde ser salvo."
      );

      return;
    }

    const pistasUtilizadas =
      obterPistasUtilizadas(
        atividadeIntermediaria.id
      );

    const novoRelatorio: DadosRelatorioIntermediario = {
      tutorial: atividadeIntermediaria,
      concluidoEm: new Date().toISOString(),
      indicadores: criarIndicadoresRelatorio(
        atividadeIntermediaria.id
      ),
      pistasUtilizadas,
      pontosFortes: criarPontosFortes(
        atividadeIntermediaria.id
      ),
      pontosParaPraticar:
        criarPontosParaPraticar(
          atividadeIntermediaria.id,
          pistasUtilizadas
        ),
      proximoTutorial:
        atividadeIntermediaria.proximoTutorial,
    };

    setRelatorioIntermediario(novoRelatorio);
    setMostrarRelatorioIntermediario(true);

    localStorage.setItem(
      "cenarilog-academy-v4-1-ultimo-relatorio",
      JSON.stringify(novoRelatorio)
    );

    setMessage(
      `Problema concluído: ${atividadeIntermediaria.titulo}.`
    );
  }

  function repetirAtividadeIntermediaria() {
    if (!atividadeIntermediaria) {
      return;
    }

    setMostrarRelatorioIntermediario(false);
    setRelatorioIntermediario(null);
    setAtividadeIntermediariaConcluida(false);

    iniciarProblemaIntermediario(
      atividadeIntermediaria
    );
  }

  function abrirProximoProblemaIntermediario(
    tutorialId: IdTutorialIntermediario
  ) {
    const proximoTutorial =
      tutoriaisIntermediarios.find(
        (tutorial) =>
          tutorial.id === tutorialId
      );

    if (!proximoTutorial) {
      setMessage(
        "O próximo problema não foi encontrado."
      );

      return;
    }

    setMostrarRelatorioIntermediario(
      false
    );

    setRelatorioIntermediario(
      null
    );

    setAtividadeIntermediariaConcluida(
      false
    );

    iniciarProblemaIntermediario(
      proximoTutorial
    );
  }

  function copyCurrentToSimulation() {
    setSimulated({ ...current });
    setScenarioName("Cópia da operação atual");
    setMessage("Dados atuais copiados para o cenário.");
  }

  function saveScenario() {
    if (validationErrors.length > 0) {
      setMessage(
        "Corrija os erros de consistência antes de salvar o cenário."
      );
      return;
    }
    const name =
      scenarioName.trim() || `Cenário ${savedScenarios.length + 1}`;

    const newScenario: SavedScenario = {
      nome: name,
      data: new Date().toLocaleString("pt-BR"),
      operation: simulated,
    };

    const updatedScenarios = [
      newScenario,
      ...savedScenarios,
    ].slice(0, 10);

    setSavedScenarios(updatedScenarios);

    try {
      localStorage.setItem(
        "logsim-pro-scenarios",
        JSON.stringify(updatedScenarios)
      );

      setMessage(`Cenário "${name}" salvo no navegador.`);
    } catch {
      setMessage("Não foi possível salvar o cenário.");
    }
  }

  function loadScenario(scenario: SavedScenario) {
    setScenarioName(scenario.nome);
    setSimulated(scenario.operation);
    setMessage(`Cenário "${scenario.nome}" carregado.`);
  }

  function removeScenario(index: number) {
    const updatedScenarios = savedScenarios.filter(
      (_, scenarioIndex) => scenarioIndex !== index
    );

    setSavedScenarios(updatedScenarios);

    try {
      localStorage.setItem(
        "logsim-pro-scenarios",
        JSON.stringify(updatedScenarios)
      );

      setMessage("Cenário excluído.");
    } catch {
      setMessage("Não foi possível atualizar os cenários.");
    }
  }

  function exportJson() {
    const backup: LogSimBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      current,
      simulated,
      targets,
      scenarioName,
      observations,
      savedScenarios,
    };

    const json = JSON.stringify(backup, null, 2);

    const blob = new Blob([json], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    link.href = url;
    link.download = `cenarilog-academy-backup-${date}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    setMessage("Backup JSON exportado com sucesso.");
  }

  function isOperationData(
    value: unknown
  ): value is OperationData {
    if (
      typeof value !== "object" ||
      value === null
    ) {
      return false;
    }

    const operation =
      value as Record<string, unknown>;

    const requiredFields: Array<
      keyof OperationData
    > = [
        "demanda",
        "estoqueMedio",
        "pedidosTotais",
        "pedidosNoPrazo",
        "pedidosCompletosNoPrazo",
        "unidadesSolicitadas",
        "unidadesAtendidas",
        "leadTime",
        "itensConferidos",
        "itensCorretos",
        "custoLogistico",
        "demandaDiariaMedia",
        "demandaDiariaMaxima",
        "leadTimeMaximo",
        "estoqueDisponivel",
      ];

    return requiredFields.every(
      (field) =>
        typeof operation[field] === "number" &&
        Number.isFinite(operation[field])
    );
  }

  function isTargets(
    value: unknown
  ): value is Targets {
    if (
      typeof value !== "object" ||
      value === null
    ) {
      return false;
    }

    const importedTargets =
      value as Record<string, unknown>;

    const requiredFields: Array<keyof Targets> = [
      "otif",
      "otd",
      "fillRate",
      "leadTime",
      "acuracidade",
      "ruptura",
    ];

    return requiredFields.every(
      (field) =>
        typeof importedTargets[field] === "number" &&
        Number.isFinite(importedTargets[field])
    );
  }

  function importJson(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.name.toLowerCase().endsWith(".json")
    ) {
      setMessage(
        "Selecione um arquivo com extensão .json."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        if (typeof reader.result !== "string") {
          throw new Error("Conteúdo inválido.");
        }

        const parsed = JSON.parse(
          reader.result
        ) as Partial<LogSimBackup>;

        if (parsed.version !== 1) {
          throw new Error(
            "Versão de backup incompatível."
          );
        }

        if (
          !isOperationData(parsed.current) ||
          !isOperationData(parsed.simulated) ||
          !isTargets(parsed.targets)
        ) {
          throw new Error(
            "O arquivo não possui dados válidos do CenariLog Academy."
          );
        }

        setCurrent(parsed.current);
        setSimulated(parsed.simulated);
        setTargets(parsed.targets);

        setScenarioName(
          typeof parsed.scenarioName === "string"
            ? parsed.scenarioName
            : "Cenário importado"
        );

        setObservations(
          typeof parsed.observations === "string"
            ? parsed.observations
            : ""
        );

        const importedScenarios =
          Array.isArray(parsed.savedScenarios)
            ? parsed.savedScenarios
            : [];

        setSavedScenarios(importedScenarios);

        localStorage.setItem(
          "logsim-pro-scenarios",
          JSON.stringify(importedScenarios)
        );

        setMessage(
          `Backup "${file.name}" importado com sucesso.`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Arquivo inválido.";

        setMessage(
          `Não foi possível importar: ${errorMessage}`
        );
      } finally {
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setMessage(
        "Não foi possível ler o arquivo selecionado."
      );

      event.target.value = "";
    };

    reader.readAsText(file);
  }

  function resetExample() {
    setCurrent(initialCurrent);
    setSimulated(initialSimulated);
    setTargets(initialTargets);
    setScenarioName("Cenário otimizado");
    setObservations("");
    setMessage("Dados de exemplo restaurados.");

  }

  const diagnostics = useMemo(() => {
    const messages: string[] = [];

    if (simulatedKPIs.otif < targets.otif) {
      messages.push(
        "O OTIF está abaixo da meta. Verifique simultaneamente atrasos e pedidos incompletos."
      );
    }

    if (
      simulatedKPIs.otd >= targets.otd &&
      simulatedKPIs.otif < targets.otif
    ) {
      messages.push(
        "As entregas chegam no prazo, mas parte delas pode estar incompleta."
      );
    }

    if (simulatedKPIs.fillRate < targets.fillRate) {
      messages.push(
        "O Fill Rate está abaixo da meta. Avalie disponibilidade, estoque de segurança e reposição."
      );
    }

    if (simulatedKPIs.ruptura > targets.ruptura) {
      messages.push(
        "A ruptura está acima do limite definido. Considere rever estoque e previsão de demanda."
      );
    }

    if (simulatedKPIs.leadTime > targets.leadTime) {
      messages.push(
        "O lead time está acima da meta. Analise fornecedores, processamento e transporte."
      );
    }

    if (simulatedKPIs.acuracidade < targets.acuracidade) {
      messages.push(
        "A acuracidade está baixa. Revise inventário físico, registros e movimentações."
      );
    }

    if (messages.length === 0) {
      messages.push(
        "Todos os indicadores controlados estão dentro das metas definidas."
      );
    }

    return messages;
  }, [simulatedKPIs, targets]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header
        data-tour="cabecalho"
        className="border-b border-slate-800 bg-slate-950 text-white"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-600 p-3 shadow-lg shadow-blue-950/30">
              <Truck size={30} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                CenariLog Academy
              </h1>

              <p className="mt-1 text-sm text-slate-300">
                Aprenda logística simulando decisões.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <GuiaInterativo
              aoSelecionarAtividadeIntermediaria={
                iniciarProblemaIntermediario
              }
            />

            <button
              data-tour="restaurar-exemplo"
              type="button"
              onClick={resetExample}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-800"
            >
              <RotateCcw size={17} />
              Restaurar exemplo
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {message && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>{message}</span>

            {atividadeIntermediaria && (
              <section className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                      Artesanatos Lucia’s · Nível intermediário
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {atividadeIntermediaria.titulo}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">
                      {atividadeIntermediaria.objetivo}
                    </p>

                    <p
                      className={`mt-3 text-sm font-bold ${objetivoIntermediarioAtingido
                        ? "text-emerald-700"
                        : "text-amber-800"
                        }`}
                    >
                      {objetivoIntermediarioAtingido
                        ? "Objetivo atingido. Você pode concluir a atividade."
                        : "Objetivo ainda não atingido. Analise os indicadores e teste uma mudança."}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setAtividadeIntermediaria(null);
                        setAtividadeIntermediariaConcluida(false);

                        localStorage.removeItem(
                          "cenarilog-academy-v4-1-atividade-atual"
                        );
                      }}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Encerrar
                    </button>

                    <button
                      type="button"
                      onClick={concluirProblemaIntermediario}
                      disabled={
                        !objetivoIntermediarioAtingido ||
                        atividadeIntermediariaConcluida
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {atividadeIntermediariaConcluida
                        ? "Atividade concluída"
                        : "Concluir atividade"}
                    </button>
                  </div>
                </div>
              </section>
            )}


            <button
              type="button"
              onClick={() => setMessage("")}
              className="font-bold"
              aria-label="Fechar mensagem"
            >
              ×
            </button>
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-2">
          <div
            data-tour="operacao-atual"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
                <Warehouse size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Operação atual
                </h2>
                <p className="text-sm text-slate-500">
                  Dados reais ou situação inicial
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <NumberInput
                label="Demanda no período"
                name="demanda"
                value={current.demanda}
                suffix="un."
                onChange={updateCurrent}
              />

              <NumberInput
                label="Estoque médio"
                name="estoqueMedio"
                value={current.estoqueMedio}
                suffix="un."
                onChange={updateCurrent}
              />

              <NumberInput
                label="Total de pedidos"
                name="pedidosTotais"
                value={current.pedidosTotais}
                onChange={updateCurrent}
              />

              <NumberInput
                label="Pedidos entregues no prazo"
                name="pedidosNoPrazo"
                value={current.pedidosNoPrazo}
                onChange={updateCurrent}
              />

              <NumberInput
                label="Pedidos no prazo e completos"
                name="pedidosCompletosNoPrazo"
                value={current.pedidosCompletosNoPrazo}
                onChange={updateCurrent}
              />

              <NumberInput
                label="Unidades solicitadas"
                name="unidadesSolicitadas"
                value={current.unidadesSolicitadas}
                suffix="un."
                onChange={updateCurrent}
              />

              <NumberInput
                label="Unidades atendidas"
                name="unidadesAtendidas"
                value={current.unidadesAtendidas}
                suffix="un."
                onChange={updateCurrent}
              />

              <NumberInput
                label="Lead time médio"
                name="leadTime"
                value={current.leadTime}
                suffix="dias"
                onChange={updateCurrent}
              />

              <NumberInput
                label="Demanda média diária"
                name="demandaDiariaMedia"
                value={current.demandaDiariaMedia}
                suffix="un./dia"
                onChange={updateCurrent}
              />

              <NumberInput
                label="Demanda máxima diária"
                name="demandaDiariaMaxima"
                value={current.demandaDiariaMaxima}
                suffix="un./dia"
                onChange={updateCurrent}
              />

              <NumberInput
                label="Lead time máximo"
                name="leadTimeMaximo"
                value={current.leadTimeMaximo}
                suffix="dias"
                onChange={updateCurrent}
              />

              <NumberInput
                label="Estoque disponível"
                name="estoqueDisponivel"
                value={current.estoqueDisponivel}
                suffix="un."
                onChange={updateCurrent}
              />

              <NumberInput
                label="Itens conferidos"
                name="itensConferidos"
                value={current.itensConferidos}
                onChange={updateCurrent}
              />

              <NumberInput
                label="Itens corretos"
                name="itensCorretos"
                value={current.itensCorretos}
                onChange={updateCurrent}
              />

              <div className="sm:col-span-2">
                <NumberInput
                  label="Custo logístico total"
                  name="custoLogistico"
                  value={current.custoLogistico}
                  suffix="R$"
                  onChange={updateCurrent}
                />
              </div>
            </div>

            <button
              data-tour="copiar-cenario"
              type="button"
              onClick={copyCurrentToSimulation}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Copy size={17} />
              Copiar para o cenário simulado
            </button>
          </div>

          <div
            data-tour="cenario-simulado"
            className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
                  <Calculator size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Cenário simulado
                  </h2>
                  <p className="text-sm text-slate-500">
                    Altere os dados para testar decisões
                  </p>
                </div>
              </div>
            </div>

            <label className="mb-5 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Nome do cenário
              </span>

              <input
                type="text"
                value={scenarioName}
                onChange={(event) =>
                  setScenarioName(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <NumberInput
                label="Demanda no período"
                name="demanda"
                value={simulated.demanda}
                suffix="un."
                onChange={updateSimulated}
              />

              <NumberInput
                label="Estoque médio"
                name="estoqueMedio"
                value={simulated.estoqueMedio}
                suffix="un."
                onChange={updateSimulated}
              />

              <NumberInput
                label="Total de pedidos"
                name="pedidosTotais"
                value={simulated.pedidosTotais}
                onChange={updateSimulated}
              />

              <NumberInput
                tourId="pedidos-prazo-simulado"
                label="Pedidos entregues no prazo"
                name="pedidosNoPrazo"
                value={simulated.pedidosNoPrazo}
                onChange={updateSimulated}
              />

              <NumberInput
                tourId="pedidos-completos-simulado"
                label="Pedidos no prazo e completos"
                name="pedidosCompletosNoPrazo"
                value={simulated.pedidosCompletosNoPrazo}
                onChange={updateSimulated}
              />


              <NumberInput
                label="Unidades solicitadas"
                name="unidadesSolicitadas"
                value={simulated.unidadesSolicitadas}
                suffix="un."
                onChange={updateSimulated}
              />

              <NumberInput
                tourId="unidades-atendidas-simulado"
                label="Unidades atendidas"
                name="unidadesAtendidas"
                value={simulated.unidadesAtendidas}
                suffix="un."
                onChange={updateSimulated}
              />

              <NumberInput
                label="Lead time médio"
                name="leadTime"
                value={simulated.leadTime}
                suffix="dias"
                onChange={updateSimulated}
              />

              <NumberInput
                label="Demanda média diária"
                name="demandaDiariaMedia"
                value={simulated.demandaDiariaMedia}
                suffix="un./dia"
                onChange={updateSimulated}
              />

              <NumberInput
                label="Demanda máxima diária"
                name="demandaDiariaMaxima"
                value={simulated.demandaDiariaMaxima}
                suffix="un./dia"
                onChange={updateSimulated}
              />

              <NumberInput
                label="Lead time máximo"
                name="leadTimeMaximo"
                value={simulated.leadTimeMaximo}
                suffix="dias"
                onChange={updateSimulated}
              />

              <NumberInput
                label="Estoque disponível"
                name="estoqueDisponivel"
                value={simulated.estoqueDisponivel}
                suffix="un."
                onChange={updateSimulated}
              />

              <NumberInput
                label="Itens conferidos"
                name="itensConferidos"
                value={simulated.itensConferidos}
                onChange={updateSimulated}
              />

              <NumberInput
                label="Itens corretos"
                name="itensCorretos"
                value={simulated.itensCorretos}
                onChange={updateSimulated}
              />

              <div className="sm:col-span-2">
                <NumberInput
                  label="Custo logístico total"
                  name="custoLogistico"
                  value={simulated.custoLogistico}
                  suffix="R$"
                  onChange={updateSimulated}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={saveScenario}
              disabled={hasValidationErrors}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Save size={17} />
              Salvar cenário no navegador
            </button>
          </div>
        </section>



        <section
          data-tour="validacao"
          className="mt-8"
        >
          {hasValidationErrors ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-2.5 text-red-700">
                  <AlertCircle size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-red-900">
                    Erros de consistência
                  </h2>

                  <p className="text-sm text-red-700">
                    Corrija os dados antes de salvar ou analisar o cenário.
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-2">
                {validationErrors.map((error) => (
                  <li
                    key={error}
                    className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-800"
                  >
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
              <CheckCircle2 size={22} />

              <div>
                <p className="font-bold">
                  Dados consistentes
                </p>

                <p className="text-sm">
                  Nenhuma inconsistência foi identificada.
                </p>
              </div>
            </div>
          )}
        </section>


        <section
          data-tour="metas"
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700">
              <Target size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Metas personalizadas
              </h2>

              <p className="text-sm text-slate-500">
                Defina seus próprios limites de desempenho
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <TargetInput
              label="Meta OTIF"
              value={targets.otif}
              onChange={(value) =>
                setTargets((previous) => ({
                  ...previous,
                  otif: value,
                }))
              }
            />

            <TargetInput
              label="Meta OTD"
              value={targets.otd}
              onChange={(value) =>
                setTargets((previous) => ({
                  ...previous,
                  otd: value,
                }))
              }
            />

            <TargetInput
              label="Meta Fill Rate"
              value={targets.fillRate}
              onChange={(value) =>
                setTargets((previous) => ({
                  ...previous,
                  fillRate: value,
                }))
              }
            />

            <TargetInput
              label="Lead time máximo"
              value={targets.leadTime}
              suffix="dias"
              onChange={(value) =>
                setTargets((previous) => ({
                  ...previous,
                  leadTime: value,
                }))
              }
            />

            <TargetInput
              label="Meta acuracidade"
              value={targets.acuracidade}
              onChange={(value) =>
                setTargets((previous) => ({
                  ...previous,
                  acuracidade: value,
                }))
              }
            />

            <TargetInput
              label="Ruptura máxima"
              value={targets.ruptura}
              onChange={(value) =>
                setTargets((previous) => ({
                  ...previous,
                  ruptura: value,
                }))
              }
            />
          </div>
        </section>

        <section
          data-tour="reposicao"
          className="mt-8"
        >
          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Planejamento de reposição
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Resultados calculados para o cenário simulado
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-600">
                Demanda durante o lead time
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-700">
                {formatNumber(
                  simulatedKPIs.demandaDuranteLeadTime,
                  0
                )}{" "}
                un.
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Demanda média diária × lead time médio
              </p>
            </article>

            <article className="rounded-2xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-600">
                Estoque de segurança
              </p>

              <p className="mt-2 text-3xl font-bold text-violet-700">
                {formatNumber(
                  simulatedKPIs.estoqueSeguranca,
                  0
                )}{" "}
                un.
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Proteção estimada contra variações de demanda e prazo
              </p>
            </article>

            <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-600">
                Ponto de reposição
              </p>

              <p className="mt-2 text-3xl font-bold text-indigo-700">
                {formatNumber(
                  simulatedKPIs.pontoReposicao,
                  0
                )}{" "}
                un.
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Nível estimado para disparar uma nova compra
              </p>
            </article>

            <article
              className={`rounded-2xl border p-5 shadow-sm ${simulatedKPIs.precisaRepor
                ? "border-red-200 bg-red-50"
                : "border-emerald-200 bg-emerald-50"
                }`}
            >
              <p className="text-sm font-semibold text-slate-600">
                Situação da reposição
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${simulatedKPIs.precisaRepor
                  ? "text-red-700"
                  : "text-emerald-700"
                  }`}
              >
                {simulatedKPIs.precisaRepor
                  ? "Repor estoque"
                  : "Estoque suficiente"}
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Disponível:{" "}
                {formatNumber(
                  simulated.estoqueDisponivel,
                  0
                )}{" "}
                unidades
              </p>
            </article>
          </div>
        </section>

        <section
          data-tour="painel-indicadores"
          className="mt-8"
        >
          <div className="mb-5 flex items-center gap-3">
            <BarChart3 className="text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold">
                Painel de indicadores
              </h2>
              <p className="text-sm text-slate-500">
                Resultado principal do cenário simulado
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <KPICard
              tourId="indicador-otif"
              title="OTIF"
              current={currentKPIs.otif}
              simulated={simulatedKPIs.otif}
              target={targets.otif}
              format={(value) => `${formatNumber(value)}%`}
            />

            <KPICard
              tourId="indicador-otd"
              title="OTD"
              current={currentKPIs.otd}
              simulated={simulatedKPIs.otd}
              target={targets.otd}
              format={(value) => `${formatNumber(value)}%`}
            />

            <KPICard
              tourId="indicador-fill-rate"
              title="Fill Rate"
              current={currentKPIs.fillRate}
              simulated={simulatedKPIs.fillRate}
              target={targets.fillRate}
              format={(value) => `${formatNumber(value)}%`}
            />

            <KPICard
              tourId="indicador-ruptura"
              title="Ruptura"
              current={currentKPIs.ruptura}
              simulated={simulatedKPIs.ruptura}
              target={targets.ruptura}
              lowerIsBetter
              format={(value) => `${formatNumber(value)}%`}
            />

            <KPICard
              title="Giro de estoque"
              current={currentKPIs.giro}
              simulated={simulatedKPIs.giro}
              format={(value) => `${formatNumber(value, 2)}x`}
            />

            <KPICard
              title="Lead time"
              current={currentKPIs.leadTime}
              simulated={simulatedKPIs.leadTime}
              target={targets.leadTime}
              lowerIsBetter
              format={(value) => `${formatNumber(value)} dias`}
            />

            <KPICard
              title="Acuracidade"
              current={currentKPIs.acuracidade}
              simulated={simulatedKPIs.acuracidade}
              target={targets.acuracidade}
              format={(value) => `${formatNumber(value)}%`}
            />

            <KPICard
              title="Custo por pedido"
              current={currentKPIs.custoPorPedido}
              simulated={simulatedKPIs.custoPorPedido}
              lowerIsBetter
              format={formatCurrency}
            />
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          <div
            data-tour="grafico-comparacao"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2"
          >
            <h2 className="text-xl font-bold">
              Atual × Simulado × Meta
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Comparação dos indicadores percentuais
            </p>

            <div className="mt-6 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="indicador"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="Atual"
                    fill="#64748b"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="Simulado"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="Meta"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
                <TriangleAlert size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Diagnóstico
                </h2>
                <p className="text-sm text-slate-600">
                  Análise automática do cenário
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-3">
              {diagnostics.map((diagnostic) => (
                <li
                  key={diagnostic}
                  className="rounded-xl border border-amber-200 bg-white/70 p-3 text-sm leading-relaxed text-slate-700"
                >
                  {diagnostic}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Observações da simulação
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Registre decisões, premissas e conclusões do cenário.
          </p>

          <textarea
            value={observations}
            onChange={(event) =>
              setObservations(event.target.value)
            }
            rows={6}
            placeholder="Exemplo: aumentar o estoque de segurança, negociar redução do lead time e revisar o fornecedor..."
            className="mt-5 w-full resize-y rounded-xl border border-slate-300 p-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <p className="mt-2 text-right text-xs text-slate-400">
            {observations.length} caracteres
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-100 p-2.5 text-cyan-700">
              <FileJson size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Backup do CenariLog Academy
              </h2>

              <p className="text-sm text-slate-500">
                Exporte ou importe os dados completos em JSON.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={exportJson}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700"
            >
              <Download size={18} />
              Exportar backup JSON
            </button>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-3 font-semibold text-cyan-800 transition hover:bg-cyan-100">
              <Upload size={18} />
              Importar backup JSON

              <input
                type="file"
                accept="application/json,.json"
                onChange={importJson}
                className="hidden"
              />
            </label>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            O arquivo inclui operação atual, cenário simulado,
            metas, observações e cenários salvos.
          </p>
        </section>

        <div data-tour="modulos-avancados">
          <ProductsModule
            atividadeIntermediariaAtiva={
              atividadeIntermediaria?.id ===
              "produtos-importantes"
            }
            aoAtualizarCurvaABC={
              tratarAtualizacaoCurvaABC
            }
          />

          <MonthlySimulation />

          <ChallengeOptimizer />
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Cenários salvos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Os últimos dez cenários ficam salvos neste navegador
          </p>

          {savedScenarios.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Nenhum cenário foi salvo.
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {savedScenarios.map((scenario, index) => (
                <div
                  key={`${scenario.nome}-${scenario.data}-${index}`}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {scenario.nome}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Salvo em {scenario.data}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => loadScenario(scenario)}
                      className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-200"
                    >
                      Carregar
                    </button>

                    <button
                      type="button"
                      onClick={() => removeScenario(index)}
                      className="rounded-lg bg-red-100 p-2 text-red-700 transition hover:bg-red-200"
                      aria-label={`Excluir ${scenario.nome}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="py-8 text-center text-sm text-slate-500">
          CenariLog Academy · Aprenda logística simulando decisões.
        </footer>


        <RelatorioIntermediario
          aberto={
            mostrarRelatorioIntermediario
          }
          dados={
            relatorioIntermediario
          }
          aoFechar={() => {
            setMostrarRelatorioIntermediario(
              false
            );
          }}
          aoRepetir={
            repetirAtividadeIntermediaria
          }
          aoAbrirProximo={
            abrirProximoProblemaIntermediario
          }
        />

      </div>
    </main>
  );
}
