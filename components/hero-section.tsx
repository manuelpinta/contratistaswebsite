import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border py-24 md:py-32 lg:py-40">
      {/* Modern gradient background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,0,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,102,204,0.1),transparent_50%)]" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 px-6 py-2.5 text-sm font-semibold text-primary backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Programa Oficial
          </div>

          <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl xl:text-8xl text-balance leading-tight">
            <span className="block">Registra tus proyectos</span>
            <span className="block text-gradient-brand mt-2">y gana beneficios</span>
          </h1>

          <p className="mb-12 text-xl text-muted-foreground md:text-2xl lg:text-3xl text-pretty max-w-3xl mx-auto leading-relaxed font-medium">
            Participa en el Concurso de Contratistas registrando tus obras y accede a promociones exclusivas y premios increíbles.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/register">
              <Button 
                size="lg" 
                className="w-full text-base font-bold sm:w-auto px-10 py-7 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary hover:bg-primary/90"
              >
                Registrarme como contratista
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full text-base font-semibold sm:w-auto px-10 py-7 text-lg border-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
              >
                Iniciar sesión
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Proyectos validados</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Promociones exclusivas</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Sorteos mensuales</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
