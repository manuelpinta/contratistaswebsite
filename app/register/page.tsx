import { RegisterForm } from "@/components/contractor/register-form"
import { Header } from "@/components/header"

export const metadata = {
  title: "Registrarse | Portal del Contratista",
  description: "Crea tu cuenta de contratista",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Crear Cuenta</h1>
            <p className="text-slate-600">Regístrate para comenzar a registrar tus proyectos</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
