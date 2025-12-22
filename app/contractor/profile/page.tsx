import { ContractorHeader } from "@/components/contractor/contractor-header"
import { ProfileForm } from "@/components/contractor/profile-form"

export const metadata = {
  title: "Mi Perfil | Portal del Contratista",
  description: "Edita tu información personal",
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ContractorHeader />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Mi Perfil</h1>
          <p className="text-slate-600">Revisa y actualiza tu información personal</p>
        </div>

        <ProfileForm />
      </main>
    </div>
  )
}
