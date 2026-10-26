"use client";

import { useEffect, useState } from "react";
import {
  EVENTS,
  STATUS,
  Joyride,
  type EventData,
} from "react-joyride";
import {
  BookOpen,
  RotateCcw,
  X,
} from "lucide-react";

import { etapasGuiaIniciante } from "@/data/tutoriais/iniciante";
import NivelIntermediario from "@/components/guia/intermediario/NivelIntermediario";
import type { TutorialIntermediario } from "@/data/tutoriais/intermediario";

const CHAVE_STATUS =
  "cenarilog-academy-v4-guia-status";

const CHAVE_RELATORIO =
  "cenarilog-academy-v4-relatorio";

type Relatorio = {
  tutorial: string;
  concluidoEm: string;
  etapasConcluidas: number;
  etapasTotais: number;
  aprendizados: string[];
  pontosParaPraticar: string[];
  vantagens: string[];
  limitacoes: string[];
};

function criarRelatorio(): Relatorio {
  return {
    tutorial: "Conhecendo o CenariLog Academy",
    concluidoEm: new Date().toISOString(),
    etapasConcluidas: etapasGuiaIniciante.length,
    etapasTotais: etapasGuiaIniciante.length,
    aprendizados: [
      "A operação atual representa a situação de agora.",
      "O cenário simulado permite testar mudanças.",
      "OTD mostra as entregas realizadas no prazo.",
      "OTIF considera prazo e pedido completo.",
      "Fill Rate mostra a parte que foi atendida.",
      "Ruptura mostra a parte que ficou faltando.",
      "As metas ajudam a comparar o resultado desejado.",
    ],
    pontosParaPraticar: [
      "Alterar somente uma informação por vez.",
      "Comparar OTD e OTIF.",
      "Observar Fill Rate e ruptura juntos.",
      "Analisar prazo, custo e estoque em conjunto.",
    ],
    vantagens: [
      "A comparação de cenários ajuda a observar possíveis resultados.",
      "As metas ajudam a encontrar resultados que precisam de atenção.",
    ],
    limitacoes: [
      "Os resultados dependem dos dados informados.",
      "O simulador não substitui uma ferramenta profissional.",
      "O relatório não representa uma certificação profissional.",
    ],
  };
}

