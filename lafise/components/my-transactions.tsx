"use client"

import { useState } from "react"

const tabs = ["Movimientos", "Estado", "Detalle", "Fondo no Disponible"]

const transactions = [
  { fecha: "14/Nov/2021", descripcion: "Walmart Carretera Masaya", debito: "320.00", balance: "2,100" },
  { fecha: "14/Nov/2021", descripcion: "Walmart Carretera Masaya", debito: "320.00", balance: "2,100" },
  { fecha: "14/Nov/2021", descripcion: "Walmart Carretera Masaya", debito: "320.00", balance: "2,100" },
  { fecha: "14/Nov/2021", descripcion: "Walmart Carretera Masaya", debito: "320.00", balance: "2,100" },
  { fecha: "14/Nov/2021", descripcion: "Walmart Carretera Masaya", debito: "320.00", balance: "2,100" },
  { fecha: "14/Nov/2021", descripcion: "Walmart Carretera Masaya", debito: "320.00", balance: "2,100" },
  { fecha: "14/Nov/2021", descripcion: "Walmart Carretera Masaya", debito: "320.00", balance: "2,100" },
  { fecha: "14/Nov/2021", descripcion: "Walmart Carretera Masaya", debito: "320.00", balance: "2,100" },
  { fecha: "14/Nov/2021", descripcion: "Walmart Carretera Masaya", debito: "320.00", balance: "2,100" },
  { fecha: "14/Nov/2021", descripcion: "Walmart Carretera Masaya", debito: "320.00", balance: "2,100" },
  { fecha: "14/Nov/2021", descripcion: "Walmart Carretera Masaya", debito: "320.00", balance: "2,100" },
]

export function MyTransactions() {
  const [activeTab, setActiveTab] = useState("Movimientos")

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mis Transacciones</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Descripción</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Débito USD</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Balance USD</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-900">{transaction.fecha}</td>
                <td className="py-3 px-4 text-sm text-gray-900">{transaction.descripcion}</td>
                <td className="py-3 px-4 text-sm text-gray-900">{transaction.debito}</td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">{transaction.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
