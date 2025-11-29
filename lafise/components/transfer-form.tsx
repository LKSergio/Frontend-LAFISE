"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { apiClient } from "@/lib/api-client"
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
  const [currentStep, setCurrentStep] = useState(4)
  const [transactionType, setTransactionType] = useState("Terceros")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(accounts[0] || null)
  const [destinationAccount, setDestinationAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [debitConcept, setDebitConcept] = useState("")
  const [creditConcept, setCreditConcept] = useState("")
  const [reference, setReference] = useState("")
  const [confirmationEmail, setConfirmationEmail] = useState("")
  const [showTransactionDropdown, setShowTransactionDropdown] = useState(false)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleContinue = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit the transaction
      await handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!selectedAccount || !destinationAccount || !amount) {
      setSubmitError("Por favor complete todos los campos requeridos")
      return
    }

    try {
      setSubmitting(true)
      setSubmitError(null)

      await apiClient.createTransaction({
        origin: selectedAccount.account_number.toString(),
        destination: destinationAccount,
        amount: {
          currency: selectedAccount.currency,
          value: parseFloat(amount),
        },
      })

      setSubmitSuccess(true)
      // Refresh accounts to get updated balances
      await refreshAccounts()

      // Reset form after 2 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
        setCurrentStep(1)
        setDestinationAccount("")
        setAmount("")
        setDebitConcept("")
        setCreditConcept("")
        setReference("")
        setConfirmationEmail("")
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear la transferencia"
      setSubmitError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const getCurrencySymbol = (currency: string) => {
    return currency === "NIO" ? "C$" : currency
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
            <p className="text-gray-600">La transferencia se ha realizado correctamente</p>
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
                    className={`absolute top-4 left-1/2 w-full h-0.5 ${step.id < currentStep ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                  />
                )}

                {/* Step indicator */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${step.id < currentStep
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
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-black ${transactionType === type ? 'bg-emerald-50' : ''
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
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
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
            {showAccountDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {accounts.map((account) => (
                  <button
                    key={account.account_number}
                    onClick={() => {
                      setSelectedAccount(account)
                      setShowAccountDropdown(false)
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
          <div className="mt-6 md:mt-8">
            <input
              type="text"
              value={destinationAccount}
              onChange={(e) => setDestinationAccount(e.target.value)}
              placeholder="Cuenta destino"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 text-black"
            />
          </div>

          {/* Monto */}
          <div className="mt-6 md:mt-8">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Monto"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 text-black"
            />
          </div>

          {/* Concepto de débito */}
          <div className="relative mt-6 md:mt-8">
            <label className="absolute -top-2 left-3 px-1 bg-white text-xs text-emerald-600">Concepto de débito</label>
            <input
              type="text"
              value={debitConcept}
              onChange={(e) => setDebitConcept(e.target.value)}
              placeholder="Concepto de débito"
              className="w-full px-4 py-3 border border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-black"
            />
          </div>

          {/* Concepto de crédito */}
          <div className="mt-6 md:mt-8">
            <input
              type="text"
              value={creditConcept}
              onChange={(e) => setCreditConcept(e.target.value)}
              placeholder="Concepto de crédito"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 text-black"
            />
          </div>

          {/* Referencia */}
          <div className="mt-6 md:mt-8">
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Referencia"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 text-black"
            />
          </div>

          {/* Enviar confirmación a */}
          <div className="mt-6 md:mt-8">
            <input
              type="email"
              value={confirmationEmail}
              onChange={(e) => setConfirmationEmail(e.target.value)}
              placeholder="Enviar confirmación a:"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 text-black"
            />
          </div>
        </div>

        {/* Error message */}
        {submitError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {submitError}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-center gap-8 mt-8 py-4">
          <button
            onClick={handleBack}
            disabled={submitting}
            className="px-8 py-2.5 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium disabled:opacity-50">
            Atrás
          </button>

          <button
            onClick={handleContinue}
            disabled={submitting}
            className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50">
            {submitting ? "Procesando..." : currentStep === 4 ? "Transferir" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  )
}
