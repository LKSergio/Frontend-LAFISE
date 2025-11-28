"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type SidebarContextType = {
  activeItem: string
  setActiveItem: (item: string) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [activeItem, setActiveItem] = useState("Tablero")
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapsed = () => setIsCollapsed((prev) => !prev)

  return (
    <SidebarContext.Provider value={{ activeItem, setActiveItem, isCollapsed, setIsCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar debe usarse dentro de un SidebarProvider")
  }
  return context
}
