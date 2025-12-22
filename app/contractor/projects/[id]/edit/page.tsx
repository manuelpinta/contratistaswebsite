"use client"

import { ContractorHeader } from "@/components/contractor/contractor-header"
import { EditProjectForm } from "@/components/contractor/edit-project-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function EditProjectPage() {
  const params = useParams()
  const projectId = params?.id as string

  return (
    <div className="min-h-screen bg-slate-50">
      <ContractorHeader />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <Link href={`/contractor/projects/${projectId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al proyecto
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Editar Proyecto</h1>
          <p className="text-slate-600">Corrige la información y reenvía tu proyecto para revisión</p>
        </div>

        {projectId && <EditProjectForm projectId={projectId} />}
      </main>
    </div>
  )
}
