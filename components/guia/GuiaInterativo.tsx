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

  useEffect(() => {
    const status =
      localStorage.getItem(CHAVE_STATUS);

    if (!status) {
      setMostrarConvite(true);
    }
  }, []);

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
        onClick={iniciarGuia}
        className="flex items-center justify-center gap-2 rounded-xl border border-blue-500 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        <BookOpen size={17} />
        Guia interativo
      </button>

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

      {mostrarConvite && (
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
                onClick={iniciarGuia}
                className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Começar o guia
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
      )}

      {relatorio && (
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
      )}
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