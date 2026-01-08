// Configuración de rifas por país

import type { CountryCode } from './countries'

export interface RafflePrize {
  title: string
  description: string
  value: string
  image: string
}

export interface RaffleConfig {
  month: string
  prize: RafflePrize
  drawDate: string
}

export const RAFFLES: Record<CountryCode, RaffleConfig> = {
  MX: {
    month: "Enero 2025",
    prize: {
      title: "Kit de Herramientas Profesionales",
      description: "Incluye pistola de pintura profesional, rodillos premium, brochas de alta calidad y accesorios",
      value: "$15,000 MXN",
      image: "/professional-painting-tools.jpg",
    },
    drawDate: "2025-01-31",
  },
  HN: {
    month: "Enero 2025",
    prize: {
      title: "Kit Completo de Pintura Profesional",
      description: "Pistola de pintura, rodillos de alta calidad, brochas profesionales y todos los accesorios necesarios",
      value: "L. 3,500 HNL",
      image: "/professional-painting-tools.jpg",
    },
    drawDate: "2025-01-31",
  },
  SV: {
    month: "Enero 2025",
    prize: {
      title: "Equipo Profesional de Pintura",
      description: "Kit completo con pistola de pintura profesional, rodillos premium y herramientas de alta calidad",
      value: "$400 USD",
      image: "/professional-painting-tools.jpg",
    },
    drawDate: "2025-01-31",
  },
  BZ: {
    month: "January 2025",
    prize: {
      title: "Professional Painting Tools Kit",
      description: "Includes professional paint sprayer, premium rollers, high-quality brushes and accessories",
      value: "$400 BZD",
      image: "/professional-painting-tools.jpg",
    },
    drawDate: "2025-01-31",
  },
}

export function getRaffleByCountry(countryCode: CountryCode | null): RaffleConfig {
  if (!countryCode || !(countryCode in RAFFLES)) {
    return RAFFLES.MX // Default
  }
  return RAFFLES[countryCode]
}

