// Validation utilities for forms

export interface ValidationResult {
    valid: boolean
    error?: string
}

export interface TransferValidationResult {
    valid: boolean
    errors: string[]
}

/**
 * Validate transfer parameters
 */
export function validateTransfer(
    amount: number,
    balance: number,
    originAccount: string,
    destinationAccount: string
): TransferValidationResult {
    const errors: string[] = []

    // Validate origin account
    if (!originAccount) {
        errors.push("Debe seleccionar una cuenta origen")
    }

    // Validate destination account
    if (!destinationAccount) {
        errors.push("Debe seleccionar una cuenta destino")
    }

    // Validate accounts are different
    if (originAccount && destinationAccount && originAccount === destinationAccount) {
        errors.push("La cuenta origen y destino deben ser diferentes")
    }

    // Validate amount
    if (!amount || amount <= 0) {
        errors.push("El monto debe ser mayor a 0")
    }

    // Validate sufficient balance
    if (amount > balance) {
        errors.push("Saldo insuficiente para realizar la transferencia")
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Validate amount input
 */
export function validateAmount(amount: string): ValidationResult {
    if (!amount || amount.trim() === "") {
        return { valid: false, error: "El monto es requerido" }
    }

    const numAmount = parseFloat(amount)

    if (isNaN(numAmount)) {
        return { valid: false, error: "El monto debe ser un número válido" }
    }

    if (numAmount <= 0) {
        return { valid: false, error: "El monto debe ser mayor a 0" }
    }

    return { valid: true }
}

/**
 * Validate account number format
 */
export function validateAccountNumber(accountNumber: string): ValidationResult {
    if (!accountNumber || accountNumber.trim() === "") {
        return { valid: false, error: "El número de cuenta es requerido" }
    }

    // Account numbers should be numeric and between 10-16 digits
    const numericPattern = /^\d{10,16}$/

    if (!numericPattern.test(accountNumber)) {
        return { valid: false, error: "El número de cuenta debe tener entre 10 y 16 dígitos" }
    }

    return { valid: true }
}

/**
 * Check if balance is sufficient for amount
 */
export function hasSufficientBalance(amount: number, balance: number): boolean {
    return balance >= amount
}

/**
 * Format currency symbol
 */
export function getCurrencySymbol(currency: string): string {
    return currency === "NIO" ? "C$" : currency
}
