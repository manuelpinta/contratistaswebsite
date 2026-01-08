"use client"

import { useState, useEffect } from "react"
import { getContractorById } from "@/lib/supabase/contractors"
import type { CountryCode } from "@/lib/countries"

/**
 * Hook para obtener el país del contratista desde su cuenta
 * Solo funciona cuando el usuario está logueado
 */
export function useContractorCountry(): CountryCode | null {
  const [countryCode, setCountryCode] = useState<CountryCode | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (typeof window === 'undefined') return
    
    async function loadContractorCountry() {
      const contractorId = localStorage.getItem("contractorId")
      if (contractorId) {
        try {
          const contractor = await getContractorById(contractorId)
          if (contractor.country_code) {
            setCountryCode(contractor.country_code as CountryCode)
          }
        } catch (error) {
          console.error("Error loading contractor country:", error)
        }
      }
    }
    
    loadContractorCountry()
  }, [])

  if (!mounted) return null
  
  return countryCode
}

