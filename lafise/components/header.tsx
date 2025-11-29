"use client"

import { Bell, Menu, Search } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { useUser } from "@/contexts/user-context"

export function Header() {
  const { toggleCollapsed } = useSidebar()
  const { user } = useUser()

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      {/* Botón hamburguesa */}
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
        <button className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-colors">
          {user?.profile_photo ? (
            <img src={user.profile_photo} alt={user.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
              {user?.full_name?.charAt(0) || "U"}
            </div>
          )}
        </button>
      </div>
    </header>
  )
}
