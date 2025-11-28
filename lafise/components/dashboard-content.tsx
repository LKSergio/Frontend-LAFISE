import { CreditCards } from "@/components/credit-cards"
import { Accounts } from "@/components/accounts"
import { RecentTransactions } from "@/components/recent-transactions"

export function DashboardContent() {
  return (
    <div className="space-y-8">
      <CreditCards />
      <Accounts />
      <RecentTransactions />
    </div>
  )
}
