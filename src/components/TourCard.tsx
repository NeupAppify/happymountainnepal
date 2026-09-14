"use client";

import { LinkButton } from "@neup/components/ui/link-button";
import { Link } from "@neup/components/ui/link";
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@neup/components/ui/card';
import { Badge } from '@neup/components/ui/badge';
import { Button } from '@neup/components/ui/button';
import { Heart, Clock, Mountain, BarChart } from 'lucide-react';
import type { Tour } from '@/lib/types';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images'; // Import placeholder images

interface TourCardProps {
  tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(tour.id);

  // Use a fallback image if tour.mainImage is missing or empty
  const imageUrl = tour.mainImage && tour.mainImage.url && tour.mainImage.url.length > 0
    ? tour.mainImage.url
    : PlaceHolderImages.find(img => img.id === 'tour-ebc')?.imageUrl || 'https://placehold.co/600x400';

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(tour.id);
    } else {
      addToWishlist(tour.id);
    }
  };

  return (
    <Link href={`/tours/${tour.slug}`} className="group block">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0 relative">
          <Image
            src={imageUrl}
            alt={tour.name}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint="mountain landscape"
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 rounded-full h-9 w-9"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={cn('h-5 w-5', isWishlisted ? 'text-red-500 fill-current' : 'text-foreground/80')} />
          </Button>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Badge variant="secondary" className="mb-2">{tour.region}</Badge>
          <CardTitle className="text-lg font-bold !font-headline mb-2 leading-tight group-hover:text-primary transition-colors">
            {tour.name}
          </CardTitle>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{tour.duration} days</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart className="h-4 w-4" />
              <span>{tour.difficulty}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-end items-center">
          <Button variant="ghost" className="text-primary">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
