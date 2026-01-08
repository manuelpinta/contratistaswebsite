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
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects"
import { uploadProjectImages, uploadFileToStorage, getPublicUrl } from "@/lib/supabase/project-images"
import { useTranslation } from "@/hooks/use-translation"
import { getLanguageByCountry } from "@/lib/translations"
import { useContractorCountry } from "@/hooks/use-contractor-country"
import { getCountryConfig, type CountryCode } from "@/lib/countries"
import { getContractorById } from "@/lib/supabase/contractors"

// Extender el tipo Window para incluir Google Maps
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, options?: { 
            types?: string[]
            componentRestrictions?: { country: string | string[] }
            fields?: string[]
          }) => {
            addListener: (event: string, callback: () => void) => void
            getPlace: () => {
              formatted_address?: string
              geometry?: {
                location: {
                  lat: () => number
                  lng: () => number
                }
              }
              address_components?: Array<{
                long_name: string
                short_name: string
                types: string[]
              }>
            }
          }
        }
        event: {
          clearInstanceListeners: (instance: any) => void
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

// Función para validar ubicación permitida según el país del contratista
function validateLocation(location: string, language: 'es' | 'en', contractorCountryCode: CountryCode | null, contractorCityCode: string | null): { valid: boolean; message?: string } {
  const t = language === 'en'
    ? {
        enterValidLocation: "Enter a valid location",
        locationNotAllowed: "Location not allowed",
        countryOnly: (country: string) => `Only locations in ${country} are permitted`,
        mexicoCitiesOnly: (cities: string) => `In Mexico only these cities are allowed: ${cities}`,
        cityOnly: (city: string, country: string) => `Only locations in ${city}, ${country} are permitted`,
      }
    : {
        enterValidLocation: "Ingresa una ubicación válida",
        locationNotAllowed: "Ubicación no permitida",
        countryOnly: (country: string) => `Solo se permiten ubicaciones en ${country}`,
        mexicoCitiesOnly: (cities: string) => `En México solo se permiten estas ciudades: ${cities}`,
        cityOnly: (city: string, country: string) => `Solo se permiten ubicaciones en ${city}, ${country}`,
      }
  
  if (!location || location.length < 3) {
    return { valid: false, message: t.enterValidLocation }
  }
  
  // Si no hay país del contratista, no validar (fallback a validación anterior)
  if (!contractorCountryCode) {
    return { valid: true } // Permitir si no hay país definido (compatibilidad)
  }
  
  const locationLower = location.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
  
  const countryConfig = getCountryConfig(contractorCountryCode)
  if (!countryConfig) {
    return { valid: false, message: t.locationNotAllowed }
  }
  
  // Obtener nombres del país y ciudades permitidas
  const countryNames: Record<CountryCode, string[]> = {
    "MX": ["méxico", "mexico", "mx", "df", "distrito federal", "cdmx"],
    "HN": ["honduras", "tegucigalpa", "san pedro sula", "la ceiba", "comayagua"],
    "SV": ["el salvador", "salvador", "san salvador", "santa ana", "san miguel"],
    "BZ": ["belize", "belmopan", "belice", "belize city"]
  }
  
  const countryNameList = countryNames[contractorCountryCode] || []
  const hasCountryMatch = countryNameList.some(name => locationLower.includes(name))
  
  // Si el país tiene ciudades específicas (México)
  if (contractorCountryCode === 'MX' && countryConfig.cities && countryConfig.cities.length > 0) {
    // Si el contratista tiene una ciudad específica, validar solo esa ciudad
    if (contractorCityCode) {
      const cityConfig = countryConfig.cities.find(c => c.code === contractorCityCode)
      if (cityConfig) {
        const cityName = cityConfig.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const cityVariations: Record<string, string[]> = {
          "ciudad de mexico": ["ciudad de mexico", "cdmx", "df", "distrito federal", "mexico df"],
          "coatzacoalcos": ["coatzacoalcos", "coatzacoalcos veracruz", "coatza"],
          "minatitlán": ["minatitlán", "minatitlan", "minatitlan veracruz"],
          "aguascalientes": ["aguascalientes", "aguascalientes ags"],
          "guerrero": ["guerrero", "acapulco", "chilpancingo"],
          "lázaro cárdenas": ["lázaro cárdenas", "lazaro cardenas", "lazaro cardenas michoacan"]
        }
        
        const cityLower = cityConfig.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const variations = cityVariations[cityLower] || [cityLower]
        const hasCityMatch = variations.some(v => locationLower.includes(v)) || locationLower.includes(cityLower)
        
        if (hasCountryMatch && hasCityMatch) {
          return { valid: true }
        }
        
        return { 
          valid: false, 
          message: t.cityOnly(cityConfig.name, countryConfig.name)
        }
      }
    }
    
    // Si no tiene ciudad específica pero es México, validar todas las ciudades permitidas
    if (hasCountryMatch) {
      const cityNames = countryConfig.cities.map(city => city.name.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""))
      
      const cityVariations: Record<string, string[]> = {
        "ciudad de mexico": ["ciudad de mexico", "cdmx", "df", "distrito federal", "mexico df"],
        "coatzacoalcos": ["coatzacoalcos", "coatzacoalcos veracruz", "coatza"],
        "minatitlán": ["minatitlán", "minatitlan", "minatitlan veracruz"],
        "aguascalientes": ["aguascalientes", "aguascalientes ags"],
        "guerrero": ["guerrero", "acapulco", "chilpancingo"],
        "lázaro cárdenas": ["lázaro cárdenas", "lazaro cardenas", "lazaro cardenas michoacan"]
      }
      
      const hasAllowedCity = cityNames.some(city => {
        const variations = cityVariations[city] || [city]
        return variations.some(v => locationLower.includes(v)) || locationLower.includes(city)
      })
      
      if (hasAllowedCity) {
        return { valid: true }
      }
      
      const allowedCities = countryConfig.cities.map(c => c.name).join(", ")
      return { 
        valid: false, 
        message: t.mexicoCitiesOnly(allowedCities)
      }
    }
  } else {
    // Para otros países, solo validar que esté en el país
    if (hasCountryMatch) {
      return { valid: true }
    }
  }
  
  return { 
    valid: false, 
    message: t.countryOnly(countryConfig.name)
  }
}

