
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@neup/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@neup/components/ui/form';
import { Input } from '@neup/components/ui/input';
import { Textarea } from '@neup/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@neup/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { getTourById } from '@/lib/db';
import type { Tour } from '@/lib/types';
import { Skeleton } from '@neup/components/ui/skeleton';

const itineraryItemSchema = z.object({
  day: z.coerce.number().int().min(1),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
});

const formSchema = z.object({
  itinerary: z.array(itineraryItemSchema),
  customizationNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CustomizeItineraryStepProps {
  packageId: string;
}

export function CustomizeItineraryStep({ packageId }: CustomizeItineraryStepProps) {
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const region = searchParams.get('region');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itinerary: [],
      customizationNotes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "itinerary",
  });

  useEffect(() => {
    async function fetchTourDetails() {
      setIsLoading(true);
      const tourDetails = await getTourById(packageId);
      if (tourDetails) {
        setTour(tourDetails);
        form.reset({
          itinerary: tourDetails.itinerary || [],
          customizationNotes: '',
        });
      }
      setIsLoading(false);
    }
    fetchTourDetails();
  }, [packageId, form]);

  const onSubmit = (values: FormValues) => {
    // Save to localStorage for now to pass to next step
    localStorage.setItem(`booking-${packageId}`, JSON.stringify(values));
    router.push(`/book?step=details&region=${region}&package=${packageId}`);
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }
  
  return (
    <div>
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold !font-headline">Customize Your Itinerary</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Step 3: Adjust the plan for <span className="font-semibold text-primary">{tour?.name}</span>.
            </p>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Daily Itinerary</CardTitle>
                <CardDescription>Add, remove, or edit days to fit your schedule.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                         <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <div className="space-y-2">
                            <FormField control={form.control} name={`itinerary.${index}.day`} render={({ field }) => (
                                <FormItem><FormLabel>Day</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`itinerary.${index}.title`} render={({ field }) => (
                                <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Arrival in Kathmandu" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`itinerary.${index}.description`} render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Details for the day..." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </Card>
                ))}
                 <Button type="button" variant="outline" onClick={() => append({ day: fields.length + 1, title: '', description: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Day
                </Button>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="customizationNotes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Any other requests?</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="e.g., 'I'd like an extra acclimatization day in Namche Bazaar', or 'Can we add a visit to a local monastery?'"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <div className="p-4 bg-secondary/50 rounded-lg text-sm text-secondary-foreground text-center">
                You will get the expected price for your custom itinerary through an email or phone number you provide in the next step.
            </div>

            <div className="mt-8 flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.push(`/book?step=package&region=${region}`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Packages
                </Button>
                <Button type="submit">
                    Next: Your Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
          </form>
        </FormProvider>
    </div>
  );
}
