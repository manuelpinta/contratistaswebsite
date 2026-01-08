"use client"

import { ContractorHeader } from "@/components/contractor/contractor-header"
import { NewProjectForm } from "@/components/contractor/new-project-form"
import { useTranslation } from "@/hooks/use-translation"

export default function NewProjectPage() {
  const t = useTranslation()

  return (
    <div className="min-h-screen bg-slate-50">
      <ContractorHeader />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t.projects.registerNewProject}</h1>
          <p className="text-slate-600">{t.projects.completeInfo}</p>
        </div>

        <NewProjectForm />
      </main>
    </div>
  )
}
