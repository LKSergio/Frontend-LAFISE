"use client"

import { useState, useEffect } from "react"
import { ChevronDown, X, Search } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { apiClient } from "@/lib/api-client"
import { getCurrencySymbol } from "@/lib/validation-utils"
import type { SummarizedTransaction, Account } from "@/lib/types"

const tabs = ["Movimientos", "Estado", "Detalle", "Fondo no Disponible"]

export function MyTransactions() {
  const { accounts, localTransactions } = useUser()
  const [activeTab, setActiveTab] = useState("Movimientos")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<SummarizedTransaction[]>([])
  const [serverTransactions, setServerTransactions] = useState<SummarizedTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<SummarizedTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)

  // Establecer la primera cuenta como predeterminada cuando se cargan las cuentas
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0])
    }
  }, [accounts, selectedAccount])

  // Cargar transacciones del servidor cuando cambia la cuenta seleccionada
  useEffect(() => {
    const loadTransactions = async () => {
      if (!selectedAccount) return

      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.getAccountTransactions(selectedAccount.account_number.toString())
        setServerTransactions(response.items)
        // Merge with any local transactions immediately
        const locals = localTransactions[selectedAccount.account_number.toString()] || []
        const merged = [...locals, ...(response.items || [])]
        merged.sort((a, b) => {
          const da = new Date(a.transaction_date || 0).getTime()
          const db = new Date(b.transaction_date || 0).getTime()
          return db - da
        })
        setTransactions(merged)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load transactions"
        setError(errorMessage)
        console.error("Error loading transactions:", err)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [selectedAccount])

  // Reunir nuevamente (merge) cuando cambian transacciones locales o hay actualización del servidor
  useEffect(() => {
    if (!selectedAccount) return
    const locals = localTransactions[selectedAccount.account_number.toString()] || []
    const merged = [...locals, ...(serverTransactions || [])]
    merged.sort((a, b) => {
      const da = new Date(a.transaction_date || 0).getTime()
      const db = new Date(b.transaction_date || 0).getTime()
      return db - da
    })
    setTransactions(merged)
  }, [localTransactions, selectedAccount, serverTransactions])

  // Filtrar transacciones por rango de fechas
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredTransactions(transactions)
      return
    }

    const filtered = transactions.filter(transaction => {
      if (!transaction.transaction_date) return true

      const transactionDate = new Date(transaction.transaction_date)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      if (start) start.setHours(0, 0, 0, 0)
      if (end) end.setHours(23, 59, 59, 999)

      if (start && transactionDate < start) return false
      if (end && transactionDate > end) return false
      return true
    })

    setFilteredTransactions(filtered)
  }, [startDate, endDate, transactions])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/D"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-NI", { day: "2-digit", month: "short", year: "numeric" })
  }

  const clearFilters = () => {
    setStartDate("")
    setEndDate("")
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mis Transacciones</h1>

      {/* Pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Movimientos" ? (
        <div className="space-y-6">
          {/* Sección de filtros */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Selector de cuenta */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">Cuenta</label>
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-sm"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-emerald-600 font-medium truncate">
                      {selectedAccount ? selectedAccount.alias : "Seleccionar cuenta"}
                    </span>
                    {selectedAccount && (
                      <span className="text-gray-500 text-xs">{selectedAccount.account_number}</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>

                {showAccountDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {accounts.map((account) => (
                      <button
                        key={account.account_number}
                        onClick={() => {
                          setSelectedAccount(account)
                          setShowAccountDropdown(false)
                        }}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">{account.alias}</div>
                          <div className="text-xs text-gray-500">{account.account_number}</div>
                        </div>
                        <div className="text-sm font-medium text-emerald-600">
                          {getCurrencySymbol(account.currency)} {account.balance.toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filtros de fecha */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  {(startDate || endDate) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                      title="Limpiar filtros"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información de resultados */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>
              Mostrando <span className="font-medium text-gray-900">{filteredTransactions.length}</span> movimientos
              {startDate || endDate ? " filtrados por fecha" : ""}
            </p>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            {loading ? (
              <div className="p-8 space-y-4">
                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600 bg-red-50">
                <p>{error}</p>
                <button
                  onClick={() => setSelectedAccount(selectedAccount ? { ...selectedAccount } : null)}
                  className="mt-2 text-sm underline hover:text-red-800"
                >
                  Intentar de nuevo
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-500">
                          {startDate || endDate
                            ? "No se encontraron transacciones en el rango de fechas seleccionado"
                            : "No hay transacciones disponibles para esta cuenta"}
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <tr key={transaction.transaction_number} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap">
                            {formatDate(transaction.transaction_date)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-xs text-gray-500">{transaction.bank_description}</div>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.transaction_type === 'Credit'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {transaction.transaction_type === 'Credit' ? 'Crédito' : 'Débito'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-right font-medium text-gray-900">
                            {getCurrencySymbol(transaction.amount.currency)} {transaction.amount.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sección en construcción</h3>
          <p className="text-gray-500">
            La funcionalidad de {activeTab} estará disponible próximamente.
          </p>
        </div>
      )}
    </div>
  )
}
