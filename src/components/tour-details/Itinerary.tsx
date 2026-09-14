import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@neup/components/ui/accordion"
import type { Tour } from "@/lib/types"

interface ItineraryProps {
  items: Tour['itinerary'];
}

export function Itinerary({ items }: ItineraryProps) {
  return (
    <div>
      <Accordion type="single" collapsible className="w-full bg-card rounded-lg shadow-sm px-6">
        {items.map((item) => (
          <AccordionItem key={item.day} value={`item-${item.day}`}>
            <AccordionTrigger>
              <div className="flex items-center gap-4">
                <span className="text-primary font-bold">Day {item.day}</span>
                <span className="font-semibold text-left">{item.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="whitespace-pre-wrap">
              {item.description}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
