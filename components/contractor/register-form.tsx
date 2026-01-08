"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createContractor } from "@/lib/supabase/contractors"
import { signUpContractor } from "@/lib/supabase/auth"
import { useSelectedCountry } from "@/components/country-selector"
import { COUNTRIES, getCountryConfig, type CountryCode, type CityCode } from "@/lib/countries"
import { useTranslation } from "@/hooks/use-translation"
import { getLanguageByCountry } from "@/lib/translations"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe, ChevronDown } from "lucide-react"

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

// Función para crear el schema dinámico según el país e idioma
function createRegisterSchema(countryCode: CountryCode | null, language: 'es' | 'en') {
  const country = getCountryConfig(countryCode || 'MX')
  
  const t = language === 'en'
    ? {
        nameMin: "Name must be at least 2 characters",
        emailInvalid: "Enter a valid email address",
        phoneMin: (min: number) => `Phone must have at least ${min} digits`,
        phoneMax: (max: number) => `Phone must have at most ${max} digits`,
        phoneInvalid: "Invalid phone format",
        passwordMin: "Password must be at least 6 characters",
        taxIdMin: (label: string, min: number) => `${label} must have at least ${min} characters`,
        taxIdMax: (label: string, max: number) => `${label} cannot have more than ${max} characters`,
        taxIdInvalid: (label: string) => `Invalid ${label} format`,
        cityRequired: "Select a city",
      }
    : {
        nameMin: "El nombre debe tener al menos 2 caracteres",
        emailInvalid: "Ingresa un correo electrónico válido",
        phoneMin: (min: number) => `El teléfono debe tener al menos ${min} dígitos`,
        phoneMax: (max: number) => `El teléfono debe tener máximo ${max} dígitos`,
        phoneInvalid: "Formato de teléfono inválido",
        passwordMin: "La contraseña debe tener al menos 6 caracteres",
        taxIdMin: (label: string, min: number) => `El ${label} debe tener al menos ${min} caracteres`,
        taxIdMax: (label: string, max: number) => `El ${label} no puede tener más de ${max} caracteres`,
        taxIdInvalid: (label: string) => `Formato de ${label} inválido`,
        cityRequired: "Selecciona una ciudad",
      }

  const baseSchema: any = {
    name: z.string().min(2, t.nameMin),
    email: z.string().email(t.emailInvalid),
    phone: z.string()
      .min(country.phoneFormat.minLength, t.phoneMin(country.phoneFormat.minLength))
      .max(country.phoneFormat.maxLength, t.phoneMax(country.phoneFormat.maxLength))
      .regex(country.phoneFormat.pattern, t.phoneInvalid),
    password: z.string().min(6, t.passwordMin),
  }

  // Agregar campo de tax ID según el país
  if (country.requiresTaxId) {
    baseSchema.taxId = z.string()
      .min(country.taxIdMinLength, t.taxIdMin(country.taxIdLabel, country.taxIdMinLength))
      .max(country.taxIdMaxLength, t.taxIdMax(country.taxIdLabel, country.taxIdMaxLength))
      .regex(country.taxIdPattern!, t.taxIdInvalid(country.taxIdLabel))
  } else {
    baseSchema.taxId = z.string().optional()
  }

  // Agregar campo de ciudad si el país tiene ciudades
  if (country.cities && country.cities.length > 0) {
    baseSchema.city = z.string().min(1, t.cityRequired)
  }

  return z.object(baseSchema)
}

type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>

