"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/user-context"
import { apiClient } from "@/lib/api-client"
import type { SummarizedTransaction } from "@/lib/types"

export function RecentTransactions() {
  const { accounts } = useUser()
  const [transactions, setTransactions] = useState<SummarizedTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTransactions = async () => {
      if (accounts.length === 0) return

      try {
        setLoading(true)
        setError(null)
        // Get transactions from the first account
        const response = await apiClient.getAccountTransactions(accounts[0].account_number.toString())
        setTransactions(response.items)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load transactions"
        setError(errorMessage)
        console.error("Error loading transactions:", err)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [accounts])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-NI", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Transacciones recientes</h2>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          Error al cargar las transacciones: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Transacciones recientes</h2>
        <button className="text-sm text-gray-800 hover:text-gray-700 transition-colors">Ver todas</button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Descripción</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-gray-500">
                    No hay transacciones recientes
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr
                    key={transaction.transaction_number}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">{formatDate(transaction.transaction_date)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{transaction.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{transaction.transaction_type}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {transaction.amount.currency} {transaction.amount.value.toFixed(2)}
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
