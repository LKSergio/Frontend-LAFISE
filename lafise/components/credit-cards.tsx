"use client"

import Image from "next/image"
import { useUser } from "@/contexts/user-context"

interface CreditCard {
  id: string
  color: "green" | "blue" | "gray"
  firstDigits: string
  lastDigits: string
  expiryDate: string
}

const cards: CreditCard[] = [
  {
    id: "1",
    color: "green",
    firstDigits: "5325",
    lastDigits: "9033",
    expiryDate: "06/22",
  },
  {
    id: "2",
    color: "blue",
    firstDigits: "5789",
    lastDigits: "2847",
    expiryDate: "04/24",
  },
  {
    id: "3",
    color: "gray",
    firstDigits: "4809",
    lastDigits: "2234",
    expiryDate: "09/24",
  },
]

{/* Estilos de fondo para cada color de tarjeta */ }
const colorClasses = {
  green: "bg-gradient-to-br from-emerald-950 to-emerald-800",
  blue: "bg-gradient-to-br from-blue-950 to-blue-950",
  gray: "bg-gradient-to-br from-gray-900 to-gray-900",
}

export function CreditCards() {
  const { user } = useUser()

  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4 text-gray-800">Mis tarjetas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`${colorClasses[card.color]} relative overflow-hidden rounded-2xl p-6 text-white min-h-[240px] flex flex-col justify-between shadow-lg`}
          >
            {/* Logo LAFISE - Superior izquierda */}
            <div className="flex justify-start items-start">
              <Image src="/images/Cards/Logo.png" width={100} height={50} alt="Logo Banco LAFISE" priority className="object-contain" />
            </div>

            {/* Imagen de fondo - Lado derecho */}
            <Image
              src="/images/Cards/Background.png"
              alt="Fondo de tarjeta"
              width={300}
              height={300}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-10 pointer-events-none select-none"
              aria-hidden="true"
              priority
            />

            {/* Número de tarjeta - Centro */}
            <div className="flex items-center justify-center gap-4 text-xl font-mono tracking-wider my-4">
              <span>{card.firstDigits}</span>
              <span>****</span>
              <span>****</span>
              <span>{card.lastDigits}</span>
            </div>

            {/* Información del titular - Inferior */}
            <div className="flex items-end">
              <div>
                <p className="text-sm font-medium">{user?.full_name || "Cargando..."}</p>
              </div>
              <div className="text-right px-10">
                <p className="text-xs opacity-70 mb-1 text-center">Fecha de expiración</p>
                <p className="text-sm font-medium text-center">{card.expiryDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
