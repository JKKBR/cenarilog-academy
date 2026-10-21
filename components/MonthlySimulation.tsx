"use client";

import {
  BarChart3,
  CalendarRange,
  CheckCircle2,
  Copy,
  PackagePlus,
  Play,
  RotateCcw,
  Save,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Warehouse,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SimulationInputs = {
  nome: string;
  estoqueInicial: number;
  demandaAnual: number;
  custoUnitario: number;
  custoPorPedido: number;
  taxaArmazenagemAnual: number;
  estoqueSeguranca: number;
  leadTimeDias: number;
  loteManual: number;
  usarEOQ: boolean;
};

type MonthlyResult = {
  mes: string;
  indice: number;
  fatorSazonal: number;
  demandaPrevista: number;
  estoqueInicial: number;
  recebimentos: number;
  estoqueDisponivel: number;
  demandaAtendida: number;
  ruptura: number;
  estoqueFinal: number;
  quantidadePedida: number;
  custoPedido: number;
  custoArmazenagem: number;
  valorEstoqueFinal: number;
  nivelServico: number;
};

type SavedSimulation = {
  id: string;
  savedAt: string;
  inputs: SimulationInputs;
  seasonality: number[];
  results: MonthlyResult[];
};

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const DEFAULT_SEASONALITY = [
  0.85,
  0.9,
  0.95,
  1,
  1.05,
  1.1,
  1,
  0.95,
  1.05,
  1.15,
  1.35,
  1.6,
];

const STABLE_SEASONALITY = Array(12).fill(1);

const INITIAL_INPUTS: SimulationInputs = {
  nome: "Cenário base anual",
  estoqueInicial: 1800,
  demandaAnual: 12000,
  custoUnitario: 25,
  custoPorPedido: 180,
  taxaArmazenagemAnual: 24,
  estoqueSeguranca: 300,
  leadTimeDias: 30,
  loteManual: 1200,
  usarEOQ: true,
};

function safeDivide(
  numerator: number,
  denominator: number
) {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator <= 0
  ) {
    return 0;
  }

  return numerator / denominator;
}

