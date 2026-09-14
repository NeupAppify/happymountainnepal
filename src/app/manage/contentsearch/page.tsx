import { Card, CardContent } from '@neup/components/ui/card';
import { Skeleton } from '@neup/components/ui/skeleton';
import { ManageLinksContent } from './ManageLinksContent';
import { getContentSearchRecords, getLinkReport } from '@/services/links/get-link-report';

function ManageLinksLoadingFallback() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Link Scanner</h1>
        <p className="mt-2 text-muted-foreground">Scanning blog links and checking known targets.</p>
      </div>
      <Card>
        <CardContent className="py-8">
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ManageLinksPage() {
  const [report, records] = await Promise.all([getLinkReport(), Promise.resolve(getContentSearchRecords())]);
  const imageReport = records
    .filter((record) => record.lookupFor === 'imageinBlog' || record.lookupFor === 'imageInTour')
    .flatMap((record) => Array.isArray(record.contentFound) ? record.contentFound.map((image: any) => ({ ...image, recordId: record.id, onPage: image.onPage || record.forPage })) : []) as any;

  return <ManageLinksContent report={report} imageReport={imageReport} />;
}
