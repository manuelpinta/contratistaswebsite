import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import "../lib/country-debug" // Cargar utilidades de debug para países
import { CountrySelectorWrapper } from "@/components/country-selector-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Concurso de Contratistas | Registra proyectos y gana recompensas",
  description:
    "Programa para contratistas de pintura donde tus proyectos validados se convierten en incentivos y recompensas",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} font-sans antialiased`}>
        <CountrySelectorWrapper>
        {children}
        </CountrySelectorWrapper>
        <Analytics />
      </body>
    </html>
  )
}
