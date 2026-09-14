
import { getLegalDocuments, getLegalSettings } from '@/lib/db';
import type { LegalDocument } from '@/lib/types';
import { FileText } from 'lucide-react';
import { cookies, headers } from 'next/headers';
import { Link } from "@neup/components/ui/link";
import { redirect } from 'next/navigation';
import { DocumentViewer as DocumentCard } from './components/document-card';
import { UrlCleaner } from './components/url-cleaner';


export default async function LegalDocumentsPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value || 'guest';

  // Check global protection settings
  const settings = await getLegalSettings();
  if (settings.requireEmailProtection && userEmail === 'guest') {
    redirect('/legal/documents/gate?returnTo=/legal/documents');
  }

  let documents: LegalDocument[] = [];
  try {
    documents = await getLegalDocuments();
  } catch (error) {
    console.error("Failed to load legal documents", error);
  }

  // Get request metadata for device ID
  const headerList = await headers();
  const userAgent = headerList.get('user-agent') || 'unknown-device';
  const realIp = headerList.get('x-forwarded-for') || 'unknown-ip';
  const deviceIdentifier = `${userAgent}-${realIp}`;

  return (
    <div className="container mx-auto py-16">
      <UrlCleaner />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold !font-headline">Legal Documents</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Our official documents for transparency and your peace of mind.
          </p>
        </div>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => (
              <Link key={doc.id} href={`/legal/documents/${doc.id}`} className="block group h-full">
                <div className="border rounded-lg overflow-hidden shadow-sm transition-all duration-300 h-full flex flex-col group-hover:border-primary group-hover:ring-1 group-hover:ring-primary bg-card">
                  <div className="h-64 overflow-hidden relative shrink-0 border-b">
                    <DocumentCard
                      url={doc.url}
                      email={userEmail}
                      deviceId={deviceIdentifier}
                    />
                  </div>
                  <div className="p-4 bg-muted/20 flex-grow flex items-start gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-md shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {doc.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg border">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Documents Available</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Please check back later for our official documents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
