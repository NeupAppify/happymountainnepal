'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@neup/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@neup/components/ui/form';
import { Input } from '@neup/components/ui/input';
import { Textarea } from '@neup/components/ui/textarea';
import { Card, CardContent } from '@neup/components/ui/card';
import { type Tour, type ManagedReview, type Review } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition, useState } from 'react';
import { Loader2, PlusCircle, Trash2, Check, RefreshCw, Star, Backpack } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@neup/components/ui/dialog';
import { Checkbox } from '@neup/components/ui/checkbox';

const reviewItemSchema = z.object({
    id: z.string(),
    rating: z.number().min(1).max(5),
    author: z.string().min(1, "Author is required"),
    comment: z.string().min(1, "Comment is required"),
    date: z.custom<Review['date']>(),
    globalId: z.string().optional(),
});

export const reviewsFormSchema = z.object({
    reviews: z.array(reviewItemSchema),
});

type FormValues = z.infer<typeof reviewsFormSchema>;

interface ReviewsFormProps {
    tour: Tour;
    globalReviews: ManagedReview[];
}

export function ReviewsForm({ tour, globalReviews }: ReviewsFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const pathname = usePathname();

    const form = useFormContext<FormValues>();

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "reviews",
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            try {
                // Ensure dates are strings for JSON serialization if needed, or keep as is if Timestamp works
                // But db.ts usually expects objects. `updateTour` handles whatever is passed.
                // NOTE: We might need to handle Timestamp serialization if it causes issues.
                await updateTour(tour.id, values);
                toast({ title: 'Success', description: 'Reviews updated successfully.' });
            } catch (error: any) {
                logError({ message: `Failed to update reviews for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values } });
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not save changes. Please try again.',
                });
            }
        });
    };

    const [libraryOpen, setLibraryOpen] = useState(false);
    const [selectedFromLib, setSelectedFromLib] = useState<string[]>([]);

    const handleLibraryConfirm = () => {
        const selected = globalReviews.filter(r => selectedFromLib.includes(r.id));
        selected.forEach(r => {
            // Check if already exists to avoid duplicates? Usually allows multiple same reviews is user wants, but unlikely.
            // Let's just append.
            append({
                id: uuidv4(),
                rating: r.stars,
                author: r.userName,
                comment: r.reviewBody,
                date: typeof r.reviewedOn === 'string' ? r.reviewedOn : (r.reviewedOn as any).toDate ? (r.reviewedOn as any).toDate().toISOString() : new Date(r.reviewedOn as any).toISOString(),
                globalId: r.id
            });
        });
        setLibraryOpen(false);
        setSelectedFromLib([]);
    };

    const toggleLibSelection = (id: string) => {
        if (selectedFromLib.includes(id)) {
            setSelectedFromLib(selectedFromLib.filter(sid => sid !== id));
        } else {
            setSelectedFromLib([...selectedFromLib, id]);
        }
    };

    return (
        <>
            <Card>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">Customer Reviews</h3>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const currentReviews = form.getValues('reviews');
                                                let updatedCount = 0;
                                                currentReviews.forEach((review, index) => {
                                                    if (review.globalId) {
                                                        const globalItem = globalReviews.find(r => r.id === review.globalId);
                                                        if (globalItem) {
                                                            const dateStr = typeof globalItem.reviewedOn === 'string' ? globalItem.reviewedOn : (globalItem.reviewedOn as any).toDate ? (globalItem.reviewedOn as any).toDate().toISOString() : new Date(globalItem.reviewedOn as any).toISOString();

                                                            update(index, {
                                                                ...review,
                                                                author: globalItem.userName,
                                                                comment: globalItem.reviewBody,
                                                                rating: globalItem.stars,
                                                                date: dateStr
                                                            });
                                                            updatedCount++;
                                                        }
                                                    }
                                                });
                                                if (updatedCount > 0) {
                                                    toast({ title: 'Sync Complete', description: `Updated ${updatedCount} reviews from library.` });
                                                } else {
                                                    toast({ description: 'No linked reviews found to sync.' });
                                                }
                                            }}
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Sync All
                                        </Button>
                                        <Button type="button" variant="secondary" size="sm" onClick={() => setLibraryOpen(true)}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Select from Library
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex flex-col gap-4 p-4 border rounded-lg bg-card/50">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-grow space-y-2">
                                                    <div className="flex gap-2 items-center">
                                                        <FormField
                                                            control={form.control}
                                                            name={`reviews.${index}.author`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex-1">
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="Author Name" className="font-medium" readOnly />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`reviews.${index}.rating`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-24">
                                                                    <FormControl>
                                                                        <div className="flex items-center border rounded-md px-2 h-10 bg-muted/50 text-muted-foreground cursor-not-allowed">
                                                                            <Star className="h-4 w-4 text-yellow-500 mr-2" />
                                                                            <span className="text-sm">{field.value}</span>
                                                                        </div>
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Sync Button */}
                                                        {form.getValues(`reviews.${index}.globalId`) && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Sync from Global Library"
                                                                onClick={() => {
                                                                    const gid = form.getValues(`reviews.${index}.globalId`);
                                                                    const globalItem = globalReviews.find(r => r.id === gid);
                                                                    if (globalItem) {
                                                                        const dateStr = typeof globalItem.reviewedOn === 'string' ? globalItem.reviewedOn : (globalItem.reviewedOn as any).toDate ? (globalItem.reviewedOn as any).toDate().toISOString() : new Date(globalItem.reviewedOn as any).toISOString();

                                                                        update(index, {
                                                                            ...form.getValues(`reviews.${index}`),
                                                                            author: globalItem.userName,
                                                                            comment: globalItem.reviewBody,
                                                                            rating: globalItem.stars,
                                                                            date: dateStr
                                                                        });
                                                                        toast({ title: 'Synced', description: 'Review info refreshed from library.' });
                                                                    } else {
                                                                        toast({ variant: 'destructive', title: 'Error', description: 'Original review not found in library.' });
                                                                    }
                                                                }}
                                                            >
                                                                <RefreshCw className="h-4 w-4 text-orange-500" />
                                                            </Button>
                                                        )}

                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={isPending} className="text-muted-foreground hover:text-destructive shrink-0">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name={`reviews.${index}.comment`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Textarea {...field} placeholder="Review Comment" className="resize-y" readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {fields.length === 0 && (
                                        <div className="text-center py-10 border border-dashed rounded-lg">
                                            <p className="text-muted-foreground">No reviews linked to this package.</p>
                                            <Button type="button" variant="link" onClick={() => setLibraryOpen(true)}>Select from library</Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Reviews
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Select from Global Reviews ({globalReviews.length})</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 py-4">
                        {globalReviews.length === 0 ? (
                            <p className="text-center text-muted-foreground">No global reviews found.</p>
                        ) : (
                            globalReviews.map(review => (
                                <div key={review.id} className="flex items-start space-x-3 border p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => toggleLibSelection(review.id)}>
                                    <Checkbox
                                        checked={selectedFromLib.includes(review.id)}
                                        onCheckedChange={() => toggleLibSelection(review.id)}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium leading-none">{review.userName}</p>
                                            <div className="flex items-center text-yellow-500 text-xs">
                                                <Star className="h-3 w-3 fill-current mr-1" />
                                                {review.stars}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{review.reviewBody}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {typeof review.reviewedOn === 'string' ? new Date(review.reviewedOn).toLocaleDateString() : 'Date N/A'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLibraryOpen(false)}>Cancel</Button>
                        <Button onClick={handleLibraryConfirm} disabled={selectedFromLib.length === 0}>
                            Add Selected ({selectedFromLib.length})
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
