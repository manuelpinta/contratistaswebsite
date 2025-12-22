import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Clock, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

const recentProjects = [
  {
    id: "1",
    name: "Edificio Reforma 123",
    date: "2025-12-10",
    status: "validated",
  },
  {
    id: "2",
    name: "Casa Residencial Polanco",
    date: "2025-12-14",
    status: "reviewing",
  },
  {
    id: "3",
    name: "Oficinas Corporativas Santa Fe",
    date: "2025-12-15",
    status: "reviewing",
  },
]

const statusConfig = {
  reviewing: {
    label: "En revisión",
    icon: Clock,
    variant: "secondary" as const,
  },
  validated: {
    label: "Validado",
    icon: CheckCircle2,
    variant: "default" as const,
  },
  rejected: {
    label: "Rechazado",
    icon: XCircle,
    variant: "destructive" as const,
  },
}

export function ProjectsOverview() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Mis Proyectos</h2>
        <Link href="/contractor/projects">
          <Button variant="outline">Ver todos</Button>
        </Link>
      </div>

      {recentProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-600 text-center mb-4">Aún no tienes proyectos registrados</p>
            <Link href="/contractor/projects/new">
              <Button>Registrar Primer Proyecto</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recentProjects.map((project) => {
            const status = statusConfig[project.status as keyof typeof statusConfig]
            const StatusIcon = status.icon

            return (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>
                        Registrado el {new Date(project.date).toLocaleDateString("es-MX")}
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
                      Ver detalles
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
