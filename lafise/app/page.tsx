import { SidebarProvider } from "@/contexts/sidebar-context"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar/>
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Contenido principal del dashboard</p>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}