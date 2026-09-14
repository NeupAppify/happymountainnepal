
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@neup/components/ui/button';
import { Grid, Maximize } from 'lucide-react';
import { ImageViewerDialog } from './ImageViewerDialog';
import { cn } from '@/lib/utils';
import type { ImageWithCaption } from '@/lib/types';

interface ImageGalleryProps {
  images: ImageWithCaption[];
  mainImage: ImageWithCaption;
  tourName: string;
}

export function ImageGallery({ images, mainImage, tourName }: ImageGalleryProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  // Combine all images and filter out invalid ones
  const allImages = [mainImage, ...images].filter(img => {
    // Check if img exists and has a valid url property
    if (!img || typeof img !== 'object') return false;
    if (!img.url || typeof img.url !== 'string') return false;
    // Check if url is not empty after trimming
    return img.url.trim().length > 0;
  });
  const imageCount = allImages.length;

  // If no valid images, don't render anything
  if (imageCount === 0) {
    return null;
  }

  const openViewer = (index: number) => {
    setViewerInitialIndex(index);
    setIsViewerOpen(true);
  };

  const renderGallery = () => {
    // Mobile view: single column scroll
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return (
        <div className="flex flex-col gap-4">
          {allImages.map((img, index) => (
            <div
              key={img.url + index}
              className="relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openViewer(index)}
            >
              <Image src={String(img.url)} alt={img.caption || img.story || `${tourName} - gallery image ${index + 1}`} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
            </div>
          ))}
        </div>
      );
    }

    // Desktop views
    if (imageCount === 1) {
      return (
        <div className="relative h-[60vh] max-h-[500px] rounded-lg overflow-hidden cursor-pointer group" onClick={() => openViewer(0)}>
          <Image src={String(allImages[0].url)} alt={allImages[0].caption || allImages[0].story || tourName} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Maximize className="h-12 w-12 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
          </div>
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div className="grid grid-cols-3 gap-4 h-[60vh] max-h-[500px]">
          <div className="col-span-2 relative rounded-lg overflow-hidden cursor-pointer group" onClick={() => openViewer(0)}>
            <Image src={String(allImages[0].url)} alt={allImages[0].caption || allImages[0].story || tourName} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
          </div>
          <div className="col-span-1 relative rounded-lg overflow-hidden cursor-pointer group" onClick={() => openViewer(1)}>
            <Image src={String(allImages[1].url)} alt={allImages[1].caption || allImages[1].story || `${tourName} - gallery image 2`} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
          </div>
        </div>
      );
    }

    // 3 or more images
    return (
      <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[60vh] max-h-[500px]">
        <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden cursor-pointer group" onClick={() => openViewer(0)}>
          <Image src={String(allImages[0].url)} alt={allImages[0].caption || allImages[0].story || tourName} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
        </div>

        {allImages[1] && (
          <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden cursor-pointer group" onClick={() => openViewer(1)}>
            <Image src={String(allImages[1].url)} alt={allImages[1].caption || allImages[1].story || `${tourName} - gallery image 2`} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
          </div>
        )}

        {allImages[2] && (
          <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden cursor-pointer group" onClick={() => openViewer(2)}>
            <Image src={String(allImages[2].url)} alt={allImages[2].caption || allImages[2].story || `${tourName} - gallery image 3`} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
            {imageCount > 3 && (
              <div
                className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                onClick={() => openViewer(3)}
              >
                <div className="text-white text-center">
                  <Grid className="h-8 w-8 mx-auto" />
                  <p className="font-semibold mt-1">View All {imageCount} Photos</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto pt-8">
        {renderGallery()}
      </div>
      <ImageViewerDialog
        images={allImages}
        tourName={tourName}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        initialIndex={viewerInitialIndex}
      />
    </>
  );
}
