
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getLegalDocumentById, getLegalSettings } from '@/lib/db';
import { FileText, ChevronLeft, Edit } from 'lucide-react';
import { LinkButton } from "@neup/components/ui/link-button";
import { Button } from '@neup/components/ui/button';
import { DocumentViewer } from './viewer';
import { AdminPageControl } from '@/components/admin/AdminPageControl';

export default async function LegalDocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;
    const isManager = cookieStore.has('manager_username');

    const [document, settings] = await Promise.all([
        getLegalDocumentById(id),
        getLegalSettings()
    ]);

    if (!document) {
        notFound();
    }

    if (document.isHidden && !isManager) {
        notFound();
    }

    // Use global setting for protection
    const requireProtection = settings.requireEmailProtection;

    if (requireProtection && !userEmail) {
        redirect('/legal/documents/gate');
    }

    // If protection is OFF, we do not watermark with an email (passing empty string)
    // The visual watermark "DO NOT DISTRIBUTE" still applies from the API logic if implemented there
    const viewerEmail = requireProtection ? (userEmail || '') : '';

    return (
        <div className="container mx-auto py-8">
            <AdminPageControl editPath={`/manage/legal/documents/${id}`} />
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <LinkButton variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" href="/legal/documents">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Documents
                        </LinkButton>
                    <div className="flex items-center justify-between mt-2">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <FileText className="h-8 w-8 text-primary" />
                            {document.title}
                        </h1>

                    </div>
                    {document.isHidden && isManager && (
                        <div className="mt-2 inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            HIDDEN FROM PUBLIC
                        </div>
                    )}
                    {requireProtection && (
                        <p className="text-muted-foreground mt-2">
                            Authorized access for: <span className="font-semibold text-foreground">{userEmail}</span>
                        </p>
                    )}
                </div>

                <div className="relative bg-muted/20 border rounded-lg overflow-hidden">
                    <DocumentViewer url={document.url} email={viewerEmail} deviceId={cookieStore.get('temp_account')?.value || 'unknown'} />
                </div>
            </div>
        </div>
    );
}
