"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { apiClient } from "@/lib/api-client"
import type { UserInfo, Account } from "@/lib/types"

interface UserContextType {
    user: UserInfo | null
    accounts: Account[]
    loading: boolean
    error: string | null
    refreshUser: () => Promise<void>
    refreshAccounts: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null)
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // For demo purposes, we'll use userId 1
    // In a real app, this would come from authentication
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

    // Load user on mount
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