export function RegisterForm() {
  const t = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [localSelectedCountry, setLocalSelectedCountry] = useState<CountryCode | null>(null)
  const router = useRouter()
  const selectedCountryFromStorage = useSelectedCountry()
  
  // Usar el país del storage o el local (el local tiene prioridad en esta página)
  const selectedCountry = localSelectedCountry || selectedCountryFromStorage
  const language = getLanguageByCountry(selectedCountry)

  // Cargar país del storage al montar
  useEffect(() => {
    if (selectedCountryFromStorage) {
      setLocalSelectedCountry(selectedCountryFromStorage)
    }
  }, [selectedCountryFromStorage])

  // Si no hay país seleccionado, usar México por defecto para mostrar el formulario
  const displayCountry = selectedCountry || 'MX'
  
  const handleCountryChange = (countryCode: CountryCode) => {
    setLocalSelectedCountry(countryCode)
    // Guardar en localStorage para persistencia
    localStorage.setItem("selectedCountry", countryCode)
    // Disparar evento para notificar a otros componentes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('countryChanged'))
    }
  }

  const country = getCountryConfig(displayCountry)
  const registerSchema = createRegisterSchema(selectedCountry, language)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const selectedCity = watch("city")
  
  // Resetear el formulario cuando cambie el país para aplicar las nuevas validaciones
  useEffect(() => {
    if (selectedCountry) {
      // Limpiar campos que dependen del país (ciudad, taxId)
      setValue("city", "")
      setValue("taxId", "")
      // El schema se actualiza automáticamente porque depende de selectedCountry
    }
  }, [selectedCountry, setValue])

  const onSubmit = async (data: RegisterFormValues) => {
    if (!selectedCountry) {
      toast.error(t.register.selectCountry || "Debes seleccionar un país")
      return
    }

    setIsLoading(true)

    try {
      // Preparar datos para crear el contratista
      // Nota: rfc es requerido en el esquema original, así que siempre lo enviamos
      const taxIdValue = data.taxId ? data.taxId.toUpperCase() : ""
      
      const contractor = await createContractor({
        name: data.name,
        email: data.email,
        phone: data.phone,
        rfc: taxIdValue, // Requerido en esquema original
        tax_id: data.taxId ? data.taxId.toUpperCase() : null, // Nuevo campo
        country_code: selectedCountry,
        city_code: data.city || null,
        // password_hash se manejaría con Supabase Auth o tu propio sistema
      })

      // Guardar ID del contratista en localStorage (ajustar según tu sistema de auth)
      localStorage.setItem("contractorId", contractor.id)
      localStorage.setItem("contractorEmail", contractor.email)

      toast.success(t.register.success)
      router.push("/contractor/dashboard")
    } catch (error: any) {
      console.error("Error registering:", error)
      // Mostrar mensaje de error más descriptivo
      const errorMessage = error?.message || error?.error?.message || t.register.error
      const duplicateError = language === 'en' 
        ? "This email is already registered"
        : "Este correo electrónico ya está registrado"
      const configError = language === 'en'
        ? "Configuration error. Please run the SQL migration in Supabase."
        : "Error de configuración. Por favor ejecuta la migración SQL en Supabase."
      
      toast.error(
        errorMessage.includes("duplicate") || errorMessage.includes("unique")
          ? duplicateError
          : errorMessage.includes("column") || errorMessage.includes("field")
          ? configError
          : errorMessage
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!country) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.register.title}</CardTitle>
        <CardDescription>{t.register.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Selector de País - Visible en la página de registro */}
          <div className="space-y-2">
            <Label htmlFor="country">{t.register.country || "País"} *</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between h-11"
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-500" />
                    {selectedCountry ? (
                      <>
                        <span className="text-xl">{getCountryFlag(selectedCountry)}</span>
                        <span>{COUNTRIES[selectedCountry].name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        {t.register.selectCountry || "Selecciona un país"}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full" align="start">
                {Object.values(COUNTRIES).map((countryOption) => (
                  <DropdownMenuItem
                    key={countryOption.code}
                    onClick={() => handleCountryChange(countryOption.code)}
                    className={selectedCountry === countryOption.code ? "bg-muted" : ""}
                  >
                    <span className="mr-2 text-xl">{getCountryFlag(countryOption.code)}</span>
                    <span>{countryOption.name}</span>
                    {selectedCountry === countryOption.code && (
                      <span className="ml-auto text-primary">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {!selectedCountry && (
              <p className="text-sm text-red-600">
                {t.register.selectCountry || "Debes seleccionar un país"}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{t.register.name}</Label>
            <Input id="name" type="text" placeholder="Juan Pérez" {...register("name")} disabled={isLoading} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.register.email}</Label>
            <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} disabled={isLoading} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.register.phone}</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder={country.phoneFormat.placeholder} 
              {...register("phone")} 
              disabled={isLoading}
              maxLength={country.phoneFormat.maxLength}
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          {country.cities && country.cities.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Select
                value={selectedCity || ""}
                onValueChange={(value) => setValue("city", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {country.cities.map((city) => (
                    <SelectItem key={city.code} value={city.code}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="taxId">
              {country.taxIdLabel} {country.requiresTaxId && "*"}
            </Label>
            <Input 
              id="taxId" 
              type="text" 
              placeholder={country.taxIdPlaceholder} 
              {...register("taxId")} 
              disabled={isLoading}
              className={country.requiresTaxId ? "uppercase" : ""}
              maxLength={country.taxIdMaxLength}
            />
            {errors.taxId && <p className="text-sm text-red-600">{errors.taxId.message}</p>}
            {country.requiresTaxId && (
              <p className="text-xs text-muted-foreground">
                {country.code === 'MX' && "Formato: 3-4 letras, 6 dígitos, 3 caracteres alfanuméricos"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.register.password}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? t.common.loading : t.register.registerButton}
          </Button>

          <div className="text-center text-sm text-slate-600">
            {t.register.hasAccount}{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              {t.register.loginLink}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
