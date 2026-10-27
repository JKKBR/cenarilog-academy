"use client";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  MapPin,
  PackageSearch,
  RotateCcw,
  Store,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  tutoriaisIntermediarios,
  type IdTutorialIntermediario,
  type TutorialIntermediario,
} from "@/data/tutoriais/intermediario";

const CHAVE_PROGRESSO =
  "cenarilog-academy-v4-1-progresso-intermediario";

type ProgressoTutorial = {
  tutorialId: IdTutorialIntermediario;
  iniciadoEm: string;
  pistasVisualizadas: number;
  concluido: boolean;
  concluidoEm?: string;
};

type NivelIntermediarioProps = {
  aberto: boolean;
  aoFechar: () => void;
  aoIniciarAtividade?: (
    tutorial: TutorialIntermediario
  ) => void;
};

function carregarProgresso(): ProgressoTutorial[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const salvo = localStorage.getItem(
      CHAVE_PROGRESSO
    );

    if (!salvo) {
      return [];
    }

    const dados = JSON.parse(salvo);

    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export default function NivelIntermediario({
  aberto,
  aoFechar,
  aoIniciarAtividade,
}: NivelIntermediarioProps) {
  const [tutorialSelecionadoId, setTutorialSelecionadoId] =
    useState<IdTutorialIntermediario | null>(null);

  const [quantidadePistas, setQuantidadePistas] =
    useState(0);

  const [progresso, setProgresso] =
    useState<ProgressoTutorial[]>([]);

  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (aberto) {
      setProgresso(carregarProgresso());
    }
  }, [aberto]);

  const tutorialSelecionado = useMemo(
    () =>
      tutoriaisIntermediarios.find(
        (tutorial) =>
          tutorial.id === tutorialSelecionadoId
      ) ?? null,
    [tutorialSelecionadoId]
  );

  const tutoriaisConcluidos = progresso.filter(
    (item) => item.concluido
  ).length;

  function salvarProgresso(
    novoProgresso: ProgressoTutorial[]
  ) {
    setProgresso(novoProgresso);

    localStorage.setItem(
      CHAVE_PROGRESSO,
      JSON.stringify(novoProgresso)
    );
  }

  function selecionarTutorial(
    tutorialId: IdTutorialIntermediario
  ) {
    setTutorialSelecionadoId(tutorialId);
    setQuantidadePistas(0);
    setMensagem("");
  }

  function voltarParaLista() {
    setTutorialSelecionadoId(null);
    setQuantidadePistas(0);
    setMensagem("");
  }

  function mostrarProximaPista() {
    if (!tutorialSelecionado) {
      return;
    }

    setQuantidadePistas((quantidadeAtual) =>
      Math.min(
        quantidadeAtual + 1,
        tutorialSelecionado.pistas.length
      )
    );
  }

  function iniciarAtividade() {
    if (!tutorialSelecionado) {
      return;
    }

    const registroExistente = progresso.find(
      (item) =>
        item.tutorialId === tutorialSelecionado.id
    );

    const novoRegistro: ProgressoTutorial = {
      tutorialId: tutorialSelecionado.id,
      iniciadoEm:
        registroExistente?.iniciadoEm ??
        new Date().toISOString(),
      pistasVisualizadas: Math.max(
        registroExistente?.pistasVisualizadas ?? 0,
        quantidadePistas
      ),
      concluido:
        registroExistente?.concluido ?? false,
      concluidoEm:
        registroExistente?.concluidoEm,
    };

    const novoProgresso = [
      ...progresso.filter(
        (item) =>
          item.tutorialId !== tutorialSelecionado.id
      ),
      novoRegistro,
    ];

    salvarProgresso(novoProgresso);

    setMensagem(
      "Atividade iniciada. O problema está pronto para ser analisado no simulador."
    );

    aoIniciarAtividade?.(tutorialSelecionado);
  }

  function reiniciarTutorial() {
    if (!tutorialSelecionado) {
      return;
    }

    const novoProgresso = progresso.filter(
      (item) =>
        item.tutorialId !== tutorialSelecionado.id
    );

    salvarProgresso(novoProgresso);
    setQuantidadePistas(0);

    setMensagem(
      "O progresso deste problema foi reiniciado."
    );
  }

  if (!aberto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[12000] overflow-y-auto bg-slate-950/80 p-4 sm:p-6">
      <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-nivel-intermediario"
          className="w-full overflow-hidden rounded-3xl bg-slate-100 shadow-2xl"
        >
          <header className="bg-slate-950 p-6 text-white sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-amber-500 p-3 text-slate-950">
                  <Store size={30} />
                </div>

                <div>
                  <span className="inline-flex rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
                    CenariLog Academy 4.1
                  </span>

                  <h2
                    id="titulo-nivel-intermediario"
                    className="mt-3 text-2xl font-bold sm:text-3xl"
                  >
                    Artesanatos Lucia’s
                  </h2>

                  <p className="mt-1 font-semibold text-amber-300">
                    Nível intermediário
                  </p>

                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    A loja está crescendo. Resolva
                    problemas de atendimento, estoque,
                    reposição e organização de produtos
                    usando pistas quando precisar.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={aoFechar}
                aria-label="Fechar nível intermediário"
                className="shrink-0 rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Tipo de loja
                </p>

                <p className="mt-1 font-semibold">
                  Artesanatos e presentes
                </p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Progresso
                </p>

                <p className="mt-1 font-semibold">
                  {tutoriaisConcluidos} de{" "}
                  {tutoriaisIntermediarios.length} problemas
                </p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Como funciona
                </p>

                <p className="mt-1 font-semibold">
                  Problema, pistas e solução
                </p>
              </div>
            </div>
          </header>

          {mensagem && (
            <div className="mx-6 mt-6 flex items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 sm:mx-8">
              <span>{mensagem}</span>

              <button
                type="button"
                onClick={() => setMensagem("")}
                aria-label="Fechar mensagem"
                className="font-bold"
              >
                ×
              </button>
            </div>
          )}

          {!tutorialSelecionado ? (
            <ListaTutoriais
              progresso={progresso}
              aoSelecionar={selecionarTutorial}
            />
          ) : (
            <DetalhesTutorial
              tutorial={tutorialSelecionado}
              quantidadePistas={quantidadePistas}
              progresso={progresso}
              aoMostrarPista={mostrarProximaPista}
              aoIniciar={iniciarAtividade}
              aoReiniciar={reiniciarTutorial}
              aoVoltar={voltarParaLista}
            />
          )}

          <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs leading-relaxed text-slate-500 sm:px-8">
            Atividade educacional. Os problemas apresentam
            situações simuladas e não substituem decisões
            profissionais.
          </footer>
        </section>
      </div>
    </div>
  );
}

