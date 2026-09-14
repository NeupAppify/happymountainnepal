
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllPublishedTours } from '@/lib/db';
import type { Tour } from '@/lib/types';
import { Skeleton } from '@neup/components/ui/skeleton';
import { TourCard } from '@/components/TourCard';
import { CardsGrid } from '../CardsGrid';
import { Button } from '@neup/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ChoosePackageStepProps {
  region: string;
}

export function ChoosePackageStep({ region }: ChoosePackageStepProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchTours() {
      try {
        const allTours = await getAllPublishedTours();
        // Filter tours by the selected region
        const filteredTours = allTours.filter(tour => 
          Array.isArray(tour.region) && tour.region.includes(region)
        );
        setTours(filteredTours);
      } catch (error) {
        console.error("Failed to fetch tours:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTours();
  }, [region]);

  const handlePackageSelect = (packageId: string) => {
    router.push(`/book?step=customize&region=${region}&package=${packageId}`);
  };

  return (
    <div>
      <div className="text-center mb-12">
        <Button variant="ghost" className="mb-4" onClick={() => router.push('/book')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Change Region
        </Button>
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">Book Your Adventure</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Step 2: Choose your starting adventure in <span className="font-semibold text-primary">{region}</span>.
        </p>
      </div>
      {isLoading ? (
        <CardsGrid>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ))}
        </CardsGrid>
      ) : (
        <CardsGrid>
          {tours.map(tour => (
            <div key={tour.id} onClick={() => handlePackageSelect(tour.id)} className="cursor-pointer">
              <TourCard tour={tour} />
            </div>
          ))}
        </CardsGrid>
      )}
    </div>
  );
}
