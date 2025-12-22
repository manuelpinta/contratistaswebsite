"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { User, Mail, Phone, MapPin, Building } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  phone: z.string().min(10, "Ingresa un número de teléfono válido"),
  company: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "Juan Pérez",
      email: "juan.perez@email.com",
      phone: "5512345678",
      company: "Pinturas JP",
      address: "Av. Principal 123, CDMX",
      bio: "Contratista con 10 años de experiencia en pintura residencial y comercial",
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)

    setTimeout(() => {
      console.log("[v0] Profile updated:", data)
      toast.success("Perfil actualizado exitosamente")
      setIsEditing(false)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Información Personal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Tus datos básicos de contacto</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                Nombre completo
              </Label>
              <Input
                id="name"
                type="text"
                {...register("name")}
                disabled={!isEditing || isLoading}
                className={!isEditing ? "bg-slate-50" : ""}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled={!isEditing || isLoading}
                className={!isEditing ? "bg-slate-50" : ""}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                Teléfono
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                disabled={!isEditing || isLoading}
                className={!isEditing ? "bg-slate-50" : ""}
              />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-500" />
                Empresa (opcional)
              </Label>
              <Input
                id="company"
                type="text"
                {...register("company")}
                disabled={!isEditing || isLoading}
                className={!isEditing ? "bg-slate-50" : ""}
                placeholder="Nombre de tu empresa"
              />
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                Dirección (opcional)
              </Label>
              <Input
                id="address"
                type="text"
                {...register("address")}
                disabled={!isEditing || isLoading}
                className={!isEditing ? "bg-slate-50" : ""}
                placeholder="Tu dirección"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Biografía (opcional)</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                disabled={!isEditing || isLoading}
                className={!isEditing ? "bg-slate-50" : ""}
                placeholder="Cuéntanos sobre tu experiencia..."
                rows={4}
              />
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </form>
      </Card>

      {/* Estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
          <CardDescription>Resumen de tu actividad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-slate-600">Proyectos Registrados</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-slate-600">Proyectos Validados</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">450</div>
              <div className="text-sm text-slate-600">Puntos Acumulados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
