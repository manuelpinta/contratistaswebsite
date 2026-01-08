"use client"

import { useState, useEffect } from "react"
import { getTranslation, getLanguageByCountry, type Language } from "@/lib/translations"
import { useContractorCountry } from "@/hooks/use-contractor-country"
import type { CountryCode } from "@/lib/countries"

export function useTranslation() {
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<Language>('es')
  const contractorCountry = useContractorCountry()
  
  useEffect(() => {
    setMounted(true)
    
    if (typeof window === 'undefined') return
    
    const updateLanguage = () => {
      // Si el usuario está logueado, usar el idioma basado en su país
      const contractorId = localStorage.getItem("contractorId")
      if (contractorId && contractorCountry) {
        // Usuario logueado: idioma basado en su país (solo Belice = inglés)
        const countryLang = getLanguageByCountry(contractorCountry)
        setLanguage(countryLang)
        return
      }
      
      // Usuario no logueado: usar el idioma del selector
      const stored = localStorage.getItem("selectedLanguage") as Language
      if (stored && (stored === 'es' || stored === 'en')) {
        setLanguage(stored)
      } else {
        // Si no hay idioma guardado, detectar desde el navegador
        const browserLang = navigator.language.split('-')[0]
        const defaultLang: Language = browserLang === 'en' ? 'en' : 'es'
        setLanguage(defaultLang)
        localStorage.setItem("selectedLanguage", defaultLang)
      }
    }
    
    // Leer el idioma inicial
    updateLanguage()
    
    // Escuchar cambios en localStorage
    window.addEventListener('storage', updateLanguage)
    
    // También escuchar eventos personalizados para cambios en la misma pestaña
    const handleLanguageChange = () => updateLanguage()
    window.addEventListener('languageChanged', handleLanguageChange)
    
    return () => {
      window.removeEventListener('storage', updateLanguage)
      window.removeEventListener('languageChanged', handleLanguageChange)
    }
  }, [contractorCountry])
  
  // Durante SSR y antes del mount, usar español por defecto para evitar hydration mismatch
  if (!mounted) {
    return getTranslation('es')
  }
  
  return getTranslation(language)
}

