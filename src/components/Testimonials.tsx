'use client';
import type { ManagedReview } from '@/lib/types';
import { LinkButton } from '@neup/components/ui/link-button';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@neup/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { getFiveStarReviews } from '@/lib/db/reviews';
import { useSiteProfile } from '@/hooks/use-site-profile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@neup/components/ui/carousel"
import { ReviewCarouselItem } from './ReviewCarouselItem'; // New component for the card
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from '@neup/components/ui/card'; // Added import

export function Testimonials({ initialReviews = [], initialProfile }: { initialReviews?: ManagedReview[], initialProfile?: any }) {
  const [reviews, setReviews] = useState<ManagedReview[]>(initialReviews);
  const { profile, isLoading: isProfileLoading } = useSiteProfile(initialProfile);
  const [isReviewsLoading, setIsReviewsLoading] = useState(!initialReviews || initialReviews.length === 0);

  const totalReviewCount = profile?.reviewCount;
  const isLoading = isProfileLoading || isReviewsLoading;

  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviews(initialReviews);
      setIsReviewsLoading(false);
      return;
    }

    const fetchReviews = async () => {
      setIsReviewsLoading(true);
      try {
        const fetchedFiveStarReviews = await getFiveStarReviews();
        setReviews(fetchedFiveStarReviews);
      } catch (error) {
        console.error("Error fetching 5-star reviews:", error);
      } finally {
        setIsReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [initialReviews]);
  
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-1 text-center lg:text-left">
            {isLoading ? (
              <Skeleton className="h-16 w-32 mx-auto lg:mx-0 mb-4" />
            ) : (
              <h2 className="text-5xl md:text-6xl font-bold !font-headline text-primary mb-4">
                {totalReviewCount !== null ? `${totalReviewCount}+` : '...'}
              </h2>
            )}
            <p className="text-xl font-semibold text-foreground">
              Reviews from Our Adventurers
            </p>
            <p className="mt-2 text-muted-foreground">
              Real stories from travelers who have explored the Himalayas with us.
            </p>
            <LinkButton href="/reviews" variant="outlined" className="mt-6" postIcon={<ArrowRight className="h-4 w-4" />}>
              Read All Reviews
            </LinkButton>
          </div>

          <div className="lg:col-span-2">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className='space-y-2'>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full mt-2" />
                  <Skeleton className="h-5 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ) : (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[
                    Autoplay({
                      delay: 10000,
                      stopOnInteraction: true,
                    }),
                  ]}
                className="w-full"
              >
                <CarouselContent>
                  {reviews.map((review) => (
                    <CarouselItem key={review.id}>
                        <ReviewCarouselItem review={review} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="mt-4 flex justify-end gap-2">
                    <CarouselPrevious className="relative -left-0 -top-0 -translate-y-0" />
                    <CarouselNext className="relative -right-0 -top-0 -translate-y-0" />
                </div>
              </Carousel>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
