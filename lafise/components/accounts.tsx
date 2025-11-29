"use client"

import { Copy } from "lucide-react"
import { useUser } from "@/contexts/user-context"

function FlagIcon({ country }: { country: "ni" | "us" }) {
  if (country === "ni") {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 bg-blue-500"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-blue-500"></div>
        </div>
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
      <div className="w-full h-full relative">
        <div className="absolute inset-0 flex flex-col">
          {[...Array(7)].map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? "bg-red-600" : "bg-white"}`}></div>
          ))}
        </div>
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-800 flex items-center justify-center">
          <span className="text-white text-[6px]">★★★</span>
        </div>
      </div>
    </div>
  )
}

export function Accounts() {
  const { accounts, loading, error } = useUser()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getCurrencySymbol = (currency: string) => {
    return currency === "NIO" ? "C$" : currency
  }

  const getFlag = (currency: string): "ni" | "us" => {
    return currency === "NIO" ? "ni" : "us"
  }

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4 text-gray-800">Cuentas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4 text-gray-800">Cuentas</h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          Error al cargar las cuentas: {error}
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4 text-gray-800">Cuentas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.account_number} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-2 text-gray-800">{account.alias}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                    {account.account_number}
                  </span>
                  <button
                    onClick={() => copyToClipboard(account.account_number.toString())}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-2xl font-bold text-foreground text-gray-800 py-5">
                  {getCurrencySymbol(account.currency)} {account.balance.toLocaleString()}
                </p>
              </div>
              <FlagIcon country={getFlag(account.currency)} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
