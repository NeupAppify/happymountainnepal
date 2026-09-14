
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
import { Loader2, MessageSquare, Save, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@neup/components/ui/skeleton';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { Switch } from '@neup/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@neup/components/ui/select';

const formSchema = z.object({
  enabled: z.boolean(),
  position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left', 'middle-right', 'middle-left']),
  whatsappNumber: z.string().optional(),
  emailAddress: z.string().email({ message: "Please enter a valid email." }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ChatbotSettingsPage() {
  const [isPending, startTransition] = useTransition();
  const { profile, isLoading } = useSiteProfile();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enabled: false,
      position: 'bottom-right',
      whatsappNumber: '',
      emailAddress: '',
    },
  });

  useEffect(() => {
    if (profile?.chatbot) {
      form.reset({
        enabled: profile.chatbot.enabled || false,
        position: profile.chatbot.position || 'bottom-right',
        whatsappNumber: profile.chatbot.whatsappNumber || '',
        emailAddress: profile.chatbot.emailAddress || '',
      });
    }
  }, [profile, form]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateSiteProfileAction({ chatbot: values });
        sessionStorage.removeItem('site-profile'); // Invalidate cache
        toast({ title: 'Success', description: 'Chatbot settings updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update chatbot settings: ${error.message}`, stack: error.stack, pathname, context: { values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save settings. Please try again.',
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
        <Card>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold !font-headline flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Chatbot Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure the customer-facing chat widget.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>Enable or disable the chatbot and set its position on the screen.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Chatbot</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Show the chat widget on all pages of your site.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position on Screen</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                          <SelectItem value="middle-right">Middle Right</SelectItem>
                          <SelectItem value="middle-left">Middle Left</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Options</CardTitle>
                <CardDescription>Configure the links that appear when a user opens the chat widget.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., +15551234567 (with country code)" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="e.g., support@example.com" {...field} disabled={isPending} />
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
              Save Settings
            </Button>
          </form>
        </Form>
      </div>
    </FormProvider>
  );
}
