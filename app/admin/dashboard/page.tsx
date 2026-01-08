"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProjectsTable } from "@/components/admin/projects-table"
import { useAllProjects } from "@/hooks/use-all-projects"
import { useTranslation } from "@/hooks/use-translation"

export default function AdminDashboard() {
  const t = useTranslation()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { projects, loading, error, refetch } = useAllProjects()

  useEffect(() => {
    // Verificar autenticación
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth !== "true") {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // Recargar proyectos cuando se actualiza uno
  useEffect(() => {
    const handleProjectsUpdated = () => {
      if (isAuthenticated) {
        refetch()
      }
    }

    window.addEventListener("projectsUpdated", handleProjectsUpdated)
    return () => {
      window.removeEventListener("projectsUpdated", handleProjectsUpdated)
    }
  }, [isAuthenticated, refetch])

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <p className="text-slate-600">{t.admin.dashboard.loading}</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <p className="text-red-600">{t.admin.dashboard.errorLoading}: {error.message}</p>
        </main>
      </div>
    )
  }

  // Transformar proyectos de Supabase al formato esperado por ProjectsTable
  const transformedProjects = projects.map((project: any) => {
    // Extraer datos del contratista si viene en el join
    const contractor = project.contractor || project.contractors || null
    
    return {
      id: project.id,
      name: project.name,
      contractor: contractor ? {
        name: contractor.name || "N/A",
        phone: contractor.phone || "",
        email: contractor.email || "",
      } : { name: "N/A", phone: "", email: "" },
      location: project.location,
      registeredDate: project.created_at,
      status: project.status,
      area: project.square_meters,
      liters: project.liters,
      paintType: project.paint_type || "",
      photos: [], // Se cargarán en la página de detalle
      notes: project.description || "",
      validatorComments: project.validation_notes || "",
    }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t.admin.dashboard.title}</h1>
          <p className="text-slate-600">{t.admin.dashboard.description}</p>
        </div>
        <ProjectsTable projects={transformedProjects} setProjects={() => refetch()} />
      </main>
    </div>
  )
}
