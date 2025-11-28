"use client"

import { useSidebar } from "@/contexts/sidebar-context"
import Image from "next/image"

import {
    LayoutDashboard,
    ArrowRightLeft,
    Banknote,
    ClipboardList,
    Settings2,
    FileText,
    Landmark,
    Users,
    PiggyBank,
    Settings,
    ChevronRight,
    ChevronDown,
    ArrowLeftRight,
} from "lucide-react"

const menuItems = [
    { id: "Tablero", label: "Tablero", icon: LayoutDashboard },
    { id: "Transferir", label: "Transferir", icon: ArrowRightLeft },
    { id: "Pagar", label: "Pagar", icon: Banknote },
    { id: "Mis transacciones", label: "Mis transacciones", icon: ClipboardList },
    { id: "Gestionar", label: "Gestionar", icon: Settings2 },
    { id: "Cheques", label: "Cheques", icon: FileText },
    { id: "Paganet", label: "Paganet", icon: Landmark },
    { id: "Administrar", label: "Administrar", icon: Users },
    { id: "Ahorro automático", label: "Ahorro automático", icon: PiggyBank },
    { id: "Configuración", label: "Configuración", icon: Settings },
]

export function Sidebar() {
  const { activeItem, setActiveItem } = useSidebar()
  
  return (
    <aside className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-6">
            <Image src="/Banco_Lafise.png" width={250} height={100} alt="Banco LAFISE Logo" priority />
        </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Exchange Rate Section */}
      <div className="border-t border-gray-200 px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Tasa de cambio</h3>

        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-800">
            <span>Córdoba</span>
            <ChevronDown className="h-3 w-3" />
          </div>
          <div className="flex items-center gap-7 rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-800">
            <span>USD</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-800">NIO: 35.1</span>
          <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
          <span className="font-medium text-gray-800">USD: 35.95</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 px-4 py-3">
        <p className="text-xs text-gray-500">IP del Servidor: 190.432.574.23</p>
        <p className="text-xs text-gray-500">Último acceso: 2021/11/21 13:32:11</p>
      </div>

    </aside>
  )
}
