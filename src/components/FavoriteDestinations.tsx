
'use client';
import { useState, useEffect } from 'react';
import { LinkButton } from "@neup/components/ui/link-button";
import { Link } from "@neup/components/ui/link";
import Image from 'next/image';
import { Badge } from '@neup/components/ui/badge';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@neup/components/ui/button';
import { Skeleton } from '@neup/components/ui/skeleton';
import { Location } from '@/lib/types';

export function FavoriteDestinations({ initialLocations = [] }: { initialLocations?: Location[] }) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [loading, setLoading] = useState(false); // Default to false if we have initialLocations or if it's SSR

  useEffect(() => {
    if (initialLocations && initialLocations.length > 0) {
      setLocations(initialLocations);
      setLoading(false);
      return;
    }

    async function fetchDestinations() {
      try {
        setLoading(true);
        const res = await fetch('/api/locations?featured=true');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setLocations(data);
      } catch (error) {
        console.error("Failed to fetch featured locations", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDestinations();
  }, [initialLocations]);

  if (loading) {
    return (
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="container mx-auto relative">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/3 text-center lg:text-left space-y-4">
              <Skeleton className="h-10 w-3/4 mx-auto lg:mx-0" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mx-auto lg:mx-0" />
              <Skeleton className="h-12 w-48 mx-auto lg:mx-0" />
            </div>
            <div className="lg:w-2/3 w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <Skeleton className="h-96 col-span-2 md:col-span-1 md:row-span-2 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (locations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="container mx-auto relative">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/3 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold !font-headline">
              Our Favorite Destinations
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Explore the regions that capture the heart of the Himalayas, each offering a unique adventure.
            </p>
            <LinkButton href="/tours" className="mt-6" size="lg" variant="solid" postIcon={<ArrowRight />}>
                Explore All Tours
              </LinkButton>
          </div>
          <div className="lg:w-2/3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {locations.slice(0, 5).map((dest, index) => (
                <Link
                  key={dest.id}
                  href={`/location/${dest.slug}`} // Linking to location detail page
                  className={`group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${index === 0 ? 'col-span-2 md:col-span-1 md:row-span-2' : ''
                    } ${index === 1 ? 'md:col-start-2' : ''
                    } ${index === 2 ? 'md:col-start-3' : ''
                    }`}
                >
                  {dest.image ? (
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      width={600}
                      height={index === 0 ? 600 : 300}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white w-full">
                    <h3 className="text-xl md:text-2xl font-bold !font-headline">{dest.name}</h3>
                    {dest.description && (
                      <p className="mt-2 text-xs md:text-sm text-gray-200 line-clamp-2">
                        {dest.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
