'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getPartnersAction } from '@/app/actions/partners';
import type { Partner } from '@/lib/types';
import { Skeleton } from '@neup/components/ui/skeleton';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@neup/components/ui/card';

export function OurPartners({ initialPartners = [] }: { initialPartners?: Partner[] }) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [isLoading, setIsLoading] = useState(false);

  // Autoplay controller
  const autoplay = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
    })
  );

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: false,
      containScroll: 'trimSnaps',
    },
    [autoplay.current]
  );

  useEffect(() => {
    if (initialPartners && initialPartners.length > 0) {
      setPartners(initialPartners);
      setIsLoading(false);
      return;
    }

    const fetchPartners = async () => {
      setIsLoading(true);
      try {
        const data = await getPartnersAction();
        setPartners(data);
      } catch (err) {
        console.error('Error fetching partners:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, [initialPartners]);

  return (
    <section className="py-16 lg:py-24 bg-secondary/50">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">
            Our Partners & Affiliations
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Trusted organizations we proudly collaborate with.
          </p>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex -ml-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="pl-6 flex-shrink-0 w-[80%] sm:w-[50%] md:w-[33.333%] lg:w-[25%]"
              >
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-5 w-3/4 mt-4" />
                <Skeleton className="h-4 w-full mt-2" />
              </div>
            ))}
          </div>
        ) : (
          /* Carousel */
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex -ml-6">
              {partners.map(partner => (
                <div
                  key={partner.id}
                  className="pl-6 flex-shrink-0 w-[80%] sm:w-[50%] md:w-[33.333%] lg:w-[25%]"
                  onMouseEnter={() => autoplay.current.stop()}
                  onMouseLeave={() => autoplay.current.play()}
                >
                  {/* Wrap content in link if it exists */}
                  {partner.link ? (
                    <a href={partner.link} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer">
                      <Card className="rounded-xl overflow-hidden bg-white group-hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                          <div className="relative h-48 w-full bg-white flex items-center justify-center">
                            <Image
                              src={partner.logo}
                              alt={partner.name}
                              fill
                              className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                              data-ai-hint="company logo"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <h3 className="mt-4 text-lg font-semibold group-hover:text-primary transition-colors">
                        {partner.name}
                      </h3>
                    </a>
                  ) : (
                    <div>
                      <Card className="rounded-xl overflow-hidden bg-white">
                        <CardContent className="p-0">
                          <div className="relative h-48 w-full bg-white flex items-center justify-center">
                            <Image
                              src={partner.logo}
                              alt={partner.name}
                              fill
                              className="object-contain p-6"
                              data-ai-hint="company logo"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <h3 className="mt-4 text-lg font-semibold">
                        {partner.name}
                      </h3>
                    </div>
                  )}

                  <p className="mt-1 text-sm text-muted-foreground">
                    {partner.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
