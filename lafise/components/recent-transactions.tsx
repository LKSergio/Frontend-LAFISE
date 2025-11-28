"use client"

interface Transaction {
  id: string
  fecha: string
  descripcion: string
  debitoUSD: number
  balanceUSD: number
}

const transactions: Transaction[] = [
  {
    id: "1",
    fecha: "14/11/2021",
    descripcion: "Walmart",
    debitoUSD: 320.0,
    balanceUSD: 2100,
  },
  {
    id: "2",
    fecha: "12/11/2021",
    descripcion: "Hugo Delivery",
    debitoUSD: 12.45,
    balanceUSD: 2100,
  },
  {
    id: "3",
    fecha: "14/Nov/2021",
    descripcion: "Walmart Carretera Masaya",
    debitoUSD: 320.0,
    balanceUSD: 2100,
  },
]

export function RecentTransactions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Transacciones recientes</h2>
        <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Ver todas</button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Descripción</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Débito USD</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Balance USD</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors`}
                >
                  <td className="py-3 px-4 text-sm text-gray-900">{transaction.fecha}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{transaction.descripcion}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{transaction.debitoUSD.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{transaction.balanceUSD.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
