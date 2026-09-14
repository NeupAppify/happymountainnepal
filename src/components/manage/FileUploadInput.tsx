
'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@neup/components/ui/input';
import { Button } from '@neup/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';
import { logError } from '@/lib/db';
import { usePathname } from 'next/navigation';
import { slugify } from '@/lib/utils';

interface FileUploadInputProps {
  name: string;
  children?: React.ReactNode;
  onUploadSuccess?: (url: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  customFileName?: string;
  skipCompression?: boolean;
  tags?: string[];
}

export function FileUploadInput({
  name,
  children,
  onUploadSuccess,
  onUploadingChange,
  customFileName,
  skipCompression = false,
  tags = ['general'],
}: FileUploadInputProps) {
  const { setValue } = useFormContext();
  const pathname = usePathname();

  const [isUploadingInternal, setIsUploadingInternal] = useState(false);
  const isUploading = isUploadingInternal;
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingInternal(true);
    onUploadingChange?.(true);
    setUploadError(null);

    let finalFile = file;

    if (!skipCompression && file.type.startsWith('image/')) {
      try {
        const options = {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        finalFile = await imageCompression(file, options);
      } catch (compressionError: any) {
        logError({
          message: `Image compression failed: ${compressionError.message}`,
          stack: compressionError.stack,
          pathname,
        });
        toast({
          variant: 'destructive',
          title: 'Compression Failed',
          description: 'Could not compress the image. Please try a different file.',
        });
        setIsUploadingInternal(false);
        onUploadingChange?.(false);
        return;
      }
    }

    const safeBaseName = customFileName || slugify(file.name.replace(/\.[^/.]+$/, ''));
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeFileName = `${safeBaseName}.${extension}`;

    const correctedFile = new File([finalFile], safeFileName, { type: file.type });

    const formData = new FormData();
    formData.append('file', correctedFile);
    formData.append('platform', 'p3.happymountainnepal');
    formData.append('contentIds', JSON.stringify(['uploads', 'admin-user', slugify(name)]));
    formData.append('name', safeBaseName);

    try {
      const response = await fetch('https://cdn.neupgroup.com/bridge/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(`Upload failed: ${response.status} ${responseText}`);

      const result = JSON.parse(responseText);

      if (result.success && result.url) {
        setValue(name, result.url, { shouldValidate: true, shouldDirty: true });
        
        await fetch('/api/log-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: correctedFile.name,
                url: result.url,
                uploadedBy: 'admin',
                type: correctedFile.type,
                size: correctedFile.size,
                tags,
                meta: [],
            }),
        });

        onUploadSuccess?.(result.url);
      } else {
        throw new Error(result.message || 'Unknown upload error.');
      }
    } catch (error: any) {
      logError({
        message: `Upload failed: ${error.message}`,
        stack: error.stack,
        pathname,
        context: { endpoint: 'upload', fileName: file.name },
      });
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message,
      });
      setUploadError(error.message);
    } finally {
      setIsUploadingInternal(false);
      onUploadingChange?.(false);
    }
  };

  if (children) {
    return (
      <label htmlFor={name} className="cursor-pointer w-full">
        <Input
          id={name}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        {children}
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <div className="border border-dashed rounded-lg p-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="relative w-full">
            <Input
              id={name}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full pointer-events-none"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </>
              )}
            </Button>
          </div>
          {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
        </div>
      </div>
    </div>
  );
}
