"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/user-context"
import { apiClient } from "@/lib/api-client"
import { getCurrencySymbol } from "@/lib/validation-utils"
import type { SummarizedTransaction } from "@/lib/types"
import { useSidebar } from "@/contexts/sidebar-context"

export function RecentTransactions() {
  const { accounts, localTransactions } = useUser()
  const { setActiveItem } = useSidebar()
  const [transactions, setTransactions] = useState<SummarizedTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTransactions = async () => {
      if (accounts.length === 0) {
        setTransactions([])
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        // Obtener transacciones de todas las cuentas en paralelo
        const results = await Promise.all(
          accounts.map(acc => apiClient.getAccountTransactions(acc.account_number.toString()).catch(() => ({ items: [] as SummarizedTransaction[] })))
        )
        const serverItems = results.flatMap(r => r.items || [])
        const localItems = Object.values(localTransactions).flat()
        // Fusionar y eliminar duplicados por transaction_number, preferir las locales (las más recientes sobrescriben)
        const byId = new Map<string, SummarizedTransaction>()
        ;[...localItems, ...serverItems].forEach(t => {
          if (!t || !t.transaction_number) return
          byId.set(t.transaction_number, t)
        })
        const merged = Array.from(byId.values())
          .filter(t => t.transaction_date)
          .sort((a, b) => new Date(b.transaction_date!).getTime() - new Date(a.transaction_date!).getTime())
          .slice(0, 3)
        setTransactions(merged)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load transactions"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    loadTransactions()
  }, [accounts, localTransactions])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-NI", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const typeBadge = (t: string) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t === 'Credit' ? 'Crédito' : 'Débito'}</span>
  )

  const goToAll = () => setActiveItem("Mis transacciones")

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Transacciones recientes</h2>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Transacciones recientes</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Error al cargar las transacciones: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Transacciones recientes</h2>
        <button onClick={goToAll} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">Ver todas</button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Fecha</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Descripción</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Tipo</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-gray-500 text-sm">
                    No hay transacciones recientes
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.transaction_number} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">{formatDate(transaction.transaction_date)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      <div className="font-medium truncate max-w-xs">{transaction.description}</div>
                      <div className="text-xs text-gray-500">Banco LAFISE</div>
                    </td>
                    <td className="py-3 px-4 text-sm">{typeBadge(transaction.transaction_type)}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-gray-900 whitespace-nowrap">
                      {getCurrencySymbol(transaction.amount.currency)} {transaction.amount.value.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
