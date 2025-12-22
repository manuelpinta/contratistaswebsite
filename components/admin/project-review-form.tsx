"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Ruler,
  Droplet,
  CheckCircle2,
  XCircle,
  Paintbrush,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

interface ProjectReviewFormProps {
  project: any
}

export function ProjectReviewForm({ project }: ProjectReviewFormProps) {
  const router = useRouter()
  const [physicalValidation, setPhysicalValidation] = useState(false)
  const [comments, setComments] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<"validate" | "reject" | null>(null)

  const updateProjectStatus = (status: "validated" | "rejected") => {
    // Obtener proyectos desde localStorage
    const savedProjects = localStorage.getItem("adminProjects")
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects)
        const updatedProjects = projects.map((p: any) => {
          if (p.id === project.id) {
            return {
              ...p,
              status,
              validatorComments: comments.trim() || undefined,
            }
          }
          return p
        })
        localStorage.setItem("adminProjects", JSON.stringify(updatedProjects))
        // Disparar evento personalizado para notificar al dashboard
        window.dispatchEvent(new CustomEvent("projectsUpdated"))
      } catch (e) {
        console.error("Error al actualizar proyecto:", e)
      }
    }
  }

  const handleValidate = () => {
    updateProjectStatus("validated")
    toast.success("Proyecto validado correctamente")
    setTimeout(() => {
      router.push("/admin/dashboard")
    }, 1000)
  }

  const handleReject = () => {
    if (!comments.trim()) {
      toast.error("Debes agregar comentarios al rechazar un proyecto")
      return
    }
    updateProjectStatus("rejected")
    toast.error("Proyecto rechazado")
    setTimeout(() => {
      router.push("/admin/dashboard")
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Datos del Proyecto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Datos del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-slate-600">Nombre del Proyecto</Label>
                <p className="text-lg font-semibold">{project.name}</p>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <Label className="text-slate-600">Ubicación</Label>
                  <p className="font-medium">{project.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <Label className="text-slate-600">Fecha de Registro</Label>
                  <p className="font-medium">
                    {new Date(project.registeredDate).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Ruler className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <Label className="text-slate-600">Superficie</Label>
                  <p className="text-lg font-semibold">{project.area} m²</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Droplet className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <Label className="text-slate-600">Litros Estimados</Label>
                  <p className="text-lg font-semibold">{project.liters} lts</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Paintbrush className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <Label className="text-slate-600">Tipo de Pintura</Label>
                  <p className="font-medium">{project.paintType || "No especificado"}</p>
                </div>
              </div>
            </div>
          </div>

          {project.notes && (
            <div className="pt-4 border-t">
              <Label className="text-slate-600">Notas del Contratista</Label>
              <p className="mt-1 text-slate-700 bg-slate-50 p-3 rounded-md">{project.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Datos del Contratista */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Datos del Contratista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <Label className="text-slate-600">Nombre</Label>
                <p className="font-medium">{project.contractor.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-slate-400" />
              <div>
                <Label className="text-slate-600">Teléfono</Label>
                <p className="font-medium">{project.contractor.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <Label className="text-slate-600">Correo</Label>
                <p className="font-medium">{project.contractor.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidencia Fotográfica */}
      <Card>
        <CardHeader>
          <CardTitle>Evidencia Fotográfica</CardTitle>
          <CardDescription>Haz clic en una imagen para verla en tamaño completo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.photos.map((photo: string, index: number) => (
              <div
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-colors cursor-pointer group"
                onClick={() => setSelectedImage(photo)}
              >
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">Ver imagen</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sección de Validación */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle>Validación del Proyecto</CardTitle>
          <CardDescription>Completa la revisión antes de validar o rechazar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="physical-validation"
              checked={physicalValidation}
              onCheckedChange={(checked) => setPhysicalValidation(checked as boolean)}
            />
            <Label htmlFor="physical-validation" className="text-base font-medium cursor-pointer">
              Validación física realizada
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comentarios del Validador</Label>
            <Textarea
              id="comments"
              placeholder="Escribe tus observaciones sobre el proyecto..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-slate-500">
              Los comentarios son opcionales para validar, pero obligatorios para rechazar.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!physicalValidation}
              onClick={() => setConfirmDialog("validate")}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Validar Proyecto
            </Button>

            <Button size="lg" variant="destructive" className="flex-1" onClick={() => setConfirmDialog("reject")}>
              <XCircle className="h-5 w-5 mr-2" />
              Rechazar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmación */}
      <Dialog open={confirmDialog !== null} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog === "validate" ? "¿Validar proyecto?" : "¿Rechazar proyecto?"}</DialogTitle>
            <DialogDescription>
              {confirmDialog === "validate"
                ? "El contratista será notificado de la validación y el proyecto aparecerá como validado."
                : "El contratista será notificado del rechazo. Esta acción no se puede deshacer."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Cancelar
            </Button>
            <Button
              className={confirmDialog === "validate" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={confirmDialog === "reject" ? "destructive" : "default"}
              onClick={confirmDialog === "validate" ? handleValidate : handleReject}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de imagen ampliada */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vista de Imagen</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img src={selectedImage || "/placeholder.svg"} alt="Imagen ampliada" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
