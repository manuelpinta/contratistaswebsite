"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation } from "@/hooks/use-translation"

export function Header() {
  const t = useTranslation()
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-md">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
      
      <div className="container mx-auto">
        <div className="flex h-20 items-center justify-between px-4 lg:px-8">
          {/* Logo section - more sophisticated */}
          <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <svg className="h-7 w-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-foreground leading-tight tracking-tight">Concurso de Contratistas</span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.header.officialProgram}</span>
            </div>
        </Link>

          {/* Navigation - more prominent */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/#como-funciona"
              className="relative px-4 py-2 text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-primary/5 group"
          >
            {t.header.howItWorks}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all group-hover:w-3/4 rounded-full"></span>
            </Link>
            <Link
              href="/#promociones"
              className="relative px-4 py-2 text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-primary/5 group"
          >
            {t.header.promotions}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all group-hover:w-3/4 rounded-full"></span>
            </Link>
        </nav>

          {/* Actions - more refined */}
          <div className="flex items-center gap-2">
          <LanguageSelector />
          <Link href="/admin/login">
              <Button 
                variant="ghost" 
                size="sm"
                className="hidden sm:flex text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
              {t.header.admin}
            </Button>
          </Link>
          <Link href="/login">
              <Button
                variant="ghost"
                className="text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
              >
              {t.header.login}
            </Button>
          </Link>
          <Link href="/register">
              <Button 
                className="text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-primary hover:bg-primary/90 px-6"
              >
                {t.header.register}
              </Button>
          </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
