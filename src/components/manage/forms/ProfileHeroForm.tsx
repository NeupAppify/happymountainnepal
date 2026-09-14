
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
import { Textarea } from '@neup/components/ui/textarea';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { MultiMediaPicker } from '../MultiMediaPicker';
import { Link } from "@neup/components/ui/link";

const formSchema = z.object({
  heroTitle: z.string().optional(),
  heroDescription: z.string().optional(),
  footerTagline: z.string().optional(),
  heroImage: z.string().url("Please provide a valid image URL.").optional(),
  heroImages: z.array(z.string().url()).optional(),
  heroTransitionInterval: z.coerce.number().min(2, "Minimum 2 seconds").max(60, "Max 60 seconds").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileHeroForm() {
  const [isPending, startTransition] = useTransition();
  const { profile, isLoading } = useSiteProfile();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heroTitle: 'Discover Your Next Adventure',
      heroDescription: 'Explore breathtaking treks and cultural tours in the heart of the Himalayas. Unforgettable journeys await.',
      footerTagline: 'Your gateway to Himalayan adventures.',
      heroImage: 'https://happymountainnepal.com/wp-content/uploads/2022/06/everest-helicopter-tour1.jpg',
      heroImages: [],
      heroTransitionInterval: 5,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        heroTitle: profile.heroTitle || 'Discover Your Next Adventure',
        heroDescription: profile.heroDescription || 'Explore breathtaking treks and cultural tours in the heart of the Himalayas. Unforgettable journeys await.',
        footerTagline: profile.footerTagline || 'Your gateway to Himalayan adventures.',
        heroImage: profile.heroImage || 'https://happymountainnepal.com/wp-content/uploads/2022/06/everest-helicopter-tour1.jpg',
        heroImages: profile.heroImages || (profile.heroImage ? [profile.heroImage] : []),
        heroTransitionInterval: profile.heroTransitionInterval || 5,
      });
    }
  }, [profile?.id]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        // Sync main heroImage to first of heroImages if available
        if (values.heroImages && values.heroImages.length > 0) {
          values.heroImage = values.heroImages[0];
        }

        await updateSiteProfileAction(values);
        // Invalidate session storage cache
        sessionStorage.removeItem('site-profile');
        toast({ title: 'Success', description: 'Hero section updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update site profile hero: ${error.message}`, stack: error.stack, pathname, context: { values } });
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
          <Skeleton className="h-48 w-full" />
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
          <h1 className="text-3xl font-bold !font-headline">Hero Section</h1>
          <p className="text-muted-foreground mt-2">Manage homepage hero content, background images, and taglines.</p>
        </div>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Content</CardTitle>
                <CardDescription>Manage the main text content and background image for your homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <MultiMediaPicker name="heroImages" label="Hero Background Images" maxItems={12} tags={['all']} description="Select up to 12 images. The first image will be the default background, and others will cycle automatically." />

                <FormField
                  control={form.control}
                  name="heroTransitionInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slide Transition Interval (Seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" min={2} max={60} {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4 mt-4"></div>

                <FormField
                  control={form.control}
                  name="heroTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Homepage Hero Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Discover Your Next Adventure" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="heroDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Homepage Hero Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Explore breathtaking treks..." {...field} disabled={isPending} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="footerTagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer Tagline</FormLabel>
                      <FormControl>
                        <Input placeholder="Your gateway to Himalayan adventures." {...field} disabled={isPending} />
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
              Save Hero Settings
            </Button>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
