import { ContractorHeader } from "@/components/contractor/contractor-header"
import { NewProjectForm } from "@/components/contractor/new-project-form"

export const metadata = {
  title: "Registrar Proyecto | Portal del Contratista",
  description: "Registra un nuevo proyecto",
}

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ContractorHeader />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Registrar Nuevo Proyecto</h1>
          <p className="text-slate-600">Completa la información del proyecto para enviarlo a revisión</p>
        </div>

        <NewProjectForm />
      </main>
    </div>
  )
}
