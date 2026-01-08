"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COUNTRIES, type CountryCode } from "@/lib/countries"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function TestCountryPage() {
  const [currentCountry, setCurrentCountry] = useState<CountryCode | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("MX")
  const router = useRouter()

  useEffect(() => {
    // Obtener país actual desde localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("selectedCountry")
      if (stored && stored in COUNTRIES) {
        setCurrentCountry(stored as CountryCode)
        setSelectedCountry(stored as CountryCode)
      }
    }
  }, [])

  const handleChangeCountry = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedCountry", selectedCountry)
      setCurrentCountry(selectedCountry)
      toast.success(`País cambiado a ${COUNTRIES[selectedCountry].name}`)
    }
  }

  const handleClearCountry = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("selectedCountry")
      setCurrentCountry(null)
      toast.success("País eliminado. Se mostrará el selector al registrarse.")
    }
  }

  const country = COUNTRIES[selectedCountry]

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Página de Prueba - Cambiar País</CardTitle>
            <CardDescription>
              Usa esta página para cambiar el país seleccionado y probar cómo se ve la aplicación con diferentes configuraciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">País actual en localStorage:</p>
              <p className="text-lg font-semibold text-blue-600">
                {currentCountry ? COUNTRIES[currentCountry].name : "Ninguno (se mostrará selector)"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar país para probar:</label>
              <Select
                value={selectedCountry}
                onValueChange={(value) => setSelectedCountry(value as CountryCode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(COUNTRIES).map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-slate-100 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Configuración del país seleccionado:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li><strong>Identificador fiscal:</strong> {country.taxIdLabel} {country.requiresTaxId ? "(Requerido)" : "(Opcional)"}</li>
                <li><strong>Formato teléfono:</strong> {country.phoneFormat.placeholder} ({country.phoneFormat.minLength}-{country.phoneFormat.maxLength} dígitos)</li>
                <li><strong>Ciudades:</strong> {country.cities ? `${country.cities.length} ciudades disponibles` : "No requiere ciudad"}</li>
                {country.cities && (
                  <li className="ml-4">
                    <ul className="list-disc list-inside">
                      {country.cities.map(city => (
                        <li key={city.code}>{city.name}</li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleChangeCountry} className="flex-1">
                Cambiar a {COUNTRIES[selectedCountry].name}
              </Button>
              <Button onClick={handleClearCountry} variant="outline">
                Limpiar País
              </Button>
            </div>

            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium">Páginas para probar:</p>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push("/register")}
                >
                  Ir a Registro
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push("/")}
                >
                  Ir a Inicio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem("selectedCountry")
                    window.location.reload()
                  }}
                >
                  Limpiar y recargar
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip rápido:</strong> También puedes cambiar el país desde el botón con el ícono de globo en el header de cualquier página.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> Después de cambiar el país, ve a la página de registro para ver cómo cambian los campos del formulario según el país seleccionado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

