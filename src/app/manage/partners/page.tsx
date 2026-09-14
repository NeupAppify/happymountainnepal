
'use client';

import { Link } from "@neup/components/ui/link";
import { Button } from '@neup/components/ui/button';
import { Card } from '@neup/components/ui/card';
import { ChevronRight, PlusCircle } from 'lucide-react';
import { getPartnersAction } from '@/app/actions/partners';
import type { Partner } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@neup/components/ui/skeleton';
import { SmartImage } from '@/components/ui/smart-image';
import { cn } from '@/lib/utils';

export default function PartnersListPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      try {
        const data = await getPartnersAction();
        setPartners(data);
      } catch (err) {
        console.error('Failed to fetch partners:', err);
      }
      setLoading(false);
    };
    fetchPartners();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold !font-headline">Partners & Affiliations</h1>
          <p className="text-muted-foreground mt-2">
            {partners.length} {partners.length === 1 ? 'partner' : 'partners'} currently active
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {/* Action Card */}
        <Card className="mb-6 overflow-hidden border-blue-200/50">
          <Link href="/manage/partners/create" className="block hover:bg-muted/50 transition-colors">
            <div className="p-6 flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="font-semibold text-base text-primary">Add New Partner</h3>
                <p className="text-sm text-muted-foreground">
                  Create a new partnership profile to display on the website.
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </Link>
        </Card>

        {/* Partners List Card */}
        {loading ? (
          <Card className="overflow-hidden">
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : partners.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="flex flex-col">
              {partners.map((partner, index) => (
                <Link
                  key={partner.id}
                  href={`/manage/partners/${partner.id}/edit`}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-accent/5 transition-colors group",
                    index !== partners.length - 1 && "border-b"
                  )}
                >
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted border flex-shrink-0">
                    {partner.logo ? (
                      <SmartImage
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground text-lg font-bold">
                        {partner.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium group-hover:underline text-base truncate mb-0.5">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {partner.description || 'No description provided'}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </Card>
        ) : (
          <div className="text-center py-16 text-muted-foreground border rounded-lg bg-card">
            <h3 className="text-lg font-semibold">No Partners Yet</h3>
            <p className="mt-2 text-sm">Get started by adding your first business partner.</p>
          </div>
        )}
      </div>
    </div>
  );
}

