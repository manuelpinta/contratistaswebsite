"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Menu, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getContractorById } from "@/lib/supabase/contractors"
import { useTranslation } from "@/hooks/use-translation"
import { useContractorCountry } from "@/hooks/use-contractor-country"
import { COUNTRIES, type CountryCode } from "@/lib/countries"

// Función para obtener emoji de bandera
function getCountryFlag(code: CountryCode): string {
  const flags: Record<CountryCode, string> = {
    MX: "🇲🇽",
    HN: "🇭🇳",
    SV: "🇸🇻",
    BZ: "🇧🇿",
  }
  return flags[code] || "🌍"
}

export function ContractorHeader() {
  const t = useTranslation()
  const contractorCountry = useContractorCountry()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [contractorName, setContractorName] = useState("")
  const router = useRouter()

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
    }
    loadContractor()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("contractorId")
    localStorage.removeItem("contractorEmail")
    toast.success(t.contractorHeader.sessionClosed)
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/contractor/dashboard" className="font-bold text-xl text-slate-900 flex items-center gap-2">
          {t.contractorHeader.portal}
          {contractorCountry && (
            <span className="text-2xl" title={COUNTRIES[contractorCountry].name}>
              {getCountryFlag(contractorCountry)}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/contractor/dashboard" className="text-slate-700 hover:text-slate-900 font-medium">
            {t.contractorHeader.home}
          </Link>
          <Link href="/contractor/projects" className="text-slate-700 hover:text-slate-900 font-medium">
            {t.contractorHeader.myProjects}
          </Link>
          <Link href="/contractor/rifa" className="text-slate-700 hover:text-slate-900 font-medium">
            {t.contractorHeader.monthlyRaffle}
          </Link>
          <Link href="/contractor/projects/nuevo" className="text-slate-700 hover:text-slate-900 font-medium">
            {t.contractorHeader.registerProject}
          </Link>
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{contractorName || "Usuario"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/contractor/profile">
                  <User className="mr-2 h-4 w-4" />
                  {t.contractorHeader.profile}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t.contractorHeader.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link
              href="/contractor/dashboard"
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t.contractorHeader.home}
            </Link>
            <Link
              href="/contractor/projects"
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t.contractorHeader.myProjects}
            </Link>
            <Link
              href="/contractor/rifa"
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t.contractorHeader.monthlyRaffle}
            </Link>
            <Link
              href="/contractor/projects/nuevo"
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t.contractorHeader.registerProject}
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded">
              {t.contractorHeader.logout}
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
