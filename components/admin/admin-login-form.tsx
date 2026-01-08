"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Mail, Info } from "lucide-react"
import { getAdminByEmail } from "@/lib/supabase/admin"
import { toast } from "sonner"
import { useTranslation } from "@/hooks/use-translation"

export function AdminLoginForm() {
  const t = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!email || !password) {
        setError(t.admin.login.fillAllFields)
        setLoading(false)
        return
      }

      // Verificar si el email existe en la tabla admin_users
      const admin = await getAdminByEmail(email)
      
      if (!admin) {
        setError(t.admin.login.invalidCredentials)
        setLoading(false)
        return
      }

      // En producción, aquí verificarías la contraseña
      // Por ahora, solo verificamos que el admin exista
      
      // Guardar sesión en localStorage
      localStorage.setItem("adminAuth", "true")
      localStorage.setItem("adminEmail", admin.email)
      localStorage.setItem("adminId", admin.id)
      localStorage.setItem("adminName", admin.name)
      // Guardar país y ciudad del admin para filtrar proyectos
      if (admin.country_code) {
        localStorage.setItem("adminCountryCode", admin.country_code)
      }
      if (admin.city_code) {
        localStorage.setItem("adminCityCode", admin.city_code)
      }

      toast.success(t.admin.login.welcome(admin.name))
      router.push("/admin/dashboard")
    } catch (err: any) {
      console.error("Error logging in:", err)
      setError(err.message || t.admin.login.loginError)
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{t.admin.login.title}</CardTitle>
        <CardDescription>{t.admin.login.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.admin.login.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="admin@demo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.admin.login.password}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t.admin.login.entering : t.admin.login.enter}
          </Button>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              <strong className="block mb-1">{t.admin.login.demoAccess}</strong>
              <div className="space-y-0.5 text-xs">
                <div>
                  {t.admin.login.demoEmail}: <code className="bg-blue-100 px-1 rounded">admin@demo.com</code>
                </div>
                <div>
                  {t.admin.login.demoPassword}: <code className="bg-blue-100 px-1 rounded">Admin123!</code>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  )
}
