"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { COUNTRIES, type CountryCode, detectCountryFromBrowser } from "@/lib/countries"
import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface CountrySelectorProps {
  onCountrySelected: (countryCode: CountryCode) => void
  showSkip?: boolean
}

// Función para obtener emoji de bandera (simple, basado en código de país)
function getCountryFlag(code: CountryCode): string {
  const flags: Record<CountryCode, string> = {
    MX: "🇲🇽",
    HN: "🇭🇳",
    SV: "🇸🇻",
    BZ: "🇧🇿",
  }
  return flags[code] || "🌍"
}

export function CountrySelector({ onCountrySelected, showSkip = false }: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null)
  const [detectedCountry, setDetectedCountry] = useState<CountryCode | null>(null)

  useEffect(() => {
    // Intentar detectar país automáticamente
    const detected = detectCountryFromBrowser()
    if (detected) {
      setDetectedCountry(detected)
      setSelectedCountry(detected)
    }
  }, [])

  const handleContinue = () => {
    if (selectedCountry) {
      // Guardar en localStorage
      localStorage.setItem("selectedCountry", selectedCountry)
      // Disparar evento personalizado para notificar a otros componentes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('countryChanged'))
      }
      onCountrySelected(selectedCountry)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Globe className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Selecciona tu país</CardTitle>
          {detectedCountry && (
            <p className="text-sm text-muted-foreground mt-2">
              Detectamos que estás en {COUNTRIES[detectedCountry].name}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {Object.values(COUNTRIES).map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country.code)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left",
                  "hover:border-blue-500 hover:bg-blue-50",
                  selectedCountry === country.code
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-slate-200 bg-white"
                )}
              >
                <span className="text-3xl">{getCountryFlag(country.code)}</span>
                <span className="flex-1 font-medium text-slate-900">{country.name}</span>
                {selectedCountry === country.code && (
                  <span className="text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>

          <Button 
            onClick={handleContinue} 
            className="w-full mt-6" 
            disabled={!selectedCountry}
            size="lg"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook para obtener el país seleccionado (sin auto-detectar)
// Usa estado para evitar hydration mismatch
export function useSelectedCountry(): CountryCode | null {
  const [country, setCountry] = useState<CountryCode | null>(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    
    if (typeof window === 'undefined') return
    
    const updateCountry = () => {
      const stored = localStorage.getItem("selectedCountry")
      if (stored && stored in COUNTRIES) {
        setCountry(stored as CountryCode)
      } else {
        setCountry(null)
      }
    }
    
    // Leer el país inicial
    updateCountry()
    
    // Escuchar cambios en localStorage (por si cambia en otra pestaña o componente)
    window.addEventListener('storage', updateCountry)
    
    // También escuchar eventos personalizados para cambios en la misma pestaña
    const handleCountryChange = () => updateCountry()
    window.addEventListener('countryChanged', handleCountryChange)
    
    return () => {
      window.removeEventListener('storage', updateCountry)
      window.removeEventListener('countryChanged', handleCountryChange)
    }
  }, [])
  
  // Durante SSR, retornar null
  if (!mounted) return null
  
  return country
}

