"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"
import { NewProjectForm } from "./new-project-form"

// Datos mock del proyecto (en producción vendría de una API)
const projectData: Record<string, any> = {
  "1": {
    id: "1",
    name: "Edificio Reforma 123",
    location: "Ciudad de México, Reforma",
    squareMeters: 500,
    liters: 150,
    paintType: "vinimex",
    description: "Proyecto de pintura exterior e interior",
    images: ["/paint-products-store.jpg"],
  },
  "2": {
    id: "2",
    name: "Casa Residencial Polanco",
    location: "Polanco, CDMX",
    squareMeters: 200,
    liters: 80,
    paintType: "pro-mil",
    description: "Pintura completa de casa residencial",
  },
  "3": {
    id: "3",
    name: "Oficinas Corporativas Santa Fe",
    location: "Santa Fe, CDMX",
    squareMeters: 800,
    liters: 250,
    paintType: "cam-vinimex",
    description: "Proyecto de pintura para oficinas corporativas",
  },
  "4": {
    id: "4",
    name: "Departamento Roma Norte",
    location: "Roma Norte, CDMX",
    squareMeters: 120,
    liters: 40,
    paintType: "prima",
    description: "Pintura de departamento completo",
    images: ["/home-interior-before.jpg", "/home-interior-after.jpg"],
  },
}

interface EditProjectFormProps {
  projectId: string
}

export function EditProjectForm({ projectId }: EditProjectFormProps) {
  const project = projectData[projectId]
  const router = useRouter()

  useEffect(() => {
    if (!project) {
      toast.error("Proyecto no encontrado")
      router.push("/contractor/projects")
    }
  }, [project, router])

  if (!project) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">Cargando proyecto...</p>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async (data: any) => {
    // Simular actualización de proyecto
    setTimeout(() => {
      console.log("[v0] Project update:", data)
      toast.success("Proyecto actualizado exitosamente. Será revisado nuevamente.")
      router.push(`/contractor/projects/${projectId}`)
    }, 1500)
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
          squareMeters: project.squareMeters.toString(),
          liters: project.liters.toString(),
          paintType: project.paintType || "",
          description: project.description || "",
        }}
        onSubmit={handleSubmit}
        submitLabel="Actualizar y reenviar proyecto"
        isEditMode={true}
      />
    </div>
  )
}
