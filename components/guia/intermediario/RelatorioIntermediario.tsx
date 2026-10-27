"use client";

import {
    ArrowRight,
    CheckCircle2,
    Printer,
    RotateCcw,
    Store,
    Target,
    TrendingDown,
    TrendingUp,
    X,
} from "lucide-react";

import type {
    IdTutorialIntermediario,
    TutorialIntermediario,
} from "@/data/tutoriais/intermediario";

export type IndicadorRelatorio = {
    nome: string;
    antes: number;
    depois: number;
    unidade: "%" | "dias" | "un." | "R$";
    menorMelhor?: boolean;
};

export type DadosRelatorioIntermediario = {
    tutorial: TutorialIntermediario;
    concluidoEm: string;
    indicadores: IndicadorRelatorio[];
    pistasUtilizadas: number;
    pontosFortes: string[];
    pontosParaPraticar: string[];
    proximoTutorial?: IdTutorialIntermediario;
};

type RelatorioIntermediarioProps = {
    aberto: boolean;
    dados: DadosRelatorioIntermediario | null;
    aoFechar: () => void;
    aoRepetir: () => void;
    aoAbrirProximo?: (
        tutorialId: IdTutorialIntermediario
    ) => void;
};

function formatarValor(
    valor: number,
    unidade: IndicadorRelatorio["unidade"]
) {
    if (unidade === "R$") {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(valor);
    }

    const valorFormatado = new Intl.NumberFormat(
        "pt-BR",
        {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }
    ).format(valor);

    if (unidade === "%") {
        return `${valorFormatado}%`;
    }

    if (unidade === "dias") {
        return `${valorFormatado} dias`;
    }

    return `${valorFormatado} un.`;
}

export default function RelatorioIntermediario({
    aberto,
    dados,
    aoFechar,
    aoRepetir,
    aoAbrirProximo,
}: RelatorioIntermediarioProps) {
    if (!aberto || !dados) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[13000] overflow-y-auto bg-slate-950/80 p-4 sm:p-6">
            <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
                <article
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="titulo-relatorio-intermediario"
                    className="w-full overflow-hidden rounded-3xl bg-slate-100 shadow-2xl"
                >
                    <header className="bg-slate-950 p-6 text-white sm:p-8">
                        <div className="flex items-start justify-between gap-5">
                            <div className="flex items-start gap-4">
                                <div className="rounded-2xl bg-emerald-500 p-3 text-slate-950">
                                    <CheckCircle2 size={30} />
                                </div>

                                <div>
                                    <span className="inline-flex rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">
                                        Atividade concluída
                                    </span>

                                    <h2
                                        id="titulo-relatorio-intermediario"
                                        className="mt-3 text-2xl font-bold sm:text-3xl"
                                    >
                                        Relatório de Aprendizagem
                                    </h2>

                                    <p className="mt-2 text-slate-300">
                                        Artesanatos Lucia’s · Nível
                                        intermediário
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={aoFechar}
                                aria-label="Fechar relatório"
                                className="shrink-0 rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <ResumoCabecalho
                                titulo="Problema"
                                valor={dados.tutorial.titulo}
                            />

                            <ResumoCabecalho
                                titulo="Setor"
                                valor={dados.tutorial.setor}
                            />

                            <ResumoCabecalho
                                titulo="Pistas utilizadas"
                                valor={`${dados.pistasUtilizadas} de ${dados.tutorial.pistas.length}`}
                            />
                        </div>
                    </header>

                    <div className="space-y-6 p-6 sm:p-8">
                        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                            <div className="flex items-start gap-3">
                                <Target className="mt-0.5 shrink-0 text-blue-700" />

                                <div>
                                    <h3 className="font-bold text-blue-950">
                                        Objetivo da atividade
                                    </h3>

                                    <p className="mt-2 leading-relaxed text-blue-900">
                                        {dados.tutorial.objetivo}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-slate-900">
                                Comparação dos resultados
                            </h3>

                            <p className="mt-1 text-sm text-slate-600">
                                Veja como os indicadores mudaram durante
                                a atividade.
                            </p>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                {dados.indicadores.map(
                                    (indicador) => (
                                        <CartaoIndicador
                                            key={indicador.nome}
                                            indicador={indicador}
                                        />
                                    )
                                )}
                            </div>
                        </section>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <ListaRelatorio
                                titulo="O que foi aprendido"
                                itens={dados.tutorial.aprendizados}
                                cor="violet"
                            />

                            <ListaRelatorio
                                titulo="O que você fez bem"
                                itens={dados.pontosFortes}
                                cor="emerald"
                            />

                            <ListaRelatorio
                                titulo="Vantagens da decisão"
                                itens={dados.tutorial.vantagens}
                                cor="blue"
                            />

                            <ListaRelatorio
                                titulo="Desvantagens e limitações"
                                itens={dados.tutorial.desvantagens}
                                cor="amber"
                            />
                        </div>

                        <ListaRelatorio
                            titulo="Continue praticando"
                            itens={dados.pontosParaPraticar}
                            cor="slate"
                        />

                        <section className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-start gap-3">
                                <Store className="mt-0.5 shrink-0 text-amber-700" />

                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        Crescimento da Artesanatos Lucia’s
                                    </h3>

                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        A resolução deste problema ajuda a
                                        loja a organizar o setor de{" "}
                                        {dados.tutorial.setor.toLowerCase()}{" "}
                                        antes de continuar sua expansão.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <p className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                            Este relatório registra uma atividade
                            educacional. O resultado não representa
                            certificado ou avaliação de competência
                            profissional.
                        </p>

                        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:flex-wrap">
                            <button
                                type="button"
                                onClick={aoRepetir}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                <RotateCcw size={17} />
                                Repetir atividade
                            </button>

                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                <Printer size={17} />
                                Imprimir relatório
                            </button>

                            {dados.proximoTutorial &&
                                aoAbrirProximo && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            aoAbrirProximo(
                                                dados.proximoTutorial!
                                            )
                                        }
                                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 sm:ml-auto"
                                    >
                                        Próximo problema
                                        <ArrowRight size={17} />
                                    </button>
                                )}

                            <button
                                type="button"
                                onClick={aoFechar}
                                className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                            >
                                Voltar ao simulador
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}

