// API Client for LAFISE Transfer App

import type {
    UserInfo,
    Account,
    AccountTransactionResponse,
    TransactionRequest,
    SummarizedTransaction,
    ProblemDetails,
} from "./types"

const API_BASE_URL = "http://localhost:5566"

class ApiError extends Error {
    constructor(
        public status: number,
        public problemDetails?: ProblemDetails
    ) {
        super(problemDetails?.title || "API Error")
        this.name = "ApiError"
    }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
        })

        if (!response.ok) {
            let problemDetails: ProblemDetails | undefined
            try {
                problemDetails = await response.json()
            } catch {
                // If response is not JSON, ignore
            }
            throw new ApiError(response.status, problemDetails)
        }

        return await response.json()
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }
        // Network error or other issues
        throw new Error(`Failed to fetch ${endpoint}: ${error}`)
    }
}

export const apiClient = {
    /**
     * Get user information by user ID
     */
    async getUserInfo(userId: number): Promise<UserInfo> {
        return fetchApi<UserInfo>(`/users/${userId}`)
    },

    /**
     * Get account details by account ID
     */
    async getAccount(accountId: string): Promise<Account> {
        return fetchApi<Account>(`/accounts/${accountId}`)
    },

    /**
     * Get account transactions by account ID
     */
    async getAccountTransactions(accountId: string): Promise<AccountTransactionResponse> {
        return fetchApi<AccountTransactionResponse>(`/accounts/${accountId}/transactions`)
    },

    /**
     * Create a new transaction (transfer)
     */
    async createTransaction(request: TransactionRequest): Promise<SummarizedTransaction> {
        return fetchApi<SummarizedTransaction>("/transactions", {
            method: "POST",
            body: JSON.stringify(request),
        })
    },
}

export { ApiError }
