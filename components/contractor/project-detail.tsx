"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, XCircle, MapPin, Ruler, Droplet, Calendar, ImageIcon, Edit } from "lucide-react"
import Link from "next/link"
import { useProject } from "@/hooks/use-projects"
import { getProjectImages, getSignedUrl } from "@/lib/supabase/project-images"
import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { getLanguageByCountry } from "@/lib/translations"
import { useContractorCountry } from "@/hooks/use-contractor-country"

// Función para obtener configuración de estado según idioma
function getStatusConfig(language: 'es' | 'en') {
  const t = language === 'en'
    ? {
        pending: { label: "Pending", message: "Your project is pending review. We will notify you when it is reviewed." },
        reviewing: { label: "Under review", message: "Your project is being reviewed by our team. We will notify you when it is validated." },
        validated: { label: "Validated", message: "Congratulations! Your project has been successfully validated." },
        rejected: { label: "Rejected", message: "Your project could not be validated. Please review the observations." },
      }
    : {
        pending: { label: "Pendiente", message: "Tu proyecto está pendiente de revisión. Te notificaremos cuando sea revisado." },
        reviewing: { label: "En revisión", message: "Tu proyecto está siendo revisado por nuestro equipo. Te notificaremos cuando esté validado." },
        validated: { label: "Validado", message: "¡Felicidades! Tu proyecto ha sido validado exitosamente." },
        rejected: { label: "Rechazado", message: "Tu proyecto no pudo ser validado. Por favor revisa las observaciones." },
      }
  
  return {
    pending: {
      label: t.pending.label,
      icon: Clock,
      variant: "secondary" as const,
      color: "bg-yellow-50 text-yellow-800 border-yellow-200",
      message: t.pending.message,
    },
    reviewing: {
      label: t.reviewing.label,
      icon: Clock,
      variant: "secondary" as const,
      color: "bg-yellow-50 text-yellow-800 border-yellow-200",
      message: t.reviewing.message,
    },
    validated: {
      label: t.validated.label,
      icon: CheckCircle2,
      variant: "default" as const,
      color: "bg-green-50 text-green-800 border-green-200",
      message: t.validated.message,
    },
    rejected: {
      label: t.rejected.label,
      icon: XCircle,
      variant: "destructive" as const,
      color: "bg-red-50 text-red-800 border-red-200",
      message: t.rejected.message,
    },
  }
}

// Componente para manejar imágenes con fallback a URLs firmadas
function ImageWithFallback({ 
  src, 
  alt, 
  projectImages, 
  imageIndex,
  language = 'es'
}: { 
  src: string
  alt: string
  projectImages: any[]
  imageIndex: number
  language?: 'es' | 'en'
}) {
  const [imageSrc, setImageSrc] = useState(src)
  const [loading, setLoading] = useState(true)

  const handleError = async () => {
    // Verificar si la imagen realmente falló (esperar un momento para evitar falsos positivos)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Si la imagen ya se cargó correctamente, no hacer nada
    if (!loading) return
    
    // Si ya es una URL firmada o no podemos extraer el path, usar placeholder
    if (src.includes('?token=') || src.includes('/placeholder')) {
      setImageSrc("/placeholder.svg")
      setLoading(false)
      return
    }
    
    // Intentar obtener URL firmada solo si realmente falló
    try {
      const urlMatch = src.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/)
      if (urlMatch) {
        const [, bucket, encodedPath] = urlMatch
        const decodedPath = decodeURIComponent(encodedPath)
        const signedUrl = await getSignedUrl(bucket, decodedPath, 3600)
        setImageSrc(signedUrl)
        setLoading(false)
        return
      }
    } catch (error: any) {
      // Solo mostrar warning si realmente falló después de intentar URL firmada
      // No mostrar error si la imagen se carga correctamente después
      if (loading) {
        console.warn("Could not load image with signed URL:", error.message || error)
      }
    }
    
    // Si todo falla, usar placeholder
    setImageSrc("/placeholder.svg")
    setLoading(false)
  }

  return (
    <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-slate-400 text-sm">{language === 'en' ? "Loading..." : "Cargando..."}</p>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={handleError}
        onLoad={() => {
          setLoading(false)
          setHasError(false) // Reset error flag si la imagen se carga correctamente
        }}
      />
    </div>
  )
}