function ResumoCabecalho({
    titulo,
    valor,
}: {
    titulo: string;
    valor: string;
}) {
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
                {titulo}
            </p>

            <p className="mt-1 font-semibold text-white">
                {valor}
            </p>
        </div>
    );
}

function CartaoIndicador({
    indicador,
}: {
    indicador: IndicadorRelatorio;
}) {
    const diferenca =
        indicador.depois - indicador.antes;

    const semMudanca =
        Math.abs(diferenca) < 0.0001;

    const melhorou = indicador.menorMelhor
        ? diferenca < 0
        : diferenca > 0;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
                {indicador.nome}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                        Antes
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-700">
                        {formatarValor(
                            indicador.antes,
                            indicador.unidade
                        )}
                    </p>
                </div>

                <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                        Depois
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                        {formatarValor(
                            indicador.depois,
                            indicador.unidade
                        )}
                    </p>
                </div>
            </div>

            <div
                className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${semMudanca
                        ? "bg-slate-100 text-slate-600"
                        : melhorou
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                    }`}
            >
                {!semMudanca &&
                    (diferenca > 0 ? (
                        <TrendingUp size={17} />
                    ) : (
                        <TrendingDown size={17} />
                    ))}

                {semMudanca
                    ? "Sem mudança"
                    : melhorou
                        ? "Resultado melhorou"
                        : "Resultado exige atenção"}
            </div>
        </div>
    );
}

function ListaRelatorio({
    titulo,
    itens,
    cor,
}: {
    titulo: string;
    itens: string[];
    cor:
    | "violet"
    | "emerald"
    | "blue"
    | "amber"
    | "slate";
}) {
    const classes = {
        violet:
            "border-violet-200 bg-violet-50 text-violet-950",
        emerald:
            "border-emerald-200 bg-emerald-50 text-emerald-950",
        blue:
            "border-blue-200 bg-blue-50 text-blue-950",
        amber:
            "border-amber-200 bg-amber-50 text-amber-950",
        slate:
            "border-slate-200 bg-white text-slate-900",
    };

    return (
        <section
            className={`rounded-2xl border p-5 ${classes[cor]}`}
        >
            <h3 className="font-bold">
                {titulo}
            </h3>

            <ul className="mt-4 space-y-3">
                {itens.map((item) => (
                    <li
                        key={item}
                        className="flex gap-2 text-sm leading-relaxed"
                    >
                        <CheckCircle2
                            size={17}
                            className="mt-0.5 shrink-0"
                        />

                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}