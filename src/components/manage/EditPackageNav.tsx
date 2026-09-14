
'use client';
import { LinkButton } from '@neup/components/ui/link-button';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

interface EditPackageNavProps {
  packageId: string;
  currentStep: string;
}

const steps = [
  { slug: 'basics', label: 'Basic Info' },
  { slug: 'media', label: 'Media & Gallery' },
  { slug: 'itinerary', label: 'Itinerary' },
  { slug: 'inclusions', label: 'Inclusions' },
  { slug: 'gears', label: 'Gears' },
  { slug: 'faq', label: 'FAQ' },
  { slug: 'info', label: 'Additional Info' },
  { slug: 'booking', label: 'Booking & Price' },
];

export function EditPackageNav({ packageId, currentStep }: EditPackageNavProps) {
  return (
    <nav className="flex flex-col gap-2 sticky top-24">
      {steps.map(step => (
        <LinkButton
          key={step.slug}
          variant={currentStep === step.slug ? 'solid' : 'plain'}
          href={`/manage/packages/${packageId}/${step.slug}`}
          className="justify-start"
        >
          {step.label}
        </LinkButton>
      ))}
      <LinkButton
        href={`/manage/packages/${packageId}/publish`}
        variant={currentStep === 'publish' ? 'solid' : 'plain'}
        className={cn("justify-start mt-2", currentStep === 'publish' && 'ring-2 ring-primary/50')}
      >
        <Send className="mr-2 h-4 w-4" />
        Publish
      </LinkButton>
    </nav>
  );
}