export function ProjectDetail({ projectId }: { projectId: string }) {
  const t = useTranslation()
  // Usar el país del contratista si está logueado, si no, null (español por defecto)
  const contractorCountry = useContractorCountry()
  const language = getLanguageByCountry(contractorCountry)
  const locale = language === 'en' ? 'en-US' : 'es-MX'
  const statusConfig = getStatusConfig(language)
  
  const { project, loading, error } = useProject(projectId)
  const [images, setImages] = useState<string[]>([])
  const [projectImages, setProjectImages] = useState<any[]>([])

  useEffect(() => {
    async function loadImages() {
      if (!projectId) return

      try {
        const projectImages = await getProjectImages(projectId)
        
        if (projectImages && projectImages.length > 0) {
          setProjectImages(projectImages)
          
          // Intentar usar URLs públicas primero (más rápido)
          // Solo generar URLs firmadas si fallan las públicas
          const imageUrls = await Promise.all(
            projectImages.map(async (img) => {
              const publicUrl = img.image_url
              
              // Intentar usar la URL pública directamente primero
              // Si el bucket es público, esto funcionará y será más rápido
              return publicUrl
            })
          )
          
          setImages(imageUrls)
        } else {
          setImages([])
        }
      } catch (err: any) {
        console.error("Error loading project images:", err)
        setImages([])
      }
    }

    loadImages()
  }, [projectId])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">{language === 'en' ? "Loading project..." : "Cargando proyecto..."}</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !project) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">{language === 'en' ? "Project not found" : "Proyecto no encontrado"}</p>
          {error && <p className="text-red-600 text-sm mt-2">{error.message}</p>}
        </CardContent>
      </Card>
    )
  }

  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className={`border-2 ${status.color}`}>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <StatusIcon className="h-6 w-6 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{t.projectDetail.status}: {status.label}</h3>
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
                <p className="text-sm text-slate-600">{t.projectDetail.registrationDate}</p>
                <p className="font-semibold">{new Date(project.created_at).toLocaleDateString(locale)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Ruler className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">{t.projectDetail.squareMeters}</p>
                <p className="font-semibold">{project.square_meters} m²</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Droplet className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">{t.projectDetail.estimatedLiters}</p>
                <p className="font-semibold">{project.liters} L</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div>
              <h3 className="font-semibold mb-2">{t.projectDetail.description}</h3>
              <p className="text-slate-600">{project.description}</p>
            </div>
          )}

          {/* Validation Info */}
          {project.status === "validated" && project.validation_date && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">{t.projectDetail.validationInfo}</h3>
              <p className="text-sm text-slate-600 mb-1">
                <strong>{t.projectDetail.validationDate}:</strong> {new Date(project.validation_date).toLocaleDateString(locale)}
              </p>
              {project.validation_notes && (
                <p className="text-sm text-slate-600">
                  <strong>{t.projectDetail.notes}:</strong> {project.validation_notes}
                </p>
              )}
            </div>
          )}

          {/* Rejection Info */}
          {project.status === "rejected" && project.validation_notes && (
            <div className="border-t pt-4 space-y-4">
              <div>
              <h3 className="font-semibold mb-2 text-red-600">{t.projectDetail.rejectionObservations}</h3>
              <p className="text-sm text-slate-600">
                {project.validation_notes}
              </p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Edit className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-1">{t.projectDetail.needToCorrect}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t.projectDetail.canEditInfo}
                    </p>
                    <Link href={`/contractor/projects/${projectId}/edit`}>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Edit className="h-4 w-4 mr-2" />
                        {t.projectDetail.editAndResubmit}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images */}
          {images && images.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {t.projectDetail.photographicEvidence} ({images.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image, index) => (
                  <ImageWithFallback 
                    key={index} 
                    src={image} 
                    alt={`${t.projectDetail.evidence} ${index + 1}`}
                    projectImages={projectImages}
                    imageIndex={index}
                    language={language}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {t.projectDetail.photographicEvidence}
              </h3>
              <div className="p-8 bg-slate-50 rounded-lg text-center">
                <p className="text-slate-600">{t.projectDetail.noImagesAvailable}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
