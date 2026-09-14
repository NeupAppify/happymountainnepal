
'use client';

import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
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
import { Loader2, PlusCircle, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@neup/components/ui/skeleton';
import { Textarea } from '@neup/components/ui/textarea';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { MediaPicker } from '../MediaPicker';
import { LinkButton } from "@neup/components/ui/link-button";

const whyUsSchema = z.object({
  icon: z.string().url("Icon URL must be a valid URL."),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
});

const formSchema = z.object({
  whyUs: z.array(whyUsSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileWhyUsForm() {
  const [isPending, startTransition] = useTransition();
  const { profile, isLoading } = useSiteProfile();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      whyUs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "whyUs",
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        whyUs: profile.whyUs || [],
      });
    }
  }, [profile?.id]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateSiteProfileAction(values);
        // Invalidate session storage cache
        sessionStorage.removeItem('site-profile');
        toast({ title: 'Success', description: 'Why Us section updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update site profile why-us: ${error.message}`, stack: error.stack, pathname, context: { values } });
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
      <LinkButton href="/manage/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Profile
      </LinkButton>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold !font-headline">Why Choose Us</h1>
          <p className="text-muted-foreground mt-2">Update the "Why Trek With Us" features and highlights.</p>
        </div>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>"Why Trek With Us" Section</CardTitle>
                <CardDescription>Manage the features highlighted on your homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md relative space-y-4">
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
                      <MediaPicker name={`whyUs.${index}.icon`} label="Feature Icon" tags={['feature-icon']} />
                      <FormField
                        control={form.control}
                        name={`whyUs.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Expert Local Guides" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`whyUs.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Briefly describe this feature." {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ icon: '', title: '', description: '' })}
                  disabled={isPending}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </CardContent>
            </Card>

            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Why Us Settings
            </Button>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
