"use client"

import { Copy } from "lucide-react"

interface Account {
  id: string
  type: "NIO" | "USD"
  accountNumber: string
  balance: string
  currency: string
  flag: "ni" | "us"
}

const accounts: Account[] = [
  {
    id: "1",
    type: "NIO",
    accountNumber: "10424667",
    balance: "38,456",
    currency: "C$",
    flag: "ni",
  },
  {
    id: "2",
    type: "USD",
    accountNumber: "10239849",
    balance: "22,380",
    currency: "USD",
    flag: "us",
  },
  {
    id: "3",
    type: "USD",
    accountNumber: "10635657",
    balance: "12,400",
    currency: "USD",
    flag: "us",
  },
]

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
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4 text-gray-800">Cuentas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-2 text-gray-800">{account.type} Cuenta</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                    {account.accountNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(account.accountNumber)}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-2xl font-bold text-foreground text-gray-800 py-5">
                  {account.currency} {account.balance}
                </p>
              </div>
              <FlagIcon country={account.flag}/>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
