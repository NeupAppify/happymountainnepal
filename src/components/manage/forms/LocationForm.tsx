
'use client';

import { useForm, FormProvider } from 'react-hook-form';
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
import { Checkbox } from '@neup/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neup/components/ui/card';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Link } from "@neup/components/ui/link";
import { MediaPicker } from '../MediaPicker';
import { Location } from '@/lib/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@neup/components/ui/select';

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    slug: z.string().min(2, "Slug must be at least 2 characters.")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
    parentId: z.string().optional().nullable(),
    description: z.string().optional(),
    image: z.string().url("Please provide a valid image URL.").optional().or(z.literal('')),
    isFeatured: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
    initialData?: Location | null;
    availableLocations?: Location[];
}

export function LocationForm({ initialData, availableLocations = [] }: LocationFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || '',
            slug: initialData?.slug || '',
            parentId: initialData?.parentId || 'no-parent', // Use 'no-parent' as value for null
            description: initialData?.description || '',
            image: initialData?.image || '',
            isFeatured: initialData?.isFeatured || false,
        },
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            try {
                const url = initialData?.id
                    ? `/api/locations/${initialData.id}`
                    : '/api/locations';
                const method = initialData?.id ? 'PUT' : 'POST';

                // Handle 'no-parent' value
                const payload = {
                    ...values,
                    parentId: values.parentId === 'no-parent' ? null : values.parentId
                };

                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Failed to save location');
                }

                toast({ title: 'Success', description: 'Location saved successfully.' });
                router.push('/manage/locations');
                router.refresh();
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error.message || 'Could not save location.',
                });
            }
        });
    };

    // Filter out current location from parent options to avoid loops
    const parentOptions = availableLocations.filter(loc => loc.id !== initialData?.id);

    return (
        <div className="space-y-6">
            <Link href="/manage/locations" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Locations
            </Link>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold !font-headline">{initialData ? 'Edit Location' : 'Create Location'}</h1>
                    <p className="text-muted-foreground mt-2">{initialData ? 'Update existing location details.' : 'Add a new location to your system.'}</p>
                </div>
            </div>

            <FormProvider {...form}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Location Details</CardTitle>
                                <CardDescription>Basic information about the location.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Everest Base Camp" {...field} disabled={isPending}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        if (!initialData) {
                                                            // Auto-generate slug for new items
                                                            const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                                                            form.setValue('slug', slug);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="parentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Parent Location</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || 'no-parent'}>
                                                <FormControl>
                                                    <SelectTrigger disabled={isPending}>
                                                        <SelectValue placeholder="Select a parent location" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="no-parent">No Parent (Top Level)</SelectItem>
                                                    {parentOptions.map((loc) => (
                                                        <SelectItem key={loc.id} value={loc.id}>
                                                            {loc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Is this a sub-region of another location? e.g. "Namche Bazaar" is in "Everest Region".
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. everest-base-camp" {...field} disabled={isPending} />
                                            </FormControl>
                                            <FormDescription>URL-friendly version of the name.</FormDescription>
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
                                                <Textarea placeholder="Short description..." {...field} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <MediaPicker name="image" label="Featured Image" category="background" />

                                <FormField
                                    control={form.control}
                                    name="isFeatured"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Featured Location
                                                </FormLabel>
                                                <FormDescription>
                                                    If checked, this location will be displayed on the homepage.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                            </CardContent>
                        </Card>

                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Location
                        </Button>
                    </form>
                </Form>
            </FormProvider>
        </div>
    );
}
