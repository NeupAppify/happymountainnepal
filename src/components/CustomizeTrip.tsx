import { LinkButton } from "@neup/components/ui/link-button";
import { Button } from '@neup/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export function CustomizeTrip() {
  return (
    <section>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 py-16 lg:py-24">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold !font-headline">
              Craft Your Perfect Himalayan Adventure
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Don&apos;t see exactly what you&apos;re looking for? We specialize in creating custom treks and tours tailored to your interests, timeline, and budget.
            </p>
            <LinkButton href="/customize" className="mt-6" size="lg" variant="solid" postIcon={<ArrowRight />}>
                Plan Your Custom Trip
              </LinkButton>
          </div>
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
             <Image 
                src="https://picsum.photos/seed/custom-trip/800/600" 
                alt="A trekker looking at a map in the mountains"
                fill
                className="object-cover"
                data-ai-hint="trekker map"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
