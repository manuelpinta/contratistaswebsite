"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Language } from "@/lib/translations"

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
]

export function LanguageSelector() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('es')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("selectedLanguage") as Language
      if (stored && (stored === 'es' || stored === 'en')) {
        setCurrentLanguage(stored)
      } else {
        // Si no hay idioma guardado, detectar desde el navegador
        const browserLang = navigator.language.split('-')[0]
        const defaultLang: Language = browserLang === 'en' ? 'en' : 'es'
        setCurrentLanguage(defaultLang)
        localStorage.setItem("selectedLanguage", defaultLang)
      }
    }
  }, [])
  
  // No renderizar hasta que esté montado para evitar errores de hidratación
  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="sm"
        className="gap-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60"
        disabled
      >
        <Languages className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">🌍</span>
        <span className="sm:hidden">🌍</span>
      </Button>
    )
  }

  const handleChangeLanguage = (language: Language) => {
    localStorage.setItem("selectedLanguage", language)
    setCurrentLanguage(language)
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new Event('languageChanged'))
    toast.success(`Idioma cambiado a ${LANGUAGES.find(l => l.code === language)?.name}`)
    // Recargar la página para aplicar los cambios
    router.refresh()
  }

  const currentLangData = LANGUAGES.find(l => l.code === currentLanguage)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          <Languages className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{currentLangData?.flag} {currentLangData?.name}</span>
          <span className="sm:hidden">{currentLangData?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Seleccionar idioma</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChangeLanguage(lang.code)}
            className={currentLanguage === lang.code ? "bg-muted" : ""}
          >
            <span className="mr-2 text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
            {currentLanguage === lang.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