// Función para crear schema según idioma y país del contratista
function createProjectSchema(language: 'es' | 'en', contractorCountryCode: CountryCode | null, contractorCityCode: string | null) {
  const t = language === 'en'
    ? {
        nameMin: "Name must be at least 3 characters",
        enterValidLocation: "Enter a valid location",
        locationNotAllowed: "Location not allowed",
        enterSquareMeters: "Enter square meters",
        enterLiters: "Enter estimated liters",
      }
    : {
        nameMin: "El nombre debe tener al menos 3 caracteres",
        enterValidLocation: "Ingresa una ubicación válida",
        locationNotAllowed: "Ubicación no permitida",
        enterSquareMeters: "Ingresa los metros cuadrados",
        enterLiters: "Ingresa los litros estimados",
      }
  
  return z.object({
    name: z.string().min(3, t.nameMin),
    location: z.string()
      .min(5, t.enterValidLocation)
      .refine((val) => {
        const validation = validateLocation(val, language, contractorCountryCode, contractorCityCode)
        return validation.valid
      }, (val) => {
        const validation = validateLocation(val, language, contractorCountryCode, contractorCityCode)
        return { message: validation.message || t.locationNotAllowed }
      }),
    squareMeters: z.string().min(1, t.enterSquareMeters),
    paintType: z.string().optional(),
    liters: z.string().min(1, t.enterLiters),
    description: z.string().optional(),
  })
}

// Rendimientos de pinturas (m² por litro)
const PAINT_YIELDS = {
  "vinimex": { name: "Vinimex", yield: 12, category: "Interior" },
  "pro-mil": { name: "Pro-mil", yield: 10, category: "Interior" },
  "prima": { name: "Prima", yield: 8, category: "Interior" },
  "cam-vinimex": { name: "CAM Vinimex", yield: 10, category: "Exterior" },
  "acrimate": { name: "Acrimate", yield: 12, category: "Exterior" },
} as const

type PaintType = keyof typeof PAINT_YIELDS

type ProjectFormValues = z.infer<ReturnType<typeof createProjectSchema>>

interface ExistingImage {
  id: string
  url: string
  order: number
}

interface NewProjectFormProps {
  initialData?: Partial<ProjectFormValues>
  onSubmit?: (data: ProjectFormValues) => void | Promise<void>
  submitLabel?: string
  isEditMode?: boolean
  projectId?: string // ID del proyecto en modo edición
  existingImages?: ExistingImage[] // Imágenes existentes en modo edición
  onImageDelete?: (imageId: string) => Promise<void> // Callback para eliminar imagen
}

