import { Suspense } from 'react';
import { Card, CardContent } from '@neup/components/ui/card';
import { LogsContent } from './LogsContent';

function LogsLoadingFallback() {
    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    Loading logs...
                </CardContent>
            </Card>
        </div>
    );
}

export default function LogsPage() {
    return (
        <Suspense fallback={<LogsLoadingFallback />}>
            <LogsContent />
        </Suspense>
    );
}
