
'use client';

import { Link } from "@neup/components/ui/link";
import type { Location } from '@/lib/types';
import { Button } from '@neup/components/ui/button';
import { MoreHorizontal, Trash2, Edit, MapPin } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@neup/components/ui/dropdown-menu';
import { Badge } from '@neup/components/ui/badge';
import Image from 'next/image';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@neup/components/ui/alert-dialog";

interface LocationManagementCardProps {
    location: Location;
}

export function LocationManagementCard({ location }: LocationManagementCardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const res = await fetch(`/api/locations/${location.id}`, {
                    method: 'DELETE',
                });

                if (!res.ok) {
                    throw new Error('Failed to delete');
                }

                toast({ title: 'Success', description: 'Location deleted successfully.' });
                router.refresh();
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not delete location.',
                });
            }
        });
    };

    return (
        <div className="flex items-center gap-4 p-4 hover:bg-accent/5 transition-colors border-b last:border-0 relative group">
            <Link href={`/manage/locations/${location.id}/edit`} className="absolute inset-0 z-10">
                <span className="sr-only">Edit {location.name}</span>
            </Link>
            <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0 border flex items-center justify-center">
                {location.image ? (
                    <Image src={location.image} alt={location.name} fill className="object-cover" />
                ) : (
                    <MapPin className="h-8 w-8 text-muted-foreground/50" />
                )}
            </div>

            <div className="flex-1 min-w-0 pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-base group-hover:text-primary transition-colors truncate">{location.name}</p>
                    {location.isFeatured && <Badge variant="secondary" className="text-[10px] px-1.5 h-5">Featured</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{location.description || 'No description'}</p>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span className="font-mono">{location.slug}</span>
                    {/* @ts-ignore - parentName is injected via SQL join but not on main type always */}
                    {location.parentName && (
                        <>
                            <span>&bull;</span>
                            <span className="text-xs text-muted-foreground">In: {location.parentName}</span>
                        </>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 relative z-20">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/location/${location.slug}`} target="_blank">View Public Page</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/manage/locations/${location.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the location '{location.name}'.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        {isPending ? 'Deleting...' : 'Delete'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
