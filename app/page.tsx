"use client";

import { useState } from "react";

export default function Home() {
  const [demanda, setDemanda] = useState(5000);
  const [estoque, setEstoque] = useState(1500);
  const [entregas, setEntregas] = useState(950);
  const [totalEntregas, setTotalEntregas] = useState(1000);

  const giro = (demanda / estoque).toFixed(2);
  const otif = ((entregas / totalEntregas) * 100).toFixed(2);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold text-blue-700">
          LogSim Pro
        </h1>

        <p className="text-gray-600 mt-2">
          Simulador de Indicadores Logísticos
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="font-bold text-xl mb-4">
              Dados da Operação
            </h2>

            <label>Demanda</label>

            <input
              type="number"
              value={demanda}
              onChange={(e) =>
                setDemanda(Number(e.target.value))
              }
              className="border p-2 w-full mb-4"
            />

            <label>Estoque Médio</label>

            <input
              type="number"
              value={estoque}
              onChange={(e) =>
                setEstoque(Number(e.target.value))
              }
              className="border p-2 w-full mb-4"
            />

            <label>Entregas no Prazo</label>

            <input
              type="number"
              value={entregas}
              onChange={(e) =>
                setEntregas(Number(e.target.value))
              }
              className="border p-2 w-full mb-4"
            />

            <label>Total Entregas</label>

            <input
              type="number"
              value={totalEntregas}
              onChange={(e) =>
                setTotalEntregas(Number(e.target.value))
              }
              className="border p-2 w-full"
            />

          </div>

          <div className="space-y-6">

            <div className="bg-white rounded-xl shadow p-6">

              <h3 className="text-gray-500">
                Giro de Estoque
              </h3>

              <p className="text-4xl font-bold text-blue-600">
                {giro}
              </p>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

              <h3 className="text-gray-500">
                OTIF
              </h3>

              <p className="text-4xl font-bold text-green-600">
                {otif}%
              </p>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}