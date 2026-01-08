"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getContractorByEmail } from "@/lib/supabase/contractors"
import { signInContractor } from "@/lib/supabase/auth"
import { useTranslation } from "@/hooks/use-translation"
import { useSelectedCountry } from "@/components/country-selector"
import { getLanguageByCountry } from "@/lib/translations"

// Función para crear schema dinámico según idioma
function createLoginSchema(language: 'es' | 'en') {
  const t = language === 'en' 
    ? { emailInvalid: "Enter a valid email address", passwordMin: "Password must be at least 6 characters" }
    : { emailInvalid: "Ingresa un correo electrónico válido", passwordMin: "La contraseña debe tener al menos 6 caracteres" }
  
  return z.object({
    email: z.string().email(t.emailInvalid),
    password: z.string().min(6, t.passwordMin),
  })
}

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const t = useTranslation()
  const selectedCountry = useSelectedCountry()
  const language = getLanguageByCountry(selectedCountry)
  const loginSchema = createLoginSchema(language)
  
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)

    try {
      // Opción 1: Usar Supabase Auth (recomendado)
      // const { user } = await signInContractor(data.email, data.password)
      // localStorage.setItem("contractorId", user.id)

      // Opción 2: Buscar contratista por email (si no usas Auth)
      const contractor = await getContractorByEmail(data.email)
      
      if (!contractor) {
        toast.error(t.login.invalidCredentials)
        setIsLoading(false)
        return
      }

      // En producción, verificarías la contraseña aquí
      // Por ahora, solo guardamos el ID
      localStorage.setItem("contractorId", contractor.id)
      localStorage.setItem("contractorEmail", contractor.email)

      toast.success(t.login.success)
      router.push("/contractor/dashboard")
    } catch (error: any) {
      console.error("Error logging in:", error)
      toast.error(error.message || t.login.error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.login.title}</CardTitle>
        <CardDescription>{t.login.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.login.email}</Label>
            <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} disabled={isLoading} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.login.password}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              {t.login.forgotPassword}
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? t.login.loggingIn : t.login.loginButton}
          </Button>

          <div className="text-center text-sm text-slate-600">
            {t.login.noAccount}{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              {t.login.registerLink}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
