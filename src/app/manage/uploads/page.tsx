import { Suspense } from 'react';
import { UploadsContent } from './UploadsContent';
import { Card } from '@neup/components/ui/card';

function UploadsLoadingFallback() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold !font-headline">Uploads Library</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>

      {/* Action Card Skeleton */}
      <Card className="mb-6 overflow-hidden border-blue-200/50 animate-pulse">
        <div className="p-6 flex flex-col space-y-2">
          <div className="h-5 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border-b last:border-0 animate-pulse"
            >
              <div className="h-16 w-24 rounded-md bg-muted flex-shrink-0"></div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="flex items-center gap-3">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function UploadsLibraryPage() {
  return (
    <Suspense fallback={<UploadsLoadingFallback />}>
      <UploadsContent />
    </Suspense>
  );
}