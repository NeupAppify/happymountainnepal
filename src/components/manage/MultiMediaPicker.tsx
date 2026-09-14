
'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@neup/components/ui/button';
import { Label } from '@neup/components/ui/label';
import { Card } from '@neup/components/ui/card';
import { SmartImage } from '@/components/ui/smart-image';
import { XCircle, Library, Plus } from 'lucide-react';
import { MediaLibraryDialog } from './MediaLibraryDialog';
import { Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ImageWithCaption } from '@/lib/types';

interface MultiMediaPickerProps {
    name: string;
    label?: string;
    maxItems?: number;
    description?: string;
    tags?: string[];
}

export function MultiMediaPicker({ name, label, maxItems = 12, description, tags = ['general'] }: MultiMediaPickerProps) {
    const { watch, setValue } = useFormContext();
    const images: string[] = watch(name) || [];
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    const handleSelectImages = (selectedImages: ImageWithCaption[]) => {
        // We only care about URLs here
        const newUrls = selectedImages.map(img => img.url);

        // Merge with existing, avoiding duplicates
        const combined = [...images];
        newUrls.forEach(url => {
            if (!combined.includes(url)) {
                combined.push(url);
            }
        });

        // Limit to maxItems
        const finalImages = combined.slice(0, maxItems);

        setValue(name, finalImages, { shouldValidate: true, shouldDirty: true });
        setIsLibraryOpen(false);
    };

    const removeImage = (indexToRemove: number) => {
        const newImages = images.filter((_, idx) => idx !== indexToRemove);
        setValue(name, newImages, { shouldValidate: true, shouldDirty: true });
    };

    const handleReorder = (newOrder: string[]) => {
        setValue(name, newOrder, { shouldValidate: true, shouldDirty: true });
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label>{label || 'Images'} <span className="text-muted-foreground text-xs font-normal">({images.length}/{maxItems})</span></Label>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>

            <Card className="p-4">
                {images.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No images selected</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setIsLibraryOpen(true)}
                        >
                            <Library className="mr-2 h-4 w-4" />
                            Select from Library
                        </Button>
                    </div>
                ) : (
                    <Reorder.Group
                        axis="y"
                        values={images}
                        onReorder={handleReorder}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                    >
                        {images.map((url, index) => (
                            <Reorder.Item
                                key={url}
                                value={url}
                                className="relative aspect-video rounded-md overflow-hidden group border bg-muted cursor-grab active:cursor-grabbing"
                            >
                                <SmartImage src={url} alt={`Hero ${index + 1}`} fill className="object-cover" />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    onClick={() => removeImage(index)}
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                                <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {index + 1}
                                </div>
                            </Reorder.Item>
                        ))}

                        {images.length < maxItems && (
                            <div
                                className="aspect-video rounded-md border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary transition-colors cursor-pointer"
                                onClick={() => setIsLibraryOpen(true)}
                            >
                                <Plus className="h-6 w-6 mb-1" />
                                <span className="text-xs">Add</span>
                            </div>
                        )}
                    </Reorder.Group>
                )}
            </Card>

            <MediaLibraryDialog
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onSelect={handleSelectImages}
                initialSelectedUrls={images}
                defaultTags={tags}
            />
        </div>
    );
}
