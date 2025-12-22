"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Calendar, MapPin, User } from "lucide-react"

type Project = {
  id: string
  name: string
  contractor: { name: string; phone: string; email: string }
  location: string
  registeredDate: string
  status: "pending" | "validated" | "rejected"
  area: number
  liters: number
}

interface ProjectsTableProps {
  projects: Project[]
  setProjects: (projects: Project[]) => void
}

export function ProjectsTable({ projects, setProjects }: ProjectsTableProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const filteredProjects = projects.filter((project) => {
    if (statusFilter !== "all" && project.status !== statusFilter) return false
    // Filtro de fecha simplificado
    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0]
      if (project.registeredDate !== today) return false
    }
    return true
  })

  // Ordenar: pendientes primero
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1
    if (a.status !== "pending" && b.status === "pending") return 1
    return new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime()
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>
      case "validated":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Validado</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rechazado</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Estatus</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="validated">Validados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Fecha</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Últimos 7 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Contratista</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No hay proyectos para mostrar
                </TableCell>
              </TableRow>
            ) : (
              sortedProjects.map((project) => (
                <TableRow key={project.id} className={project.status === "pending" ? "bg-yellow-50/50" : ""}>
                  <TableCell className="font-mono text-sm">#{project.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{project.name}</div>
                    <div className="text-sm text-slate-500">
                      {project.area} m² · {project.liters} lts
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900">{project.contractor.name}</div>
                        <div className="text-sm text-slate-500">{project.contractor.phone}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4" />
                      {project.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(project.registeredDate).toLocaleDateString("es-MX")}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => router.push(`/admin/projects/${project.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Revisar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Resumen */}
      <div className="flex gap-4 text-sm text-slate-600">
        <div>
          Total: <strong>{sortedProjects.length}</strong>
        </div>
        <div>
          Pendientes:{" "}
          <strong className="text-yellow-600">{sortedProjects.filter((p) => p.status === "pending").length}</strong>
        </div>
        <div>
          Validados:{" "}
          <strong className="text-green-600">{sortedProjects.filter((p) => p.status === "validated").length}</strong>
        </div>
        <div>
          Rechazados:{" "}
          <strong className="text-red-600">{sortedProjects.filter((p) => p.status === "rejected").length}</strong>
        </div>
      </div>
    </div>
  )
}
