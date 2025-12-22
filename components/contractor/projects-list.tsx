import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle, FolderOpen, Edit } from "lucide-react"
import Link from "next/link"

const projects = [
  {
    id: "1",
    name: "Edificio Reforma 123",
    location: "Ciudad de México",
    date: "2025-12-10",
    status: "validated",
    squareMeters: 500,
    liters: 150,
  },
  {
    id: "2",
    name: "Casa Residencial Polanco",
    location: "Polanco, CDMX",
    date: "2025-12-14",
    status: "reviewing",
    squareMeters: 200,
    liters: 80,
  },
  {
    id: "3",
    name: "Oficinas Corporativas Santa Fe",
    location: "Santa Fe, CDMX",
    date: "2025-12-15",
    status: "reviewing",
    squareMeters: 800,
    liters: 250,
  },
  {
    id: "4",
    name: "Departamento Roma Norte",
    location: "Roma Norte, CDMX",
    date: "2025-12-08",
    status: "rejected",
    squareMeters: 120,
    liters: 40,
  },
]

const statusConfig = {
  reviewing: {
    label: "En revisión",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-600",
  },
  validated: {
    label: "Validado",
    icon: CheckCircle2,
    variant: "default" as const,
    color: "text-green-600",
  },
  rejected: {
    label: "Rechazado",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-red-600",
  },
}

export function ProjectsList() {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-600 text-center mb-4">Aún no tienes proyectos registrados</p>
          <Link href="/contractor/projects/new">
            <Button>Registrar Primer Proyecto</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const status = statusConfig[project.status as keyof typeof statusConfig]
        const StatusIcon = status.icon

        return (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">{project.name}</CardTitle>
                  <CardDescription className="flex flex-col gap-1">
                    <span>{project.location}</span>
                    <span className="text-xs">Registrado el {new Date(project.date).toLocaleDateString("es-MX")}</span>
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
                  <span className="font-medium">M²:</span> {project.squareMeters}
                </div>
                <div>
                  <span className="font-medium">Litros:</span> {project.liters}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/contractor/projects/${project.id}`}>
                  <Button variant="outline">Ver detalles</Button>
                </Link>
                {project.status === "rejected" && (
                  <Link href={`/contractor/projects/${project.id}/edit`}>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
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
