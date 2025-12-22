"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProjectReviewForm } from "@/components/admin/project-review-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Mock data (en producción vendría de una API)
const mockProjects = {
  "1": {
    id: "1",
    name: "Pintura Residencial Centro",
    contractor: { name: "Juan Pérez", phone: "555-0101", email: "juan@example.com" },
    location: "Monterrey, NL",
    registeredDate: "2024-01-15",
    status: "pending",
    area: 120,
    liters: 45,
    paintType: "Vinílica Premium",
    photos: ["/house-before-painting.jpg", "/house-during-painting.jpg", "/house-after-painting.jpg"],
    notes: "Proyecto residencial de alta calidad con acabados premium",
  },
  "2": {
    id: "2",
    name: "Fachada Comercial",
    contractor: { name: "María García", phone: "555-0102", email: "maria@example.com" },
    location: "Guadalajara, JAL",
    registeredDate: "2024-01-14",
    status: "pending",
    area: 250,
    liters: 90,
    paintType: "Acrílica Exterior",
    photos: ["/commercial-facade-before.jpg", "/commercial-facade-during.jpg", "/commercial-facade-after.jpg"],
    notes: "Requiere pintura especial para exteriores, clima húmedo",
  },
  "5": {
    id: "5",
    name: "Casa Habitación",
    contractor: { name: "Roberto López", phone: "555-0105", email: "roberto@example.com" },
    location: "Querétaro, QRO",
    registeredDate: "2024-01-16",
    status: "pending",
    area: 95,
    liters: 35,
    paintType: "Esmalte Interior",
    photos: ["/home-interior-before.jpg", "/home-interior-after.jpg"],
    notes: "Primera participación en el concurso. Trabajo interior completo.",
  },
}

export default function ProjectReviewPage() {
  const router = useRouter()
  const params = useParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [project, setProject] = useState<any>(null)

  useEffect(() => {
    // Verificar autenticación
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth !== "true") {
      router.push("/admin/login")
      return
    }

    setIsAuthenticated(true)

    // Cargar proyecto desde localStorage o mock data
    const projectId = params.id as string
    const savedProjects = localStorage.getItem("adminProjects")
    
    let projectData = null
    
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects)
        projectData = projects.find((p: any) => p.id === projectId)
      } catch (e) {
        console.error("Error al cargar proyectos:", e)
      }
    }
    
    // Si no se encuentra en localStorage, buscar en mock data
    if (!projectData) {
      projectData = mockProjects[projectId as keyof typeof mockProjects]
    }

    if (projectData) {
      setProject(projectData)
    } else {
      // Si no existe el proyecto, redirigir
      router.push("/admin/dashboard")
    }
  }, [params.id, router])

  if (!isAuthenticated || !project) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => router.push("/admin/dashboard")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Bandeja
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
          <p className="text-slate-600">Revisión y validación del proyecto</p>
        </div>

        <ProjectReviewForm project={project} />
      </main>
    </div>
  )
}
