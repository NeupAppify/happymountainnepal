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
  FormLabel,
  FormMessage,
} from '@neup/components/ui/form';
import { Input } from '@neup/components/ui/input';
import { Textarea } from '@neup/components/ui/textarea';
import { Card, CardContent } from '@neup/components/ui/card';
import { type Tour } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition } from 'react';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';

const faqItemSchema = z.object({
  question: z.string().min(5, "Question is required and must be at least 5 characters."),
  answer: z.string().min(10, "Answer is required and must be at least 10 characters."),
});

const formSchema = z.object({
  faq: z.array(faqItemSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface FaqFormProps {
  tour: Tour;
}

export function FaqForm({ tour }: FaqFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      faq: tour.faq || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faq",
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateTour(tour.id, { faq: values.faq });
        toast({ title: 'Success', description: 'FAQ section updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update FAQ for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values: values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save FAQ. Please try again.',
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
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => remove(index)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <FormField
                      control={form.control}
                      name={`faq.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., What is the best time to visit?" {...field} disabled={isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`faq.${index}.answer`}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Answer</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Provide a detailed answer here..." {...field} disabled={isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => append({ question: '', answer: '' })}
                    disabled={isPending}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save FAQs
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
