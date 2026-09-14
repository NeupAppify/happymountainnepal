import { Suspense } from 'react';
import { Skeleton } from '@neup/components/ui/skeleton';
import { Card, CardContent } from '@neup/components/ui/card';
import { ManagePackagesContent } from '../ManagePackagesContent';

function ManagePackagesLoadingFallback() {
    return (
        <div>
            <div className="flex items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold !font-headline">Draft Packages</h1>
                    <p className="text-muted-foreground mt-2">Manage your unpublished draft packages.</p>
                </div>
            </div>
            <Card>
                <CardContent className="py-8">
                    <Skeleton className="w-full h-64" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function PackagesDraftPage() {
    return (
        <Suspense fallback={<ManagePackagesLoadingFallback />}>
            <ManagePackagesContent status="draft" />
        </Suspense>
    );
}
