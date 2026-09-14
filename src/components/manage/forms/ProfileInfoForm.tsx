
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
} from '@neup/components/ui/form';
import { Input } from '@neup/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neup/components/ui/card';
import { logError } from '@/lib/db';
import { updateSiteProfileAction } from '@/app/actions/profile';
import { useTransition, useEffect } from 'react';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@neup/components/ui/skeleton';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { Link } from "@neup/components/ui/link";

const formSchema = z.object({
  basePath: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  reviewCount: z.coerce.number().int().min(0, "Review count cannot be negative.").optional(),
  contactEmail: z.string().email({ message: "Please enter a valid email." }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  locationUrl: z.string().url().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileInfoForm() {
  const [isPending, startTransition] = useTransition();
  const { profile, isLoading } = useSiteProfile();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basePath: '',
      reviewCount: 0,
      contactEmail: '',
      phone: '',
      address: '',
      location: '',
      locationUrl: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        basePath: profile?.basePath || '',
        reviewCount: profile.reviewCount || 0,
        contactEmail: profile.contactEmail || '',
        phone: profile.phone || '',
        address: profile.address || '',
        location: profile.location || '',
        locationUrl: profile.locationUrl || '',
      });
    }
  }, [profile?.id]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateSiteProfileAction(values);
        // Invalidate session storage cache
        sessionStorage.removeItem('site-profile');
        toast({ title: 'Success', description: 'Company info updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update site profile info: ${error.message}`, stack: error.stack, pathname, context: { values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save profile. Please try again.',
        });
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/manage/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Profile
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold !font-headline">Company Info</h1>
          <p className="text-muted-foreground mt-2">Edit general company details, contact info, and website settings.</p>
        </div>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Manage public company stats and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="basePath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Path (Website URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://happymountainnepal.com" {...field} disabled={isPending} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        The base URL of your website. This is required for creating correct links in sitemaps and feeds.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reviewCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Review Count</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 250" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="info@example.com" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555-123-4567" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Address (Legacy)</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Mountain Rd, Kathmandu, Nepal" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Name (Displayed)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Kathmandu, Nepal" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location URL (Map Link)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://goo.gl/maps/..." {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Info Settings
            </Button>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
