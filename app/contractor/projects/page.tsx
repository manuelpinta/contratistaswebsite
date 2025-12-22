import { ContractorHeader } from "@/components/contractor/contractor-header"
import { ProjectsList } from "@/components/contractor/projects-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Mis Proyectos | Portal del Contratista",
  description: "Lista de proyectos registrados",
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ContractorHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Mis Proyectos</h1>
            <p className="text-slate-600">Gestiona y revisa el estatus de tus proyectos</p>
          </div>
          <Link href="/contractor/projects/nuevo">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Nuevo Proyecto
            </Button>
          </Link>
        </div>

        <ProjectsList />
      </main>
    </div>
  )
}
