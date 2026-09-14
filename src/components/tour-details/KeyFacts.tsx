
import type { Tour } from '@/lib/types';
import { Card, CardContent } from '@neup/components/ui/card';
import { Clock, BarChart, Globe, Mountain } from 'lucide-react';

interface KeyFactsProps {
  tour: Tour;
}

export function KeyFacts({ tour }: KeyFactsProps) {
  const facts = [
    { icon: Clock, label: 'Duration', value: `${tour.duration} days` },
    { icon: BarChart, label: 'Difficulty', value: tour.difficulty },
    { icon: Globe, label: 'Region', value: Array.isArray(tour.region) ? tour.region.join(', ') : tour.region },
    { icon: Mountain, label: 'Activity', value: tour.type },
  ];

  return (
    <div>
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col items-center">
                <fact.icon className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm font-semibold text-muted-foreground">{fact.label}</p>
                <p className="font-bold">{fact.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
