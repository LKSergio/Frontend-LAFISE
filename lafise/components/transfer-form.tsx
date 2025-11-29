"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, AlertCircle, RefreshCw } from "lucide-react"
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

const transactionTypes = ["Propias", "Terceros"]

// Tasas de cambio según dirección
// USD -> NIO: multiplicar por 35.95
// NIO -> USD: dividir entre 35.10
const EXCHANGE_RATE_USD_TO_NIO = 35.95
const EXCHANGE_RATE_NIO_TO_USD = 35.10

export function TransferForm() {
  const { accounts, refreshAccounts, addLocalTransaction, applyTransferBalances } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [transactionType, setTransactionType] = useState("Propias")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [destinationAccount, setDestinationAccount] = useState<Account | null>(null)
  const [destinationAccountNumber, setDestinationAccountNumber] = useState("")
  const [thirdPartyError, setThirdPartyError] = useState<string | null>(null)
  const [autoVerifying, setAutoVerifying] = useState(false)
  const [thirdPartyManualCurrency, setThirdPartyManualCurrency] = useState<'USD'|'NIO'>('NIO')
  const [amount, setAmount] = useState("")
  const [conceptType, setConceptType] = useState<"debit"|"credit">("debit")
  const [conceptValue, setConceptValue] = useState("")
  const [reference, setReference] = useState("")
  const [confirmationEmail, setConfirmationEmail] = useState("")
  const [showTransactionDropdown, setShowTransactionDropdown] = useState(false)
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [verifyingAccount, setVerifyingAccount] = useState(false)

  // Establecer la primera cuenta como predeterminada al cargar las cuentas
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0])
    }
  }, [accounts, selectedAccount])

  // Lógica derivada de pasos: calcula el paso más alto válido según campos llenos sin bloquear ediciones previas
  useEffect(() => {
    let target = 1
    const originValid = !!selectedAccount
    const destinationValid = originValid && (
      (transactionType === 'Propias' && destinationAccount && destinationAccount.account_number !== selectedAccount!.account_number) ||
      (transactionType === 'Terceros' && destinationAccount)
    )
    const amountValid = destinationValid && amount && (() => {
      const v = parseFloat(amount)
      return !isNaN(v) && v > 0 && selectedAccount && v <= selectedAccount.balance
    })()
    if (originValid) target = 2
    if (destinationValid) target = 3
    if (amountValid) target = 4
    if (target !== currentStep) setCurrentStep(target)
  }, [selectedAccount, destinationAccount, transactionType, amount, currentStep])

  // Reiniciar la cuenta destino cuando cambia el tipo de transacción
  useEffect(() => {
    setDestinationAccount(null)
    setDestinationAccountNumber("")
    setValidationErrors([])
    setThirdPartyError(null)
    setThirdPartyManualCurrency('NIO')
  }, [transactionType])

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setValidationErrors([])
    }
  }

  const verifyThirdPartyAccount = async (accountNumber: string): Promise<boolean> => {
    try {
      setVerifyingAccount(true)
      if (selectedAccount && accountNumber === selectedAccount.account_number.toString()) {
        setDestinationAccount(null)
        setThirdPartyError("Debe ingresar una cuenta distinta a la de origen")
        return false
      }
      const account = await apiClient.getAccount(accountNumber)
      setDestinationAccount(account)
      setThirdPartyError(null)
      if (account.currency === 'USD' || account.currency === 'NIO') {
        setThirdPartyManualCurrency(account.currency as 'USD'|'NIO')
      }
      return true
    } catch (error) {
      setDestinationAccount(null)
      setThirdPartyError("Cuenta no encontrada")
      return false
    } finally {
      setVerifyingAccount(false)
    }
  }

  const handleContinue = async () => {
    // Solo se usa ahora para el envío final
    if (currentStep === 4) {
      await handleSubmit()
    }
  }

  // Auto-verificación con espera (debounce) para cuentas de terceros (mínimo 10 dígitos)
  useEffect(() => {
    if (transactionType !== 'Terceros') return
    const len = destinationAccountNumber ? destinationAccountNumber.trim().length : 0
    if (!destinationAccountNumber || len < 10 || len > 16) {
      setDestinationAccount(null)
      setThirdPartyError(null)
      return
    }
    setAutoVerifying(true)
    const timer = setTimeout(() => {
      verifyThirdPartyAccount(destinationAccountNumber.trim()).finally(() => setAutoVerifying(false))
    }, 600)
    return () => clearTimeout(timer)
  }, [transactionType, destinationAccountNumber])

  const handleSubmit = async () => {
    if (!selectedAccount || !destinationAccount || !amount) {
      setValidationErrors(["Por favor complete todos los campos requeridos"])
      return
    }

    const amountValue = parseFloat(amount)

    // Validación final
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

      // Normalizar moneda al formato de la API (espera "USD" o "NIO")
      const displayToApiCurrency: Record<string, string> = {
        USD: "USD",
        NIO: "NIO",
        "C$": "NIO",
        "$": "USD",
      }
      const apiCurrency = displayToApiCurrency[selectedAccount.currency] ?? selectedAccount.currency

      const created = await apiClient.createTransaction({
        origin: selectedAccount.account_number.toString(),
        destination: destinationAccount.account_number.toString(),
        amount: {
          currency: apiCurrency,
          value: amountValue,
        },
      })

      // Agregar registros de transacción local para reflejar inmediatamente en el historial
      const nowIso = new Date().toISOString()
      const originTx = {
        ...created,
        description: conceptType === "debit" && conceptValue ? conceptValue : created.description || "Transferencia",
        bank_description: "Banco LAFISE",
        transaction_type: "Debit" as const,
        origin: selectedAccount.account_number.toString(),
        destination: destinationAccount.account_number.toString(),
        amount: { currency: selectedAccount.currency, value: amountValue },
        transaction_date: nowIso,
      }
      addLocalTransaction(selectedAccount.account_number, originTx)

      // Si la cuenta destino pertenece al usuario, agregar crédito espejo
      const destBelongs = accounts.some(a => a.account_number === destinationAccount.account_number)
      if (destBelongs) {
        // Calcular monto acreditado (maneja conversión entre monedas)
        let creditedValue = amountValue
        if (selectedAccount.currency !== destinationAccount.currency) {
          if (selectedAccount.currency === "USD" && destinationAccount.currency === "NIO") {
            creditedValue = amountValue * EXCHANGE_RATE_USD_TO_NIO
          } else if (selectedAccount.currency === "NIO" && destinationAccount.currency === "USD") {
            creditedValue = amountValue / EXCHANGE_RATE_NIO_TO_USD
          }
        }
        const creditTx = {
          ...created,
          description: conceptType === "credit" && conceptValue ? conceptValue : created.description || "Transferencia",
          bank_description: "Banco LAFISE",
          transaction_type: "Credit" as const,
          origin: selectedAccount.account_number.toString(),
          destination: destinationAccount.account_number.toString(),
          amount: { currency: destinationAccount.currency, value: creditedValue },
          transaction_date: nowIso,
        }
        addLocalTransaction(destinationAccount.account_number, creditTx)
      }

      // Ajustar balances localmente (no dependemos de un backend mutable)
      if (destBelongs) {
        applyTransferBalances(
          selectedAccount.account_number,
          amountValue, // débito en origen
          destinationAccount.account_number,
          (selectedAccount.currency !== destinationAccount.currency)
            ? (selectedAccount.currency === "USD" ? amountValue * EXCHANGE_RATE_USD_TO_NIO : amountValue / EXCHANGE_RATE_NIO_TO_USD)
            : amountValue // mismo monto si misma moneda
        )
      } else {
        // Solo se debita la cuenta origen (destino externo no impacta balances locales)
        applyTransferBalances(selectedAccount.account_number, amountValue, destinationAccount.account_number, 0)
      }

      setSubmitSuccess(true)

      // Reiniciar formulario después de 3 segundos
      setTimeout(() => {
        setSubmitSuccess(false)
        setCurrentStep(1)
        setDestinationAccount(null)
        setDestinationAccountNumber("")
        setAmount("")
        setConceptValue("")
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

  // Obtener cuentas destino disponibles (excluye la cuenta origen seleccionada)
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

  // Los balances proyectados se calculan en línea donde se necesiten

  const getConversionInfo = () => {
    if (!amount || !selectedAccount) return null
    const destCurrency = destinationAccount ? destinationAccount.currency : (transactionType === 'Terceros' ? thirdPartyManualCurrency : null)
    if (!destCurrency) return null
    if (selectedAccount.currency === destCurrency) return null

    const amountValue = parseFloat(amount)
    if (isNaN(amountValue)) return null

    let convertedAmount = 0
    let rateText = ""

    if (selectedAccount.currency === "USD" && destCurrency === "NIO") {
      convertedAmount = amountValue * EXCHANGE_RATE_USD_TO_NIO
      rateText = `1 USD = ${EXCHANGE_RATE_USD_TO_NIO.toFixed(2)} NIO`
    } else if (selectedAccount.currency === "NIO" && destCurrency === "USD") {
      convertedAmount = amountValue / EXCHANGE_RATE_NIO_TO_USD
      // Se mantiene el mismo formato mostrando la tasa USD->NIO de referencia
      rateText = `1 USD = ${EXCHANGE_RATE_USD_TO_NIO.toFixed(2)} NIO})`
    }
    return { convertedAmount, rateText, targetCurrency: destCurrency }
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
                  <span>Monto debitado:</span>
                  <span className="font-semibold">{selectedAccount && getCurrencySymbol(selectedAccount.currency)} {parseFloat(amount).toLocaleString()}</span>
                </div>
                {getConversionInfo() && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Monto acreditado:</span>
                    <span className="font-semibold">
                      {getCurrencySymbol(getConversionInfo()?.targetCurrency || "")} {getConversionInfo()?.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Desde:</span>
                  <span className="font-semibold">{selectedAccount?.alias}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hacia:</span>
                  <span className="font-semibold">{destinationAccount?.alias || destinationAccountNumber}</span>
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
            {/* Paso a paso */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex flex-col items-center relative">
                {/* Línea conectora */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 ${step.id < currentStep ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                  />
                )}

                {/* Indicador de paso */}
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

                {/* Etiqueta de paso */}
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

        {/* Formulario */}
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
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex-nowrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-emerald-600 font-medium truncate max-w-[10rem]">{account.alias}</span>
                      <span className="text-gray-600 whitespace-nowrap">{account.account_number}</span>
                    </div>
                    <span className="text-gray-800 whitespace-nowrap ml-4 flex-shrink-0">
                      {getCurrencySymbol(account.currency)} {account.balance.toLocaleString()} {selectedAccount && account.account_number === selectedAccount.account_number && amount && parseFloat(amount) > 0 && parseFloat(amount) <= selectedAccount.balance && currentStep >= 3 && !submitSuccess && (
                        <span className="text-xs text-emerald-600 ml-2">→ {getCurrencySymbol(account.currency)} {(selectedAccount.balance - parseFloat(amount)).toLocaleString()}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cuenta destino */}
          <div className="relative mt-6 md:mt-8">
            <label className="block text-sm text-gray-800 mb-2">Cuenta destino</label>

            {transactionType === "Propias" ? (
              <>
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
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex-nowrap">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-emerald-600 font-medium truncate max-w-[10rem]">{account.alias}</span>
                            <span className="text-gray-600 whitespace-nowrap">{account.account_number}</span>
                          </div>
                          <span className="text-gray-800 whitespace-nowrap ml-4 flex-shrink-0">
                            {getCurrencySymbol(account.currency)} {account.balance.toLocaleString()} {destinationAccount && account.account_number === destinationAccount.account_number && amount && parseFloat(amount) > 0 && currentStep >= 3 && !submitSuccess && selectedAccount && (
                              (() => {
                                const v = parseFloat(amount)
                                if (isNaN(v)) return null
                                let credit = v
                                if (selectedAccount.currency !== destinationAccount.currency) {
                                  if (selectedAccount.currency === 'USD' && destinationAccount.currency === 'NIO') {
                                    credit = v * EXCHANGE_RATE_USD_TO_NIO
                                  } else if (selectedAccount.currency === 'NIO' && destinationAccount.currency === 'USD') {
                                    credit = v / EXCHANGE_RATE_NIO_TO_USD
                                  }
                                }
                                return <span className="text-xs text-emerald-600 ml-2">→ {getCurrencySymbol(account.currency)} { (destinationAccount.balance + credit).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) }</span>
                              })()
                            )}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={destinationAccountNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim()}
                  maxLength={19}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0,16)
                    setDestinationAccountNumber(digits)
                  }}
                  placeholder="Ingrese número de cuenta"
                  disabled={false}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-black disabled:bg-gray-50"
                />
                {verifyingAccount && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                  </div>
                )}
                {!verifyingAccount && autoVerifying && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  </div>
                )}
                {destinationAccount && transactionType === "Terceros" && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
                    <Check className="w-4 h-4" />
                    <span>Cuenta verificada: {destinationAccount.alias} ({destinationAccount.currency})</span>
                  </div>
                )}
                {thirdPartyError && !destinationAccount && destinationAccountNumber && destinationAccountNumber.length >= 10 && destinationAccountNumber.length <= 16 && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{thirdPartyError}</span>
                  </div>
                )}
                {!thirdPartyError && !destinationAccount && destinationAccountNumber && destinationAccountNumber.length >= 10 && destinationAccountNumber.length <= 16 && autoVerifying && (
                  <div className="mt-2 text-xs text-gray-500">Verificando...</div>
                )}
                {destinationAccountNumber && destinationAccountNumber.length > 0 && destinationAccountNumber.length < 10 && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Debe tener entre 10 y 16 dígitos</div>
                )}
                {destinationAccountNumber && destinationAccountNumber.length > 16 && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Debe tener entre 10 y 16 dígitos</div>
                )}
                {/* Moneda manual para terceros (si ya verificada, se bloquea la selección) */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Moneda de la cuenta destino</p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1 text-xs text-gray-700">
                      <input
                        type="radio"
                        name="thirdPartyCurrency"
                        value="NIO"
                        disabled={!!destinationAccount}
                        checked={thirdPartyManualCurrency === 'NIO'}
                        onChange={() => setThirdPartyManualCurrency('NIO')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      Córdobas
                    </label>
                    <label className="flex items-center gap-1 text-xs text-gray-700">
                      <input
                        type="radio"
                        name="thirdPartyCurrency"
                        value="USD"
                        disabled={!!destinationAccount}
                        checked={thirdPartyManualCurrency === 'USD'}
                        onChange={() => setThirdPartyManualCurrency('USD')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      Dólares
                    </label>
                    {destinationAccount && <span className="text-xs text-emerald-600">Fijada por verificación</span>}
                  </div>
                </div>
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
              disabled={false}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 text-black disabled:bg-gray-50 ${getBalanceWarning() ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'
                }`}
            />
            {getBalanceWarning() && (
              <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{getBalanceWarning()}</span>
              </div>
            )}

            {/* Información de conversión de moneda */}
            {getConversionInfo() && (
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-blue-700">Tasa de cambio:</span>
                  <span className="font-medium text-blue-900">{getConversionInfo()?.rateText}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-700">Recibirá estimado:</span>
                  <span className="font-bold text-blue-900">
                    {getCurrencySymbol(getConversionInfo()?.targetCurrency || "")} {getConversionInfo()?.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {selectedAccount && amount && !getBalanceWarning() && (
              <p className="mt-2 text-sm text-gray-600">
                Saldo disponible: {getCurrencySymbol(selectedAccount.currency)} {selectedAccount.balance.toLocaleString()}
              </p>
            )}
          </div>

          {/* Concepto (único) */}
          <div className="mt-6 md:mt-8">
            <div className="flex items-center gap-4 mb-2">
              <label className="text-sm text-gray-800">Tipo de concepto:</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="conceptType"
                    value="debit"
                    checked={conceptType === "debit"}
                    onChange={() => setConceptType("debit")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  Débito
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="conceptType"
                    value="credit"
                    checked={conceptType === "credit"}
                    onChange={() => setConceptType("credit")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  Crédito
                </label>
              </div>
            </div>
            <input
              type="text"
              value={conceptValue}
              onChange={(e) => setConceptValue(e.target.value)}
              placeholder={`Concepto de ${conceptType === 'debit' ? 'débito' : 'crédito'} (opcional)`}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 text-black"
            />
          </div>

          {/* Referencia (alineado con campo de concepto) */}
          <div className="mt-6 md:mt-8 pt-7">
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

        {/* Mensajes de error */}
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
                          {selectedAccount && (
                            <div className="flex justify-between">
                              <span>Saldo origen nuevo:</span>
                              <span className="font-semibold">{getCurrencySymbol(selectedAccount.currency)} {selectedAccount.balance.toLocaleString()}</span>
                            </div>
                          )}
                          {destinationAccount && accounts.some(a=>a.account_number===destinationAccount.account_number) && (
                            <div className="flex justify-between">
                              <span>Saldo destino nuevo:</span>
                              <span className="font-semibold">{getCurrencySymbol(destinationAccount.currency)} {destinationAccount.balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                            </div>
                          )}
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-center gap-8 mt-8 py-4">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              disabled={submitting}
              className="px-8 py-2.5 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              Atrás
            </button>
          )}
          {currentStep === 4 && (
            <button
              onClick={handleContinue}
              disabled={submitting || !!getBalanceWarning()}
              className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? "Procesando..." : "Transferir"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
