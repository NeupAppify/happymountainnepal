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
import { Checkbox } from '@neup/components/ui/checkbox';
import { Card, CardContent } from '@neup/components/ui/card';
import { type Tour, type GearItem, type ImageWithCaption } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition, useState } from 'react';
import { Loader2, PlusCircle, Trash2, Image as ImageIcon, Check, Backpack } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { MediaLibraryDialog } from '../MediaLibraryDialog';
import Image from 'next/image';
import { Reorder } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@neup/components/ui/dialog';

const gearItemSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    image: z.string().optional(),
    provided: z.boolean().default(false),
    globalId: z.string().optional(),
});

export const gearsFormSchema = z.object({
    gears: z.array(gearItemSchema),
});

type FormValues = z.infer<typeof gearsFormSchema>;

interface GearsFormProps {
    tour: Tour;
    globalGears: GearItem[];
}

export function GearsForm({ tour, globalGears }: GearsFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const pathname = usePathname();
    const [mediaPickerOpen, setMediaPickerOpen] = useState<{ isOpen: boolean; index: number | null }>({ isOpen: false, index: null });

    const form = useFormContext<FormValues>();

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "gears",
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            try {
                await updateTour(tour.id, values);
                toast({ title: 'Success', description: 'Gears updated successfully.' });
            } catch (error: any) {
                logError({ message: `Failed to update gears for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values } });
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not save changes. Please try again.',
                });
            }
        });
    };

    const handleImageSelect = (images: ImageWithCaption[]) => {
        if (mediaPickerOpen.index !== null && images.length > 0) {
            const currentGear = form.getValues(`gears.${mediaPickerOpen.index}`);
            update(mediaPickerOpen.index, { ...currentGear, image: images[0].url });
        }
        setMediaPickerOpen({ isOpen: false, index: null });
    };

    const [libraryOpen, setLibraryOpen] = useState(false);
    const [selectedFromLib, setSelectedFromLib] = useState<string[]>([]);

    const handleLibraryConfirm = () => {
        const selected = globalGears.filter(g => selectedFromLib.includes(g.id));
        selected.forEach(g => {
            append({
                id: uuidv4(),
                name: g.name,
                description: g.description,
                image: g.image,
                provided: g.provided,
                globalId: g.id // Save the global ID
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
                                    <h3 className="text-lg font-medium">Gears & Equipment</h3>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="secondary" size="sm" onClick={() => setLibraryOpen(true)}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Select from Library
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => append({ id: uuidv4(), name: '', provided: false })}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add Custom Item
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card/50">
                                            {/* Image Preview/Select */}
                                            <div className="flex-shrink-0">
                                                <FormField
                                                    control={form.control}
                                                    name={`gears.${index}.image`}
                                                    render={({ field }) => (
                                                        <div
                                                            className="relative w-24 h-24 bg-muted rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors border overflow-hidden group"
                                                            onClick={() => setMediaPickerOpen({ isOpen: true, index })}
                                                        >
                                                            {field.value ? (
                                                                <>
                                                                    <Image src={field.value} alt="Gear" fill className="object-cover" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                        <ImageIcon className="text-white h-6 w-6" />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-center p-2">
                                                                    <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                                                                    <span className="text-[10px] text-muted-foreground">Add Photo</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                />
                                            </div>

                                            {/* Info Fields */}
                                            <div className="flex-grow space-y-3">
                                                <div className="flex gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`gears.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-grow">
                                                                <FormControl>
                                                                    <div className="flex gap-2">
                                                                        <Input {...field} placeholder="Item Name (e.g., Down Jacket)" disabled={isPending} />
                                                                        {form.getValues(`gears.${index}.globalId`) && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                title="Sync from Global Library"
                                                                                onClick={() => {
                                                                                    const gid = form.getValues(`gears.${index}.globalId`);
                                                                                    const globalItem = globalGears.find(g => g.id === gid);
                                                                                    if (globalItem) {
                                                                                        update(index, {
                                                                                            ...form.getValues(`gears.${index}`),
                                                                                            name: globalItem.name,
                                                                                            description: globalItem.description,
                                                                                            image: globalItem.image,
                                                                                            provided: globalItem.provided
                                                                                        });
                                                                                        toast({ title: 'Synced', description: 'Gear info refreshed from library.' });
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <Backpack className="h-4 w-4 text-orange-500" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={isPending} className="text-muted-foreground hover:text-destructive shrink-0">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name={`gears.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input {...field} placeholder="Description (Optional)" disabled={isPending} className="text-sm" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`gears.${index}.provided`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <div className="space-y-1 leading-none">
                                                                <FormLabel className="cursor-pointer">
                                                                    Provided by us
                                                                </FormLabel>
                                                                <FormDescription>
                                                                    Check if this item is provided by the company.
                                                                </FormDescription>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {fields.length === 0 && (
                                        <div className="text-center py-10 border border-dashed rounded-lg">
                                            <p className="text-muted-foreground">No gears added yet.</p>
                                            <Button type="button" variant="link" onClick={() => setLibraryOpen(true)}>Select from library</Button>
                                            <span className="text-muted-foreground mx-2">or</span>
                                            <Button type="button" variant="link" onClick={() => append({ id: uuidv4(), name: '', provided: false })}>Add custom item</Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={() => append({ id: uuidv4(), name: '', provided: false })}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Another Item
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Gears
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Select from Global Library</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 py-4">
                        {globalGears.length === 0 ? (
                            <p className="text-center text-muted-foreground">No global gears found. Add them in the Gears Library page.</p>
                        ) : (
                            globalGears.map(gear => (
                                <div key={gear.id} className="flex items-start space-x-3 border p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => toggleLibSelection(gear.id)}>
                                    <Checkbox
                                        checked={selectedFromLib.includes(gear.id)}
                                        onCheckedChange={() => toggleLibSelection(gear.id)}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between">
                                            <p className="font-medium leading-none">{gear.name}</p>
                                            {gear.provided && <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Provided</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{gear.description}</p>
                                    </div>
                                    {gear.image && (
                                        <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0 bg-muted">
                                            <Image src={gear.image} alt={gear.name} fill className="object-cover" />
                                        </div>
                                    )}
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

            <MediaLibraryDialog
                isOpen={mediaPickerOpen.isOpen}
                onClose={() => setMediaPickerOpen({ isOpen: false, index: null })}
                onSelect={handleImageSelect}
                defaultTags={['general', 'background']} // Using general tags as default
            />
        </>
    );
}
