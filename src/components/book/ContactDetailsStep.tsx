
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@neup/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@neup/components/ui/form';
import { Input } from '@neup/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@neup/components/ui/card';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveInquiry, logError } from '@/lib/db';
import { usePathname } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required."),
  phone: z.string().optional(),
  country: z.string().min(2, "Country is required."),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactDetailsStepProps {
  packageId: string;
}

export function ContactDetailsStep({ packageId }: ContactDetailsStepProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const customizationData = JSON.parse(localStorage.getItem(`booking-${packageId}`) || '{}');
        
        const inquiryPayload = {
            type: 'booking' as const,
            page: pathname,
            temporary_id: 'booking-form', 
            data: {
                basePackageId: packageId,
                ...customizationData,
                ...values,
            },
        };

        await saveInquiry(inquiryPayload);
        
        toast({
          title: "Inquiry Submitted!",
          description: "Thank you for your request. We will review your custom itinerary and get back to you shortly.",
        });

        localStorage.removeItem(`booking-${packageId}`);
        router.push(`/book?step=complete`);

      } catch (error: any) {
        console.error("Booking form submission error:", error);
        logError({
          message: 'Booking form submission failed',
          stack: error.stack,
          pathname,
          context: { values }
        });
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: 'There was a problem sending your request. Please try again.',
        });
      }
    });
  };

  return (
    <div>
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold !font-headline">Your Details</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Step 4: Tell us who you are.
            </p>
        </div>
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>We'll use this to send you your quote and itinerary.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input placeholder="+1 555-123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="e.g., United States" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>
                 <div className="mt-8 flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customization
                    </Button>
                    <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Inquiry <Send className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </FormProvider>
    </div>
  );
}
