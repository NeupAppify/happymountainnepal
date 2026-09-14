
'use client';

import { LinkButton } from "@neup/components/ui/link-button";
import { Button } from '@neup/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { Tour } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SaveStatus, useAutoSave } from '@/hooks/use-auto-save'; // Import useAutoSave hook

const steps = [
  'basics',
  'media',
  'itinerary',
  'inclusions',
  'faq',
  'gears',
  'reviews',
  'guide',
  'info',
  'booking',
  'publish'
];

interface EditPackageLayoutProps {
  children: React.ReactNode;
  tour: Tour;
  currentStep: string;
}

function AutoSaveStatus({ status }: { status: SaveStatus }) {
  if (status === 'idle') {
    return <span className="text-xs text-muted-foreground">Changes are saved automatically.</span>;
  }
  if (status === 'saving') {
    return <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>;
  }
  if (status === 'success') {
    return <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Saved</span>;
  }
  if (status === 'error') {
    return <span className="text-xs text-destructive flex items-center gap-1"><XCircle className="h-3 w-3" /> Save failed</span>;
  }
  return null;
}

export function EditPackageLayout({ children, tour, currentStep }: EditPackageLayoutProps) {
  // Auto-save is enabled for all steps except 'publish'
  const enableAutoSave = currentStep !== 'publish';
  const { saveStatus } = useAutoSave({
    tourId: tour.id,
    enabled: enableAutoSave
  });

  const currentIndex = steps.indexOf(currentStep);
  const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

  const basePath = `/manage/packages/${tour.id}`;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">
          Editing: <span className="text-primary">{tour.name || 'New Package'}</span>
        </h1>
        {tour.slug && (
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            /{tour.slug}
          </p>
        )}
        <p className="text-muted-foreground mt-2 capitalize">{currentStep.replace('-', ' ')}</p>
      </div>

      <div className="md:col-span-3">
        {children}
      </div>

      {/* Sticky Footer Navigation */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t mt-12 py-4">
        <div className="container max-w-5xl mx-auto flex justify-between items-center">
          <div>
            {prevStep && (
              <LinkButton variant="outline" href={`${basePath}/${prevStep}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </LinkButton>
            )}
          </div>

          <div className="flex-grow text-center">
            {enableAutoSave && <AutoSaveStatus status={saveStatus} />}
          </div>

          <div>
            {nextStep && (
              <LinkButton variant="solid" href={`${basePath}/${nextStep}`}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </LinkButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

