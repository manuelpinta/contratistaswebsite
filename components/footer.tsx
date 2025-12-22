export function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-20" />
      
      <div className="container relative mx-auto px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">Concurso de Contratistas</span>
                <span className="text-xs text-muted-foreground font-semibold">COMEX México</span>
              </div>
            </div>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed font-medium">
              Programa oficial para contratistas de pintura. Registra proyectos, obtén validación y gana recompensas por
              tu trabajo.
            </p>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold text-foreground uppercase tracking-wider">Programa</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#como-funciona" className="text-muted-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-primary transition-all group-hover:w-3"></span>
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#promociones" className="text-muted-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-primary transition-all group-hover:w-3"></span>
                  Promociones
                </a>
              </li>
              <li>
                <a href="#portales" className="text-muted-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-primary transition-all group-hover:w-3"></span>
                  Portales
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold text-foreground uppercase tracking-wider">Soporte</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-primary transition-all group-hover:w-3"></span>
                  Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-primary transition-all group-hover:w-3"></span>
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-primary transition-all group-hover:w-3"></span>
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} Concurso de Contratistas. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
              Términos
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
              Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