export default function GuiaInterativo() {
  const [guiaAtivo, setGuiaAtivo] =
    useState(false);

  const [mostrarConvite, setMostrarConvite] =
    useState(false);

  const [relatorio, setRelatorio] =
    useState<Relatorio | null>(null);

  const [mostrarSeletorNivel, setMostrarSeletorNivel] =
    useState(false);

  const [
    mostrarNivelIntermediario,
    setMostrarNivelIntermediario,
  ] = useState(false);

  const [
    atividadeIntermediaria,
    setAtividadeIntermediaria,
  ] = useState<TutorialIntermediario | null>(null);

  useEffect(() => {
    const status =
      localStorage.getItem(CHAVE_STATUS);

    if (!status) {
      setMostrarConvite(true);
    }
  }, []);

  function abrirSeletorNivel() {
    setMostrarConvite(false);
    setRelatorio(null);
    setMostrarSeletorNivel(true);
  }

  function iniciarNivelIniciante() {
    setMostrarSeletorNivel(false);
    iniciarGuia();
  }

  function iniciarNivelIntermediario() {
    setMostrarSeletorNivel(false);
    setMostrarNivelIntermediario(true);
  }

  function iniciarAtividadeIntermediaria(
    tutorial: TutorialIntermediario
  ) {
    setAtividadeIntermediaria(tutorial);
    setMostrarNivelIntermediario(false);

    localStorage.setItem(
      "cenarilog-academy-v4-1-atividade-atual",
      tutorial.id
    );
  }

  function iniciarGuia() {
    localStorage.setItem(
      CHAVE_STATUS,
      "iniciado"
    );

    setMostrarConvite(false);
    setRelatorio(null);
    setGuiaAtivo(true);
  }

  function adiarGuia() {
    setMostrarConvite(false);
  }

  function ocultarConvite() {
    localStorage.setItem(
      CHAVE_STATUS,
      "oculto"
    );

    setMostrarConvite(false);
  }

  function concluirGuia() {
    const novoRelatorio = criarRelatorio();

    localStorage.setItem(
      CHAVE_STATUS,
      "concluido"
    );

    localStorage.setItem(
      CHAVE_RELATORIO,
      JSON.stringify(novoRelatorio)
    );

    setGuiaAtivo(false);
    setRelatorio(novoRelatorio);
  }

  function tratarEvento(data: EventData) {
    if (data.type !== EVENTS.TOUR_END) {
      return;
    }

    if (data.status === STATUS.FINISHED) {
      concluirGuia();
      return;
    }

    setGuiaAtivo(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrirSeletorNivel}
        className="flex items-center justify-center gap-2 rounded-xl border border-blue-500 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        <BookOpen size={17} />
        Guia interativo
      </button>

      {atividadeIntermediaria && (
        <div className="fixed bottom-4 left-1/2 z-[9000] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                Nível intermediário em andamento
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {atividadeIntermediaria.titulo}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {atividadeIntermediaria.objetivo}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAtividadeIntermediaria(null);

                  localStorage.removeItem(
                    "cenarilog-academy-v4-1-atividade-atual"
                  );
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Encerrar
              </button>

              <button
                type="button"
                onClick={() => setMostrarNivelIntermediario(true)}
                className="rounded-xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Ver problema
              </button>
            </div>
          </div>
        </div>
      )}

      <Joyride
        run={guiaAtivo}
        steps={etapasGuiaIniciante}
        continuous
        scrollToFirstStep
        onEvent={tratarEvento}
        locale={{
          back: "Voltar",
          close: "Fechar",
          last: "Concluir",
          next: "Próximo",
          skip: "Pular guia",
        }}
        options={{
          buttons: [
            "back",
            "close",
            "primary",
            "skip",
          ],
          primaryColor: "#2563eb",
          textColor: "#0f172a",
          backgroundColor: "#ffffff",
          overlayColor: "#0f172acc",
          showProgress: true,
          skipBeacon: true,
          spotlightPadding: 8,
          spotlightRadius: 12,
          scrollDuration: 450,
          scrollOffset: 24,
          width: 390,
          zIndex: 10000,
          closeButtonAction: "skip",
          dismissKeyAction: false,
          overlayClickAction: false,
        }}
        styles={{
          tooltip: {
            borderRadius: 16,
            fontSize: 16,
            lineHeight: 1.5,
          },
          buttonPrimary: {
            borderRadius: 10,
            padding: "10px 16px",
          },
          buttonBack: {
            color: "#475569",
          },
        }}
      />
      {mostrarSeletorNivel && (
        <div className="fixed inset-0 z-[11500] grid place-items-center overflow-y-auto bg-slate-950/80 p-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-seletor-nivel"
            className="w-full max-w-4xl rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  Modos de aprendizagem
                </span>

                <h2
                  id="titulo-seletor-nivel"
                  className="mt-4 text-2xl font-bold sm:text-3xl"
                >
                  Como você deseja aprender?
                </h2>

                <p className="mt-2 max-w-2xl leading-relaxed text-slate-600">
                  Escolha o modo que combina melhor com seu
                  conhecimento atual. Você poderá trocar de nível
                  quando quiser.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarSeletorNivel(false)}
                aria-label="Fechar seleção de nível"
                className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <button
                type="button"
                onClick={iniciarNivelIniciante}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
              >
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Nível iniciante
                </span>

                <h3 className="mt-4 text-xl font-bold text-slate-900">
                  Aprender passo a passo
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Conheça as partes do simulador e entenda os
                  principais indicadores com explicações simples.
                </p>

                <p className="mt-5 text-sm font-bold text-emerald-700">
                  Começar nível iniciante
                </p>
              </button>

              <button
                type="button"
                onClick={iniciarNivelIntermediario}
                className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-md"
              >
                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  Nível intermediário
                </span>

                <h3 className="mt-4 text-xl font-bold text-slate-900">
                  Resolver problemas com pistas
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Ajude a Artesanatos Lucia’s a enfrentar problemas
                  de atendimento, estoque, reposição e organização
                  de produtos.
                </p>

                <p className="mt-5 text-sm font-bold text-amber-800">
                  Começar nível intermediário
                </p>
              </button>

              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6 opacity-75">
                <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                  Em desenvolvimento
                </span>

                <h3 className="mt-4 text-xl font-bold text-slate-700">
                  Nível avançado
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  Compare vários cenários, restrições, custos,
                  riscos e decisões combinadas.
                </p>

                <p className="mt-5 text-sm font-bold text-slate-500">
                  Disponível em uma versão futura
                </p>
              </div>
            </div>

            <p className="mt-7 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
              Os níveis indicam a quantidade de orientação
              oferecida pelo sistema. Eles não representam
              classificação profissional.
            </p>
          </section>
        </div>
      )}

      {
        mostrarConvite && (
          <div className="fixed inset-0 z-[11000] grid place-items-center bg-slate-950/75 p-5">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-convite-guia"
              className="w-full max-w-lg rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    CenariLog Academy 4.0
                  </span>

                  <h2
                    id="titulo-convite-guia"
                    className="mt-4 text-2xl font-bold"
                  >
                    Quer conhecer o simulador?
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={adiarGuia}
                  aria-label="Fechar convite"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="mt-4 leading-relaxed text-slate-600">
                Este guia mostra as partes principais
                usando explicações curtas e fáceis de
                acompanhar.
              </p>

              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                O CenariLog Academy possui finalidade
                educacional e não substitui uma análise
                profissional.
              </p>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={abrirSeletorNivel}
                  className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Escolher modo de aprendizagem
                </button>

                <button
                  type="button"
                  onClick={adiarGuia}
                  className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Agora não
                </button>

                <button
                  type="button"
                  onClick={ocultarConvite}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800"
                >
                  Não mostrar novamente
                </button>
              </div>
            </section>
          </div>
        )
      }

      {
        relatorio && (
          <div className="fixed inset-0 z-[11000] grid place-items-center bg-slate-950/75 p-5">
            <article
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-relatorio"
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Relatório educacional
                  </span>

                  <h2
                    id="titulo-relatorio"
                    className="mt-4 text-2xl font-bold"
                  >
                    Relatório de Aprendizagem
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setRelatorio(null)}
                  aria-label="Fechar relatório"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 rounded-xl bg-slate-100 p-4">
                <p>
                  <strong>Tutorial:</strong>{" "}
                  {relatorio.tutorial}
                </p>

                <p className="mt-1">
                  <strong>Etapas:</strong>{" "}
                  {relatorio.etapasConcluidas} de{" "}
                  {relatorio.etapasTotais}
                </p>
              </div>

              <ReportSection
                title="O que foi apresentado"
                items={relatorio.aprendizados}
              />

              <ReportSection
                title="Continue praticando"
                items={relatorio.pontosParaPraticar}
              />

              <ReportSection
                title="Vantagens da simulação"
                items={relatorio.vantagens}
              />

              <ReportSection
                title="Limitações"
                items={relatorio.limitacoes}
              />

              <p className="mt-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
                Este relatório registra a conclusão
                do guia. Não representa certificado,
                nota ou avaliação profissional.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={iniciarGuia}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <RotateCcw size={17} />
                  Repetir guia
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-slate-300 px-4 py-3 font-semibold hover:bg-slate-50"
                >
                  Imprimir
                </button>

                <button
                  type="button"
                  onClick={() => setRelatorio(null)}
                  className="rounded-xl border border-slate-300 px-4 py-3 font-semibold hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>
            </article>
          </div>
        )
      }
      <NivelIntermediario
        aberto={mostrarNivelIntermediario}
        aoFechar={() => setMostrarNivelIntermediario(false)}
        aoIniciarAtividade={iniciarAtividadeIntermediaria}
      />

    </>

  );
}

function ReportSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="mt-6">
      <h3 className="text-lg font-bold text-slate-900">
        {title}
      </h3>

      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}