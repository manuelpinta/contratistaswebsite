"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Link from "next/link"

export function Promotions() {
  // Banners de promociones - solo imágenes
  const promotionBanners = [
    {
      image: "/paint-products-store.jpg",
      link: "#", // Opcional: link a la promoción
    },
    {
      image: "/delivery-truck.jpg",
      link: "#",
    },
    {
      image: "/professional-painting-tools.jpg",
      link: "#",
    },
    // Agregar más banners según necesites
  ]

  return (
    <section id="promociones" className="relative py-16 md:py-24 overflow-hidden">
      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {promotionBanners.map((banner, index) => (
                <CarouselItem key={index}>
                  <Link href={banner.link} className="block w-full">
                    <div className="relative w-full aspect-[16/6] md:aspect-[16/5] rounded-xl overflow-hidden bg-muted">
                      <img
                        src={banner.image || "/placeholder.svg"}
                        alt={`Promoción ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  )
}
