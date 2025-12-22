"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Gift, Users, Clock } from "lucide-react"

// Datos de la rifa del mes actual
const currentRaffle = {
  month: "Enero 2025",
  prize: {
    title: "Kit de Herramientas Profesionales",
    description: "Incluye pistola de pintura profesional, rodillos premium, brochas de alta calidad y accesorios",
    value: "$15,000 MXN",
    image: "/professional-painting-tools.jpg",
  },
  drawDate: "2025-01-31",
  totalParticipants: 127,
  totalTickets: 342,
}

export function RaffleInfo() {
  const daysUntilDraw = Math.ceil(
    (new Date(currentRaffle.drawDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

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
            <Badge className="bg-red-600 text-white font-semibold px-3 py-1">Rifa del Mes</Badge>
          </div>
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{currentRaffle.prize.title}</CardTitle>
              <CardDescription className="text-base">{currentRaffle.prize.description}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-1">Valor del premio</p>
              <p className="text-2xl font-bold text-green-600">{currentRaffle.prize.value}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-slate-600">
            <Gift className="h-5 w-5" />
            <span className="font-medium">Rifa de {currentRaffle.month}</span>
          </div>
        </CardContent>
      </Card>

      {/* Información del Sorteo */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sorteo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <Calendar className="h-5 w-5 text-slate-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-1">Fecha del sorteo</p>
              <p className="font-semibold">
                {new Date(currentRaffle.drawDate).toLocaleDateString("es-MX", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {daysUntilDraw > 0 && (
                <p className="text-sm text-blue-600 mt-1">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {daysUntilDraw} {daysUntilDraw === 1 ? "día" : "días"} restantes
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-slate-600">Participantes</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">{currentRaffle.totalParticipants}</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-green-600" />
                <p className="text-sm text-slate-600">Boletos totales</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{currentRaffle.totalTickets}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cómo Participar */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo participar?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside text-slate-700">
            <li>Registra tus proyectos de pintura completados</li>
            <li>Sube las fotografías del antes, durante y después</li>
            <li>Espera a que tu proyecto sea validado por nuestro equipo</li>
            <li>
              <strong>Cada proyecto validado = 1 boleto para la rifa</strong>
            </li>
            <li>Más proyectos validados = más oportunidades de ganar</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}


