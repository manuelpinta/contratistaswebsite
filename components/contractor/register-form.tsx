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

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  phone: z.string().min(10, "Ingresa un número de teléfono válido"),
  rfc: z.string()
    .min(12, "El RFC debe tener al menos 12 caracteres")
    .max(13, "El RFC no puede tener más de 13 caracteres")
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, "Formato de RFC inválido (ejemplo: ABC123456DEF)"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)

    // Simular registro
    setTimeout(() => {
      console.log("[v0] Registration attempt:", data)
      toast.success("Cuenta creada exitosamente")
      router.push("/contractor/dashboard")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
        <CardDescription>Regístrate para comenzar a registrar tus proyectos y participar en beneficios</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" type="text" placeholder="Juan Pérez" {...register("name")} disabled={isLoading} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} disabled={isLoading} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" type="tel" placeholder="5512345678" {...register("phone")} disabled={isLoading} />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfc">RFC *</Label>
            <Input 
              id="rfc" 
              type="text" 
              placeholder="ABC123456DEF" 
              {...register("rfc")} 
              disabled={isLoading}
              className="uppercase"
              maxLength={13}
            />
            {errors.rfc && <p className="text-sm text-red-600">{errors.rfc.message}</p>}
            <p className="text-xs text-muted-foreground">Formato: 3-4 letras, 6 dígitos, 3 caracteres alfanuméricos</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
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
            {isLoading ? "Creando cuenta..." : "Registrarme"}
          </Button>

          <div className="text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Iniciar sesión
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
