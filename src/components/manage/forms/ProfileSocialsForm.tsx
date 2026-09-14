
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
import { Facebook, Instagram, Loader2, Twitter, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@neup/components/ui/skeleton';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { Link } from "@neup/components/ui/link";

const formSchema = z.object({
  socials: z.object({
    facebook: z.string().url().or(z.literal('')).optional(),
    instagram: z.string().url().or(z.literal('')).optional(),
    twitter: z.string().url().or(z.literal('')).optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileSocialsForm() {
  const [isPending, startTransition] = useTransition();
  const { profile, isLoading } = useSiteProfile();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      socials: {
        facebook: '',
        instagram: '',
        twitter: '',
      },
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        socials: {
          facebook: profile.socials?.facebook || '',
          instagram: profile.socials?.instagram || '',
          twitter: profile.socials?.twitter || '',
        },
      });
    }
  }, [profile?.id]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateSiteProfileAction(values);
        // Invalidate session storage cache
        sessionStorage.removeItem('site-profile');
        toast({ title: 'Success', description: 'Social media links updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update site profile socials: ${error.message}`, stack: error.stack, pathname, context: { values } });
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
          <h1 className="text-3xl font-bold !font-headline">Social Media</h1>
          <p className="text-muted-foreground mt-2">Manage links to your social media profiles.</p>
        </div>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Enter the full URLs for your social media profiles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="socials.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Facebook className="h-4 w-4" /> Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/your-page" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socials.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="https://instagram.com/your-profile" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socials.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Twitter className="h-4 w-4" /> Twitter / X</FormLabel>
                      <FormControl>
                        <Input placeholder="https://twitter.com/your-handle" {...field} disabled={isPending} />
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
              Save Socials Settings
            </Button>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
