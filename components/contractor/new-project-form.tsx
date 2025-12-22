"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Upload, X, MapPin, Ruler, Droplets, FileText, CheckCircle2, ImageIcon, Calculator, Info } from "lucide-react"

// Extender el tipo Window para incluir Google Maps
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, options?: { types?: string[]; componentRestrictions?: { country: string } }) => {
            addListener: (event: string, callback: () => void) => void
            getPlace: () => {
              formatted_address?: string
              geometry?: {
                location: {
                  lat: () => number
                  lng: () => number
                }
              }
            }
          }
        }
      }
    }
  }
}

// Países permitidos
const ALLOWED_COUNTRIES = ["hn", "sv", "bz"] // Honduras, El Salvador, Belize
// Ciudades permitidas en México
const ALLOWED_MEXICO_CITIES = [
  "Coatzacoalcos",
  "Minatitlán",
  "Aguascalientes",
  "Guerrero",
  "Lázaro Cárdenas",
  "Ciudad de México",
  "CDMX",
  "México D.F.",
  "Distrito Federal"
]

// Función para validar ubicación permitida
const validateLocation = (location: string): { valid: boolean; message?: string } => {
  if (!location || location.length < 3) {
    return { valid: false, message: "Ingresa una ubicación válida" }
  }
  
  const locationLower = location.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
  
  // Verificar países permitidos primero
  const countryNames: Record<string, string[]> = {
    "hn": ["honduras", "tegucigalpa", "san pedro sula", "la ceiba", "comayagua"],
    "sv": ["el salvador", "salvador", "san salvador", "santa ana", "san miguel"],
    "bz": ["belize", "belmopan", "belice", "belize city"]
  }
  
  const hasAllowedCountry = Object.entries(countryNames).some(([code, names]) => 
    names.some(name => locationLower.includes(name))
  )
  
  if (hasAllowedCountry) {
    return { valid: true }
  }
  
  // Verificar si es México y tiene ciudad permitida
  const mexicoIndicators = ["méxico", "mexico", "mx", "df", "distrito federal", "cdmx"]
  const isMexico = mexicoIndicators.some(indicator => locationLower.includes(indicator))
  
  if (isMexico) {
    const cityNames = ALLOWED_MEXICO_CITIES.map(city => city.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""))
    
    const hasAllowedCity = cityNames.some(city => {
      // Buscar coincidencias más flexibles
      const cityVariations: Record<string, string[]> = {
        "ciudad de mexico": ["ciudad de mexico", "cdmx", "df", "distrito federal", "mexico df"],
        "coatza": ["coatzacoalcos", "coatzacoalcos veracruz"],
        "minatitlan": ["minatitlán", "minatitlan", "minatitlan veracruz"],
        "aguascalientes": ["aguascalientes", "aguascalientes ags"],
        "guerrero": ["guerrero", "acapulco", "chilpancingo"],
        "lazaro cardenas": ["lázaro cárdenas", "lazaro cardenas", "lazaro cardenas michoacan"]
      }
      
      // Buscar en variaciones
      for (const [key, variations] of Object.entries(cityVariations)) {
        if (variations.some(v => locationLower.includes(v))) {
          return true
        }
      }
      
      return locationLower.includes(city)
    })
    
    if (hasAllowedCity) {
      return { valid: true }
    }
    return { 
      valid: false, 
      message: `En México solo se permiten estas ciudades: ${ALLOWED_MEXICO_CITIES.join(", ")}` 
    }
  }
  
  return { 
    valid: false, 
    message: "Solo se permiten ubicaciones en Honduras, El Salvador, Belize o las ciudades permitidas de México" 
  }
}

const projectSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  location: z.string()
    .min(5, "Ingresa una ubicación válida")
    .refine((val) => {
      const validation = validateLocation(val)
      return validation.valid
    }, (val) => {
      const validation = validateLocation(val)
      return { message: validation.message || "Ubicación no permitida" }
    }),
  squareMeters: z.string().min(1, "Ingresa los metros cuadrados"),
  paintType: z.string().optional(),
  liters: z.string().min(1, "Ingresa los litros estimados"),
  description: z.string().optional(),
})

// Rendimientos de pinturas (m² por litro)
const PAINT_YIELDS = {
  "vinimex": { name: "Vinimex", yield: 12, category: "Interior" },
  "pro-mil": { name: "Pro-mil", yield: 10, category: "Interior" },
  "prima": { name: "Prima", yield: 8, category: "Interior" },
  "cam-vinimex": { name: "CAM Vinimex", yield: 10, category: "Exterior" },
  "acrimate": { name: "Acrimate", yield: 12, category: "Exterior" },
} as const

type PaintType = keyof typeof PAINT_YIELDS

type ProjectFormValues = z.infer<typeof projectSchema>

interface NewProjectFormProps {
  initialData?: Partial<ProjectFormValues>
  onSubmit?: (data: ProjectFormValues) => void | Promise<void>
  submitLabel?: string
  isEditMode?: boolean
}

