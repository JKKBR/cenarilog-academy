"use client";

import {
  AlertTriangle,
  BarChart3,
  Download,
  FileSpreadsheet,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ABCClass = "A" | "B" | "C";

type Product = {
  id: string;
  codigo: string;
  descricao: string;
  categoria: string;
  demandaAnual: number;
  estoqueAtual: number;
  custoUnitario: number;
  demandaDiariaMedia: number;
  leadTime: number;
  estoqueSeguranca: number;
};

type ProductAnalysis = Product & {
  valorEstoque: number;
  valorConsumoAnual: number;
  pontoReposicao: number;
  abaixoPontoReposicao: boolean;
  percentualValor: number;
  percentualAcumulado: number;
  classeABC: ABCClass;
};

type ProductForm = Omit<Product, "id">;

const emptyForm: ProductForm = {
  codigo: "",
  descricao: "",
  categoria: "",
  demandaAnual: 0,
  estoqueAtual: 0,
  custoUnitario: 0,
  demandaDiariaMedia: 0,
  leadTime: 0,
  estoqueSeguranca: 0,
};

const exampleProducts: Product[] = [
  {
    id: "produto-1",
    codigo: "SKU-001",
    descricao: "Motor elétrico",
    categoria: "Equipamentos",
    demandaAnual: 120,
    estoqueAtual: 18,
    custoUnitario: 2400,
    demandaDiariaMedia: 0.5,
    leadTime: 20,
    estoqueSeguranca: 5,
  },
  {
    id: "produto-2",
    codigo: "SKU-002",
    descricao: "Rolamento industrial",
    categoria: "Componentes",
    demandaAnual: 600,
    estoqueAtual: 35,
    custoUnitario: 280,
    demandaDiariaMedia: 2.4,
    leadTime: 12,
    estoqueSeguranca: 10,
  },
  {
    id: "produto-3",
    codigo: "SKU-003",
    descricao: "Filme stretch",
    categoria: "Embalagens",
    demandaAnual: 4800,
    estoqueAtual: 500,
    custoUnitario: 24,
    demandaDiariaMedia: 19,
    leadTime: 7,
    estoqueSeguranca: 80,
  },
  {
    id: "produto-4",
    codigo: "SKU-004",
    descricao: "Etiqueta logística",
    categoria: "Embalagens",
    demandaAnual: 24000,
    estoqueAtual: 3500,
    custoUnitario: 1.2,
    demandaDiariaMedia: 95,
    leadTime: 5,
    estoqueSeguranca: 500,
  },
  {
    id: "produto-5",
    codigo: "SKU-005",
    descricao: "Luva de proteção",
    categoria: "Segurança",
    demandaAnual: 3600,
    estoqueAtual: 380,
    custoUnitario: 8.5,
    demandaDiariaMedia: 14,
    leadTime: 10,
    estoqueSeguranca: 100,
  },
];

function formatNumber(value: number, decimals = 0) {
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

  return `produto-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function parseNumber(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return 0;
  }

  let normalized = cleanValue.replace(/\s/g, "");

  if (
    normalized.includes(",") &&
    normalized.includes(".")
  ) {
    normalized = normalized
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }

  normalized = normalized.replace(
    /[^0-9.-]/g,
    ""
  );

  const number = Number(normalized);

  return Number.isFinite(number)
    ? Math.max(0, number)
    : 0;
}

function escapeCSV(value: string | number) {
  const text = String(value ?? "");

  if (
    text.includes(";") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function parseCSVLine(
  line: string,
  delimiter: string
) {
  const columns: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (
      character === delimiter &&
      !insideQuotes
    ) {
      columns.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  columns.push(current.trim());

  return columns;
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function downloadTextFile(
  content: string,
  filename: string,
  type: string
) {
  const blob = new Blob(["\uFEFF", content], {
    type,
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function ProductNumberInput({
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
    event: ChangeEvent<HTMLInputElement>
  ) {
    const nextValue = event.target.value;

    setDisplayValue(nextValue);

    if (nextValue === "") {
      return;
    }

    const number = Number(nextValue);

    if (Number.isFinite(number)) {
      onChange(Math.max(0, number));
    }
  }

  function handleBlur() {
    if (displayValue.trim() === "") {
      setDisplayValue("0");
      onChange(0);
      return;
    }

    const number = Number(displayValue);

    if (!Number.isFinite(number)) {
      setDisplayValue(String(value));
      return;
    }

    const validNumber = Math.max(0, number);

    setDisplayValue(String(validNumber));
    onChange(validNumber);
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
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-16 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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

export default function ProductsModule() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [form, setForm] =
    useState<ProductForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [limitA, setLimitA] = useState(80);
  const [limitB, setLimitB] = useState(95);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem(
        "logsim-pro-products"
      );

      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);

        if (Array.isArray(parsed)) {
          setProducts(parsed);
        }
      }
    } catch {
      setMessage(
        "Não foi possível carregar os produtos salvos."
      );
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "logsim-pro-products",
        JSON.stringify(products)
      );
    } catch {
      setMessage(
        "Não foi possível salvar os produtos no navegador."
      );
    }
  }, [products]);

  const analysis = useMemo<ProductAnalysis[]>(() => {
    const productsWithValues = products
      .map((product) => ({
        ...product,
        valorEstoque:
          product.estoqueAtual *
          product.custoUnitario,
        valorConsumoAnual:
          product.demandaAnual *
          product.custoUnitario,
        pontoReposicao:
          product.demandaDiariaMedia *
            product.leadTime +
          product.estoqueSeguranca,
      }))
      .sort(
        (first, second) =>
          second.valorConsumoAnual -
          first.valorConsumoAnual
      );

    const totalAnnualValue =
      productsWithValues.reduce(
        (total, product) =>
          total + product.valorConsumoAnual,
        0
      );

    let accumulated = 0;

    return productsWithValues.map((product) => {
      const percentage =
        totalAnnualValue > 0
          ? (product.valorConsumoAnual /
              totalAnnualValue) *
            100
          : 0;

      accumulated += percentage;

      const previousAccumulated =
        accumulated - percentage;

      let abcClass: ABCClass = "C";

      if (previousAccumulated < limitA) {
        abcClass = "A";
      } else if (previousAccumulated < limitB) {
        abcClass = "B";
      }

      return {
        ...product,
        abaixoPontoReposicao:
          product.estoqueAtual <=
          product.pontoReposicao,
        percentualValor: percentage,
        percentualAcumulado: accumulated,
        classeABC: abcClass,
      };
    });
  }, [products, limitA, limitB]);

  const filteredAnalysis = useMemo(() => {
    const normalized = search
      .trim()
      .toLowerCase();

    if (!normalized) {
      return analysis;
    }

    return analysis.filter((product) => {
      return [
        product.codigo,
        product.descricao,
        product.categoria,
        product.classeABC,
      ].some((value) =>
        value.toLowerCase().includes(normalized)
      );
    });
  }, [analysis, search]);

  const totals = useMemo(() => {
    return analysis.reduce(
      (result, product) => {
        result.valorEstoque +=
          product.valorEstoque;

        result.valorConsumoAnual +=
          product.valorConsumoAnual;

        if (product.abaixoPontoReposicao) {
          result.itensAbaixoReposicao++;
        }

        result.classes[product.classeABC]++;

        return result;
      },
      {
        valorEstoque: 0,
        valorConsumoAnual: 0,
        itensAbaixoReposicao: 0,
        classes: {
          A: 0,
          B: 0,
          C: 0,
        },
      }
    );
  }, [analysis]);

  const abcChartData = useMemo(() => {
    return (["A", "B", "C"] as ABCClass[]).map(
      (abcClass) => ({
        classe: `Classe ${abcClass}`,
        valor: analysis
          .filter(
            (product) =>
              product.classeABC === abcClass
          )
          .reduce(
            (total, product) =>
              total +
              product.valorConsumoAnual,
            0
          ),
      })
    );
  }, [analysis]);

  function updateTextField(
    field: "codigo" | "descricao" | "categoria",
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateNumberField(
    field: Exclude<
      keyof ProductForm,
      "codigo" | "descricao" | "categoria"
    >,
    value: number
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function validateProduct() {
    const errors: string[] = [];

    if (!form.codigo.trim()) {
      errors.push("Informe o código do produto.");
    }

    if (!form.descricao.trim()) {
      errors.push(
        "Informe a descrição do produto."
      );
    }

    const duplicatedCode = products.some(
      (product) =>
        product.codigo.trim().toLowerCase() ===
          form.codigo.trim().toLowerCase() &&
        product.id !== editingId
    );

    if (duplicatedCode) {
      errors.push(
        "Já existe um produto com esse código."
      );
    }

    if (form.custoUnitario < 0) {
      errors.push(
        "O custo unitário não pode ser negativo."
      );
    }

    if (form.demandaAnual < 0) {
      errors.push(
        "A demanda anual não pode ser negativa."
      );
    }

    return errors;
  }

  function saveProduct() {
    const errors = validateProduct();

    if (errors.length > 0) {
      setMessage(errors.join(" "));
      return;
    }

    const normalizedProduct: Product = {
      id: editingId ?? generateId(),
      codigo: form.codigo.trim(),
      descricao: form.descricao.trim(),
      categoria:
        form.categoria.trim() || "Sem categoria",
      demandaAnual: form.demandaAnual,
      estoqueAtual: form.estoqueAtual,
      custoUnitario: form.custoUnitario,
      demandaDiariaMedia:
        form.demandaDiariaMedia,
      leadTime: form.leadTime,
      estoqueSeguranca:
        form.estoqueSeguranca,
    };

    if (editingId) {
      setProducts((previous) =>
        previous.map((product) =>
          product.id === editingId
            ? normalizedProduct
            : product
        )
      );

      setMessage("Produto atualizado.");
    } else {
      setProducts((previous) => [
        ...previous,
        normalizedProduct,
      ]);

      setMessage("Produto cadastrado.");
    }

    clearForm();
  }

  function editProduct(product: Product) {
    setForm({
      codigo: product.codigo,
      descricao: product.descricao,
      categoria: product.categoria,
      demandaAnual: product.demandaAnual,
      estoqueAtual: product.estoqueAtual,
      custoUnitario: product.custoUnitario,
      demandaDiariaMedia:
        product.demandaDiariaMedia,
      leadTime: product.leadTime,
      estoqueSeguranca:
        product.estoqueSeguranca,
    });

    setEditingId(product.id);

    document
      .getElementById("cadastro-produto")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function removeProduct(product: Product) {
    const confirmed = window.confirm(
      `Excluir o produto ${product.codigo} - ${product.descricao}?`
    );

    if (!confirmed) {
      return;
    }

    setProducts((previous) =>
      previous.filter(
        (item) => item.id !== product.id
      )
    );

    if (editingId === product.id) {
      clearForm();
    }

    setMessage("Produto excluído.");
  }

  function clearForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function loadExampleProducts() {
    const confirmed =
      products.length === 0 ||
      window.confirm(
        "Os produtos atuais serão substituídos pelos exemplos. Continuar?"
      );

    if (!confirmed) {
      return;
    }

    setProducts(exampleProducts);
    setMessage(
      "Produtos de exemplo carregados."
    );
  }

  function downloadCSVTemplate() {
    const content = [
      [
        "codigo",
        "descricao",
        "categoria",
        "demandaAnual",
        "estoqueAtual",
        "custoUnitario",
        "demandaDiariaMedia",
        "leadTime",
        "estoqueSeguranca",
      ].join(";"),
      [
        "SKU-001",
        "Produto de exemplo",
        "Categoria A",
        "1200",
        "180",
        "25,50",
        "5",
        "10",
        "30",
      ].join(";"),
    ].join("\n");

    downloadTextFile(
      content,
      "modelo-produtos-logsim-pro.csv",
      "text/csv;charset=utf-8"
    );
  }

  function exportProductsCSV() {
    if (analysis.length === 0) {
      setMessage(
        "Cadastre produtos antes de exportar."
      );
      return;
    }

    const header = [
      "codigo",
      "descricao",
      "categoria",
      "demandaAnual",
      "estoqueAtual",
      "custoUnitario",
      "demandaDiariaMedia",
      "leadTime",
      "estoqueSeguranca",
      "pontoReposicao",
      "abaixoPontoReposicao",
      "valorEstoque",
      "valorConsumoAnual",
      "percentualAcumulado",
      "classeABC",
    ];

    const rows = analysis.map((product) => [
      product.codigo,
      product.descricao,
      product.categoria,
      product.demandaAnual,
      product.estoqueAtual,
      product.custoUnitario
        .toFixed(2)
        .replace(".", ","),
      product.demandaDiariaMedia,
      product.leadTime,
      product.estoqueSeguranca,
      product.pontoReposicao
        .toFixed(2)
        .replace(".", ","),
      product.abaixoPontoReposicao
        ? "Sim"
        : "Não",
      product.valorEstoque
        .toFixed(2)
        .replace(".", ","),
      product.valorConsumoAnual
        .toFixed(2)
        .replace(".", ","),
      product.percentualAcumulado
        .toFixed(2)
        .replace(".", ","),
      product.classeABC,
    ]);

    const content = [
      header.map(escapeCSV).join(";"),
      ...rows.map((row) =>
        row.map(escapeCSV).join(";")
      ),
    ].join("\n");

    downloadTextFile(
      content,
      "produtos-logsim-pro.csv",
      "text/csv;charset=utf-8"
    );

    setMessage("Produtos exportados em CSV.");
  }

  function importCSV(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.name.toLowerCase().endsWith(".csv")
    ) {
      setMessage(
        "Selecione um arquivo com a extensão .csv."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        if (typeof reader.result !== "string") {
          throw new Error(
            "Não foi possível ler o arquivo."
          );
        }

        const text = reader.result
          .replace(/^\uFEFF/, "")
          .trim();

        if (!text) {
          throw new Error(
            "O arquivo CSV está vazio."
          );
        }

        const lines = text
          .split(/\r?\n/)
          .filter((line) => line.trim());

        if (lines.length < 2) {
          throw new Error(
            "O arquivo precisa ter cabeçalho e pelo menos um produto."
          );
        }

        const delimiter =
          lines[0].split(";").length >=
          lines[0].split(",").length
            ? ";"
            : ",";

        const headers = parseCSVLine(
          lines[0],
          delimiter
        ).map(normalizeHeader);

        const expectedHeaders = [
          "codigo",
          "descricao",
          "categoria",
          "demandaanual",
          "estoqueatual",
          "custounitario",
          "demandadiariamedia",
          "leadtime",
          "estoqueseguranca",
        ];

        const missingHeaders =
          expectedHeaders.filter(
            (header) =>
              !headers.includes(header)
          );

        if (missingHeaders.length > 0) {
          throw new Error(
            `Colunas ausentes: ${missingHeaders.join(
              ", "
            )}.`
          );
        }

        const columnIndex = Object.fromEntries(
          headers.map((header, index) => [
            header,
            index,
          ])
        ) as Record<string, number>;

        const importedProducts: Product[] = [];

        for (
          let lineIndex = 1;
          lineIndex < lines.length;
          lineIndex++
        ) {
          const columns = parseCSVLine(
            lines[lineIndex],
            delimiter
          );

          const codigo =
            columns[columnIndex.codigo]?.trim() ??
            "";

          const descricao =
            columns[
              columnIndex.descricao
            ]?.trim() ?? "";

          if (!codigo || !descricao) {
            continue;
          }

          importedProducts.push({
            id: generateId(),
            codigo,
            descricao,
            categoria:
              columns[
                columnIndex.categoria
              ]?.trim() || "Sem categoria",
            demandaAnual: parseNumber(
              columns[
                columnIndex.demandaanual
              ] ?? "0"
            ),
            estoqueAtual: parseNumber(
              columns[
                columnIndex.estoqueatual
              ] ?? "0"
            ),
            custoUnitario: parseNumber(
              columns[
                columnIndex.custounitario
              ] ?? "0"
            ),
            demandaDiariaMedia: parseNumber(
              columns[
                columnIndex.demandadiariamedia
              ] ?? "0"
            ),
            leadTime: parseNumber(
              columns[
                columnIndex.leadtime
              ] ?? "0"
            ),
            estoqueSeguranca: parseNumber(
              columns[
                columnIndex.estoqueseguranca
              ] ?? "0"
            ),
          });
        }

        if (importedProducts.length === 0) {
          throw new Error(
            "Nenhum produto válido foi encontrado."
          );
        }

        const existingCodes = new Set(
          products.map((product) =>
            product.codigo.toLowerCase()
          )
        );

        const uniqueImported =
          importedProducts.filter(
            (product, index, list) => {
              const normalizedCode =
                product.codigo.toLowerCase();

              const firstOccurrence =
                list.findIndex(
                  (item) =>
                    item.codigo.toLowerCase() ===
                    normalizedCode
                ) === index;

              return (
                firstOccurrence &&
                !existingCodes.has(normalizedCode)
              );
            }
          );

        setProducts((previous) => [
          ...previous,
          ...uniqueImported,
        ]);

        const ignored =
          importedProducts.length -
          uniqueImported.length;

        setMessage(
          `${uniqueImported.length} produto(s) importado(s).` +
            (ignored > 0
              ? ` ${ignored} código(s) duplicado(s) ignorado(s).`
              : "")
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? `Erro na importação: ${error.message}`
            : "Erro ao importar o CSV."
        );
      } finally {
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setMessage(
        "Não foi possível ler o arquivo CSV."
      );

      event.target.value = "";
    };

    reader.readAsText(file, "UTF-8");
  }

  return (
    <section className="mt-8 space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <Package size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Gestão de produtos
              </h2>

              <p className="text-sm text-slate-500">
                Cadastro, reposição e classificação ABC
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadCSVTemplate}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download size={17} />
              Modelo CSV
            </button>

            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">
              <Upload size={17} />
              Importar CSV

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={importCSV}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={exportProductsCSV}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <FileSpreadsheet size={17} />
              Exportar CSV
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <span>{message}</span>

            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Fechar mensagem"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div
        id="cadastro-produto"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {editingId
                ? "Editar produto"
                : "Cadastrar produto"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Informe os dados usados nos cálculos
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={clearForm}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
            >
              Cancelar edição
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Código
            </span>

            <input
              type="text"
              value={form.codigo}
              onChange={(event) =>
                updateTextField(
                  "codigo",
                  event.target.value
                )
              }
              placeholder="SKU-001"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Descrição
            </span>

            <input
              type="text"
              value={form.descricao}
              onChange={(event) =>
                updateTextField(
                  "descricao",
                  event.target.value
                )
              }
              placeholder="Nome do produto"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Categoria
            </span>

            <input
              type="text"
              value={form.categoria}
              onChange={(event) =>
                updateTextField(
                  "categoria",
                  event.target.value
                )
              }
              placeholder="Embalagens"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <ProductNumberInput
            label="Demanda anual"
            value={form.demandaAnual}
            suffix="un."
            onChange={(value) =>
              updateNumberField(
                "demandaAnual",
                value
              )
            }
          />

          <ProductNumberInput
            label="Estoque atual"
            value={form.estoqueAtual}
            suffix="un."
            onChange={(value) =>
              updateNumberField(
                "estoqueAtual",
                value
              )
            }
          />

          <ProductNumberInput
            label="Custo unitário"
            value={form.custoUnitario}
            suffix="R$"
            step="0.01"
            onChange={(value) =>
              updateNumberField(
                "custoUnitario",
                value
              )
            }
          />

          <ProductNumberInput
            label="Demanda média diária"
            value={form.demandaDiariaMedia}
            suffix="un./dia"
            step="0.01"
            onChange={(value) =>
              updateNumberField(
                "demandaDiariaMedia",
                value
              )
            }
          />

          <ProductNumberInput
            label="Lead time"
            value={form.leadTime}
            suffix="dias"
            step="0.01"
            onChange={(value) =>
              updateNumberField(
                "leadTime",
                value
              )
            }
          />

          <ProductNumberInput
            label="Estoque de segurança"
            value={form.estoqueSeguranca}
            suffix="un."
            onChange={(value) =>
              updateNumberField(
                "estoqueSeguranca",
                value
              )
            }
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={saveProduct}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600bold text-white hover:bg-blue-700"
          >
            {editingId ? (
              <Save size={18} />
            ) : (
              <Plus size={18} />
            )}

            {editingId
              ? "Salvar alterações"
              : "Cadastrar produto"}
          </button>

          <button
            type="button"
            onClick={loadExampleProducts}
            className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Carregar exemplos
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            Produtos cadastrados
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-700">
            {products.length}
          </p>
        </article>

        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            Valor atual do estoque
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {formatCurrency(
              totals.valorEstoque
            )}
          </p>
        </article>

        <article className="rounded-2xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            Valor anual de consumo
          </p>

          <p className="mt-2 text-3xl font-bold text-violet-700">
            {formatCurrency(
              totals.valorConsumoAnual
            )}
          </p>
        </article>

        <article
          className={`rounded-2xl border p-5 shadow-sm ${
            totals.itensAbaixoReposicao > 0
              ? "border-red-200 bg-red-50"
              : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <p className="text-sm font-semibold text-slate-600">
            Abaixo do ponto de reposição
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${
              totals.itensAbaixoReposicao > 0
                ? "text-red-700"
                : "text-emerald-700"
            }`}
          >
            {totals.itensAbaixoReposicao}
          </p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700">
              <BarChart3 size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Curva ABC
              </h2>

              <p className="text-sm text-slate-500">
                Valor anual de consumo por classe
              </p>
            </div>
          </div>

          <div className="mt-6 h-80">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={abcChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis dataKey="classe" />

                <YAxis
                  tickFormatter={(value) =>
                    `R$ ${formatNumber(
                      Number(value) / 1000,
                      0
                    )} mil`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(Number(value))
                  }
                />

                <Legend />

                <Bar
                  dataKey="valor"
                  name="Valor anual"
                  radius={[8, 8, 0, 0]}
                >
                  {abcChartData.map((item) => (
                    <Cell
                      key={item.classe}
                      fill={
                        item.classe === "Classe A"
                          ? "#dc2626"
                          : item.classe ===
                              "Classe B"
                            ? "#f59e0b"
                            : "#16a34a"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Limites da classificação
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Ajuste os percentuais acumulados
          </p>

          <div className="mt-6 space-y-5">
            <ProductNumberInput
              label="Classe A até"
              value={limitA}
              suffix="%"
              step="0.1"
              onChange={(value) =>
                setLimitA(
                  Math.min(value, limitB)
                )
              }
            />

            <ProductNumberInput
              label="Classes A + B até"
              value={limitB}
              suffix="%"
              step="0.1"
              onChange={(value) =>
                setLimitB(
                  Math.min(
                    100,
                    Math.max(value, limitA)
                  )
                )
              }
            />
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-red-50 p-3">
              <span className="font-semibold text-red-700">
                Classe A
              </span>
              <span>{totals.classes.A} itens</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3">
              <span className="font-semibold text-amber-700">
                Classe B
              </span>
              <span>{totals.classes.B} itens</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
              <span className="font-semibold text-emerald-700">
                Classe C
              </span>
              <span>{totals.classes.C} itens</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Produtos cadastrados
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Produtos ordenados por valor anual
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Pesquisar código, produto ou classe"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {filteredAnalysis.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <Package
              size={36}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-600">
              Nenhum produto encontrado
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Cadastre manualmente ou importe um CSV.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-[1250px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                  <th className="p-3">ABC</th>
                  <th className="p-3">Código</th>
                  <th className="p-3">Produto</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3 text-right">
                    Demanda anual
                  </th>
                  <th className="p-3 text-right">
                    Estoque
                  </th>
                  <th className="p-3 text-right">
                    Custo unitário
                  </th>
                  <th className="p-3 text-right">
                    Valor estoque
                  </th>
                  <th className="p-3 text-right">
                    Valor anual
                  </th>
                  <th className="p-3 text-right">
                    Ponto reposição
                  </th>
                  <th className="p-3">
                    Situação
                  </th>
                  <th className="p-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAnalysis.map(
                  (product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-3">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full font-bold text-white ${
                            product.classeABC === "A"
                              ? "bg-red-600"
                              : product.classeABC ===
                                  "B"
                                ? "bg-amber-500"
                                : "bg-emerald-600"
                          }`}
                        >
                          {product.classeABC}
                        </span>
                      </td>

                      <td className="p-3 font-semibold text-slate-800">
                        {product.codigo}
                      </td>

                      <td className="p-3">
                        {product.descricao}
                      </td>

                      <td className="p-3 text-slate-500">
                        {product.categoria}
                      </td>

                      <td className="p-3 text-right">
                        {formatNumber(
                          product.demandaAnual
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {formatNumber(
                          product.estoqueAtual
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {formatCurrency(
                          product.custoUnitario
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {formatCurrency(
                          product.valorEstoque
                        )}
                      </td>

                      <td className="p-3 text-right font-semibold">
                        {formatCurrency(
                          product.valorConsumoAnual
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {formatNumber(
                          product.pontoReposicao,
                          1
                        )}
                      </td>

                      <td className="p-3">
                        {product.abaixoPontoReposicao ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                            <AlertTriangle size={14} />
                            Repor
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Suficiente
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              editProduct(product)
                            }
                            className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"
                            aria-label={`Editar ${product.codigo}`}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeProduct(product)
                            }
                            className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
                            aria-label={`Excluir ${product.codigo}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}