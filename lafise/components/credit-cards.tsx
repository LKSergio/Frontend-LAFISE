"use client"

import Image from "next/image"

interface CreditCard {
  id: string
  color: "green" | "blue" | "gray"
  firstDigits: string
  lastDigits: string
  holderName: string
  expiryDate: string
}

const cards: CreditCard[] = [
  {
    id: "1",
    color: "green",
    firstDigits: "5325",
    lastDigits: "9033",
    holderName: "Mike Smith",
    expiryDate: "06/22",
  },
  {
    id: "2",
    color: "blue",
    firstDigits: "5789",
    lastDigits: "2847",
    holderName: "Mike Smith",
    expiryDate: "04/24",
  },
  {
    id: "3",
    color: "gray",
    firstDigits: "4809",
    lastDigits: "2234",
    holderName: "Mike Smith",
    expiryDate: "09/24",
  },
]

{/* Estilos de fondo para cada color de tarjeta */}
const colorClasses = {
  green: "bg-gradient-to-br from-emerald-950 to-emerald-800",
  blue: "bg-gradient-to-br from-blue-950 to-blue-950",
  gray: "bg-gradient-to-br from-gray-900 to-gray-900",
}

export function CreditCards() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4 text-gray-800">Mis tarjetas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`${colorClasses[card.color]} relative overflow-hidden rounded-xl p-5 text-white min-h-[180px] flex flex-col justify-between shadow-lg`}
          >
            {/* Logo LAFISE */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 px-0 py-0">
                <Image src="/Lafise_card.png" width={100} height={100} alt="Banco LAFISE Logo" priority />
              </div>
            </div>

            {/* Fondo decorativo */}
            <Image
              src="/Lafise_Card.png"
              alt="Banco LAFISE background"
              width={260}
              height={50}
              className="absolute right-50 top-17 object-contain opacity-[0.10] pointer-events-none select-none translate-x-60 -translate-y-20"
              aria-hidden="true"
              priority
            />

            <div className="flex items-center gap-7 text-lg font-mono tracking-widest px-20 py-12">
              <span>{card.firstDigits}</span>
              <span>****</span>
              <span>****</span>
              <span>{card.lastDigits}</span>
            </div>

            <div className="flex items-end">
              <div>
                <p className="text-sm font-medium">{card.holderName}</p>
              </div>
              <div className="text-center px-20 py-0">
                <p className="text-[10px] opacity-70">Expire date</p>
                <p className="text-sm font-medium">{card.expiryDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
