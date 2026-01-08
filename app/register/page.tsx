"use client"

import { RegisterForm } from "@/components/contractor/register-form"
import { Header } from "@/components/header"
import { useTranslation } from "@/hooks/use-translation"

export default function RegisterPage() {
  const t = useTranslation()
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t.register.pageTitle}</h1>
            <p className="text-slate-600">{t.register.pageDescription}</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
