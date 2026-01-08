"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Gift, Users, Clock } from "lucide-react"
import { getAllProjects } from "@/lib/supabase/projects"
import { useContractorCountry } from "@/hooks/use-contractor-country"
import { getRaffleByCountry } from "@/lib/raffles"
import { getRaffleTranslation, type Language } from "@/lib/translations"
import { useTranslation } from "@/hooks/use-translation"

export function RaffleInfo() {
  // Usar el país de la cuenta del contratista, no el selector de idioma
  const contractorCountry = useContractorCountry()
  const currentRaffle = getRaffleByCountry(contractorCountry)
  // Usar el idioma seleccionado para las traducciones
  const language: Language = typeof window !== 'undefined' 
    ? (localStorage.getItem("selectedLanguage") as Language) || 'es'
    : 'es'
  const raffleT = getRaffleTranslation(language)
  
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [totalTickets, setTotalTickets] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRaffleStats() {
      try {
        // Obtener proyectos filtrados por país del usuario (de su cuenta)
        const allProjects = await getAllProjects(contractorCountry || null, null)
        // Contar contratistas únicos con proyectos validados del mismo país
        const validatedProjects = allProjects.filter((p: any) => 
          p.status === "validated" && 
          (!contractorCountry || p.contractor?.country_code === contractorCountry)
        )
        const uniqueContractors = new Set(validatedProjects.map((p: any) => p.contractor_id))
        
        setTotalParticipants(uniqueContractors.size)
        setTotalTickets(validatedProjects.length)
      } catch (error) {
        console.error("Error loading raffle stats:", error)
      } finally {
        setLoading(false)
      }
    }
    loadRaffleStats()
  }, [contractorCountry])

  const daysUntilDraw = Math.ceil(
    (new Date(currentRaffle.drawDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  
  const locale = language === 'en' ? 'en-US' : 'es-MX'

  return (
    <div className="space-y-6">
      {/* Premio Principal */}
      <Card className="overflow-hidden">
        <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
          <img
            src={currentRaffle.prize.image || "/placeholder.svg"}
            alt={currentRaffle.prize.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <Badge className="bg-red-600 text-white font-semibold px-3 py-1">{raffleT.raffleBadge}</Badge>
          </div>
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{currentRaffle.prize.title}</CardTitle>
              <CardDescription className="text-base">{currentRaffle.prize.description}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-1">{raffleT.prizeValue}</p>
              <p className="text-2xl font-bold text-green-600">{currentRaffle.prize.value}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-slate-600">
            <Gift className="h-5 w-5" />
            <span className="font-medium">{raffleT.raffleOfMonth} {currentRaffle.month}</span>
          </div>
        </CardContent>
      </Card>

      {/* Información del Sorteo */}
      <Card>
        <CardHeader>
          <CardTitle>{raffleT.drawInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <Calendar className="h-5 w-5 text-slate-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-1">{raffleT.drawDate}</p>
              <p className="font-semibold">
                {new Date(currentRaffle.drawDate).toLocaleDateString(locale, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {daysUntilDraw > 0 && (
                <p className="text-sm text-blue-600 mt-1">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {raffleT.daysRemaining(daysUntilDraw)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-slate-600">{raffleT.participants}</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? "..." : totalParticipants}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-green-600" />
                <p className="text-sm text-slate-600">{raffleT.totalTickets}</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {loading ? "..." : totalTickets}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cómo Participar */}
      <Card>
        <CardHeader>
          <CardTitle>{raffleT.howToParticipate}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside text-slate-700">
            <li>{raffleT.step1}</li>
            <li>{raffleT.step2}</li>
            <li>{raffleT.step3}</li>
            <li>
              <strong>{raffleT.step4}</strong>
            </li>
            <li>{raffleT.step5}</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}


