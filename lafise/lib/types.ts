// Types based on OpenAPI schema

export interface Amount {
    currency: string
    value: number
}

export interface UserProduct {
    type: "Account"
    id: string
}

export interface UserInfo {
    full_name: string
    profile_photo?: string
    products: UserProduct[]
}

export interface Account {
    alias: string
    account_number: number
    balance: number
    currency: string
}

export interface SummarizedTransaction {
    transaction_number: string
    description: string
    bank_description: string
    transaction_type: string
    origin: string
    destination: string
    amount: Amount
    transaction_date?: string
}

export interface AccountTransactionResponse {
    page: number
    size: number
    next?: number
    total_count: number
    items: SummarizedTransaction[]
}

export interface TransactionRequest {
    origin: string
    destination: string
    amount: Amount
}

export interface ProblemDetails {
    type: string
    title: string
    status: number
    detail?: string
    instance?: string
    traceId?: string
}
