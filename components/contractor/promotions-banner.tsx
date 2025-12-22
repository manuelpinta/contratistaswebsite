"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Link from "next/link"

export function PromotionsBanner() {
  // Banners de promociones de tienda - solo imágenes
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
    <div className="mb-8">
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
                <div className="relative w-full aspect-[16/5] md:aspect-[16/4] rounded-xl overflow-hidden bg-muted shadow-lg">
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
        <CarouselPrevious className="left-2 md:left-4" />
        <CarouselNext className="right-2 md:right-4" />
      </Carousel>
    </div>
  )
}
