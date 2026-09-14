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
import { Card, CardContent } from '@neup/components/ui/card';
import { type Tour } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neup/components/ui/select";

const formSchema = z.object({
  bookingType: z.enum(['internal', 'external'], { required_error: "Booking type is required." }),
  externalBookingUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.bookingType === 'external' && (!data.externalBookingUrl || data.externalBookingUrl.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "External booking URL is required for external booking type.",
      path: ['externalBookingUrl'],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

interface BookingFormProps {
  tour: Tour;
}

export function BookingForm({ tour }: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingType: tour.bookingType || 'internal',
      externalBookingUrl: tour.externalBookingUrl || '',
    },
  });

  const bookingType = form.watch('bookingType');

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateTour(tour.id, values);
        toast({ title: 'Success', description: 'Booking settings updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update booking settings for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values: values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save booking settings. Please try again.',
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
              name="bookingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select booking method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="internal">Internal Booking (via departure dates)</SelectItem>
                      <SelectItem value="external">External Booking (link to another site)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {bookingType === 'external' && (
              <FormField
                control={form.control}
                name="externalBookingUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External Booking URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.example.com/book-this-tour" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Booking Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
