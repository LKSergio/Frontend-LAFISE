"use client"

import { useSidebar } from "@/contexts/sidebar-context"
import { DashboardContent } from "@/components/dashboard-content"
import { TransferForm } from "@/components/transfer-form"
import { MyTransactions } from "@/components/my-transactions"

export function MainContent() {
  const { activeItem } = useSidebar()

  const renderContent = () => {
    switch (activeItem) {
      case "Tablero":
        return <DashboardContent />
      case "Transferir":
        return <TransferForm />
      case "Mis transacciones":
        return <MyTransactions />
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Sección "{activeItem}" en desarrollo</p>
          </div>
        )
    }
  }

  return renderContent()
}
