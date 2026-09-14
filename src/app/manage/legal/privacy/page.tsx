'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@neup/components/ui/button';
import { Form } from '@neup/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neup/components/ui/card';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@neup/components/ui/skeleton';
import { usePathname } from 'next/navigation';
import { fetchLegalContent, updateLegalContentAction } from '../actions';

const formSchema = z.object({
  content: z.string().min(50, 'Privacy policy content must be at least 50 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

const DUMMY_POLICY = `
<h2>1. Introduction</h2>
<p>Welcome to Happy Mountain Nepal. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
<h2>2. Information We Collect</h2>
<p>We may collect personal information such as your name, email address, and phone number when you fill out our contact or booking forms. We also collect non-personal information, such as browser type and pages visited, to improve our website.</p>
<h2>3. Use of Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
    <li>Respond to your inquiries and fulfill your requests.</li>
    <li>Process your bookings and payments.</li>
    <li>Send you marketing and promotional communications.</li>
    <li>Improve our website and services.</li>
</ul>
<h2>4. Security of Your Information</h2>
<p>We use administrative, technical, and physical security measures to help protect your personal information.</p>
<h2>5. Contact Us</h2>
<p>If you have questions or comments about this Privacy Policy, please contact us at info@happymountainnepal.com.</p>
`;


export default function PrivacyPolicyManager() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      try {
        const data = await fetchLegalContent('privacy');
        if (data) {
          form.setValue('content', data.content);
        } else {
          form.setValue('content', DUMMY_POLICY);
        }
      } catch (error) {
        console.error('Failed to fetch privacy policy:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, [form]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateLegalContentAction('privacy', values.content);
        toast({ title: 'Success', description: 'Privacy Policy updated.' });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save the policy. Please try again.',
        });
      }
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">
          Use the rich text editor below to modify your website's privacy policy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Policy Content</CardTitle>
          <CardDescription>
            The changes you make here will be reflected on the public-facing privacy policy page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <RichTextEditor
                  value={form.watch('content')}
                  onChange={(value) => form.setValue('content', value)}
                  disabled={isPending}
                />
              )}
              <Button type="submit" disabled={isPending || isLoading}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Privacy Policy
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