export function NewProjectForm({ 
  initialData, 
  onSubmit: customOnSubmit, 
  submitLabel = "Enviar Proyecto",
  isEditMode = false 
}: NewProjectFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedPaint, setSelectedPaint] = useState<PaintType | "">("")
  const [calculatedLiters, setCalculatedLiters] = useState<number | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const autocompleteRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData,
  })

  // Cargar datos iniciales si se proporcionan
  useEffect(() => {
    if (initialData) {
      reset(initialData)
      if (initialData.paintType) {
        setSelectedPaint(initialData.paintType as PaintType)
      }
    }
  }, [initialData, reset])

  const squareMeters = watch("squareMeters")
  const paintType = watch("paintType")

  // Cargar Google Maps Places API
  useEffect(() => {
    if (typeof window === "undefined") return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    // Si no hay API key, no intentar cargar Google Maps
    if (!apiKey) {
      console.log("Google Maps API key no configurada. El campo funcionará como texto normal.")
      return
    }

    // Verificar si el script ya existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Si el script ya existe, solo inicializar autocomplete
      if (window.google?.maps?.places && autocompleteRef.current) {
        initializeAutocomplete()
      } else {
        // Esperar a que se cargue
        const checkGoogle = setInterval(() => {
          if (window.google?.maps?.places && autocompleteRef.current) {
            initializeAutocomplete()
            clearInterval(checkGoogle)
          }
        }, 100)
        return () => clearInterval(checkGoogle)
      }
      return
    }

    // Cargar el script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      setMapLoaded(true)
      // Esperar un poco para que Google Maps esté completamente listo
      setTimeout(() => {
        if (autocompleteRef.current) {
          initializeAutocomplete()
        }
      }, 200)
    }
    
    script.onerror = () => {
      console.error("Error cargando Google Maps API")
      toast.error("No se pudo cargar el servicio de mapas. Puedes escribir la dirección manualmente.")
    }
    
    document.head.appendChild(script)

    function initializeAutocomplete() {
      if (!autocompleteRef.current || !window.google?.maps?.places) return
      
      try {
        const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
          types: ["address"],
          componentRestrictions: { country: ["mx", "hn", "sv", "bz"] },
        })
        
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace()
          if (place.formatted_address) {
            const validation = validateLocation(place.formatted_address)
            if (validation.valid) {
              setValue("location", place.formatted_address)
            } else {
              toast.error(validation.message || "Ubicación no permitida")
              setValue("location", "")
            }
          }
        })
      } catch (error) {
        console.error("Error inicializando Google Maps Autocomplete:", error)
        toast.error("Error al inicializar el autocompletado. Puedes escribir la dirección manualmente.")
      }
    }
  }, [mapLoaded, setValue])

  // Calcular litros basado en metros cuadrados y tipo de pintura
  useEffect(() => {
    if (squareMeters && paintType && PAINT_YIELDS[paintType as PaintType]) {
      const squareMetersNum = parseFloat(squareMeters)
      const paintYield = PAINT_YIELDS[paintType as PaintType].yield
      if (!isNaN(squareMetersNum) && squareMetersNum > 0) {
        const calculated = Math.ceil(squareMetersNum / paintYield)
        setCalculatedLiters(calculated)
        setValue("liters", calculated.toString())
      }
    } else {
      setCalculatedLiters(null)
    }
  }, [squareMeters, paintType, setValue])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])

    // Create preview URLs
    files.forEach((file) => {
      const url = URL.createObjectURL(file)
      setPreviewUrls((prev) => [...prev, url])
    })
  }

  const removeFile = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index])
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ProjectFormValues) => {
    setIsLoading(true)

    if (customOnSubmit) {
      try {
        await customOnSubmit(data)
      } catch (error) {
        console.error("Error en onSubmit personalizado:", error)
        setIsLoading(false)
      }
    } else {
      // Comportamiento por defecto
      setTimeout(() => {
        console.log("[v0] Project submission:", data, uploadedFiles)
        toast.success(isEditMode ? "Proyecto actualizado exitosamente. Será revisado nuevamente." : "Proyecto enviado exitosamente. Será revisado en breve.")
        router.push("/contractor/projects")
        setIsLoading(false)
      }, 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Información Básica
          </CardTitle>
          <CardDescription>Datos generales del proyecto de pintura</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Nombre del proyecto *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Pintura Edificio Reforma 123"
              {...register("name")}
              disabled={isLoading}
              className="h-11"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              Ubicación *
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Busca una dirección o lugar..."
              {...register("location")}
              disabled={isLoading}
              className="h-11"
              ref={autocompleteRef}
            />
            {errors.location && <p className="text-sm text-red-600">{errors.location.message}</p>}
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              {typeof window !== "undefined" && (window as any).google?.maps?.places 
                ? "Escribe para buscar direcciones con Google Maps" 
                : "Escribe la dirección completa manualmente"}
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-2">
              <p className="text-xs font-semibold text-foreground mb-1">Ubicaciones permitidas:</p>
              <p className="text-xs text-muted-foreground">
                <strong>Países:</strong> Honduras, El Salvador, Belize
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>México:</strong> Coatzacoalcos, Minatitlán, Aguascalientes, Guerrero, Lázaro Cárdenas, CDMX
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Especificaciones Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Especificaciones Técnicas
          </CardTitle>
          <CardDescription>Medidas y cantidades del proyecto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="squareMeters" className="text-base flex items-center gap-2">
                <Ruler className="h-4 w-4 text-slate-500" />
                Metros cuadrados aproximados *
              </Label>
              <div className="relative">
                <Input
                  id="squareMeters"
                  type="number"
                  placeholder="500"
                  {...register("squareMeters")}
                  disabled={isLoading}
                  className="h-11 pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">m²</span>
              </div>
              {errors.squareMeters && <p className="text-sm text-red-600">{errors.squareMeters.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paintType" className="text-base flex items-center gap-2">
                <Droplets className="h-4 w-4 text-slate-500" />
                Tipo de pintura (opcional)
              </Label>
              <Select
                value={paintType || ""}
                onValueChange={(value) => {
                  setValue("paintType", value)
                  setSelectedPaint(value as PaintType)
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecciona el tipo de pintura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vinimex">Vinimex (Interior - 12 m²/L)</SelectItem>
                  <SelectItem value="pro-mil">Pro-mil (Interior - 10 m²/L)</SelectItem>
                  <SelectItem value="prima">Prima (Interior - 8 m²/L)</SelectItem>
                  <SelectItem value="cam-vinimex">CAM Vinimex (Exterior - 10 m²/L)</SelectItem>
                  <SelectItem value="acrimate">Acrimate (Exterior - 12 m²/L)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculadora de rendimiento */}
          {selectedPaint && squareMeters && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Calculator className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Cálculo automático de litros
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Rendimiento de <strong>{PAINT_YIELDS[selectedPaint].name}</strong>: {PAINT_YIELDS[selectedPaint].yield} m² por litro
                    </p>
                    {calculatedLiters && (
                      <p className="text-base font-bold text-primary mt-2">
                        Litros estimados: {calculatedLiters} L
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="liters" className="text-base flex items-center gap-2">
              <Droplets className="h-4 w-4 text-slate-500" />
              Litros estimados *
            </Label>
            <div className="relative">
              <Input
                id="liters"
                type="number"
                placeholder={calculatedLiters ? calculatedLiters.toString() : "150"}
                {...register("liters")}
                disabled={isLoading}
                className="h-11 pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">lts</span>
            </div>
            {errors.liters && <p className="text-sm text-red-600">{errors.liters.message}</p>}
            {calculatedLiters && (
              <p className="text-xs text-muted-foreground">
                Valor calculado automáticamente. Puedes ajustarlo manualmente si es necesario.
              </p>
            )}
          </div>

          {/* Información de rendimientos */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-start gap-2 mb-3">
              <Info className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-sm font-semibold text-foreground">Rendimientos de pinturas</p>
            </div>
            <div className="grid gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interior:</span>
              </div>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                  <span>Vinimex</span>
                  <span className="font-medium">12 m²/L</span>
                </div>
                <div className="flex justify-between">
                  <span>Pro-mil</span>
                  <span className="font-medium">10 m²/L</span>
                </div>
                <div className="flex justify-between">
                  <span>Prima</span>
                  <span className="font-medium">8 m²/L</span>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-muted-foreground">Exterior:</span>
              </div>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                  <span>CAM Vinimex</span>
                  <span className="font-medium">10 m²/L</span>
                </div>
                <div className="flex justify-between">
                  <span>Acrimate</span>
                  <span className="font-medium">12 m²/L</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">
              Descripción adicional (opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Detalles adicionales: tipo de superficie, colores, acabados especiales..."
              rows={4}
              {...register("description")}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Evidencia Fotográfica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            Evidencia Fotográfica
          </CardTitle>
          <CardDescription>Sube fotos del proyecto antes, durante o después del trabajo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <span className="text-base font-medium text-slate-700 mb-1">Haz clic para subir fotos</span>
                <span className="text-sm text-slate-500">o arrastra las imágenes aquí</span>
                <span className="text-xs text-slate-400 mt-2">PNG, JPG hasta 10MB por archivo</span>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-700">Imágenes cargadas ({uploadedFiles.length})</p>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200">
                        <img
                          src={previewUrls[index] || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="mt-1 text-xs text-slate-600 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Tip:</strong> Incluye fotos claras del proyecto para acelerar el proceso de validación.
              Recomendamos subir al menos 3 imágenes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Información y Botones */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-6">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">¿Qué sucede después?</p>
              <p className="text-sm text-blue-800">
                Tu proyecto será revisado y validado por nuestro equipo en un plazo de 24-48 horas. Recibirás una
                notificación por correo y podrás ver el estado en tu panel de proyectos.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto bg-white"
              onClick={() => router.back()}
              disabled={isLoading}
              size="lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (isEditMode ? "Actualizando proyecto..." : "Enviando proyecto...") : submitLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
