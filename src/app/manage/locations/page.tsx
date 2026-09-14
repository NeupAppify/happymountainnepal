
import { Link } from "@neup/components/ui/link";
import { PlusCircle, MapPin, Search } from 'lucide-react';
import { getLocations } from '@/lib/db/sqlite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neup/components/ui/card';
import { LocationManagementCard } from '@/components/manage/LocationManagementCard';

export const dynamic = 'force-dynamic';

export default async function LocationsPage() {
    const locations = await getLocations();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold !font-headline">Locations</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage trekking and tour locations.
                    </p>
                </div>
                <Link href="/manage/locations/create" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Location
                    </Link>
            </div>

            {locations.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-16 text-muted-foreground">
                        <MapPin className="mx-auto h-12 w-12 opacity-50 mb-4" />
                        <h3 className="text-lg font-semibold">No locations found</h3>
                        <p>Create your first location to get started.</p>
                        <Link href="/manage/locations/create" className="mt-4 inline-flex rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent">Create Location</Link>
                    </CardContent>
                </Card>
            ) : (
                <Card className="overflow-hidden">
                    <div className="flex flex-col">
                        {locations.map((location) => (
                            <LocationManagementCard key={location.id} location={location} />
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
