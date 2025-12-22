import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, XCircle, MapPin, Ruler, Droplet, Calendar, ImageIcon, Edit } from "lucide-react"
import Link from "next/link"

// Mock data - en producción vendría de una API o base de datos
const projectData = {
  "1": {
    id: "1",
    name: "Edificio Reforma 123",
    location: "Ciudad de México, Reforma",
    date: "2025-12-10",
    status: "validated",
    squareMeters: 500,
    liters: 150,
    description:
      "Proyecto de pintura exterior e interior para edificio corporativo de 5 pisos. Incluye áreas comunes y oficinas.",
    images: ["/paint-products-store.jpg", "/paint-products-store.jpg"],
    validationDate: "2025-12-12",
    validationNotes: "Proyecto aprobado. Cumple con todos los requisitos.",
  },
  "2": {
    id: "2",
    name: "Casa Residencial Polanco",
    location: "Polanco, CDMX",
    date: "2025-12-14",
    status: "reviewing",
    squareMeters: 200,
    liters: 80,
    description:
      "Pintura completa de casa residencial de dos pisos. Incluye fachada exterior y áreas interiores principales.",
    images: ["/house-before-painting.jpg", "/house-during-painting.jpg", "/house-after-painting.jpg"],
  },
  "3": {
    id: "3",
    name: "Oficinas Corporativas Santa Fe",
    location: "Santa Fe, CDMX",
    date: "2025-12-15",
    status: "reviewing",
    squareMeters: 800,
    liters: 250,
    description:
      "Proyecto de pintura para oficinas corporativas en edificio de 10 pisos. Incluye áreas de trabajo, salas de juntas y recepción.",
    images: ["/commercial-facade-before.jpg", "/commercial-facade-during.jpg", "/commercial-facade-after.jpg"],
  },
  "4": {
    id: "4",
    name: "Departamento Roma Norte",
    location: "Roma Norte, CDMX",
    date: "2025-12-08",
    status: "rejected",
    squareMeters: 120,
    liters: 40,
    description:
      "Pintura de departamento completo. Incluye sala, comedor, cocina y dos recámaras.",
    images: ["/home-interior-before.jpg", "/home-interior-after.jpg"],
    validationNotes: "Faltan fotografías del proceso de pintura. Se requiere evidencia del antes, durante y después.",
  },
}

const statusConfig = {
  reviewing: {
    label: "En revisión",
    icon: Clock,
    variant: "secondary" as const,
    color: "bg-yellow-50 text-yellow-800 border-yellow-200",
    message: "Tu proyecto está siendo revisado por nuestro equipo. Te notificaremos cuando esté validado.",
  },
  validated: {
    label: "Validado",
    icon: CheckCircle2,
    variant: "default" as const,
    color: "bg-green-50 text-green-800 border-green-200",
    message: "¡Felicidades! Tu proyecto ha sido validado exitosamente.",
  },
  rejected: {
    label: "Rechazado",
    icon: XCircle,
    variant: "destructive" as const,
    color: "bg-red-50 text-red-800 border-red-200",
    message: "Tu proyecto no pudo ser validado. Por favor revisa las observaciones.",
  },
}

export function ProjectDetail({ projectId }: { projectId: string }) {
  const project = projectData[projectId as keyof typeof projectData]

  if (!project) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">Proyecto no encontrado</p>
        </CardContent>
      </Card>
    )
  }

  const status = statusConfig[project.status as keyof typeof statusConfig]
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className={`border-2 ${status.color}`}>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <StatusIcon className="h-6 w-6 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Estado: {status.label}</h3>
              <p className="text-sm">{status.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">{project.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {project.location}
              </CardDescription>
            </div>
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Details Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Calendar className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">Fecha de registro</p>
                <p className="font-semibold">{new Date(project.date).toLocaleDateString("es-MX")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Ruler className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">Metros cuadrados</p>
                <p className="font-semibold">{project.squareMeters} m²</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Droplet className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">Litros estimados</p>
                <p className="font-semibold">{project.liters} L</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-slate-600">{project.description}</p>
            </div>
          )}

          {/* Validation Info */}
          {project.status === "validated" && project.validationDate && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Información de validación</h3>
              <p className="text-sm text-slate-600 mb-1">
                <strong>Fecha de validación:</strong> {new Date(project.validationDate).toLocaleDateString("es-MX")}
              </p>
              {project.validationNotes && (
                <p className="text-sm text-slate-600">
                  <strong>Notas:</strong> {project.validationNotes}
                </p>
              )}
            </div>
          )}

          {/* Rejection Info */}
          {project.status === "rejected" && project.validationNotes && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Observaciones del rechazo</h3>
                <p className="text-sm text-slate-600">
                  {project.validationNotes}
                </p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Edit className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-1">¿Necesitas corregir tu proyecto?</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Puedes editar la información y volver a enviarlo para revisión.
                    </p>
                    <Link href={`/contractor/projects/${projectId}/edit`}>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar y reenviar proyecto
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images */}
          {project.images && project.images.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Evidencia fotográfica ({project.images.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.images.map((image, index) => (
                  <div key={index} className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Evidencia ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
