"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle, FolderOpen, Edit } from "lucide-react"
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
      color: "text-yellow-600",
    },
    reviewing: {
      label: t.reviewing,
      icon: Clock,
      variant: "secondary" as const,
      color: "text-yellow-600",
    },
    validated: {
      label: t.validated,
      icon: CheckCircle2,
      variant: "default" as const,
      color: "text-green-600",
    },
    rejected: {
      label: t.rejected,
      icon: XCircle,
      variant: "destructive" as const,
      color: "text-red-600",
    },
  }
}

export function ProjectsList() {
  const t = useTranslation()
  // Usar el país del contratista si está logueado, si no, null (español por defecto)
  const contractorCountry = useContractorCountry()
  const language = getLanguageByCountry(contractorCountry)
  const locale = language === 'en' ? 'en-US' : 'es-MX'
  const statusConfig = getStatusConfig(language)
  
  // Obtener contractorId de localStorage o session (ajustar según tu sistema de auth)
  const [contractorId, setContractorId] = useState<string | null>(null)

  useEffect(() => {
    // Obtener el ID del contratista desde localStorage o tu sistema de autenticación
    const storedId = localStorage.getItem("contractorId")
    setContractorId(storedId)
  }, [])

  const { projects, loading, error } = useContractorProjects(contractorId)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-600">{t.projects.loading}</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-red-600">{t.projects.errorLoading}: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-600 text-center mb-4">{t.projects.noProjects}</p>
          <Link href="/contractor/projects/nuevo">
            <Button>{t.projects.registerFirst}</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending
        const StatusIcon = status.icon

        return (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">{project.name}</CardTitle>
                  <CardDescription className="flex flex-col gap-1">
                    <span>{project.location}</span>
                    <span className="text-xs">{t.projects.registeredOn(new Date(project.created_at).toLocaleDateString(locale))}</span>
                  </CardDescription>
                </div>
                <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600">
                <div>
                  <span className="font-medium">{t.projects.squareMeters}:</span> {project.square_meters}
                </div>
                <div>
                  <span className="font-medium">{t.projects.liters}:</span> {project.liters}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/contractor/projects/${project.id}`}>
                  <Button variant="outline">{t.projects.viewDetails}</Button>
                </Link>
                {project.status === "rejected" && (
                  <Link href={`/contractor/projects/${project.id}/edit`}>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      <Edit className="h-4 w-4 mr-2" />
                      {t.projects.edit}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
