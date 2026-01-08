"use client"

import { ContractorHeader } from "@/components/contractor/contractor-header"
import { ProjectsList } from "@/components/contractor/projects-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"

export default function ProjectsPage() {
  const t = useTranslation()
  
  return (
    <div className="min-h-screen bg-slate-50">
      <ContractorHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t.projects.myProjects}</h1>
            <p className="text-slate-600">{t.projects.manageStatus}</p>
          </div>
          <Link href="/contractor/projects/nuevo">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              {t.projects.newProject}
            </Button>
          </Link>
        </div>

        <ProjectsList />
      </main>
    </div>
  )
}
