"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ContractorHeader } from "@/components/contractor/contractor-header"
import { ProjectDetail } from "@/components/contractor/project-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"

export default function ProjectDetailPage() {
  const t = useTranslation()
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string

  useEffect(() => {
    if (projectId === "new") {
      router.push("/contractor/projects/nuevo")
    }
  }, [projectId, router])

  if (projectId === "new") {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ContractorHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/contractor/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.projects.backToProjects}
            </Button>
          </Link>
        </div>

        {projectId && <ProjectDetail projectId={projectId} />}
      </main>
    </div>
  )
}
