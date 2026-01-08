"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Clock, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { useContractorProjects } from "@/hooks/use-projects"
import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { getLanguageByCountry } from "@/lib/translations"
import { useContractorCountry } from "@/hooks/use-contractor-country"

// Función para obtener configuración de estado según idioma
function getStatusConfig(language: 'es' | 'en') {
  const t = language === 'en'
    ? {
        pending: "Pending",
        reviewing: "Under review",
        validated: "Validated",
        rejected: "Rejected",
      }
    : {
        pending: "Pendiente",
        reviewing: "En revisión",
        validated: "Validado",
        rejected: "Rechazado",
      }
  
  return {
    pending: {
      label: t.pending,
      icon: Clock,
      variant: "secondary" as const,
    },
    reviewing: {
      label: t.reviewing,
      icon: Clock,
      variant: "secondary" as const,
    },
    validated: {
      label: t.validated,
      icon: CheckCircle2,
      variant: "default" as const,
    },
    rejected: {
      label: t.rejected,
      icon: XCircle,
      variant: "destructive" as const,
    },
  }
}

export function ProjectsOverview() {
  const t = useTranslation()
  // Usar el país del contratista si está logueado, si no, null (español por defecto)
  const contractorCountry = useContractorCountry()
  const language = getLanguageByCountry(contractorCountry)
  const locale = language === 'en' ? 'en-US' : 'es-MX'
  const statusConfig = getStatusConfig(language)
  
  const [contractorId, setContractorId] = useState<string | null>(null)
  const { projects, loading } = useContractorProjects(contractorId)

  useEffect(() => {
    const storedId = localStorage.getItem("contractorId")
    setContractorId(storedId)
  }, [])

  // Mostrar solo los 3 proyectos más recientes
  const recentProjects = projects.slice(0, 3)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-900">{t.projects.myProjects}</h2>
        <Link href="/contractor/projects">
          <Button variant="outline">{t.projects.seeAll}</Button>
        </Link>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-slate-600">{t.projects.loading}</p>
          </CardContent>
        </Card>
      ) : recentProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-600 text-center mb-4">{t.projects.noProjects}</p>
            <Link href="/contractor/projects/nuevo">
              <Button>{t.projects.registerFirst}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recentProjects.map((project) => {
            const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending
            const StatusIcon = status.icon

            return (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>
                        {t.projects.registeredOn(new Date(project.created_at).toLocaleDateString(locale))}
                      </CardDescription>
                    </div>
                    <Badge variant={status.variant} className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/contractor/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      {t.projects.viewDetails}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
