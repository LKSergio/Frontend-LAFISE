import { SidebarProvider } from "@/contexts/sidebar-context"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { CreditCards } from "@/components/credit-cards"
import { Accounts } from "@/components/accounts"
import { RecentTransactions } from "@/components/recent-transactions"

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="space-y-8">
              <CreditCards />
              <Accounts />
              <RecentTransactions />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
