import { LoginForm } from "@/components/contractor/login-form"
import { Header } from "@/components/header"

export const metadata = {
  title: "Iniciar Sesión | Portal del Contratista",
  description: "Accede a tu cuenta de contratista",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Portal del Contratista</h1>
            <p className="text-slate-600">Ingresa a tu cuenta para gestionar tus proyectos</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
