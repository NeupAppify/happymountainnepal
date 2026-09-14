'use client';

import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
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
import { type Tour } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition } from 'react';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';

interface InclusionsFormValues {
  inclusions: { value: string }[];
  exclusions: { value: string }[];
}

const formSchema = z.object({
  inclusions: z.array(z.object({ value: z.string().min(1, "Inclusion cannot be empty.") })),
  exclusions: z.array(z.object({ value: z.string().min(1, "Exclusion cannot be empty.") })),
});

interface InclusionsFormProps {
  tour: Tour;
}

export function InclusionsForm({ tour }: InclusionsFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<InclusionsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inclusions: (tour.inclusions || []).map(i => ({ value: i })),
      exclusions: (tour.exclusions || []).map(e => ({ value: e })),
    },
  });

  const { fields: inclusionFields, append: appendInclusion, remove: removeInclusion } = useFieldArray({
    control: form.control,
    name: "inclusions",
  });

  const { fields: exclusionFields, append: appendExclusion, remove: removeExclusion } = useFieldArray({
    control: form.control,
    name: "exclusions",
  });

  const onSubmit = (values: InclusionsFormValues) => {
    startTransition(async () => {
      try {
        const dataToSave = {
          inclusions: values.inclusions.map(i => i.value),
          exclusions: values.exclusions.map(e => e.value),
        };
        await updateTour(tour.id, dataToSave);
        toast({ title: 'Success', description: 'Inclusions and exclusions updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update inclusions for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values: values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save changes. Please try again.',
        });
      }
    });
  };

  return (
    <FormProvider {...form}>
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Inclusions</h3>
                        {inclusionFields.map((field, index) => (
                            <FormField
                            key={field.id}
                            control={form.control}
                            name={`inclusions.${index}.value`}
                            render={({ field }) => (
                                <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                    <Input {...field} placeholder="e.g., Airport transfers" disabled={isPending} />
                                    </FormControl>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeInclusion(index)} disabled={isPending}>
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendInclusion({ value: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Inclusion
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Exclusions</h3>
                        {exclusionFields.map((field, index) => (
                            <FormField
                            key={field.id}
                            control={form.control}
                            name={`exclusions.${index}.value`}
                            render={({ field }) => (
                                <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                    <Input {...field} placeholder="e.g., International airfare" disabled={isPending} />
                                    </FormControl>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExclusion(index)} disabled={isPending}>
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendExclusion({ value: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Exclusion
                        </Button>
                    </div>
                </div>
                
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
    </FormProvider>
  );
}
