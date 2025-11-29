"use client"

import { Bell, Menu, Search } from "lucide-react"
import dynamic from "next/dynamic"
import { useSidebar } from "@/contexts/sidebar-context"
import { useUser } from "@/contexts/user-context"
import AvatarAnimation from "@/public/animation/Avatar.json"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

export function Header() {
  const { toggleCollapsed } = useSidebar()
  const { user } = useUser()

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      {/* Botón de Collapso */}
      <button
        onClick={toggleCollapsed}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Sección derecha */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {/* Indicador una notificación reciente (Opcional) 👍*/}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800" />
          <input
            type="text"
            placeholder="Buscar"
            className="w-48 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-black placeholder-opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Avatar del usuario */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 hidden md:block">
            {user?.full_name || "Usuario"}
          </span>
          <button className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-colors bg-gray-100">
            <div className="w-full h-full flex items-center justify-center">
              <Lottie
                animationData={AvatarAnimation}
                loop={true}
                className="w-full h-full scale-210"
              />
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
