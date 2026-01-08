"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProjectReviewForm } from "@/components/admin/project-review-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getProjectById } from "@/lib/supabase/projects"
import { getProjectImages, getSignedUrl } from "@/lib/supabase/project-images"
import { useTranslation } from "@/hooks/use-translation"

export default function ProjectReviewPage() {
  const t = useTranslation()
  const router = useRouter()
  const params = useParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    // Verificar autenticación
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth !== "true") {
      router.push("/admin/login")
      return
    }

    setIsAuthenticated(true)
  }, [router])

  useEffect(() => {
    async function loadProject() {
      if (!isAuthenticated || !params.id) return

      try {
        setLoading(true)
        const projectId = params.id as string
        const projectData = await getProjectById(projectId)
        
        // Cargar imágenes del proyecto con URLs firmadas (necesario para buckets privados)
        let imageUrls: string[] = []
        try {
          const projectImages = await getProjectImages(projectId)
          
          if (projectImages && projectImages.length > 0) {
            // Generar URLs firmadas para asegurar acceso (funciona con buckets públicos y privados)
            imageUrls = await Promise.all(
              projectImages.map(async (img) => {
                const publicUrl = img.image_url
                const urlMatch = publicUrl.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/)
                
                if (urlMatch) {
                  const [, bucket, encodedPath] = urlMatch
                  // Decodificar el path (maneja %20, %2F, etc.)
                  let decodedPath: string
                  try {
                    // Decodificar múltiples veces si es necesario
                    decodedPath = decodeURIComponent(encodedPath)
                    // Intentar una segunda vez por si hay doble codificación
                    if (decodedPath.includes('%')) {
                      decodedPath = decodeURIComponent(decodedPath)
                    }
                  } catch (e) {
                    decodedPath = encodedPath
                  }
                  
                  try {
                    const signedUrl = await getSignedUrl(bucket, decodedPath, 3600)
                    return signedUrl
                  } catch (signedError) {
                    // Si falla con path decodificado, intentar con el original
                    try {
                      const signedUrl = await getSignedUrl(bucket, encodedPath, 3600)
                      return signedUrl
                    } catch (e2) {
                      // Si todo falla, usar URL pública como fallback
                      return publicUrl
                    }
                  }
                }
                return publicUrl
              })
            )
          }
          setImages(imageUrls)
        } catch (imgError) {
          console.error("Error loading images:", imgError)
        }

        // Transformar datos de Supabase al formato esperado
        const contractor = (projectData as any).contractor || (projectData as any).contractors || null
        const transformedProject = {
          id: projectData.id,
          name: projectData.name,
          contractor: contractor ? {
            name: contractor.name || "N/A",
            phone: contractor.phone || "",
            email: contractor.email || "",
          } : { name: "N/A", phone: "", email: "" },
          location: projectData.location,
          registeredDate: projectData.created_at,
          status: projectData.status,
          area: projectData.square_meters,
          liters: projectData.liters,
          paintType: projectData.paint_type || "",
          photos: imageUrls, // Usar las URLs firmadas
          notes: projectData.description || "",
          validatorComments: projectData.validation_notes || "",
        }

        setProject(transformedProject)
      } catch (error: any) {
        console.error("Error loading project:", error)
        router.push("/admin/dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      loadProject()
    }
  }, [isAuthenticated, params.id, router])

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <p className="text-slate-600">{t.admin.review.loadingProject}</p>
        </main>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <p className="text-red-600">{t.admin.review.projectNotFound}</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => router.push("/admin/dashboard")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.admin.dashboard.backToTray}
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
          <p className="text-slate-600">{t.admin.dashboard.reviewAndValidation}</p>
        </div>

        <ProjectReviewForm project={project} />
      </main>
    </div>
  )
}
