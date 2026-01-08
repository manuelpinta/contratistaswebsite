"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useContractorProjects } from "@/hooks/use-projects"
import { getRaffleTranslation, type Language } from "@/lib/translations"

export function RaffleParticipations() {
  // Usar el idioma seleccionado (no el país)
  const language: Language = typeof window !== 'undefined' 
    ? (localStorage.getItem("selectedLanguage") as Language) || 'es'
    : 'es'
  const t = getRaffleTranslation(language)
  const locale = language === 'en' ? 'en-US' : 'es-MX'
  
  const [contractorId, setContractorId] = useState<string | null>(null)
  const { projects, loading } = useContractorProjects(contractorId)

  useEffect(() => {
    const storedId = localStorage.getItem("contractorId")
    setContractorId(storedId)
  }, [])

  // Filtrar solo proyectos validados
  const userValidatedProjects = projects.filter((p) => p.status === "validated")
  const totalParticipations = userValidatedProjects.length
  const pendingProjects = projects.filter((p) => p.status === "reviewing" || p.status === "pending")

  return (
    <div className="space-y-6">
      {/* Resumen de Participaciones */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-blue-600" />
            {t.yourParticipations}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-blue-600 mb-2">{totalParticipations}</p>
            <p className="text-slate-600 mb-4">
              {totalParticipations === 1 ? t.activeTicket : t.activeTickets}
            </p>
            <Badge variant="default" className="bg-blue-600 text-white">
              {totalParticipations === 1 
                ? `1 ${t.participation}` 
                : `${totalParticipations} ${t.participations}`}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Proyectos que dan Participaciones */}
      <Card>
        <CardHeader>
          <CardTitle>{t.validatedProjects}</CardTitle>
          <CardDescription>{t.validatedProjectsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600">{t.loadingProjects}</p>
            </div>
          ) : userValidatedProjects.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">{t.noValidatedProjects}</p>
              <Link href="/contractor/projects/nuevo">
                <Button>{t.registerProject}</Button>
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
                      {project.validation_date 
                        ? t.validatedOn(new Date(project.validation_date).toLocaleDateString(locale))
                        : t.validated}
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white">{t.ticket}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proyectos Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle>{t.pendingProjects}</CardTitle>
          <CardDescription>
            {pendingProjects.length > 0
              ? t.projectsInReview(pendingProjects.length)
              : t.registerMoreProjects}
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
                    <p className="text-xs text-slate-600">{t.inReview} - {t.comingSoonTicket}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 mb-4">
              {t.reviewInfo}
            </p>
          )}
          <Link href="/contractor/projects/nuevo">
            <Button className="w-full">{t.registerNewProject}</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card className="bg-slate-50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-semibold text-slate-900 mb-2">{t.tipsTitle}</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t.tip1}</li>
              <li>{t.tip2}</li>
              <li>{t.tip3}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

