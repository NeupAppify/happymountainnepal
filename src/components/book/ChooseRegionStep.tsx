
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllTourRegions } from '@/lib/db';
import { Skeleton } from '@neup/components/ui/skeleton';
import { Card } from '@neup/components/ui/card';
import { MapPin } from 'lucide-react';
import { slugify } from '@/lib/utils';
import Image from 'next/image';

export function ChooseRegionStep() {
  const [regions, setRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRegions() {
      try {
        const fetchedRegions = await getAllTourRegions();
        setRegions(fetchedRegions);
      } catch (error) {
        console.error("Failed to fetch regions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRegions();
  }, []);

  const handleRegionSelect = (region: string) => {
    router.push(`/book?step=package&region=${region}`);
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">Book Your Custom Trip</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Step 1: Choose your destination region.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {regions.map(region => (
            <Card
              key={region}
              className="group overflow-hidden cursor-pointer relative"
              onClick={() => handleRegionSelect(region)}
            >
              <Image 
                src={`https://picsum.photos/seed/dest-${slugify(region)}/400/300`}
                alt={region}
                width={400}
                height={300}
                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <h3 className="text-xl text-white font-bold !font-headline text-center">{region}</h3>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
