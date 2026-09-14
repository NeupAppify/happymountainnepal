'use client';

import { useState, useTransition } from 'react';
import { type GearItem } from '@/lib/types';
import { createGear, updateGear, deleteGear } from '@/lib/db';
import { Button } from '@neup/components/ui/button';
import { Input } from '@neup/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@neup/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@neup/components/ui/dialog';
import { Checkbox } from '@neup/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { MediaLibraryDialog } from './MediaLibraryDialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@neup/components/ui/form';

const gearSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    image: z.string().optional(),
    provided: z.boolean().default(false),
});

type GearFormValues = z.infer<typeof gearSchema>;

interface GlobalGearsManagerProps {
    initialGears: GearItem[];
}

export function GlobalGearsManager({ initialGears }: GlobalGearsManagerProps) {
    const [gears, setGears] = useState<GearItem[]>(initialGears);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGear, setEditingGear] = useState<GearItem | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleCreate = (values: GearFormValues) => {
        startTransition(async () => {
            const newId = await createGear(values);
            if (newId) {
                setGears([...gears, { id: newId, ...values }]);
                toast({ title: "Success", description: "Gear added to library." });
                setIsDialogOpen(false);
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to add gear." });
            }
        });
    };

    const handleUpdate = (values: GearFormValues) => {
        if (!editingGear) return;
        startTransition(async () => {
            await updateGear(editingGear.id, values);
            setGears(gears.map(g => g.id === editingGear.id ? { ...g, ...values } : g));
            toast({ title: "Success", description: "Gear updated." });
            setIsDialogOpen(false);
            setEditingGear(null);
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure? This will remove it from the global library but NOT from existing packages.")) return;
        startTransition(async () => {
            await deleteGear(id);
            setGears(gears.filter(g => g.id !== id));
            toast({ title: "Success", description: "Gear deleted." });
        });
    };

    return (
        <div className="space-y-6">
            <Button onClick={() => { setEditingGear(null); setIsDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Add New Gear
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gears.map(gear => (
                    <Card key={gear.id} className="overflow-hidden">
                        <div className="relative h-48 w-full bg-muted">
                            {gear.image ? (
                                <Image src={gear.image} alt={gear.name} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                                <span>{gear.name}</span>
                            </CardTitle>
                            <CardDescription className="line-clamp-2">{gear.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                {gear.provided ? (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Provided</span>
                                ) : (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">User Brings</span>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setEditingGear(gear); setIsDialogOpen(true); }}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(gear.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <GearDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialData={editingGear}
                onSubmit={editingGear ? handleUpdate : handleCreate}
                isPending={isPending}
            />
        </div>
    );
}

function GearDialog({ open, onOpenChange, initialData, onSubmit, isPending }: any) {
    const form = useForm<GearFormValues>({
        resolver: zodResolver(gearSchema),
        defaultValues: {
            name: "",
            description: "",
            provided: false,
            image: "",
        },
        values: initialData ? {
            name: initialData.name,
            description: initialData.description || "",
            provided: initialData.provided,
            image: initialData.image || "",
        } : undefined
    });

    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

    const handleSubmit = (values: GearFormValues) => {
        onSubmit(values);
    };

    const handleImageSelect = (images: any[]) => {
        if (images.length > 0) {
            form.setValue('image', images[0].url);
        }
        setMediaPickerOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) form.reset();
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Gear' : 'Add New Gear'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image</FormLabel>
                                    <FormControl>
                                        <div
                                            className="h-40 bg-muted rounded-md border border-dashed flex items-center justify-center cursor-pointer relative overflow-hidden group"
                                            onClick={() => setMediaPickerOpen(true)}
                                        >
                                            {field.value ? (
                                                <>
                                                    <Image src={field.value} alt="Preview" fill className="object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <span className="text-white font-medium">Change Image</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center text-muted-foreground">
                                                    <ImageIcon className="h-8 w-8 mb-2" />
                                                    <span>Click to select image</span>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g. Hiking Boots" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Optional description..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="provided"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Provided by Company</FormLabel>
                                        <FormDescription>
                                            Does the company provide this gear?
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Save Changes' : 'Create Gear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>

            <MediaLibraryDialog
                isOpen={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleImageSelect}
                defaultTags={['general', 'background']}
            />
        </Dialog>
    );
}
