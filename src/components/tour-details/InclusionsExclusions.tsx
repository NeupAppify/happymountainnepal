
import type { Tour } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@neup/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface InclusionsExclusionsProps {
  tour: Tour;
}

export function InclusionsExclusions({ tour }: InclusionsExclusionsProps) {
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl !font-headline text-green-800">
              <CheckCircle className="h-6 w-6" />
              Inclusions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              {tour.inclusions.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl !font-headline text-red-800">
              <XCircle className="h-6 w-6" />
              Exclusions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              {tour.exclusions.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-1 text-destructive shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
  );
}
