
'use client';

import { LinkButton } from "@neup/components/ui/link-button";
import { Button } from '@neup/components/ui/button';
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { Skeleton } from '@neup/components/ui/skeleton';
import type { SiteProfile } from '@/lib/types';

export function ContactSection({ initialProfile }: { initialProfile?: SiteProfile | null }) {
  const { profile, isLoading } = useSiteProfile(initialProfile);

  const address = profile?.address || 'Thamel, Kathmandu, Nepal';
  const phone = profile?.phone || '+977 984-3725521';
  const email = profile?.contactEmail || 'info@happymountainnepal.com';

  const locationText = profile?.location || profile?.address || 'Thamel, Kathmandu, Nepal';
  const googleMapsUrl = profile?.locationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`;

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold !font-headline">
          Ready to Start Your Adventure?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Contact us today to get a free consultation or to book your dream trip to the Himalayas.
        </p>

        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-card rounded-lg shadow-sm flex flex-col items-center gap-2 transition-all duration-300 hover:ring-2 hover:ring-primary/50 hover:shadow-lg"
            >
              <MapPin className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-lg">Our Office</h3>
              <p className="text-muted-foreground">{locationText}</p>
            </a>
            <a
              href={`tel:${phone}`}
              className="p-6 bg-card rounded-lg shadow-sm flex flex-col items-center gap-2 transition-all duration-300 hover:ring-2 hover:ring-primary/50 hover:shadow-lg"
            >
              <Phone className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-lg">Call Us</h3>
              <p className="text-muted-foreground hover:text-primary">{phone}</p>
            </a>
            <a
              href={`mailto:${email}`}
              className="p-6 bg-card rounded-lg shadow-sm flex flex-col items-center gap-2 transition-all duration-300 hover:ring-2 hover:ring-primary/50 hover:shadow-lg"
            >
              <Mail className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-lg">Email Us</h3>
              <p className="text-muted-foreground hover:text-primary">{email}</p>
            </a>
          </div>
        )}

        <LinkButton href="/contact" size="lg" className="mt-12 text-lg" variant="solid" postIcon={<ArrowRight />}>
            Send a Message
          </LinkButton>
      </div>
    </section>
  );
}
