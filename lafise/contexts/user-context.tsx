"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { apiClient } from "@/lib/api-client"
import type { UserInfo, Account, SummarizedTransaction } from "@/lib/types"

interface UserContextType {
    user: UserInfo | null
    accounts: Account[]
    loading: boolean
    error: string | null
    refreshUser: () => Promise<void>
    refreshAccounts: () => Promise<void>
    localTransactions: Record<string, SummarizedTransaction[]>
    addLocalTransaction: (accountNumber: number | string, tx: SummarizedTransaction) => void
    applyTransferBalances: (originAccountNumber: string | number, originDebit: number, destinationAccountNumber: string | number, destinationCredit: number) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null)
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [localTransactions, setLocalTransactions] = useState<Record<string, SummarizedTransaction[]>>({})

    // Para propositos de demo, se usara el id=1
    // En una aplicacion real, se obtedria mediante autenticacion
    const DEMO_USER_ID = 1

    const refreshUser = async () => {
        try {
            setLoading(true)
            setError(null)
            const userData = await apiClient.getUserInfo(DEMO_USER_ID)
            setUser(userData)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load user data"
            setError(errorMessage)
            console.error("Error loading user:", err)
        } finally {
            setLoading(false)
        }
    }

    const refreshAccounts = async () => {
        if (!user?.products) return

        try {
            setError(null)
            const accountPromises = user.products.map((product) =>
                apiClient.getAccount(product.id)
            )
            const accountsData = await Promise.all(accountPromises)
            setAccounts(accountsData)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load accounts"
            setError(errorMessage)
            console.error("Error loading accounts:", err)
        }
    }

    const addLocalTransaction = (accountNumber: number | string, tx: SummarizedTransaction) => {
        const key = typeof accountNumber === "number" ? accountNumber.toString() : accountNumber
        setLocalTransactions((prev) => {
            const list = prev[key] ? [...prev[key]] : []
            
            return { ...prev, [key]: [tx, ...list] }
        })
    }

    const applyTransferBalances = (originAccountNumber: string | number, originDebit: number, destinationAccountNumber: string | number, destinationCredit: number) => {
        const originKey = originAccountNumber.toString()
        const destKey = destinationAccountNumber.toString()
        setAccounts((prev) => prev.map(acc => {
            if (acc.account_number.toString() === originKey) {
                return { ...acc, balance: acc.balance - originDebit }
            }
            if (acc.account_number.toString() === destKey) {
                return { ...acc, balance: acc.balance + destinationCredit }
            }
            return acc
        }))
    }

    // Cargar usuario al iniciar
    useEffect(() => {
        refreshUser()
    }, [])

    // Load accounts when user changes
    useEffect(() => {
        if (user) {
            refreshAccounts()
        }
    }, [user])

    return (
        <UserContext.Provider
            value={{
                user,
                accounts,
                loading,
                error,
                refreshUser,
                refreshAccounts,
                localTransactions,
                addLocalTransaction,
                applyTransferBalances,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider")
    }
    return context
}
