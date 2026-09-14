
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
import { Textarea } from '@neup/components/ui/textarea';
import { Card, CardContent } from '@neup/components/ui/card';
import { useTransition, useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@neup/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { checkSlugAvailability, createTourWithBasicInfo, logError } from '@/lib/db';
import type { ImportedTourData } from '@/lib/types';
import { Checkbox } from '@neup/components/ui/checkbox';

const formSchema = z.object({
  name: z.string().min(5, { message: "Name must be at least 5 characters." }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters." }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and use hyphens for spaces."),
  region: z.string().min(1, { message: "At least one region is required." }),
  type: z.enum(['Trekking', 'Tour', 'Climbing', 'Jungle Safari']),
  difficulty: z.enum(['Easy', 'Moderate', 'Strenuous', 'Challenging']),
  duration: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePackageFormProps {
  importedData: ImportedTourData | null;
}

const ImportSelector = ({ sectionName, onToggle, isSelected }: { sectionName: string, onToggle: (checked: boolean) => void, isSelected: boolean }) => (
  <div className="flex items-center space-x-2 my-2">
    <Checkbox id={`import-${sectionName}`} checked={isSelected} onCheckedChange={onToggle} />
    <label htmlFor={`import-${sectionName}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      Apply imported <span className="font-bold">{sectionName}</span>
    </label>
  </div>
);

export function CreatePackageForm({ importedData }: CreatePackageFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const [selectedImports, setSelectedImports] = useState<Record<string, boolean>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        slug: '',
        region: '',
        type: 'Trekking',
        difficulty: 'Moderate',
        duration: 1,
        description: '',
      } as any,
  });

  useEffect(() => {
    if (importedData) {
      const initialSelections: Record<string, boolean> = {};
      const resetValues: Partial<FormValues> = {};

      if (importedData.name) {
        initialSelections.basic = true;
        resetValues.name = importedData.name;
        resetValues.slug = slugify(importedData.name);
        resetValues.description = importedData.description;
        resetValues.duration = importedData.duration;
        resetValues.difficulty = importedData.difficulty;
        resetValues.region = Array.isArray(importedData.region) ? importedData.region.join(', ') : '';
      }

      form.reset(resetValues);
      setSelectedImports(initialSelections);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedData]);

  const handleToggleImport = (section: string, isSelected: boolean) => {
    setSelectedImports(prev => ({ ...prev, [section]: isSelected }));
    if (isSelected && importedData) {
      if (section === 'basic') {
        form.setValue('name', importedData.name);
        form.setValue('slug', slugify(importedData.name));
        form.setValue('description', importedData.description);
        form.setValue('duration', importedData.duration);
        form.setValue('difficulty', importedData.difficulty);
        form.setValue('region', Array.isArray(importedData.region) ? importedData.region.join(', ') : '');
      }
    }
  };

  const name = form.watch('name');
  const currentSlug = form.watch('slug');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const debouncedSlug = useDebounce(currentSlug, 500);

  useEffect(() => {
    if (!isSlugManuallyEdited && name && !importedData) {
      form.setValue('slug', slugify(name), { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, isSlugManuallyEdited, importedData]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedSlug || form.formState.errors.slug?.message) {
        setIsSlugAvailable(null);
        return;
      }
      setIsSlugChecking(true);
      try {
        const available = await checkSlugAvailability(debouncedSlug);
        setIsSlugAvailable(available);
      } catch (e) {
        setIsSlugAvailable(null);
      } finally {
        setIsSlugChecking(false);
      }
    };
    checkAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSlug]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const finalData = {
          ...values,
          region: values.region.split(',').map(s => s.trim()).filter(Boolean),
          // Add other sections if they are selected for import
          ...(selectedImports.itinerary && importedData?.itinerary && { itinerary: importedData.itinerary }),
          ...(selectedImports.inclusions && importedData?.inclusions && { inclusions: importedData.inclusions }),
          ...(selectedImports.exclusions && importedData?.exclusions && { exclusions: importedData.exclusions }),
          ...(selectedImports.faq && importedData?.faq && { faq: importedData.faq }),
          ...(selectedImports.price && importedData?.price && { price: importedData.price }),
          ...(selectedImports.additionalInfo && importedData?.additionalInfoSections && { additionalInfoSections: importedData.additionalInfoSections }),
        };

        // @ts-ignore
        const newId = await createTourWithBasicInfo(finalData);

        if (!newId) throw new Error('Failed to create package');

        toast({ title: 'Success', description: 'Package created. You can now edit the full details.' });
        router.push(`/manage/packages/${newId}/basics`);
      } catch (error: any) {
        console.error("Failed to create package:", error);
        await logError({ message: `Failed to create package: ${error.message}`, stack: error.stack, pathname, context: { values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not create package. Please try again.',
        });
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {importedData && (
              <div className="p-4 border rounded-md bg-secondary/50 space-y-2">
                <h3 className="font-semibold text-lg">Apply Imported Data</h3>
                <p className="text-sm text-muted-foreground">Select which sections to apply from the imported content.</p>
                <ImportSelector sectionName="basic" onToggle={(c) => handleToggleImport('basic', c)} isSelected={!!selectedImports.basic} />
                <ImportSelector sectionName="itinerary" onToggle={(c) => handleToggleImport('itinerary', c)} isSelected={!!selectedImports.itinerary} />
                <ImportSelector sectionName="price" onToggle={(c) => handleToggleImport('price', c)} isSelected={!!selectedImports.price} />
                <ImportSelector sectionName="inclusions" onToggle={(c) => handleToggleImport('inclusions', c)} isSelected={!!selectedImports.inclusions} />
                <ImportSelector sectionName="exclusions" onToggle={(c) => handleToggleImport('exclusions', c)} isSelected={!!selectedImports.exclusions} />
                <ImportSelector sectionName="faq" onToggle={(c) => handleToggleImport('faq', c)} isSelected={!!selectedImports.faq} />
                <ImportSelector sectionName="additionalInfo" onToggle={(c) => handleToggleImport('additionalInfo', c)} isSelected={!!selectedImports.additionalInfo} />
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Everest Base Camp Trek" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                        disabled={isPending || isSlugChecking}
                        onChange={(e) => {
                          field.onChange(slugify(e.target.value));
                          setIsSlugManuallyEdited(true);
                          setIsSlugAvailable(null);
                        }}
                      />
                    </FormControl>
                    {isSlugChecking && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
                    )}
                    {!isSlugChecking && isSlugAvailable !== null && (
                      isSlugAvailable ? (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                      )
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief overview of the trek or tour..."
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
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
                      <Input
                        placeholder="e.g., Everest, Khumbu"
                        {...field as any}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
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
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (days)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isPending || isSlugChecking || !!(debouncedSlug && isSlugAvailable === false)}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Package & Continue Editing
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
