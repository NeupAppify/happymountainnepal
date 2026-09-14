'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@neup/components/ui/dialog';
import { Button } from '@neup/components/ui/button';
import { Input } from '@neup/components/ui/input';
import { Loader2, Search, Image as ImageIcon, CheckCircle2, FileText, Trash2, ExternalLink, X, Filter, LayoutTemplate, User } from 'lucide-react';
import { getFileUploads, deleteFileUpload } from '@/lib/db';
import type { FileUpload, ImageWithCaption } from '@/lib/types';
import { SmartImage } from '@/components/ui/smart-image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@neup/components/ui/scroll-area';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { getFullUrl } from '@/lib/url-utils';
import { LinkButton } from "@neup/components/ui/link-button";
import { Badge } from '@neup/components/ui/badge';

interface MediaLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (images: ImageWithCaption[]) => void;
  initialSelectedUrls?: string[];
  defaultTags?: string[];
  defaultCategory?: string;
}


const DEFAULT_SELECTED_URLS: string[] = [];
const DEFAULT_TAGS: string[] = ['general'];

// Helper to get icon and label for specific tags
const getTagConfig = (tag: string) => {
  if (tag === 'category.cover' || tag === 'cover') {
    return { icon: <LayoutTemplate className="h-3 w-3" />, label: 'Cover Image' };
  }
  if (tag === 'author.photo' || tag === 'profile') {
    return { icon: <User className="h-3 w-3" />, label: 'Profile Photo' };
  }
  if (tag === 'logo') {
    return { icon: <ImageIcon className="h-3 w-3" />, label: 'Logo' };
  }
  return { icon: <Filter className="h-3 w-3" />, label: tag };
};

export function MediaLibraryDialog({ isOpen, onClose, onSelect, initialSelectedUrls = DEFAULT_SELECTED_URLS, defaultTags = DEFAULT_TAGS, defaultCategory }: MediaLibraryDialogProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSelection, setCurrentSelection] = useState<string[]>(initialSelectedUrls);
  const [selectedTags, setSelectedTags] = useState<string[]>(['all']);

  const observerTarget = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { profile } = useSiteProfile();

  const fetchUploads = useCallback(async (tags: string[] = ['all'], currentPage = 1, search = '', isNewSearch = false) => {
    if (currentPage === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const limit = 20; // Increased limit for better grid fill
      const { uploads: fetchedUploads, hasMore: moreAvailable } = await getFileUploads({
        tags: tags.includes('all') ? undefined : tags,
        limit,
        page: currentPage,
        searchTerm: search
      });

      setUploads(prev => {
        if (currentPage === 1 || isNewSearch) return fetchedUploads;

        // Merge and ensure uniqueness by ID
        const combined = [...prev, ...fetchedUploads];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique;
      });

      setHasMore(moreAvailable);
      setPage(currentPage);
    } catch (error: any) {
      console.error('Failed to fetch uploads:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load media library. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    if (isOpen) {
      setCurrentSelection(initialSelectedUrls);
      const tagsToUse = defaultTags && defaultTags.length > 0 ? defaultTags : ['all'];
      setSelectedTags(tagsToUse);
      // Reset search and page on open
      setSearchTerm('');
      setPage(1);
      fetchUploads(tagsToUse, 1, '', true);
    }
  }, [isOpen, initialSelectedUrls, defaultTags, fetchUploads]);

  // Debounced search effect
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      // Only refetch if searchTerm changed or we are initializing
      fetchUploads(selectedTags, 1, searchTerm, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedTags, isOpen, fetchUploads]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          fetchUploads(selectedTags, page + 1, searchTerm);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isFetchingMore, isLoading, page, selectedTags, searchTerm, fetchUploads]);


  const filteredUploads = uploads; // Sorting logic removed to preserve infinite scroll order logic, usually user wants latest first which DB provides

  const handleDelete = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await deleteFileUpload(fileId);
      toast({
        title: 'File Deleted',
        description: 'The file has been removed.',
      });
      setUploads(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete file.',
      });
    }
  };

  const handleImageClick = (file: FileUpload) => {
    const fullUrl = getFullUrl(file, profile?.basePath);
    setCurrentSelection(prev => {
      if (prev.includes(fullUrl)) {
        return prev.filter(u => u !== fullUrl);
      } else {
        return [...prev, fullUrl];
      }
    });
  };

  const handleInsertSelected = async () => {
    // Convert selected URLs to ImageWithCaption objects
    const selectedImages: ImageWithCaption[] = currentSelection.map(url => {
      const file = uploads.find(u => getFullUrl(u, profile?.basePath) === url);
      return {
        url,
        caption: file?.name || ''
      };
    });

    // Call onSelect and give it time to process before closing
    onSelect(selectedImages);

    // Small delay to ensure the image insertion completes before dialog closes
    await new Promise(resolve => setTimeout(resolve, 100));

    onClose();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(t => t !== tagToRemove);
    if (newTags.length === 0) {
      setSelectedTags(['all']);
    } else {
      setSelectedTags(newTags);
    }
  };

  const handleClearFilters = () => {
    setSelectedTags(['all']);
  };

  const activeFilters = selectedTags.filter(t => t !== 'all');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex-grow flex flex-col gap-4 overflow-hidden">
          <div className="border border-dashed p-6 rounded-xl bg-muted/30 text-center space-y-3">
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-semibold text-lg">Manage Media & Upload</h3>
              <p className="text-sm text-muted-foreground">Go to the management page to upload, rename, or organize your media library.</p>
            </div>
            <LinkButton variant="outline" className="w-full sm:w-auto" href="/manage/uploads" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Media Management
              </LinkButton>
          </div>

          <div className="flex-grow flex flex-col gap-4 overflow-hidden">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground mr-1">Filtered by:</span>
                  {activeFilters.map(tag => {
                    const { icon, label } = getTagConfig(tag);
                    return (
                      <Badge key={tag} variant="secondary" className="gap-1.5 pl-2 pr-1 py-1 h-7">
                        {icon}
                        <span>{label}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-muted-foreground/20 rounded-full"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {label} filter</span>
                        </Button>
                      </Badge>
                    );
                  })}
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary ml-2" onClick={handleClearFilters}>
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-grow -mr-4 pr-4">
              {isLoading && page === 1 ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4">
                    {filteredUploads.map((file) => {
                      const fullUrl = getFullUrl(file, profile?.basePath);
                      const isSelected = currentSelection.includes(fullUrl);
                      return (
                        <div
                          key={file.id}
                          className={cn(
                            'relative h-32 w-full rounded-md overflow-hidden cursor-pointer border-2 transition-all group',
                            isSelected ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted-foreground'
                          )}
                          onClick={() => handleImageClick(file)}
                        >
                          {file.type?.startsWith('image/') ? (
                            <SmartImage
                              src={file.url}
                              alt={file.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground p-2">
                              <FileText className="h-8 w-8" />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                              <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
                            </div>
                          )}

                          <div className="absolute top-1 right-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={(e) => handleDelete(e, file.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Sentinel for Infinite Scroll */}
                  {hasMore && (
                    <div ref={observerTarget} className="flex justify-center p-4">
                      {isFetchingMore ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <div className="h-4" /> // Invisible spacer to trigger intersection
                      )}
                    </div>
                  )}

                  {!hasMore && uploads.length > 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">All files loaded</p>
                  )}

                  {!isLoading && uploads.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      No media found.
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </div>

          <div className="flex justify-end mt-auto pt-4 border-t">
            <Button onClick={handleInsertSelected} disabled={currentSelection.length === 0}>
              Insert Selected ({currentSelection.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
}
