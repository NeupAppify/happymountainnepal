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
    FormMessage,
} from '@neup/components/ui/form';
import { Input } from '@neup/components/ui/input';
import { Card, CardContent } from '@neup/components/ui/card';
import { type Tour, type BlogPost, type GuideItem } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition, useState } from 'react';
import { Loader2, PlusCircle, Trash2, RefreshCw, BookOpen, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@neup/components/ui/dialog';
import { Checkbox } from '@neup/components/ui/checkbox';
import Image from 'next/image';

const guideItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    excerpt: z.string(),
    image: z.string(),
    slug: z.string(),
    author: z.string(),
    globalId: z.string().optional(),
});

export const guideFormSchema = z.object({
    guides: z.array(guideItemSchema).optional(),
});

type FormValues = z.infer<typeof guideFormSchema>;

interface GuideFormProps {
    tour: Tour;
    globalBlogs: BlogPost[];
}

export function GuideForm({ tour, globalBlogs }: GuideFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const pathname = usePathname();

    const form = useFormContext<FormValues>();

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "guides",
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            try {
                // Ensure dates are correctly formatted/handled if backend expects Timestamp
                // But updateTour should handle object updates.
                await updateTour(tour.id, { guides: values.guides });
                toast({ title: 'Success', description: 'Guides updated successfully.' });
            } catch (error: any) {
                logError({ message: `Failed to update guides for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values } });
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
    const [searchQuery, setSearchQuery] = useState("");

    const handleLibraryConfirm = () => {
        const selected = globalBlogs.filter(b => selectedFromLib.includes(b.id));
        selected.forEach(b => {
            // Check if already linked to avoid duplicates?
            const isAlreadyLinked = form.getValues('guides')?.some(g => g.globalId === b.id);
            if (!isAlreadyLinked) {
                append({
                    id: uuidv4(),
                    title: b.title,
                    excerpt: b.excerpt,
                    image: b.image,
                    slug: b.slug,
                    author: b.author,
                    globalId: b.id
                });
            }
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

    const filteredBlogs = globalBlogs.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Card>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-medium">Blogs & Guides</h3>
                                        <p className="text-sm text-muted-foreground">Select relevant articles to display on the tour page.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const currentGuides = form.getValues('guides') || [];
                                                let updatedCount = 0;
                                                currentGuides.forEach((guide, index) => {
                                                    if (guide.globalId) {
                                                        const globalItem = globalBlogs.find(b => b.id === guide.globalId);
                                                        if (globalItem) {
                                                            update(index, {
                                                                ...guide,
                                                                title: globalItem.title,
                                                                excerpt: globalItem.excerpt,
                                                                image: globalItem.image,
                                                                slug: globalItem.slug,
                                                                author: globalItem.author
                                                            });
                                                            updatedCount++;
                                                        }
                                                    }
                                                });
                                                if (updatedCount > 0) {
                                                    toast({ title: 'Sync Complete', description: `Updated ${updatedCount} guides from library.` });
                                                } else {
                                                    toast({ description: 'No linked guides found to sync or no updates needed.' });
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
                                    {(fields || []).map((field, index) => (
                                        <div key={field.id} className="flex gap-4 p-4 border rounded-lg bg-card/50 items-start">
                                            {/* Thumbnail */}
                                            <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0 border bg-muted">
                                                {form.watch(`guides.${index}.image`) ? (
                                                    <Image src={form.watch(`guides.${index}.image`)} alt="Thumbnail" fill className="object-cover" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><BookOpen className="h-8 w-8" /></div>}
                                            </div>

                                            <div className="flex-grow space-y-2">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{form.watch(`guides.${index}.title`)}</h4>
                                                        <p className="text-sm text-muted-foreground line-clamp-1">{form.watch(`guides.${index}.excerpt`)}</p>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                            <span>By {form.watch(`guides.${index}.author`)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        {form.getValues(`guides.${index}.globalId`) && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Sync from Global Library"
                                                                onClick={() => {
                                                                    const gid = form.getValues(`guides.${index}.globalId`);
                                                                    const globalItem = globalBlogs.find(b => b.id === gid);
                                                                    if (globalItem) {
                                                                        update(index, {
                                                                            ...form.getValues(`guides.${index}`),
                                                                            title: globalItem.title,
                                                                            excerpt: globalItem.excerpt,
                                                                            image: globalItem.image,
                                                                            slug: globalItem.slug,
                                                                            author: globalItem.author
                                                                        });
                                                                        toast({ title: 'Synced', description: 'Guide info refreshed from library.' });
                                                                    } else {
                                                                        toast({ variant: 'destructive', title: 'Error', description: 'Original blog not found in library.' });
                                                                    }
                                                                }}
                                                            >
                                                                <RefreshCw className="h-4 w-4 text-orange-500" />
                                                            </Button>
                                                        )}
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {fields.length === 0 && (
                                        <div className="text-center py-10 border border-dashed rounded-lg">
                                            <p className="text-muted-foreground">No guides linked to this package.</p>
                                            <Button type="button" variant="link" onClick={() => setLibraryOpen(true)}>Select from library</Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Guides
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Select from Blogs Library ({globalBlogs.length})</DialogTitle>
                    </DialogHeader>
                    <div className="p-1">
                        <Input
                            placeholder="Search blogs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="mb-4"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 py-2">
                        {filteredBlogs.length === 0 ? (
                            <p className="text-center text-muted-foreground">No matching blogs found.</p>
                        ) : (
                            filteredBlogs.map(blog => (
                                <div key={blog.id} className="flex items-start space-x-3 border p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => toggleLibSelection(blog.id)}>
                                    <Checkbox
                                        checked={selectedFromLib.includes(blog.id)}
                                        onCheckedChange={() => toggleLibSelection(blog.id)}
                                    />
                                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                                        {blog.image && <Image src={blog.image} alt={blog.title} fill className="object-cover" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium leading-tight">{blog.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                                        <p className="text-[10px] text-muted-foreground flex justify-between mt-1">
                                            <span>{blog.author}</span>
                                            <span>{typeof blog.date === 'string' ? new Date(blog.date).toLocaleDateString() : 'Date N/A'}</span>
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
