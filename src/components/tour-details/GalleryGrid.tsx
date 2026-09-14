'use client';

import Image from 'next/image';
import { Card, CardContent } from '@neup/components/ui/card';
import { getFileNameFromUrl } from '@/lib/utils';
import type { ImageWithCaption } from '@/lib/types';
import { User } from 'lucide-react';

interface GalleryGridProps {
  images: ImageWithCaption[];
  tourName: string;
  onImageClick: (index: number) => void;
}

export function GalleryGrid({ images, tourName, onImageClick }: GalleryGridProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold !font-headline mb-6">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, index) => {
          // Safety check - only render if we have a valid URL
          if (!img || !img.url || typeof img.url !== 'string' || img.url.trim().length === 0) {
            return null;
          }

          // Ensure url is definitely a string
          const imageUrl = String(img.url);

          return (
            <Card key={index} className="overflow-hidden cursor-pointer group" onClick={() => onImageClick(index)}>
              <CardContent className="p-0">
                <div className="relative w-full h-64">
                  <Image
                    src={imageUrl}
                    alt={img.caption || `${tourName} - Gallery Image ${index + 1} - ${getFileNameFromUrl(imageUrl)}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="trekking landscape"
                  />
                </div>
                {(img.posted_by || img.story || img.caption) && (
                  <div className="p-4 space-y-2">
                    {img.posted_by && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{img.posted_by}</span>
                      </div>
                    )}
                    {img.story && (
                      <p className="text-sm text-foreground line-clamp-2">{img.story}</p>
                    )}
                    {img.caption && !img.story && (
                      <p className="text-sm text-muted-foreground italic">{img.caption}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}