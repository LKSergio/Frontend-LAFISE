import { SidebarProvider } from "@/contexts/sidebar-context"
import { Sidebar } from "@/components/sidebar"

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar/>
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Contenido principal del dashboard</p>
            </div>
        </main>
      </div>
    </SidebarProvider>
  )
}