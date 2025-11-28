"use client"

import { useSidebar } from "@/contexts/sidebar-context"
import Image from "next/image"

import {
    ChevronRight,
    LayoutDashboard,
} from "lucide-react"

const menuItems = [
  { id: "Tablero", label: "Tablero", icon: LayoutDashboard },
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
            <div className="flex items-center gap-1">

            </div>

    </aside>
  )
}
