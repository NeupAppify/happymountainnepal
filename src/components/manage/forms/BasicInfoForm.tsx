
'use client';

import { useFormContext } from 'react-hook-form';
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
import { checkSlugAvailability } from '@/lib/db';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@neup/components/ui/select';
import { slugify } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { SimpleRichTextEditor } from '@/components/ui/SimpleRichTextEditor';

const formSchema = z.object({
  name: z.string().min(5, { message: "Name must be at least 5 characters." }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters." }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and use hyphens for spaces."),
  region: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)).refine(val => val.length > 0, { message: "At least one region is required." }),
  type: z.enum(['Trekking', 'Tour', 'Climbing', 'Jungle Safari']),
  difficulty: z.enum(['Easy', 'Moderate', 'Strenuous', 'Challenging']),
  duration: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
  shortDescription: z.string().min(50, { message: "Short description must be at least 50 characters." }).max(200, { message: "Short description must not exceed 200 characters." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  searchKeywords: z.array(z.string()).optional(),
});

interface BasicInfoFormProps {
  tour: Tour;
}

export function BasicInfoForm({ tour }: BasicInfoFormProps) {
  const form = useFormContext();

  const name = form.watch('name');
  const currentSlug = form.watch('slug');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!tour.slug);
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const debouncedSlug = useDebounce(currentSlug, 500);

  useEffect(() => {
    if (!isSlugManuallyEdited && name) {
      form.setValue('slug', slugify(name), { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, isSlugManuallyEdited]);

  useEffect(() => {
    const checkAvailability = async () => {
      // @ts-ignore
      if (debouncedSlug && form.formState.errors.slug?.message === undefined) {
        setIsSlugChecking(true);
        try {
          const available = await checkSlugAvailability(debouncedSlug, tour.id);
          setIsSlugAvailable(available);
          if (!available) {
            form.setError('slug', { type: 'manual', message: 'This slug is already taken.' });
          } else {
            form.clearErrors('slug');
          }
        } catch (error) {
          console.error("Error checking slug availability:", error);
          setIsSlugAvailable(false);
          form.setError('slug', { type: 'manual', message: 'Could not check slug availability.' });
        } finally {
          setIsSlugChecking(false);
        }
      } else {
        setIsSlugAvailable(null);
      }
    };
    checkAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSlug, tour.id]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Everest Base Camp Trek" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!tour.slug && (
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="e.g., everest-base-camp-trek"
                        {...field}
                        disabled={isSlugChecking}
                        onChange={(e) => {
                          field.onChange(slugify(e.target.value));
                          setIsSlugManuallyEdited(true);
                          setIsSlugAvailable(null);
                        }}
                      />
                    </FormControl>
                    {isSlugChecking && (
                      <MoreHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-pulse" />
                    )}
                    {!isSlugChecking && isSlugAvailable !== null && (
                      isSlugAvailable ? (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                      )
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A brief meta description for SEO (no line breaks, 150-200 characters)..."
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Used for meta tags and search results. Keep it concise.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <SimpleRichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write a detailed description of the package. You can use bold, italic, and underline formatting..."
                    height="300px"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Line breaks and basic formatting (bold, italic, underline) are allowed.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Everest, Annapurna" {...field as any} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (in days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Trekking">Trekking</SelectItem>
                      <SelectItem value="Tour">Tour</SelectItem>
                      <SelectItem value="Climbing">Climbing</SelectItem>
                      <SelectItem value="Jungle Safari">Jungle Safari</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Strenuous">Strenuous</SelectItem>
                      <SelectItem value="Challenging">Challenging</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
