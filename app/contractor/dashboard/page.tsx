import { ContractorHeader } from "@/components/contractor/contractor-header"
import { PromotionsBanner } from "@/components/contractor/promotions-banner"
import { ProjectsOverview } from "@/components/contractor/projects-overview"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Mi Dashboard | Portal del Contratista",
  description: "Panel principal del contratista",
}

export default function ContractorDashboard() {
  console.log("[v0] Dashboard page loaded")

  return (
    <div className="min-h-screen bg-slate-50">
      <ContractorHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Hola, Juan Pérez</h1>
          <p className="text-slate-600">Bienvenido a tu portal de contratista</p>
        </div>

        {/* Quick Action */}
        <div className="mb-8">
          <Link href="/contractor/projects/nuevo">
            <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-lg py-6">
              <PlusCircle className="mr-2 h-6 w-6" />
              Registrar Nuevo Proyecto
            </Button>
          </Link>
        </div>

        {/* Promotions Banner */}
        <PromotionsBanner />

        {/* Projects Overview */}
        <ProjectsOverview />
      </main>
    </div>
  )
}
