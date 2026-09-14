'use client';

import { useEffect, useState } from 'react';
import { Link } from "@neup/components/ui/link";
import Image from 'next/image';
import { Card, CardContent } from '@neup/components/ui/card';
import { Input } from '@neup/components/ui/input';
import { Search, MapPin, Loader2 } from 'lucide-react';
import type { Location } from '@/lib/types';
import { Skeleton } from '@neup/components/ui/skeleton';

export function LocationsClient({ initialLocations }: { initialLocations: Location[] }) {
    const [locations] = useState<Location[]>(initialLocations);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLocations = locations.filter(loc => 
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search destinations..."
                    className="pl-10 h-12 text-base rounded-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredLocations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLocations.map((location) => (
                        <Link key={location.id} href={`/location/${location.slug}`} className="group">
                            <Card className="overflow-hidden h-full border-0 shadow-md hover:shadow-xl transition-all duration-300">
                                <div className="relative h-48 w-full overflow-hidden">
                                    {location.image ? (
                                        <Image
                                            src={location.image}
                                            alt={location.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <MapPin className="h-12 w-12 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-xl font-bold text-white group-hover:underline decoration-white/50 underline-offset-4">
                                            {location.name}
                                        </h3>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {location.description || `Explore ${location.name} with our guided tours.`}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">No destinations found</h3>
                    <p className="text-muted-foreground">Try adjusting your search term.</p>
                </div>
            )}
        </div>
    );
}
