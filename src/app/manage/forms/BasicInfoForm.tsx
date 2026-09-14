
'use client';

import { useForm } from 'react-hook-form';
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
} from '@neup/components/ui/form';
import { Input } from '@neup/components/ui/input';
import { Textarea } from '@neup/components/ui/textarea';
import { Card, CardContent } from '@neup/components/ui/card';
import { type Tour } from '@/lib/types';
import { updateTour, logError, checkSlugAvailability, validateTourForPublishing } from '@/lib/db';
import { useTransition, useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@neup/components/ui/select';
import { usePathname } from 'next/navigation';
import { slugify } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

const formSchema = z.object({
  name: z.string().min(5, { message: "Name must be at least 5 characters." }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters." }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and use hyphens for spaces."),
  region: z.string().min(1, { message: "At least one region is required." }),
  type: z.enum(['Trekking', 'Tour', 'Climbing', 'Jungle Safari']),
  difficulty: z.enum(['Easy', 'Moderate', 'Strenuous', 'Challenging']),
  duration: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  status: z.enum(['draft', 'published', 'unpublished', 'hidden']),
  searchKeywords: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BasicInfoFormProps {
  tour: Tour;
}

export function BasicInfoForm({ tour }: BasicInfoFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tour.name || '',
      slug: tour.slug || slugify(tour.name || 'new-package'),
      region: Array.isArray(tour.region) ? tour.region.join(', ') : tour.region || '',
      type: tour.type || 'Trekking',
      difficulty: tour.difficulty || 'Moderate',
      duration: tour.duration || 0,
      description: tour.description || '',
      status: tour.status || 'draft',
      searchKeywords: tour.searchKeywords || [],
    },
  });

  const name = form.watch('name');
  const currentSlug = form.watch('slug');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const debouncedSlug = useDebounce(currentSlug, 500);

  useEffect(() => {
    if (!isSlugManuallyEdited && name) {
      form.setValue('slug', slugify(name), { shouldValidate: true });
    }
  }, [name, isSlugManuallyEdited, form]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (debouncedSlug && form.formState.errors.slug?.message === undefined) {
        setIsSlugChecking(true);
        try {
          const available = await checkSlugAvailability(debouncedSlug, tour.id);
          setIsSlugAvailable(available);
          if (!available) {
            form.setError('slug', { type: 'manual', message: 'This slug is already taken.' });
          } else {
            form.clearErrors('slug');
          }
        } catch (error) {
          console.error("Error checking slug availability:", error);
          setIsSlugAvailable(false);
          form.setError('slug', { type: 'manual', message: 'Could not check slug availability.' });
        } finally {
          setIsSlugChecking(false);
        }
      } else {
        setIsSlugAvailable(null);
      }
    };
    checkAvailability();
  }, [debouncedSlug, tour.id, form, form.formState.errors.slug?.message]);

  const generateKeywords = (values: FormValues): string[] => {
    const keywords = new Set<string>();
    values.name.toLowerCase().split(' ').forEach(word => keywords.add(word));
    values.description.toLowerCase().split(' ').forEach(word => keywords.add(word.replace(/[^a-z0-9]/gi, '')));
    values.region.split(',').forEach(r => keywords.add(r.trim().toLowerCase()));
    keywords.add(values.type.toLowerCase());
    keywords.add(values.difficulty.toLowerCase());
    return Array.from(keywords).filter(Boolean);
  }

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        if (values.status === 'published' && tour.status !== 'published') {
          const validationResult = await validateTourForPublishing(tour.id);
          if (validationResult !== true) {
            toast({
              variant: 'destructive',
              title: 'Cannot Publish',
              description: (
                <div>
                  <p>The package cannot be published due to missing information:</p>
                  <ul className="list-disc list-inside mt-2">
                    {validationResult.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              ),
            });
            return;
          }
        }
        
        const keywords = generateKeywords(values);
        const regionArray = values.region.split(',').map(s => s.trim()).filter(Boolean);
        const dataToUpdate = { 
          ...values, 
          region: regionArray,
          searchKeywords: keywords 
        };

        await updateTour(tour.id, dataToUpdate);
        toast({ title: 'Success', description: 'Basic info updated.' });
      } catch (error: any) {
        console.error("Failed to save package:", error);
        logError({ message: `Failed to update basic info for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values: values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save package. Please try again.',
        });
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Everest Base Camp Trek" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="e.g., everest-base-camp-trek"
                        {...field}
                        disabled={isPending || isSlugChecking}
                        onChange={(e) => {
                          field.onChange(slugify(e.target.value));
                          setIsSlugManuallyEdited(true);
                          setIsSlugAvailable(null);
                        }}
                      />
                    </FormControl>
                    {isSlugChecking && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
                    )}
                    {!isSlugChecking && isSlugAvailable !== null && (
                      isSlugAvailable ? (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                      )
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief overview of the trek or tour..."
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Region (comma-separated)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Everest, Annapurna" {...field as any} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Duration (in days)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Activity Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an activity type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Trekking">Trekking</SelectItem>
                                <SelectItem value="Tour">Tour</SelectItem>
                                <SelectItem value="Climbing">Climbing</SelectItem>
                                <SelectItem value="Jungle Safari">Jungle Safari</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a difficulty level" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Moderate">Moderate</SelectItem>
                                <SelectItem value="Strenuous">Strenuous</SelectItem>
                                <SelectItem value="Challenging">Challenging</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="unpublished">Unpublished</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isPending || isSlugChecking || (isSlugAvailable === false)}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
