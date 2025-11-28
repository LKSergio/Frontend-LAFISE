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
            <Image src="/banco_lafise.png" width={250} height={100} alt="Banco LAFISE Logo" priority />
        </div>

            {/* Menu de Navegación */}
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

    </aside>
  )
}
