"use client"

import { useState, useEffect } from "react"
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
import { getContractorById, updateContractor } from "@/lib/supabase/contractors"
import { useContractorProjects } from "@/hooks/use-projects"

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
  const [contractorId, setContractorId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    async function loadContractor() {
      const id = localStorage.getItem("contractorId")
      if (id) {
        setContractorId(id)
        try {
          const contractor = await getContractorById(id)
          reset({
            name: contractor.name,
            email: contractor.email,
            phone: contractor.phone,
            company: "",
            address: "",
            bio: "",
          })
        } catch (error) {
          console.error("Error loading contractor:", error)
        }
      }
    }
    loadContractor()
  }, [reset])

  const onSubmit = async (data: ProfileFormValues) => {
    if (!contractorId) {
      toast.error("No se pudo identificar tu cuenta")
      return
    }

    setIsLoading(true)

    try {
      await updateContractor(contractorId, {
        name: data.name,
        email: data.email,
        phone: data.phone,
      })
      toast.success("Perfil actualizado exitosamente")
      setIsEditing(false)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(error.message || "Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
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
          <ProfileStats contractorId={contractorId} />
        </CardContent>
      </Card>
    </div>
  )
}

// Componente separado para las estadísticas
function ProfileStats({ contractorId }: { contractorId: string | null }) {
  const { projects, loading } = useContractorProjects(contractorId)
  
  const totalProjects = projects.length
  const validatedProjects = projects.filter((p) => p.status === "validated").length
  const totalTickets = validatedProjects // Cada proyecto validado = 1 boleto

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">
          {loading ? "..." : totalProjects}
        </div>
        <div className="text-sm text-slate-600">Proyectos Registrados</div>
      </div>
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">
          {loading ? "..." : validatedProjects}
        </div>
        <div className="text-sm text-slate-600">Proyectos Validados</div>
      </div>
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="text-2xl font-bold text-red-600">
          {loading ? "..." : totalTickets}
        </div>
        <div className="text-sm text-slate-600">Boletos de Rifa</div>
      </div>
    </div>
  )
}
