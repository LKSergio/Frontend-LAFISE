"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, AlertCircle } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { apiClient } from "@/lib/api-client"
import { validateTransfer, getCurrencySymbol } from "@/lib/validation-utils"
import type { Account } from "@/lib/types"

const steps = [
  { id: 1, name: "Cuenta origen" },
  { id: 2, name: "Cuenta destino" },
  { id: 3, name: "Monto a transferir" },
  { id: 4, name: "Datos adicionales" },
]

const transactionTypes = ["Terceros", "Propias", "Interbancaria"]

export function TransferForm() {
  const { accounts, refreshAccounts } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [transactionType, setTransactionType] = useState("Propias")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [destinationAccount, setDestinationAccount] = useState<Account | null>(null)
  const [amount, setAmount] = useState("")
  const [debitConcept, setDebitConcept] = useState("")
  const [creditConcept, setCreditConcept] = useState("")
  const [reference, setReference] = useState("")
  const [confirmationEmail, setConfirmationEmail] = useState("")
  const [showTransactionDropdown, setShowTransactionDropdown] = useState(false)
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Set first account as default when accounts load
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0])
    }
  }, [accounts, selectedAccount])

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setValidationErrors([])
    }
  }

  const handleContinue = async () => {
    setValidationErrors([])

    // Validate based on current step
    if (currentStep === 1) {
      if (!selectedAccount) {
        setValidationErrors(["Debe seleccionar una cuenta origen"])
        return
      }
    } else if (currentStep === 2) {
      if (!destinationAccount) {
        setValidationErrors(["Debe seleccionar una cuenta destino"])
        return
      }
      if (selectedAccount && destinationAccount && selectedAccount.account_number === destinationAccount.account_number) {
        setValidationErrors(["La cuenta origen y destino deben ser diferentes"])
        return
      }
    } else if (currentStep === 3) {
      if (!amount || parseFloat(amount) <= 0) {
        setValidationErrors(["Debe ingresar un monto válido mayor a 0"])
        return
      }
      if (selectedAccount && parseFloat(amount) > selectedAccount.balance) {
        setValidationErrors([
          `Saldo insuficiente. Disponible: ${getCurrencySymbol(selectedAccount.currency)} ${selectedAccount.balance.toLocaleString()}`
        ])
        return
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final validation before submit
      await handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!selectedAccount || !destinationAccount || !amount) {
      setValidationErrors(["Por favor complete todos los campos requeridos"])
      return
    }

    const amountValue = parseFloat(amount)

    // Final validation
    const validation = validateTransfer(
      amountValue,
      selectedAccount.balance,
      selectedAccount.account_number.toString(),
      destinationAccount.account_number.toString()
    )

    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }

    try {
      setSubmitting(true)
      setValidationErrors([])
      
      await apiClient.createTransaction({
        origin: selectedAccount.account_number.toString(),
        destination: destinationAccount.account_number.toString(),
        amount: {
          currency: selectedAccount.currency,
          value: amountValue,
        },
      })

      setSubmitSuccess(true)
      // Refresh accounts to get updated balances
      await refreshAccounts()
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
        setCurrentStep(1)
        setDestinationAccount(null)
        setAmount("")
        setDebitConcept("")
        setCreditConcept("")
        setReference("")
        setConfirmationEmail("")
        setValidationErrors([])
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear la transferencia"
      setValidationErrors([errorMessage])
    } finally {
      setSubmitting(false)
    }
  }

  // Get available destination accounts (exclude selected origin)
  const getDestinationAccounts = () => {
    if (!selectedAccount) return accounts
    return accounts.filter(acc => acc.account_number !== selectedAccount.account_number)
  }

  const getBalanceWarning = () => {
    if (!amount || !selectedAccount) return null
    
    const amountValue = parseFloat(amount)
    if (isNaN(amountValue)) return null
    
    if (amountValue > selectedAccount.balance) {
      return `Saldo insuficiente. Disponible: ${getCurrencySymbol(selectedAccount.currency)} ${selectedAccount.balance.toLocaleString()}`
    }
    return null
  }

  if (submitSuccess) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Transferir</h1>
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">¡Transferencia exitosa!</h2>
            <p className="text-gray-600 mb-4">La transferencia se ha realizado correctamente</p>
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Monto:</span>
                  <span className="font-semibold">{selectedAccount && getCurrencySymbol(selectedAccount.currency)} {parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desde:</span>
                  <span className="font-semibold">{selectedAccount?.alias}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hacia:</span>
                  <span className="font-semibold">{destinationAccount?.alias}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Transferir</h1>

      <div className="bg-white rounded-xl p-8 shadow-sm">
        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex flex-col items-center relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 ${
                      step.id < currentStep ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}

                {/* Step indicator */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    step.id < currentStep
                      ? "bg-emerald-500 text-white"
                      : step.id === currentStep
                        ? "bg-white border-2 border-emerald-500"
                        : "bg-white border-2 border-gray-200"
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : step.id === currentStep ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  ) : null}
                </div>

                {/* Step label */}
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-400">Paso {step.id}</p>
                  <p className={`text-sm ${step.id <= currentStep ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                    {step.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de transacción */}
          <div className="relative">
            <label className="block text-sm text-gray-800 mb-2">Tipo de transacción</label>
            <button
              onClick={() => setShowTransactionDropdown(!showTransactionDropdown)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between bg-white hover:border-gray-300 transition-colors text-black"
            >
              <span className="text-black font-medium">{transactionType}</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            {showTransactionDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {transactionTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setTransactionType(type)
                      setShowTransactionDropdown(false)
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-black ${
                      transactionType === type ? 'bg-emerald-50' : ''
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cuenta origen */}
          <div className="relative">
            <label className="block text-sm text-gray-800 mb-2">Cuenta origen</label>
            <button
              onClick={() => setShowOriginDropdown(!showOriginDropdown)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between bg-white hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium">{selectedAccount?.alias || "Seleccionar"}</span>
                {selectedAccount && (
                  <span className="text-gray-600">{selectedAccount.account_number}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedAccount && (
                  <span className="text-gray-600">
                    {getCurrencySymbol(selectedAccount.currency)} {selectedAccount.balance.toLocaleString()}
                  </span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </button>
            {showOriginDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {accounts.map((account) => (
                  <button
                    key={account.account_number}
                    onClick={() => {
                      setSelectedAccount(account)
                      setShowOriginDropdown(false)
                      // Reset destination if it's the same as new origin
                      if (destinationAccount?.account_number === account.account_number) {
                        setDestinationAccount(null)
                      }
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-medium">{account.alias}</span>
                      <span className="text-gray-600">{account.account_number}</span>
                    </div>
                    <span className="text-gray-800">
                      {getCurrencySymbol(account.currency)} {account.balance.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cuenta destino */}
          <div className="relative mt-6 md:mt-8">
            <label className="block text-sm text-gray-800 mb-2">Cuenta destino</label>
            <button
              onClick={() => setShowDestinationDropdown(!showDestinationDropdown)}
              disabled={!selectedAccount}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between bg-white hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium">{destinationAccount?.alias || "Seleccionar cuenta destino"}</span>
                {destinationAccount && (
                  <span className="text-gray-600">{destinationAccount.account_number}</span>
                )}
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            {showDestinationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {getDestinationAccounts().length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-sm">
                    No hay otras cuentas disponibles
                  </div>
                ) : (
                  getDestinationAccounts().map((account) => (
                    <button
                      key={account.account_number}
                      onClick={() => {
                        setDestinationAccount(account)
                        setShowDestinationDropdown(false)
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 font-medium">{account.alias}</span>
                        <span className="text-gray-600">{account.account_number}</span>
                      </div>
                      <span className="text-gray-800">
                        {getCurrencySymbol(account.currency)} {account.balance.toLocaleString()}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Monto */}
          <div className="mt-6 md:mt-8">
            <label className="block text-sm text-gray-800 mb-2">Monto a transferir</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 text-black ${
                getBalanceWarning() ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'
              }`}
            />
            {getBalanceWarning() && (
              <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{getBalanceWarning()}</span>
              </div>
            )}
            {selectedAccount && amount && !getBalanceWarning() && (
              <p className="mt-2 text-sm text-gray-600">
                Saldo disponible: {getCurrencySymbol(selectedAccount.currency)} {selectedAccount.balance.toLocaleString()}
              </p>
            )}
          </div>

          {/* Concepto de débito */}
          <div className="relative mt-6 md:mt-8">
            <label className="absolute -top-2 left-3 px-1 bg-white text-xs text-emerald-600">Concepto de débito (opcional)</label>
            <input
              type="text"
              value={debitConcept}
              onChange={(e) => setDebitConcept(e.target.value)}
              placeholder="Concepto de débito"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-black"
            />
          </div>

          {/* Concepto de crédito */}
          <div className="mt-6 md:mt-8">
            <input
              type="text"
              value={creditConcept}
              onChange={(e) => setCreditConcept(e.target.value)}
              placeholder="Concepto de crédito (opcional)"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 text-black"
            />
          </div>

          {/* Referencia */}
          <div className="mt-6 md:mt-8">
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Referencia (opcional)"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 text-black"
            />
          </div>

          {/* Enviar confirmación a */}
          <div className="mt-6 md:mt-8">
            <input
              type="email"
              value={confirmationEmail}
              onChange={(e) => setConfirmationEmail(e.target.value)}
              placeholder="Enviar confirmación a: (opcional)"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 text-black"
            />
          </div>
        </div>

        {/* Error messages */}
        {validationErrors.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                {validationErrors.map((error, index) => (
                  <p key={index} className="text-red-700 text-sm">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-center gap-8 mt-8 py-4">
          <button
            onClick={handleBack}
            disabled={submitting || currentStep === 1}
            className="px-8 py-2.5 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            Atrás
          </button>
          
          <button
            onClick={handleContinue}
            disabled={submitting || !!getBalanceWarning()}
            className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Procesando..." : currentStep === 4 ? "Transferir" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  )
}
