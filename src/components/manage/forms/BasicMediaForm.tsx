
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
  FormMessage,
  FormLabel,
} from '@neup/components/ui/form';
import { Input } from '@neup/components/ui/input';
import { Card, CardContent } from '@neup/components/ui/card';
import { type Tour, type ImageWithCaption } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition, useState } from 'react';
import { Loader2, Library, GripVertical, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaLibraryDialog } from '../MediaLibraryDialog';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Reorder } from 'framer-motion';

const extractIframeSrc = (input: string): string => {
  if (!input) return '';
  const iframeRegex = /<iframe.*?src="(.*?)"[^>]*><\/iframe>/;
  const match = input.match(iframeRegex);
  return match ? match[1] : input;
};

const imageSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
});

const formSchema = z.object({
  map: z.string().transform(val => extractIframeSrc(val)).pipe(
    z.string().url({ message: "Please enter a valid map URL." }).min(1, "Map URL is required.")
  ),
  allImages: z.array(imageSchema).min(1, "Please select at least one image."),
});

type FormValues = z.infer<typeof formSchema>;

interface BasicMediaFormProps {
  tour: Tour;
}

export function BasicMediaForm({ tour }: BasicMediaFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      map: tour.map || '',
      allImages: [tour.mainImage, ...(tour.images || [])].filter(img => img && img.url),
    },
  });

  const allImages = form.watch('allImages');

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const [mainImage, ...galleryImages] = values.allImages;
        const dataToUpdate = {
          map: values.map,
          mainImage: mainImage || { url: '' },
          images: galleryImages,
        };

        await updateTour(tour.id, dataToUpdate);
        toast({ title: 'Success', description: 'Media and gallery updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update media for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save media. Please try again.',
        });
      }
    });
  };

  const handleSelectImages = (selectedImages: ImageWithCaption[]) => {
    const newImages = selectedImages.map(img => {
      const existing = allImages.find(existingImg => existingImg.url === img.url);
      return existing || img;
    });
    form.setValue('allImages', newImages, { shouldDirty: true, shouldValidate: true });
    setIsLibraryOpen(false);
  }

  const removeImage = (indexToRemove: number) => {
    const currentImages = form.getValues('allImages');
    const newImages = currentImages.filter((_, idx) => idx !== indexToRemove);
    form.setValue('allImages', newImages, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Tour Images</h3>
                <p className="text-sm text-muted-foreground mb-4">Select all images for the tour. Drag and drop to reorder. The first image will be the main cover image.</p>
                <Button type="button" variant="outlined" onClick={() => setIsLibraryOpen(true)}>
                  <Library className="mr-2 h-4 w-4" />
                  Select Images from Library
                </Button>
                <FormMessage className="mt-2">{form.formState.errors.allImages?.message}</FormMessage>

                <Reorder.Group
                  axis="y"
                  values={allImages}
                  onReorder={(newOrder) => form.setValue('allImages', newOrder, { shouldDirty: true })}
                  className="mt-4 space-y-2"
                >
                  {allImages.map((image, index) => (
                    <Reorder.Item key={image.url} value={image}>
                      <div className="flex flex-col gap-4 p-2 border rounded-lg bg-card cursor-grab active:cursor-grabbing">
                        <div className="flex items-center gap-4">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                          <div className="relative h-16 w-24 rounded-md overflow-hidden">
                            <Image src={image.url} alt={`Selected image ${index + 1}`} fill className="object-cover" />
                          </div>
                          <span className="text-sm text-muted-foreground truncate flex-grow">{(image.url || '').split('/').pop()}</span>
                          {index === 0 && <span className="text-xs font-semibold text-primary-foreground bg-primary px-2 py-1 rounded-full">Main Image</span>}

                          <Button
                            type="button"
                            variant="plain"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name={`allImages.${index}.caption`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} value={field.value || ''} placeholder="Enter caption / alt text..." className="h-8" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Map URL</h3>
                <FormField
                  control={form.control}
                  name="map"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="e.g., https://www.google.com/maps/d/u/0/viewer?mid=... or full iframe tag"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Media
          </Button>
        </form>
      </Form>
      <MediaLibraryDialog
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleSelectImages}
        initialSelectedUrls={allImages.map(i => i.url)}
        defaultTags={['all']}
      />
    </FormProvider>
  );
}
