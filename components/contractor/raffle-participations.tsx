"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Datos mock de proyectos del usuario (en producción vendría de una API)
const mockUserProjects = [
  {
    id: "1",
    name: "Edificio Reforma 123",
    validatedDate: "2025-01-12",
    status: "validated",
  },
  {
    id: "2",
    name: "Casa Residencial Polanco",
    status: "reviewing",
  },
  {
    id: "3",
    name: "Oficinas Corporativas Santa Fe",
    status: "reviewing",
  },
]

export function RaffleParticipations() {
  const [userProjects, setUserProjects] = useState(mockUserProjects)

  useEffect(() => {
    // Intentar cargar proyectos desde localStorage (si existen)
    const savedProjects = localStorage.getItem("contractorProjects")
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects)
        setUserProjects(projects)
      } catch (e) {
        console.error("Error al cargar proyectos:", e)
      }
    }
  }, [])

  // Filtrar solo proyectos validados
  const userValidatedProjects = userProjects.filter((p) => p.status === "validated")
  const totalParticipations = userValidatedProjects.length
  const pendingProjects = userProjects.filter((p) => p.status === "reviewing" || p.status === "pending")

  return (
    <div className="space-y-6">
      {/* Resumen de Participaciones */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-blue-600" />
            Tus Participaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-blue-600 mb-2">{totalParticipations}</p>
            <p className="text-slate-600 mb-4">
              {totalParticipations === 1 ? "Boleto activo" : "Boletos activos"}
            </p>
            <Badge variant="default" className="bg-blue-600 text-white">
              {totalParticipations === 1 ? "1 participación" : `${totalParticipations} participaciones`}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Proyectos que dan Participaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos Validados</CardTitle>
          <CardDescription>Estos proyectos te dan participaciones en la rifa</CardDescription>
        </CardHeader>
        <CardContent>
          {userValidatedProjects.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Aún no tienes proyectos validados</p>
              <Link href="/contractor/projects/nuevo">
                <Button>Registrar Proyecto</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userValidatedProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-start justify-between gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <p className="font-medium text-sm">{project.name}</p>
                    </div>
                    <p className="text-xs text-slate-600">
                      Validado el {new Date(project.validatedDate).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white">1 boleto</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proyectos Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos Pendientes</CardTitle>
          <CardDescription>
            {pendingProjects.length > 0
              ? `${pendingProjects.length} proyecto${pendingProjects.length > 1 ? "s" : ""} en revisión`
              : "Registra más proyectos para aumentar tus participaciones"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingProjects.length > 0 ? (
            <div className="space-y-3 mb-4">
              {pendingProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-xs text-slate-600">En revisión - Próximamente 1 boleto</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 mb-4">
              Los proyectos en revisión aún no generan participaciones. Una vez validados, automáticamente recibirás un
              boleto para la rifa.
            </p>
          )}
          <Link href="/contractor/projects/nuevo">
            <Button className="w-full">Registrar Nuevo Proyecto</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card className="bg-slate-50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-semibold text-slate-900 mb-2">💡 Consejos para ganar:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Registra todos tus proyectos completados</li>
              <li>Asegúrate de subir fotos claras del proceso</li>
              <li>Más proyectos = más oportunidades</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

