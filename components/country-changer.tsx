"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { COUNTRIES, type CountryCode } from "@/lib/countries"
import { Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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

export function CountryChanger() {
  const [currentCountry, setCurrentCountry] = useState<CountryCode | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("selectedCountry")
      if (stored && stored in COUNTRIES) {
        setCurrentCountry(stored as CountryCode)
      }
    }
  }, [])

  const handleChangeCountry = (countryCode: CountryCode) => {
    localStorage.setItem("selectedCountry", countryCode)
    setCurrentCountry(countryCode)
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new Event('countryChanged'))
    toast.success(`País cambiado a ${COUNTRIES[countryCode].name}`)
    // Recargar la página para aplicar los cambios
    router.refresh()
  }

  if (!currentCountry) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{getCountryFlag(currentCountry)} {COUNTRIES[currentCountry].name}</span>
          <span className="sm:hidden">{getCountryFlag(currentCountry)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Cambiar país</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.values(COUNTRIES).map((country) => (
          <DropdownMenuItem
            key={country.code}
            onClick={() => handleChangeCountry(country.code)}
            className={currentCountry === country.code ? "bg-muted" : ""}
          >
            <span className="mr-2 text-lg">{getCountryFlag(country.code)}</span>
            <span>{country.name}</span>
            {currentCountry === country.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            localStorage.removeItem("selectedCountry")
            setCurrentCountry(null)
            // Disparar evento personalizado para notificar a otros componentes
            window.dispatchEvent(new Event('countryChanged'))
            toast.success("País eliminado. Se mostrará el selector al recargar.")
            router.refresh()
          }}
          className="text-muted-foreground"
        >
          Limpiar selección
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

