
import { getErrorById } from '@/lib/db';
import { notFound } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@neup/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@neup/components/ui/badge';
import { LinkButton } from "@neup/components/ui/link-button";
import { Button } from '@neup/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ErrorDetailPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ErrorDetailPage({ params }: ErrorDetailPageProps) {
    const { id } = await params;
    const error = await getErrorById(id);

    if (!error) {
        notFound();
    }

    const createdAt = error.createdAt?.toDate ? formatDistanceToNow(error.createdAt.toDate(), { addSuffix: true }) : 'N/A';

    return (
        <div>
            <div className="mb-4">
                <LinkButton variant="outline" size="sm" href="/manage/site/errors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to All Errors
                    </LinkButton>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Error Details</CardTitle>
                    <CardDescription>
                        Captured {createdAt} on path <Badge variant="secondary">{error.pathname}</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Message</h3>
                        <p className="text-destructive font-mono bg-secondary p-4 rounded-md break-words">{error.message}</p>
                    </div>

                    {error.stack && (
                        <div>
                            <h3 className="font-semibold mb-2">Stack Trace</h3>
                            <pre className="text-sm bg-secondary p-4 rounded-md overflow-x-auto">
                                <code className="whitespace-pre-wrap break-all">{error.stack}</code>
                            </pre>
                        </div>
                    )}

                    {error.componentStack && (
                        <div>
                            <h3 className="font-semibold mb-2">Component Stack</h3>
                            <pre className="text-sm bg-secondary p-4 rounded-md overflow-x-auto">
                                <code className="whitespace-pre-wrap break-all">{error.componentStack}</code>
                            </pre>
                        </div>
                    )}

                    {error.context && (
                        <div>
                            <h3 className="font-semibold mb-2">Context</h3>
                            <pre className="text-sm bg-secondary p-4 rounded-md overflow-x-auto">
                                <code className="whitespace-pre-wrap break-all">{JSON.stringify(error.context, null, 2)}</code>
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

