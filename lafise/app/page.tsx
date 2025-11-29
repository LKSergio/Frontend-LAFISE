import { SidebarProvider } from "@/contexts/sidebar-context"
import { UserProvider } from "@/contexts/user-context"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { MainContent } from "@/components/main-content"

export default function Home() {
  return (
    <UserProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6 overflow-auto">
              <MainContent />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </UserProvider>
  )
}
