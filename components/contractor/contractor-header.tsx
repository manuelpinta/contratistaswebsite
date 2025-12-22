"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Menu, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ContractorHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    toast.success("Sesión cerrada correctamente")
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/contractor/dashboard" className="font-bold text-xl text-slate-900">
          Portal del Contratista
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/contractor/dashboard" className="text-slate-700 hover:text-slate-900 font-medium">
            Inicio
          </Link>
          <Link href="/contractor/projects" className="text-slate-700 hover:text-slate-900 font-medium">
            Mis Proyectos
          </Link>
          <Link href="/contractor/rifa" className="text-slate-700 hover:text-slate-900 font-medium">
            Rifa del Mes
          </Link>
          <Link href="/contractor/projects/nuevo" className="text-slate-700 hover:text-slate-900 font-medium">
            Registrar Proyecto
          </Link>
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Juan Pérez</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/contractor/profile">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link
              href="/contractor/dashboard"
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/contractor/projects"
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Mis Proyectos
            </Link>
            <Link
              href="/contractor/rifa"
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rifa del Mes
            </Link>
            <Link
              href="/contractor/projects/nuevo"
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Registrar Proyecto
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded">
              Cerrar Sesión
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