function formatNumber(
  value: number,
  decimals = 0
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

  return `simulacao-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function calculateEOQ(inputs: SimulationInputs) {
  const holdingCostPerUnit =
    inputs.custoUnitario *
    (inputs.taxaArmazenagemAnual / 100);

  if (
    inputs.demandaAnual <= 0 ||
    inputs.custoPorPedido <= 0 ||
    holdingCostPerUnit <= 0
  ) {
    return 0;
  }

  return Math.sqrt(
    (2 *
      inputs.demandaAnual *
      inputs.custoPorPedido) /
      holdingCostPerUnit
  );
}

function calculateMonthlySimulation(
  inputs: SimulationInputs,
  seasonality: number[]
) {
  const eoq = calculateEOQ(inputs);

  const orderQuantity = Math.max(
    0,
    inputs.usarEOQ ? eoq : inputs.loteManual
  );

  const averageDailyDemand =
    inputs.demandaAnual / 365;

  const reorderPoint =
    averageDailyDemand *
      inputs.leadTimeDias +
    inputs.estoqueSeguranca;

  const leadTimeMonths = Math.max(
    1,
    Math.ceil(inputs.leadTimeDias / 30)
  );

  const holdingRateMonthly =
    inputs.taxaArmazenagemAnual /
    100 /
    12;

  const normalizedTotal =
    seasonality.reduce(
      (total, factor) =>
        total + Math.max(0, factor),
      0
    ) || 12;

  let currentStock = inputs.estoqueInicial;

  const scheduledReceipts: Record<
    number,
    number
  > = {};

  const results: MonthlyResult[] = [];

  MONTHS.forEach((month, index) => {
    const factor = Math.max(
      0,
      seasonality[index] ?? 1
    );

    const demand =
      inputs.demandaAnual *
      safeDivide(factor, normalizedTotal);

    const openingStock = currentStock;

    const receipts =
      scheduledReceipts[index] ?? 0;

    const available =
      openingStock + receipts;

    const fulfilledDemand = Math.min(
      available,
      demand
    );

    const shortage = Math.max(
      0,
      demand - available
    );

    const endingStock = Math.max(
      0,
      available - fulfilledDemand
    );

    const serviceLevel =
      demand > 0
        ? safeDivide(fulfilledDemand, demand) *
          100
        : 100;

    let orderedQuantity = 0;

    if (
      endingStock <= reorderPoint &&
      orderQuantity > 0
    ) {
      orderedQuantity = orderQuantity;

      const receiptMonth =
        index + leadTimeMonths;

      if (receiptMonth < 12) {
        scheduledReceipts[receiptMonth] =
          (scheduledReceipts[
            receiptMonth
          ] ?? 0) + orderedQuantity;
      }
    }

    const averageInventory =
      (openingStock + endingStock) / 2;

    const holdingCost =
      averageInventory *
      inputs.custoUnitario *
      holdingRateMonthly;

    const orderCost =
      orderedQuantity > 0
        ? inputs.custoPorPedido
        : 0;

    results.push({
      mes: month,
      indice: index,
      fatorSazonal: factor,
      demandaPrevista: demand,
      estoqueInicial: openingStock,
      recebimentos: receipts,
      estoqueDisponivel: available,
      demandaAtendida: fulfilledDemand,
      ruptura: shortage,
      estoqueFinal: endingStock,
      quantidadePedida: orderedQuantity,
      custoPedido: orderCost,
      custoArmazenagem: holdingCost,
      valorEstoqueFinal:
        endingStock * inputs.custoUnitario,
      nivelServico: serviceLevel,
    });

    currentStock = endingStock;
  });

  return {
    results,
    eoq,
    orderQuantity,
    reorderPoint,
    leadTimeMonths,
    holdingCostPerUnit:
      inputs.custoUnitario *
      (inputs.taxaArmazenagemAnual / 100),
  };
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  step = "1",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: string;
}) {
  const [displayValue, setDisplayValue] =
    useState(String(value));

  useEffect(() => {
    setDisplayValue(String(value));
  }, [value]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const nextValue = event.target.value;

    setDisplayValue(nextValue);

    if (nextValue === "") {
      return;
    }

    const numericValue = Number(nextValue);

    if (Number.isFinite(numericValue)) {
      onChange(Math.max(0, numericValue));
    }
  }

  function handleBlur() {
    if (displayValue.trim() === "") {
      setDisplayValue("0");
      onChange(0);
      return;
    }

    const numericValue = Number(
      displayValue
    );

    if (!Number.isFinite(numericValue)) {
      setDisplayValue(String(value));
      return;
    }

    const validValue = Math.max(
      0,
      numericValue
    );

    setDisplayValue(String(validValue));
    onChange(validValue);
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <div className="relative">
        <input
          type="number"
          min="0"
          step={step}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={(event) =>
            event.target.select()
          }
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-16 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        {suffix && (
          <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function SummaryCard({
  title,
  value,
  description,
  color = "blue",
}: {
  title: string;
  value: string;
  description: string;
  color?:
    | "blue"
    | "emerald"
    | "red"
    | "violet"
    | "amber";
}) {
  const styles = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
    violet:
      "border-violet-200 bg-violet-50 text-violet-700",
    amber:
      "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${styles[color]}`}
    >
      <p className="text-sm font-semibold text-slate-600">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        {description}
      </p>
    </article>
  );
}

