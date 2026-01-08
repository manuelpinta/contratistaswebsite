"use client"

import { useState, useEffect } from "react"
import { CountrySelector } from "./country-selector"
import { COUNTRIES, type CountryCode } from "@/lib/countries"

export function CountrySelectorWrapper({ children }: { children: React.ReactNode }) {
  const [showSelector, setShowSelector] = useState(false)
  const [country, setCountry] = useState<CountryCode | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("selectedCountry")
      if (stored && stored in COUNTRIES) {
        setCountry(stored as CountryCode)
        setShowSelector(false)
      } else {
        // No hay país seleccionado, mostrar selector
        setShowSelector(true)
      }
    }
  }, [])

  const handleCountrySelected = (countryCode: CountryCode) => {
    setCountry(countryCode)
    setShowSelector(false)
  }

  // No renderizar nada hasta que esté en el cliente
  if (!isClient) {
    return <>{children}</>
  }

  if (showSelector) {
    return <CountrySelector onCountrySelected={handleCountrySelected} />
  }

  return <>{children}</>
}

