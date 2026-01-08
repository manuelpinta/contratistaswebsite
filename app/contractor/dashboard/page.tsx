"use client"

import { useEffect, useState } from "react"
import { ContractorHeader } from "@/components/contractor/contractor-header"
import { PromotionsBanner } from "@/components/contractor/promotions-banner"
import { ProjectsOverview } from "@/components/contractor/projects-overview"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { getContractorById } from "@/lib/supabase/contractors"
import { useTranslation } from "@/hooks/use-translation"

export default function ContractorDashboard() {
  const t = useTranslation()
  const [contractorName, setContractorName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadContractor() {
      const contractorId = localStorage.getItem("contractorId")
      if (contractorId) {
        try {
          const contractor = await getContractorById(contractorId)
          setContractorName(contractor.name)
        } catch (error) {
          console.error("Error loading contractor:", error)
        }
      }
      setLoading(false)
    }
    loadContractor()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <ContractorHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {loading ? t.dashboard.loading : contractorName ? `${t.dashboard.hello}, ${contractorName}` : t.dashboard.hello}
          </h1>
          <p className="text-slate-600">{t.dashboard.welcome}</p>
        </div>

        {/* Quick Action */}
        <div className="mb-8">
          <Link href="/contractor/projects/nuevo">
            <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-lg py-6">
              <PlusCircle className="mr-2 h-6 w-6" />
              {t.dashboard.registerNewProject}
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