export default function MonthlySimulation() {
  const [inputs, setInputs] =
    useState<SimulationInputs>(
      INITIAL_INPUTS
    );

  const [seasonality, setSeasonality] =
    useState<number[]>(
      DEFAULT_SEASONALITY
    );

  const [savedSimulations, setSavedSimulations] =
    useState<SavedSimulation[]>([]);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        "logsim-pro-monthly-simulations"
      );

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setSavedSimulations(parsed);
        }
      }
    } catch {
      setMessage(
        "Não foi possível carregar as simulações mensais."
      );
    }
  }, []);

  const simulation = useMemo(
    () =>
      calculateMonthlySimulation(
        inputs,
        seasonality
      ),
    [inputs, seasonality]
  );

  const totals = useMemo(() => {
    return simulation.results.reduce(
      (summary, month) => {
        summary.demanda +=
          month.demandaPrevista;

        summary.atendida +=
          month.demandaAtendida;

        summary.ruptura +=
          month.ruptura;

        summary.custoArmazenagem +=
          month.custoArmazenagem;

        summary.custoPedidos +=
          month.custoPedido;

        summary.pedidos +=
          month.quantidadePedida > 0
            ? 1
            : 0;

        return summary;
      },
      {
        demanda: 0,
        atendida: 0,
        ruptura: 0,
        custoArmazenagem: 0,
        custoPedidos: 0,
        pedidos: 0,
      }
    );
  }, [simulation.results]);

  const annualServiceLevel =
    totals.demanda > 0
      ? safeDivide(
          totals.atendida,
          totals.demanda
        ) * 100
      : 100;

  const totalInventoryCost =
    totals.custoArmazenagem +
    totals.custoPedidos;

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!inputs.nome.trim()) {
      errors.push(
        "Informe o nome do cenário."
      );
    }

    if (inputs.demandaAnual <= 0) {
      errors.push(
        "A demanda anual deve ser maior que zero."
      );
    }

    if (inputs.custoUnitario <= 0) {
      errors.push(
        "O custo unitário deve ser maior que zero."
      );
    }

    if (inputs.custoPorPedido <= 0) {
      errors.push(
        "O custo por pedido deve ser maior que zero."
      );
    }

    if (
      inputs.taxaArmazenagemAnual <= 0
    ) {
      errors.push(
        "A taxa anual de armazenagem deve ser maior que zero."
      );
    }

    if (
      !inputs.usarEOQ &&
      inputs.loteManual <= 0
    ) {
      errors.push(
        "Informe um lote manual maior que zero."
      );
    }

    if (
      seasonality.some(
        (factor) => factor < 0
      )
    ) {
      errors.push(
        "Os fatores sazonais não podem ser negativos."
      );
    }

    return errors;
  }, [inputs, seasonality]);

  const comparisonData = useMemo(() => {
    const selected =
      savedSimulations.filter(
        (simulationItem) =>
          selectedIds.includes(
            simulationItem.id
          )
      );

    return MONTHS.map((month, index) => {
      const row: Record<
        string,
        string | number
      > = {
        mes: month,
        Atual:
          simulation.results[index]
            ?.estoqueFinal ?? 0,
      };

      selected.forEach((scenario) => {
        row[scenario.inputs.nome] =
          scenario.results[index]
            ?.estoqueFinal ?? 0;
      });

      return row;
    });
  }, [
    savedSimulations,
    selectedIds,
    simulation.results,
  ]);

  const selectedScenarios =
    savedSimulations.filter((scenario) =>
      selectedIds.includes(scenario.id)
    );

  function updateInput<K extends keyof SimulationInputs>(
    field: K,
    value: SimulationInputs[K]
  ) {
    setInputs((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateSeasonality(
    index: number,
    value: number
  ) {
    setSeasonality((previous) =>
      previous.map(
        (factor, factorIndex) =>
          factorIndex === index
            ? value
            : factor
      )
    );
  }

  function applySeasonalityPreset(
    type: "stable" | "seasonal" | "growth"
  ) {
    if (type === "stable") {
      setSeasonality(
        [...STABLE_SEASONALITY]
      );
    }

    if (type === "seasonal") {
      setSeasonality(
        [...DEFAULT_SEASONALITY]
      );
    }

    if (type === "growth") {
      setSeasonality([
        0.75,
        0.8,
        0.85,
        0.9,
        0.95,
        1,
        1.05,
        1.1,
        1.15,
        1.2,
        1.25,
        1.3,
      ]);
    }

    setMessage(
      "Perfil de sazonalidade aplicado."
    );
  }

  function saveSimulation() {
    if (validationErrors.length > 0) {
      setMessage(
        "Corrija os dados antes de salvar."
      );
      return;
    }

    const saved: SavedSimulation = {
      id: generateId(),
      savedAt:
        new Date().toLocaleString("pt-BR"),
      inputs: { ...inputs },
      seasonality: [...seasonality],
      results: simulation.results.map(
        (result) => ({ ...result })
      ),
    };

    const updated = [
      saved,
      ...savedSimulations,
    ].slice(0, 8);

    setSavedSimulations(updated);

    try {
      localStorage.setItem(
        "logsim-pro-monthly-simulations",
        JSON.stringify(updated)
      );

      setMessage(
        `Cenário "${inputs.nome}" salvo.`
      );
    } catch {
      setMessage(
        "Não foi possível salvar o cenário."
      );
    }
  }

  function loadSimulation(
    saved: SavedSimulation
  ) {
    setInputs({ ...saved.inputs });
    setSeasonality([
      ...saved.seasonality,
    ]);

    setMessage(
      `Cenário "${saved.inputs.nome}" carregado.`
    );
  }

  function duplicateSimulation(
    saved: SavedSimulation
  ) {
    setInputs({
      ...saved.inputs,
      nome: `${saved.inputs.nome} - cópia`,
    });

    setSeasonality([
      ...saved.seasonality,
    ]);

    setMessage(
      "Cenário duplicado para edição."
    );
  }

  function removeSimulation(id: string) {
    const updated =
      savedSimulations.filter(
        (scenario) =>
          scenario.id !== id
      );

    setSavedSimulations(updated);

    setSelectedIds((previous) =>
      previous.filter(
        (selectedId) =>
          selectedId !== id
      )
    );

    localStorage.setItem(
      "logsim-pro-monthly-simulations",
      JSON.stringify(updated)
    );

    setMessage("Cenário excluído.");
  }

  function toggleComparison(id: string) {
    setSelectedIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (selectedId) =>
            selectedId !== id
        );
      }

      if (previous.length >= 3) {
        setMessage(
          "Selecione no máximo três cenários salvos."
        );

        return previous;
      }

      return [...previous, id];
    });
  }

  function resetSimulation() {
    setInputs({ ...INITIAL_INPUTS });
    setSeasonality([
      ...DEFAULT_SEASONALITY,
    ]);
    setSelectedIds([]);
    setMessage(
      "Simulação inicial restaurada."
    );
  }

  const comparisonColors = [
    "#7c3aed",
    "#f59e0b",
    "#16a34a",
  ];

  return (
    <section className="mt-8 space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
              <CalendarRange size={25} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Simulação mensal 2.0
              </h2>

              <p className="text-sm text-slate-500">
                Estoque, sazonalidade, EOQ e custos em 12 meses
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetSimulation}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw size={17} />
            Restaurar exemplo
          </button>
        </div>

        {message && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <span>{message}</span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
              <Warehouse size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Parâmetros anuais
              </h2>

              <p className="text-sm text-slate-500">
                Dados usados na projeção mensal
              </p>
            </div>
          </div>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Nome do cenário
            </span>

            <input
              type="text"
              value={inputs.nome}
              onChange={(event) =>
                updateInput(
                  "nome",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>


          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Estoque inicial"
              value={inputs.estoqueInicial}
              suffix="un."
              onChange={(value) =>
                updateInput(
                  "estoqueInicial",
                  value
                )
              }
            />

            <NumberField
              label="Demanda anual"
              value={inputs.demandaAnual}
              suffix="un."
              onChange={(value) =>
                updateInput(
                  "demandaAnual",
                  value
                )
              }
            />

            <NumberField
              label="Custo unitário"
              value={inputs.custoUnitario}
              suffix="R$"
              step="0.01"
              onChange={(value) =>
                updateInput(
                  "custoUnitario",
                  value
                )
              }
            />

            <NumberField
              label="Custo por pedido"
              value={inputs.custoPorPedido}
              suffix="R$"
              step="0.01"
              onChange={(value) =>
                updateInput(
                  "custoPorPedido",
                  value
                )
              }
            />

            <NumberField
              label="Taxaarmazenagem"
              value={
                inputs.taxaArmazenagemAnual
              }
              suffix="%"
              step="0.1"
              onChange={(value) =>
                updateInput(
                  "taxaArmazenagemAnual",
                  value
                )
              }
            />

            <NumberField
              label="Estoque de segurança"
              value={
                inputs.estoqueSeguranca
              }
              suffix="un."
              onChange={(value) =>
                updateInput(
                  "estoqueSeguranca",
                  value
                )
              }
            />

            <NumberField
              label="Lead time"
              value={inputs.leadTimeDias}
              suffix="dias"
              onChange={(value) =>
                updateInput(
                  "leadTimeDias",
                  value
                )
              }
            />

            <NumberField
              label="Lote manual"
              value={inputs.loteManual}
              suffix="un."
              onChange={(value) =>
                updateInput(
                  "loteManual",
                  value
                )
              }
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={inputs.usarEOQ}
              onChange={(event) =>
                updateInput(
                  "usarEOQ",
                  event.target.checked
                )
              }
              className="h-5 w-5"
            />

            <div>
              <p className="font-semibold text-slate-800">
                Usar lote econômico
              </p>

              <p className="text-xs text-slate-500">
                Desmarque para utilizar o lote manual.
              </p>
            </div>
          </label>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700">
              <TrendingUp size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Sazonalidade
              </h2>

              <p className="text-sm text-slate-500">
                Multiplicadores relativos de demanda
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                applySeasonalityPreset(
                  "stable"
                )
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Estável
            </button>

            <button
              type="button"
              onClick={() =>
                applySeasonalityPreset(
                  "seasonal"
                )
              }
              className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
            >
              Pico no fim do ano
            </button>

            <button
              type="button"
              onClick={() =>
                applySeasonalityPreset(
                  "growth"
                )
              }
              className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Crescimento gradual
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {MONTHS.map((month, index) => (
              <NumberField
                key={month}
                label={month}
                value={
                  seasonality[index]
                }
                suffix="x"
                step="0.05"
                onChange={(value) =>
                  updateSeasonality(
                    index,
                    value
                  )
                }
              />
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            A demanda anual é distribuída
            proporcionalmente entre os meses. Um
            fator maior indica participação maior
            daquele mês na demanda anual.
          </div>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <TriangleAlert className="text-red-700" />

            <h2 className="text-lg font-bold text-red-900">
              Corrija os dados
            </h2>
          </div>

          <ul className="mt-4 space-y-2">
            {validationErrors.map(
              (error) => (
                <li
                  key={error}
                  className="rounded-xl bg-white p-3 text-sm text-red-800"
                >
                  {error}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Lote econômico"
          value={`${formatNumber(
            simulation.eoq,
            0
          )} un.`}
          description="Quantidade de referência por pedido."
          color="violet"
        />

        <SummaryCard
          title="Lote utilizado"
          value={`${formatNumber(
            simulation.orderQuantity,
            0
          )} un.`}
          description={
            inputs.usarEOQ
              ? "Calculado pelo EOQ."
              : "Definido manualmente."
          }
          color="blue"
        />

        <SummaryCard
          title="Ponto de reposição"
          value={`${formatNumber(
            simulation.reorderPoint,
            0
          )} un.`}
          description="Demanda durante o lead time mais estoque de segurança."
          color="amber"
        />

        <SummaryCard
          title="Nível de serviço anual"
          value={`${formatNumber(
            annualServiceLevel,
            1
          )}%`}
          description="Demanda atendida dividida pela demanda prevista."
          color={
            annualServiceLevel >= 95
              ? "emerald"
              : "red"
          }
        />

        <SummaryCard
          title="Custo anual de estoque"
          value={formatCurrency(
            totalInventoryCost
          )}
          description="Soma do custo de pedidos e de armazenagem."
          color="blue"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-blue-700" />

          <div>
            <h2 className="text-xl font-bold">
              Histórico mensal do estoque
            </h2>

            <p className="text-sm text-slate-500">
              Estoque final, demanda e recebimentos
            </p>
          </div>
        </div>

        <div className="mt-6 h-96">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <ComposedChart
              data={simulation.results}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
              />

              <XAxis dataKey="mes" />
              <YAxis />

              <Tooltip
                formatter={(value) =>
                  formatNumber(
                    Number(value),
                    0
                  )
                }
              />

              <Legend />

              <Bar
                dataKey="demandaPrevista"
                name="Demanda"
                fill="#94a3b8"
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="recebimentos"
                name="Recebimentos"
                fill="#16a34a"
                radius={[5, 5, 0, 0]}
              />

              <Line
                type="monotone"
                dataKey="estoqueFinal"
                name="Estoque final"
                stroke="#2563eb"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="ruptura"
                name="Ruptura"
                stroke="#dc2626"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">
          Resultado mês a mês
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Histórico detalhado da simulação
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[1400px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                <th className="p-3">Mês</th>
                <th className="p-3 text-right">
                  Fator
                </th>
                <th className="p-3 text-right">
                  Demanda
                </th>
                <th className="p-3 text-right">
                  Estoque inicial
                </th>
                <th className="p-3 text-right">
                  Recebimentos
                </th>
                <th className="p-3 text-right">
                  Atendida
                </th>
                <th className="p-3 text-right">
                  Ruptura
                </th>
                <th className="p-3 text-right">
                  Estoque final
                </th>
                <th className="p-3 text-right">
                  Pedido
                </th>
                <th className="p-3 text-right">
                  Serviço
                </th>
                <th className="p-3 text-right">
                  Armazenagem
                </th>
                <th className="p-3 text-right">
                  Valor final
                </th>
              </tr>
            </thead>

            <tbody>
              {simulation.results.map(
                (month) => (
                  <tr
                    key={month.mes}
                    className={`border-b border-slate-100 ${
                      month.ruptura > 0
                        ? "bg-red-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-3 font-semibold">
                      {month.mes}
                    </td>

                    <td className="p-3 text-right">
                      {formatNumber(
                        month.fatorSazonal,
                        2
                      )}
                      x
                    </td>

                    <td className="p-3 text-right">
                      {formatNumber(
                        month.demandaPrevista,
                        0
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {formatNumber(
                        month.estoqueInicial,
                        0
                      )}
                    </td>

                    <td className="p-3 text-right text-emerald-700">
                      {formatNumber(
                        month.recebimentos,
                        0
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {formatNumber(
                        month.demandaAtendida,
                        0
                      )}
                    </td>

                    <td className="p-3 text-right font-semibold text-red-700">
                      {formatNumber(
                        month.ruptura,
                        0
                      )}
                    </td>

                    <td className="p-3 text-right font-semibold text-blue-700">
                      {formatNumber(
                        month.estoqueFinal,
                        0
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {formatNumber(
                        month.quantidadePedida,
                        0
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {formatNumber(
                        month.nivelServico,
                        1
                      )}
                      %
                    </td>

                    <td className="p-3 text-right">
                      {formatCurrency(
                        month.custoArmazenagem
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {formatCurrency(
                        month.valorEstoqueFinal
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={saveSimulation}
          disabled={
            validationErrors.length > 0
          }
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Save size={18} />
          Salvar cenário mensal
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <PackagePlus className="text-violet-700" />

          <div>
            <h2 className="text-xl font-bold">
              Comparação de cenários
            </h2>

            <p className="text-sm text-slate-500">
              Compare o cenário atual com até três cenários salvos
            </p>
          </div>
        </div>

        {savedSimulations.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Salve pelo menos um cenário mensal
            para iniciar a comparação.
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {savedSimulations.map(
                (scenario) => (
                  <div
                    key={scenario.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          scenario.id
                        )}
                        onChange={() =>
                          toggleComparison(
                            scenario.id
                          )
                        }
                        className="mt-1 h-5 w-5"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-800">
                          {
                            scenario.inputs
                              .nome
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Salvo em{" "}
                          {scenario.savedAt}
                        </p>
                      </div>
                    </label>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          loadSimulation(
                            scenario
                          )
                        }
                        className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                      >
                        <Play size={14} />
                        Carregar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          duplicateSimulation(
                            scenario
                          )
                        }
                        className="flex items-center gap-1 rounded-lg bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-200"
                      >
                        <Copy size={14} />
                        Duplicar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeSimulation(
                            scenario.id
                          )
                        }
                        className="ml-auto rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-8 h-96">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <ComposedChart
                  data={comparisonData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="Atual"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />

                  {selectedScenarios.map(
                    (scenario, index) => (
                      <Line
                        key={scenario.id}
                        type="monotone"
                        dataKey={
                          scenario.inputs.nome
                        }
                        stroke={
                          comparisonColors[
                            index
                          ]
                        }
                        strokeWidth={2}
                      />
                    )
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 size={20} />

            <p className="font-bold">
              Custo de armazenagem
            </p>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            O cálculo mensal considera o
            estoque médio do mês multiplicado
            pelo custo unitário e pela taxa
            mensal de armazenagem.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-amber-800">
            <TriangleAlert size={20} />

            <p className="font-bold">
              Limitação do modelo
            </p>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            O simulador trabalha em períodos
            mensais e aproxima o lead time em
            meses completos. Use os resultados
            como apoio à análise, não como ordem
            automática de compra.
          </p>
        </div>
      </div>
    </section>
  );
}