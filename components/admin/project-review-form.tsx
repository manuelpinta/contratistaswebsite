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
import { reviewProject } from "@/lib/supabase/projects"
import { useTranslation } from "@/hooks/use-translation"
import { getLanguageByCountry } from "@/lib/translations"
import { useSelectedCountry } from "@/components/country-selector"

interface ProjectReviewFormProps {
  project: any
}

export function ProjectReviewForm({ project }: ProjectReviewFormProps) {
  const t = useTranslation()
  const selectedCountry = useSelectedCountry()
  const language = getLanguageByCountry(selectedCountry)
  const locale = language === 'en' ? 'en-US' : 'es-MX'
  const router = useRouter()
  const [physicalValidation, setPhysicalValidation] = useState(false)
  const [comments, setComments] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<"validate" | "reject" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleValidate = async () => {
    setIsSubmitting(true)
    try {
      const validatorId = localStorage.getItem("adminId")
      if (!validatorId) {
        toast.error(t.admin.review.sessionError)
        setIsSubmitting(false)
        return
      }
      await reviewProject(project.id, "validated", comments.trim() || (language === 'en' ? "Project validated successfully" : "Proyecto validado correctamente"), validatorId)
      toast.success(t.admin.review.validateSuccess)
      window.dispatchEvent(new CustomEvent("projectsUpdated"))
      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 1000)
    } catch (error: any) {
      console.error("Error validating project:", error)
      toast.error(error.message || t.admin.review.validateError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!comments.trim()) {
      toast.error(t.admin.review.commentsRequired)
      return
    }
    setIsSubmitting(true)
    try {
      const validatorId = localStorage.getItem("adminId")
      if (!validatorId) {
        toast.error(t.admin.review.sessionError)
        setIsSubmitting(false)
        return
      }
      await reviewProject(project.id, "rejected", comments.trim(), validatorId)
      toast.error(t.admin.review.rejectSuccess)
      window.dispatchEvent(new CustomEvent("projectsUpdated"))
      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 1000)
    } catch (error: any) {
      console.error("Error rejecting project:", error)
      toast.error(error.message || t.admin.review.rejectError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Datos del Proyecto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t.admin.review.projectData}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-slate-600">{t.admin.review.projectName}</Label>
                <p className="text-lg font-semibold">{project.name}</p>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <Label className="text-slate-600">{t.admin.review.location}</Label>
                  <p className="font-medium">{project.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <Label className="text-slate-600">{t.admin.review.registrationDate}</Label>
                  <p className="font-medium">
                    {new Date(project.registeredDate).toLocaleDateString(locale, {
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
                  <Label className="text-slate-600">{t.admin.review.surface}</Label>
                  <p className="text-lg font-semibold">{project.area} m²</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Droplet className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <Label className="text-slate-600">{t.admin.review.estimatedLiters}</Label>
                  <p className="text-lg font-semibold">{project.liters} lts</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Paintbrush className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <Label className="text-slate-600">{t.admin.review.paintType}</Label>
                  <p className="font-medium">{project.paintType || t.admin.review.notSpecified}</p>
                </div>
              </div>
            </div>
          </div>

          {project.notes && (
            <div className="pt-4 border-t">
              <Label className="text-slate-600">{t.admin.review.contractorNotes}</Label>
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
            {t.admin.review.contractorData}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <Label className="text-slate-600">{t.admin.review.name}</Label>
                <p className="font-medium">{project.contractor.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-slate-400" />
              <div>
                <Label className="text-slate-600">{t.admin.review.phone}</Label>
                <p className="font-medium">{project.contractor.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <Label className="text-slate-600">{t.admin.review.email}</Label>
                <p className="font-medium">{project.contractor.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidencia Fotográfica */}
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.review.photographicEvidence}</CardTitle>
          <CardDescription>{t.admin.review.evidenceDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {project.photos && project.photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {project.photos.map((photo: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-colors cursor-pointer group"
                  onClick={() => setSelectedImage(photo)}
                >
                  <img
                    src={photo || "/placeholder.svg"}
                    alt={`${language === 'en' ? 'Photo' : 'Foto'} ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      console.error("Error loading image in admin:", photo)
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">{t.admin.review.viewImage}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-lg text-center">
              <p className="text-slate-600">{t.admin.review.noImages}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de Validación */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle>{t.admin.review.validation}</CardTitle>
          <CardDescription>{t.admin.review.validationDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="physical-validation"
              checked={physicalValidation}
              onCheckedChange={(checked) => setPhysicalValidation(checked as boolean)}
            />
            <Label htmlFor="physical-validation" className="text-base font-medium cursor-pointer">
              {t.admin.review.physicalValidation}
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">{t.admin.review.validatorComments}</Label>
            <Textarea
              id="comments"
              placeholder={t.admin.review.commentsPlaceholder}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-slate-500">
              {t.admin.review.commentsNote}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!physicalValidation || isSubmitting}
              onClick={() => setConfirmDialog("validate")}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {isSubmitting ? t.admin.review.processing : t.admin.review.validate}
            </Button>

            <Button 
              size="lg" 
              variant="destructive" 
              className="flex-1" 
              disabled={isSubmitting}
              onClick={() => setConfirmDialog("reject")}
            >
              <XCircle className="h-5 w-5 mr-2" />
              {isSubmitting ? t.admin.review.processing : t.admin.review.reject}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmación */}
      <Dialog open={confirmDialog !== null} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog === "validate" ? t.admin.review.confirmValidate : t.admin.review.confirmReject}</DialogTitle>
            <DialogDescription>
              {confirmDialog === "validate"
                ? t.admin.review.validateDescription
                : t.admin.review.rejectDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              {t.admin.review.cancel}
            </Button>
            <Button
              className={confirmDialog === "validate" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={confirmDialog === "reject" ? "destructive" : "default"}
              disabled={isSubmitting}
              onClick={confirmDialog === "validate" ? handleValidate : handleReject}
            >
              {isSubmitting ? t.admin.review.processing : t.admin.review.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de imagen ampliada */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t.admin.review.imageView}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img 
              src={selectedImage || "/placeholder.svg"} 
              alt={language === 'en' ? "Enlarged image" : "Imagen ampliada"} 
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                console.error("Error loading image in dialog:", selectedImage)
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
