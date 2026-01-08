"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Link from "next/link"
import { usePromotions } from "@/hooks/use-promotions"

export function PromotionsBanner() {
  const { promotions, loading } = usePromotions()

  // Fallback a imágenes por defecto si no hay promociones o está cargando
  const defaultBanners = [
    { banner_image_url: "/paint-products-store.jpg", link_url: "#" },
    { banner_image_url: "/delivery-truck.jpg", link_url: "#" },
    { banner_image_url: "/professional-painting-tools.jpg", link_url: "#" },
  ]

  const promotionBanners = promotions.length > 0 
    ? promotions.map(p => ({ image: p.banner_image_url, link: p.link_url || "#" }))
    : defaultBanners.map(b => ({ image: b.banner_image_url, link: b.link_url }))

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
