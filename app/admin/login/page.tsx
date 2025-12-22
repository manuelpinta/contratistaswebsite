import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { Header } from "@/components/header"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Portal de Validación</h1>
            <p className="text-slate-600">Acceso para administradores</p>
          </div>
          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
