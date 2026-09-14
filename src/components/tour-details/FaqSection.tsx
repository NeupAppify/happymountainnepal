
'use client';

import type { Tour } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@neup/components/ui/accordion";

interface FaqSectionProps {
  faq: Tour['faq'];
}

export function FaqSection({ faq }: FaqSectionProps) {
  if (!faq || faq.length === 0) {
    return null;
  }

  return (
    <div>
      <Accordion type="single" collapsible className="w-full bg-card rounded-lg shadow-sm px-6">
        {faq.map((item, index) => (
          <AccordionItem key={index} value={`faq-item-${index}`}>
            <AccordionTrigger className="text-left font-semibold">
              {item.question}
            </AccordionTrigger>
            <AccordionContent>
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
