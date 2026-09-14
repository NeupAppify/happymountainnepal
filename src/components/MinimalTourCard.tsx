"use client";

import { Link } from "@neup/components/ui/link";
import Image from "next/image";
import type { Tour } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface MinimalTourCardProps {
  tour: Tour;
  className?: string;
}

export function MinimalTourCard({ tour, className }: MinimalTourCardProps) {
  const imageUrl = tour.mainImage && tour.mainImage.url && tour.mainImage.url.length > 0
    ? tour.mainImage.url
    : PlaceHolderImages.find((img) => img.id === "tour-ebc")?.imageUrl || "https://placehold.co/800x600";

  const regions = Array.isArray(tour.region) ? tour.region : [];
  const durationLabel = tour.duration ? `${tour.duration} days` : undefined;
  const difficultyLabel = tour.difficulty || undefined;

  return (
    <Link href={`/tours/${tour.slug}`} className={cn("group block", className)}>
      <div className="overflow-hidden rounded-xl bg-muted/30 border border-border">
        <div className="relative aspect-[4/3]">
          <Image
            src={imageUrl}
            alt={tour.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            {durationLabel && (
              <span className="rounded-full bg-black/50 text-white text-xs px-2.5 py-1 backdrop-blur-sm">
                {durationLabel}
              </span>
            )}
            {difficultyLabel && (
              <span className="rounded-full bg-black/50 text-white text-xs px-2.5 py-1 backdrop-blur-sm">
                {difficultyLabel}
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-base md:text-lg font-semibold !font-headline tracking-tight">
            {tour.name}
          </h3>
          {regions.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground truncate">
              {regions.join(" • ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}