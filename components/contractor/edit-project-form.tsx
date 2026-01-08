"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"
import { NewProjectForm } from "./new-project-form"
import { useProject } from "@/hooks/use-projects"
import { useUpdateProject } from "@/hooks/use-projects"
import { getProjectImages, deleteProjectImage } from "@/lib/supabase/project-images"

interface EditProjectFormProps {
  projectId: string
}

interface ExistingImage {
  id: string
  url: string
  order: number
}

export function EditProjectForm({ projectId }: EditProjectFormProps) {
  const { project, loading, error } = useProject(projectId)
  const { update } = useUpdateProject()
  const router = useRouter()
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [loadingImages, setLoadingImages] = useState(true)

  useEffect(() => {
    if (error) {
      toast.error("Proyecto no encontrado")
      router.push("/contractor/projects")
    }
  }, [error, router])

  // Cargar imágenes existentes del proyecto
  useEffect(() => {
    async function loadImages() {
      if (!projectId) return

      try {
        setLoadingImages(true)
        const images = await getProjectImages(projectId)

        // Usar URLs públicas directamente (más rápido)
        // El componente ImageWithFallback manejará el fallback a URLs firmadas si es necesario
        const imagesWithUrls = images.map((img) => ({
          id: img.id,
          url: img.image_url,
          order: img.image_order || 0,
        }))

        setExistingImages(imagesWithUrls.sort((a, b) => a.order - b.order))
      } catch (err: any) {
        console.error("Error loading images:", err)
        toast.error("Error al cargar las imágenes del proyecto")
      } finally {
        setLoadingImages(false)
      }
    }

    if (projectId) {
      loadImages()
    }
  }, [projectId])

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteProjectImage(imageId)
      // Remover de la lista local
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (error: any) {
      throw error // Re-lanzar para que NewProjectForm maneje el toast
    }
  }

  if (loading || loadingImages) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">Cargando proyecto...</p>
        </CardContent>
      </Card>
    )
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">Proyecto no encontrado</p>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async (data: any) => {
    try {
      await update(projectId, {
        name: data.name,
        location: data.location,
        square_meters: parseInt(data.squareMeters),
        liters: parseInt(data.liters),
        paint_type: data.paintType || null,
        description: data.description || null,
        status: "pending", // Resetear a pendiente cuando se edita
      })
      toast.success("Proyecto actualizado exitosamente. Será revisado nuevamente.")
      router.push(`/contractor/projects/${projectId}`)
    } catch (error: any) {
      console.error("Error updating project:", error)
      toast.error(error.message || "Error al actualizar el proyecto")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Editando proyecto rechazado</p>
              <p className="text-sm text-muted-foreground">
                Corrige la información según las observaciones recibidas y reenvía el proyecto para una nueva revisión.
                Puedes eliminar imágenes existentes y agregar nuevas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reutilizar el formulario de nuevo proyecto pero con datos precargados */}
      <NewProjectForm 
        initialData={{
          name: project.name,
          location: project.location,
          squareMeters: project.square_meters.toString(),
          liters: project.liters.toString(),
          paintType: project.paint_type || "",
          description: project.description || "",
        }}
        onSubmit={handleSubmit}
        submitLabel="Actualizar y reenviar proyecto"
        isEditMode={true}
        projectId={projectId}
        existingImages={existingImages}
        onImageDelete={handleDeleteImage}
      />
    </div>
  )
}
