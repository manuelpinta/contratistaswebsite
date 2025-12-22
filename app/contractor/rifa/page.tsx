"use client"

import { ContractorHeader } from "@/components/contractor/contractor-header"
import { RaffleInfo } from "@/components/contractor/raffle-info"
import { RaffleParticipations } from "@/components/contractor/raffle-participations"

export default function RafflePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ContractorHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Rifa del Mes</h1>
          <p className="text-slate-600">Participa con tus proyectos validados y gana premios increíbles</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RaffleInfo />
          </div>
          <div>
            <RaffleParticipations />
          </div>
        </div>
      </main>
    </div>
  )
}


