"use client"

import { Card } from "@/components/ui/card"
import { useTranslation } from "@/hooks/use-translation"

export function HowItWorks() {
  const t = useTranslation()
  
  const steps = [
    {
      number: "01",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      title: t.howItWorks.step1Title,
      description: t.howItWorks.step1Desc,
    },
    {
      number: "02",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc,
    },
    {
      number: "03",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc,
    },
  ]

  return (
    <section id="como-funciona" className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Modern background with gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            {t.howItWorks.badge}
          </div>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
            {t.howItWorks.title}
          </h2>
          <p className="text-xl text-muted-foreground md:text-2xl text-pretty font-medium">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 group bg-card/50 backdrop-blur-sm"
            >
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/60 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Number background */}
              <div className="absolute top-4 right-4 text-7xl font-black text-muted/5 group-hover:text-primary/10 transition-colors">
                {step.number}
              </div>
              
              <div className="relative mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  {step.icon}
                </div>
              </div>
              
              <h3 className="mb-3 text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                {step.description}
              </p>
              
              {/* Decorative element */}
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
