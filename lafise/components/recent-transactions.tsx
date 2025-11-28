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
        <h2 className="text-xl font-semibold text-foreground text-gray-800">Transacciones recientes</h2>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ver todas</button>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Descripción</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Débito USD</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Balance USD</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-foreground">{transaction.fecha}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{transaction.descripcion}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{transaction.debitoUSD.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{transaction.balanceUSD.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
