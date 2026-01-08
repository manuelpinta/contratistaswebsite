"use client"

import { LoginForm } from "@/components/contractor/login-form"
import { Header } from "@/components/header"
import { useTranslation } from "@/hooks/use-translation"

export default function LoginPage() {
  const t = useTranslation()
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t.login.pageTitle}</h1>
            <p className="text-slate-600">{t.login.pageDescription}</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