function ListaTutoriais({
  progresso,
  aoSelecionar,
}: {
  progresso: ProgressoTutorial[];
  aoSelecionar: (
    tutorialId: IdTutorialIntermediario
  ) => void;
}) {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">
          Escolha um problema
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Você pode começar por qualquer atividade e
          solicitar até três pistas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tutoriaisIntermediarios.map(
          (tutorial, index) => {
            const registro = progresso.find(
              (item) =>
                item.tutorialId === tutorial.id
            );

            return (
              <button
                key={tutorial.id}
                type="button"
                onClick={() =>
                  aoSelecionar(tutorial.id)
                }
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 font-bold text-amber-800">
                      {index + 1}
                    </span>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                        {tutorial.setor}
                      </p>

                      <h4 className="mt-1 font-bold text-slate-900">
                        {tutorial.titulo}
                      </h4>
                    </div>
                  </div>

                  {registro?.concluido ? (
                    <CheckCircle2 className="shrink-0 text-emerald-600" />
                  ) : (
                    <ChevronRight className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-amber-600" />
                  )}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {tutorial.historia}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {registro ? (
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 font-semibold text-blue-700">
                      Em andamento
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                      Não iniciado
                    </span>
                  )}

                  {registro &&
                    registro.pistasVisualizadas > 0 && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-800">
                        {registro.pistasVisualizadas}{" "}
                        {registro.pistasVisualizadas === 1
                          ? "pista usada"
                          : "pistas usadas"}
                      </span>
                    )}
                </div>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}

function DetalhesTutorial({
  tutorial,
  quantidadePistas,
  progresso,
  aoMostrarPista,
  aoIniciar,
  aoReiniciar,
  aoVoltar,
}: {
  tutorial: TutorialIntermediario;
  quantidadePistas: number;
  progresso: ProgressoTutorial[];
  aoMostrarPista: () => void;
  aoIniciar: () => void;
  aoReiniciar: () => void;
  aoVoltar: () => void;
}) {
  const registro = progresso.find(
    (item) => item.tutorialId === tutorial.id
  );

  const todasAsPistasForamExibidas =
    quantidadePistas >= tutorial.pistas.length;

  return (
    <div className="p-6 sm:p-8">
      <button
        type="button"
        onClick={aoVoltar}
        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Voltar aos problemas
      </button>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-amber-100 p-3 text-amber-800">
                <PackageSearch size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  {tutorial.setor}
                </p>

                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  {tutorial.titulo}
                </h3>
              </div>
            </div>

            <p className="mt-5 leading-relaxed text-slate-700">
              {tutorial.historia}
            </p>
          </section>

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 shrink-0 text-blue-700" />

              <div>
                <h4 className="font-bold text-blue-950">
                  Seu objetivo
                </h4>

                <p className="mt-2 leading-relaxed text-blue-900">
                  {tutorial.objetivo}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lightbulb className="text-amber-700" />

                <div>
                  <h4 className="font-bold text-amber-950">
                    Pistas
                  </h4>

                  <p className="text-sm text-amber-800">
                    Use somente se precisar.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-800">
                {quantidadePistas} de{" "}
                {tutorial.pistas.length}
              </span>
            </div>

            {quantidadePistas === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-amber-300 bg-white/60 p-4 text-sm text-amber-900">
                Nenhuma pista foi utilizada. Tente
                observar o problema antes de pedir ajuda.
              </p>
            ) : (
              <ol className="mt-5 space-y-3">
                {tutorial.pistas
                  .slice(0, quantidadePistas)
                  .map((pista, index) => (
                    <li
                      key={pista}
                      className="rounded-xl border border-amber-200 bg-white p-4 text-sm leading-relaxed text-slate-700"
                    >
                      <strong>
                        Pista {index + 1}:
                      </strong>{" "}
                      {pista}
                    </li>
                  ))}
              </ol>
            )}

            <button
              type="button"
              onClick={aoMostrarPista}
              disabled={todasAsPistasForamExibidas}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400 bg-white px-4 py-3 font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <Lightbulb size={17} />

              {todasAsPistasForamExibidas
                ? "Todas as pistas foram mostradas"
                : "Mostrar próxima pista"}
            </button>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <BookOpen className="text-violet-700" />

              <h4 className="font-bold text-slate-900">
                O que será praticado
              </h4>
            </div>

            <ul className="mt-4 space-y-3">
              {tutorial.aprendizados.map(
                (aprendizado) => (
                  <li
                    key={aprendizado}
                    className="flex gap-2 text-sm leading-relaxed text-slate-600"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-violet-600"
                    />

                    <span>{aprendizado}</span>
                  </li>
                )
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h4 className="font-bold text-slate-900">
              Status
            </h4>

            <p className="mt-2 text-sm text-slate-600">
              {registro
                ? "Esta atividade já foi iniciada."
                : "Esta atividade ainda não foi iniciada."}
            </p>

            {registro && (
              <p className="mt-2 text-xs text-slate-500">
                Maior número de pistas registrado:{" "}
                {registro.pistasVisualizadas}
              </p>
            )}
          </section>

          <button
            type="button"
            onClick={aoIniciar}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            Começar atividade
            <ChevronRight size={18} />
          </button>

          {registro && (
            <button
              type="button"
              onClick={aoReiniciar}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw size={17} />
              Reiniciar problema
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}