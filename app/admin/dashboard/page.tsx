"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProjectsTable } from "@/components/admin/projects-table"

// Datos de ejemplo
const mockProjects = [
  {
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
    notes: "Proyecto residencial de alta calidad",
  },
  {
    id: "2",
    name: "Fachada Comercial",
    contractor: { name: "María García", phone: "555-0102", email: "maria@example.com" },
    location: "Guadalajara, JAL",
    registeredDate: "2024-01-14",
    status: "pending",
    area: 250,
    liters: 90,
    paintType: "Acrílica Exterior",
    photos: [
      "/commercial-facade-before.jpg",
      "/commercial-facade-during.jpg",
      "/commercial-facade-after.jpg",
    ],
    notes: "Requiere pintura especial para exteriores",
  },
  {
    id: "3",
    name: "Restaurante La Plaza",
    contractor: { name: "Carlos Ruiz", phone: "555-0103", email: "carlos@example.com" },
    location: "Ciudad de México, CDMX",
    registeredDate: "2024-01-13",
    status: "validated",
    area: 180,
    liters: 65,
    paintType: "Esmalte Interior",
    photos: ["/placeholder.svg?height=300&width=400"],
    validatorComments: "Trabajo excelente, bien documentado",
  },
  {
    id: "4",
    name: "Oficinas Corporativas",
    contractor: { name: "Ana Martínez", phone: "555-0104", email: "ana@example.com" },
    location: "Puebla, PUE",
    registeredDate: "2024-01-12",
    status: "rejected",
    area: 200,
    liters: 75,
    paintType: "Vinílica Premium",
    photos: ["/placeholder.svg?height=300&width=400"],
    validatorComments: "Falta evidencia fotográfica del proceso",
  },
  {
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
    notes: "Primera participación en el concurso",
  },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [projects, setProjects] = useState(mockProjects)

  useEffect(() => {
    // Verificar autenticación
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth !== "true") {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const loadProjects = () => {
    // Cargar proyectos desde localStorage o usar los mock iniciales
    const savedProjects = localStorage.getItem("adminProjects")
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects))
      } catch (e) {
        console.error("Error al cargar proyectos:", e)
        // Inicializar con datos mock si no hay datos guardados
        localStorage.setItem("adminProjects", JSON.stringify(mockProjects))
        setProjects(mockProjects)
      }
    } else {
      // Inicializar con datos mock si no hay datos guardados
      localStorage.setItem("adminProjects", JSON.stringify(mockProjects))
      setProjects(mockProjects)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects()
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Recargar proyectos cuando se actualiza un proyecto
    const handleProjectsUpdated = () => {
      if (isAuthenticated) {
        loadProjects()
      }
    }

    window.addEventListener("projectsUpdated", handleProjectsUpdated)
    // También recargar cuando la ventana recupera el foco
    const handleFocus = () => {
      if (isAuthenticated) {
        loadProjects()
      }
    }
    window.addEventListener("focus", handleFocus)
    
    return () => {
      window.removeEventListener("projectsUpdated", handleProjectsUpdated)
      window.removeEventListener("focus", handleFocus)
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Guardar proyectos en localStorage cuando cambien
    if (isAuthenticated && projects.length > 0) {
      localStorage.setItem("adminProjects", JSON.stringify(projects))
    }
  }, [projects, isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bandeja de Proyectos</h1>
          <p className="text-slate-600">Valida y gestiona los proyectos registrados</p>
        </div>
        <ProjectsTable projects={projects} setProjects={setProjects} />
      </main>
    </div>
  )
}