export function NewProjectForm({ 
  initialData, 
  onSubmit: customOnSubmit, 
  submitLabel,
  isEditMode = false,
  projectId,
  existingImages = [],
  onImageDelete
}: NewProjectFormProps = {}) {
  const t = useTranslation()
  // Usar el país del contratista si está logueado, si no, null (español por defecto)
  const contractorCountry = useContractorCountry()
  const language = getLanguageByCountry(contractorCountry)
  const locale = language === 'en' ? 'en-US' : 'es-MX'
  const defaultSubmitLabel = t.newProject.submit
  
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedPaint, setSelectedPaint] = useState<PaintType | "">("")
  const [calculatedLiters, setCalculatedLiters] = useState<number | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [contractorId, setContractorId] = useState<string | null>(null)
  const [contractorCountryCode, setContractorCountryCode] = useState<CountryCode | null>(null)
  const [contractorCityCode, setContractorCityCode] = useState<string | null>(null)
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const autocompleteRef = useRef<HTMLInputElement>(null)
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null)
  const router = useRouter()
  const { create } = useCreateProject()
  const { update } = useUpdateProject()

  // Marcar como montado solo en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Obtener contractorId y cargar datos del contratista solo en el cliente
    if (!mounted) return
    
    async function loadContractorData() {
      const storedId = localStorage.getItem("contractorId")
      if (storedId) {
        setContractorId(storedId)
        try {
          const contractor = await getContractorById(storedId)
          if (contractor.country_code) {
            setContractorCountryCode(contractor.country_code as CountryCode)
          }
          if (contractor.city_code) {
            setContractorCityCode(contractor.city_code)
          }
        } catch (error) {
          console.error("Error loading contractor data:", error)
        }
      }
    }
    loadContractorData()
  }, [mounted])
  
  // Crear schema con el país del contratista (se actualiza cuando cambia el país)
  // Durante SSR, usar null para mantener consistencia
  const projectSchema = createProjectSchema(language, mounted ? contractorCountryCode : null, mounted ? contractorCityCode : null)

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
  
  const finalSubmitLabel = submitLabel || defaultSubmitLabel

  // Cargar datos iniciales si se proporcionan (solo en cliente)
  useEffect(() => {
    if (mounted && initialData) {
      reset(initialData)
      if (initialData.paintType) {
        setSelectedPaint(initialData.paintType as PaintType)
      }
    }
  }, [mounted, initialData, reset])

  const squareMeters = watch("squareMeters")
  const paintType = watch("paintType")

  // Cargar Google Maps Places API (se recarga cuando cambia el país del contratista)
  useEffect(() => {
    if (typeof window === "undefined") return
    // Esperar a que se cargue el país del contratista (pero no bloquear si no hay)
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    // Si no hay API key, no intentar cargar Google Maps
    if (!apiKey) {
      console.log("Google Maps API key no configurada. El campo funcionará como texto normal.")
      return
    }

    // Verificar si el script ya existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Si el script ya existe, destruir cualquier instancia anterior primero
      if (autocompleteInstanceRef.current) {
        try {
          window.google?.maps?.event?.clearInstanceListeners(autocompleteInstanceRef.current)
        } catch (e) {
          console.warn("Error limpiando instancia anterior:", e)
        }
        autocompleteInstanceRef.current = null
      }
      
      // Si el script ya existe, solo inicializar autocomplete
      if (window.google?.maps?.places && autocompleteRef.current) {
        // Pequeño delay para asegurar que el DOM esté listo y destruir instancia anterior
        setTimeout(() => {
          initializeAutocomplete()
        }, 150)
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
    // Restringir búsqueda al país del contratista si está disponible
    const countryRestriction = contractorCountryCode 
      ? (contractorCountryCode === 'MX' ? 'mx' : contractorCountryCode.toLowerCase())
      : undefined
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=${language}${countryRestriction ? `&region=${countryRestriction}` : ''}`
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
      toast.error(t.newProject.mapsError)
    }
    
    document.head.appendChild(script)

    function initializeAutocomplete() {
      if (!autocompleteRef.current || !window.google?.maps?.places) return
      
      try {
        // Destruir instancia anterior si existe - CRÍTICO para evitar múltiples instancias
        if (autocompleteInstanceRef.current) {
          try {
            // Limpiar todos los listeners
            window.google.maps.event.clearInstanceListeners(autocompleteInstanceRef.current)
          } catch (e) {
            console.warn("Error limpiando listeners:", e)
          }
          autocompleteInstanceRef.current = null
        }
        
        // Limpiar completamente el input para evitar conflictos
        // Clonar y reemplazar el input para remover completamente cualquier autocomplete adjunto
        if (autocompleteRef.current) {
          const input = autocompleteRef.current
          const parent = input.parentNode
          const nextSibling = input.nextSibling
          const value = input.value
          const id = input.id
          const className = input.className
          const placeholder = input.placeholder
          const disabled = input.disabled
          const required = input.required
          
          // Crear un nuevo input completamente limpio
          const newInput = document.createElement('input')
          newInput.type = input.type
          newInput.id = id
          newInput.className = className
          newInput.placeholder = placeholder || ''
          newInput.value = value
          newInput.disabled = disabled
          newInput.required = required
          newInput.setAttribute('autocomplete', 'off')
          
          // Copiar todos los atributos data-* si existen
          Array.from(input.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              newInput.setAttribute(attr.name, attr.value)
            }
          })
          
          // Reemplazar el input en el DOM
          if (parent) {
            if (nextSibling) {
              parent.insertBefore(newInput, nextSibling)
            } else {
              parent.appendChild(newInput)
            }
            parent.removeChild(input)
          }
          
          // Actualizar la referencia
          autocompleteRef.current = newInput
          
          console.log("Input reemplazado para limpiar autocomplete anterior")
        }
        
        // Restringir búsqueda al país del contratista
        const countryRestriction = contractorCountryCode 
          ? (contractorCountryCode === 'MX' ? 'mx' : contractorCountryCode.toLowerCase())
          : undefined
        
        if (!countryRestriction) {
          console.warn("No hay país del contratista, usando restricción por defecto")
        }
        
        // Crear nueva instancia con las restricciones correctas
        // IMPORTANTE: componentRestrictions debe ser un string o array de strings
        const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
          types: ["address"],
          componentRestrictions: countryRestriction ? { country: countryRestriction } : { country: ["mx", "hn", "sv", "bz"] },
          fields: ["formatted_address", "geometry", "address_components"]
        })
        
        console.log("Autocomplete inicializado con restricción de país:", countryRestriction || "todos los países permitidos")
        
        // Guardar referencia
        autocompleteInstanceRef.current = autocomplete
        
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace()
          if (place.formatted_address) {
            const validation = validateLocation(place.formatted_address, language, contractorCountryCode, contractorCityCode)
            if (validation.valid) {
              setValue("location", place.formatted_address)
            } else {
              toast.error(validation.message || t.newProject.locationNotAllowed)
              setValue("location", "")
            }
          }
        })
      } catch (error) {
        console.error("Error inicializando Google Maps Autocomplete:", error)
        toast.error(t.newProject.autocompleteError)
      }
    }
    
    return () => {
      // Cleanup: destruir instancia del autocomplete
      if (autocompleteInstanceRef.current) {
        try {
          window.google?.maps?.event?.clearInstanceListeners(autocompleteInstanceRef.current)
        } catch (e) {
          console.error("Error limpiando autocomplete:", e)
        }
        autocompleteInstanceRef.current = null
      }
    }
  }, [contractorCountryCode, contractorCityCode, language, mapLoaded, setValue, t])

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

  const handleDeleteExistingImage = async (imageId: string) => {
    if (!onImageDelete) return
    
    if (!confirm(t.newProject.deleteImageConfirm)) {
      return
    }

    setDeletingImageId(imageId)
    try {
      await onImageDelete(imageId)
      toast.success(t.newProject.imageDeleted)
    } catch (error: any) {
      console.error("Error deleting image:", error)
      toast.error(error.message || t.newProject.imageDeleteError)
    } finally {
      setDeletingImageId(null)
    }
  }

  const onSubmit = async (data: ProjectFormValues) => {
    if (!contractorId) {
      toast.error(t.newProject.accountError)
      return
    }

    setIsLoading(true)

    try {
      if (customOnSubmit) {
        await customOnSubmit(data)
      } else if (isEditMode && initialData) {
        // Modo edición - actualizar proyecto existente
        // Nota: Necesitarías pasar el projectId como prop
        toast.error("La edición requiere el ID del proyecto. Usa el componente EditProjectForm.")
        setIsLoading(false)
      } else {
        // Crear nuevo proyecto
        const projectData = {
          contractor_id: contractorId,
          name: data.name,
          location: data.location,
          square_meters: parseInt(data.squareMeters),
          liters: parseInt(data.liters),
          paint_type: data.paintType || null,
          description: data.description || null,
          status: "pending" as const,
        }

        const newProject = await create(projectData)

        // Subir imágenes si hay archivos (solo en modo creación)
        if (!isEditMode && uploadedFiles.length > 0 && newProject) {
          try {
            const imageUploads = await Promise.all(
              uploadedFiles.map(async (file, index) => {
                const timestamp = Date.now()
                const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
                const filePath = `${contractorId}/${newProject.id}/${timestamp}-${index}-${sanitizedFileName}`
                
                // Subir archivo a Storage
                await uploadFileToStorage("project-images", filePath, file)
                
                // Obtener URL pública
                const publicUrl = getPublicUrl("project-images", filePath)
                
                return {
                  project_id: newProject.id,
                  image_url: publicUrl,
                  image_order: index,
                }
              })
            )

            await uploadProjectImages(imageUploads)
            toast.success(t.newProject.projectCreated(uploadedFiles.length))
          } catch (imageError: any) {
            console.error("Error uploading images:", imageError)
            toast.warning(`${t.newProject.imagesUploadError}: ${imageError.message || 'Error desconocido'}`)
          }
        }

        // En modo edición, subir nuevas imágenes si las hay
        if (isEditMode && projectId && uploadedFiles.length > 0) {
          try {
            // Obtener el orden máximo actual para continuar desde ahí
            const maxOrder = existingImages.length > 0 
              ? Math.max(...existingImages.map(img => img.order)) + 1 
              : 0

            const imageUploads = await Promise.all(
              uploadedFiles.map(async (file, index) => {
                const timestamp = Date.now()
                const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
                const filePath = `${contractorId}/${projectId}/${timestamp}-${index}-${sanitizedFileName}`
                
                // Subir archivo a Storage
                await uploadFileToStorage("project-images", filePath, file)
                
                // Obtener URL pública
                const publicUrl = getPublicUrl("project-images", filePath)
                
                return {
                  project_id: projectId,
                  image_url: publicUrl,
                  image_order: maxOrder + index,
                }
              })
            )

            await uploadProjectImages(imageUploads)
            toast.success(t.newProject.newImagesAdded(uploadedFiles.length))
          } catch (imageError: any) {
            console.error("Error uploading new images:", imageError)
            toast.warning(`${t.newProject.newImagesUploadError}: ${imageError.message || 'Error desconocido'}`)
          }
        }

        toast.success(t.newProject.success)
        router.push("/contractor/projects")
      }
    } catch (error: any) {
      console.error("Error submitting project:", error)
      toast.error(error.message || t.newProject.error)
    } finally {
      setIsLoading(false)
    }
  }

  // No renderizar el formulario hasta que esté montado para evitar errores de hidratación
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t.newProject.basicInfo}
          </CardTitle>
          <CardDescription>{t.newProject.basicInfoDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              {t.newProject.projectName} *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t.newProject.projectNamePlaceholder}
              {...register("name")}
              disabled={isLoading}
              className="h-11"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              {t.newProject.location} *
            </Label>
            <Input
              id="location"
              type="text"
              placeholder={t.newProject.locationPlaceholder}
              {...register("location")}
              disabled={isLoading}
              className="h-11"
              ref={autocompleteRef}
            />
            {errors.location && <p className="text-sm text-red-600">{errors.location.message}</p>}
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              {typeof window !== "undefined" && (window as any).google?.maps?.places 
                ? t.newProject.locationHint 
                : t.newProject.locationHintManual}
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-2">
              <p className="text-xs font-semibold text-foreground mb-1">{t.newProject.allowedLocations}</p>
              <p className="text-xs text-muted-foreground">
                {contractorCountryCode 
                  ? (() => {
                      const countryConfig = getCountryConfig(contractorCountryCode)
                      if (!countryConfig) return t.newProject.allowedLocationsDesc
                      
                      // Si el contratista tiene una ciudad específica (México)
                      if (contractorCountryCode === 'MX' && contractorCityCode) {
                        const cityConfig = countryConfig.cities?.find(c => c.code === contractorCityCode)
                        if (cityConfig) {
                          return language === 'en' 
                            ? `Only locations in ${cityConfig.name}, ${countryConfig.name} are permitted`
                            : `Solo se permiten ubicaciones en ${cityConfig.name}, ${countryConfig.name}`
                        }
                      }
                      
                      // Si es México con ciudades permitidas
                      if (contractorCountryCode === 'MX' && countryConfig.cities && countryConfig.cities.length > 0) {
                        const cities = countryConfig.cities.map(c => c.name).join(", ")
                        return language === 'en'
                          ? `In ${countryConfig.name} only these cities are allowed: ${cities}`
                          : `En ${countryConfig.name} solo se permiten estas ciudades: ${cities}`
                      }
                      
                      // Para otros países, solo el país
                      return language === 'en'
                        ? `Only locations in ${countryConfig.name} are permitted`
                        : `Solo se permiten ubicaciones en ${countryConfig.name}`
                    })()
                  : t.newProject.allowedLocationsDesc}
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
            {t.newProject.measurements}
          </CardTitle>
          <CardDescription>{t.newProject.measurements}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="squareMeters" className="text-base flex items-center gap-2">
                <Ruler className="h-4 w-4 text-slate-500" />
                {t.newProject.squareMetersApprox} *
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
                {t.newProject.paintType} (opcional)
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
                  <SelectValue placeholder={t.newProject.selectPaintType} />
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
                      {t.newProject.autoCalculation}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Yield of' : 'Rendimiento de'} <strong>{PAINT_YIELDS[selectedPaint].name}</strong>: {PAINT_YIELDS[selectedPaint].yield} m²/L
                    </p>
                    {calculatedLiters && (
                      <p className="text-base font-bold text-primary mt-2">
                        {t.newProject.estimatedLiters}: {calculatedLiters} L
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
              {t.newProject.estimatedLiters} *
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
                {t.newProject.estimatedLitersDesc}
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
              {t.newProject.description}
            </Label>
            <Textarea
              id="description"
              placeholder={t.newProject.descriptionPlaceholder}
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
            {t.newProject.photos}
          </CardTitle>
          <CardDescription>
            {t.newProject.photosDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Imágenes existentes (solo en modo edición) */}
          {isEditMode && existingImages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">{language === 'en' ? 'Current images' : 'Imágenes actuales'} ({existingImages.length})</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200">
                      <img
                        src={img.url || "/placeholder.svg"}
                        alt={`Imagen ${img.order + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id)}
                      disabled={isLoading || deletingImageId === img.id}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      {deletingImageId === img.id ? (
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                    <p className="mt-1 text-xs text-slate-600 text-center">{language === 'en' ? 'Image' : 'Imagen'} {img.order + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Área para subir nuevas imágenes */}
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
                <span className="text-base font-medium text-slate-700 mb-1">
                  {isEditMode 
                    ? (language === 'en' ? "Add more photos" : "Agregar más fotos")
                    : (language === 'en' ? "Click to upload photos" : "Haz clic para subir fotos")}
                </span>
                <span className="text-sm text-slate-500">{language === 'en' ? "or drag images here" : "o arrastra las imágenes aquí"}</span>
                <span className="text-xs text-slate-400 mt-2">PNG, JPG hasta 10MB por archivo</span>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-700">
                    {isEditMode 
                      ? (language === 'en' ? "New images" : "Nuevas imágenes")
                      : (language === 'en' ? "Uploaded images" : "Imágenes cargadas")} ({uploadedFiles.length})
                  </p>
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
              <strong>{language === 'en' ? 'Tip:' : 'Tip:'}</strong> {language === 'en' 
                ? "Include clear photos of the project to speed up the validation process. We recommend uploading at least 3 images."
                : "Incluye fotos claras del proyecto para acelerar el proceso de validación. Recomendamos subir al menos 3 imágenes."}
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
              <p className="text-sm font-medium text-blue-900 mb-1">{language === 'en' ? "What happens next?" : "¿Qué sucede después?"}</p>
              <p className="text-sm text-blue-800">
                {language === 'en'
                  ? "Your project will be reviewed and validated by our team. You will receive a notification by email and can see the status in your projects panel."
                  : "Tu proyecto será revisado y validado por nuestro equipo. Recibirás una notificación por correo y podrás ver el estado en tu panel de proyectos."}
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
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              className="w-full sm:flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading}
              size="lg"
            >
              {isLoading 
                ? (isEditMode 
                    ? (language === 'en' ? "Updating project..." : "Actualizando proyecto...")
                    : t.newProject.submitting)
                : finalSubmitLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
