"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { MediaLibraryDialog } from '@/components/manage/MediaLibraryDialog';
import type { Quill } from 'react-quill-new';
import type { UploadCategory, ImageWithCaption } from '@/lib/types';
import { Input } from '@neup/components/ui/input';
import { Button } from '@neup/components/ui/button';
import { ImageIcon, Link, Trash2, Eraser } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@neup/components/ui/popover';
import { Label } from '@neup/components/ui/label';

// Dynamically import ReactQuill to ensure it's only loaded on the client side
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as any;

interface ImageToolbarProps {
  position: { top: number; left: number; width: number };
  onUpdate: (alt: string) => void;
  onReplace: () => void;
  onDelete: () => void;
  initialAlt: string;
}

const ImageToolbar: React.FC<ImageToolbarProps> = ({ position, onUpdate, onReplace, onDelete, initialAlt }) => {
  const [altText, setAltText] = useState(initialAlt);

  useEffect(() => {
    setAltText(initialAlt);
  }, [initialAlt]);

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAltText(e.target.value);
  };

  const handleAltUpdate = () => {
    onUpdate(altText);
  };

  return (
    <div
      className="absolute z-10 p-2 bg-background border rounded-lg shadow-lg flex items-center gap-2"
      style={{ top: position.top, left: position.left, transform: 'translateY(8px)' }}
      onClick={(e) => e.stopPropagation()} // Prevent editor from losing focus
    >
      <Input
        type="text"
        placeholder="Alt text (caption)"
        value={altText}
        onChange={handleAltChange}
        className="h-8 text-xs"
      />
      <Button size="sm" onClick={handleAltUpdate} className="h-8">Update</Button>
      <Button size="sm" variant="outline" onClick={onReplace} className="h-8">Replace</Button>
      <Button size="sm" variant="destructive" onClick={onDelete} className="h-8">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};


interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [editorValue, setEditorValue] = useState(value);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  const quillRef = useRef<Quill | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastSelectionRange = useRef<any>(null);
  const isInsertingImage = useRef<boolean>(false);

  const [selectedImage, setSelectedImage] = useState<{ node: HTMLElement; blot: any; rect: DOMRect } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const sanitizeButton = document.querySelector('.ql-sanitize');
      if (sanitizeButton) {
        sanitizeButton.setAttribute('title', 'Sanitize (remove classes, IDs, and styles from selection or entire content)');
      }
    }
  }, [mounted]);

  useEffect(() => {
    // Only update if the incoming value is different AND we have a mounted quill instance
    // This prevents overwriting user changes with stale parent state
    if (value !== editorValue && quillRef.current) {
      const currentContent = quillRef.current.root.innerHTML;
      // Only update if the incoming value is actually different from what's in the editor
      if (value !== currentContent) {
        setEditorValue(value);
      }
    } else if (!quillRef.current && value !== editorValue) {
      // If quill isn't mounted yet, just update the state
      setEditorValue(value);
    }
  }, [value, editorValue]);

  const handleEditorClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG' && target.parentElement?.tagName === 'FIGURE') {
      const figure = target.parentElement;
      if (quillRef.current) {
        // Get Quill constructor from the instance
        const Quill = quillRef.current.constructor as any;
        const blot = Quill.find(figure);
        const rect = figure.getBoundingClientRect();
        const editorBounds = editorRef.current?.getBoundingClientRect();

        if (blot && editorBounds) {
          setSelectedImage({
            node: figure,
            blot: blot,
            rect: rect,
          });
        }
      }
    } else {
      setSelectedImage(null);
    }
  };

  const imageHandler = () => {
    // Save the current selection BEFORE any state changes
    if (quillRef.current) {
      const range = quillRef.current.getSelection();
      console.log('imageHandler - Current selection:', range);
      if (range) {
        lastSelectionRange.current = range;
        console.log('imageHandler - Saved selection range:', lastSelectionRange.current);
      } else {
        // If no selection, save the current cursor position or end of document
        const length = quillRef.current.getLength();
        lastSelectionRange.current = { index: length > 0 ? length - 1 : 0, length: 0 };
        console.log('imageHandler - No selection, saved fallback range:', lastSelectionRange.current);
      }
      // Set flag to prevent selection-change handler from overwriting this
      isInsertingImage.current = true;
    }
    setSelectedImage(null);
    setIsMediaLibraryOpen(true);
  };

  const handleImageSelect = (urls: ImageWithCaption[]) => {
    console.log('handleImageSelect called with:', urls);
    console.log('Saved selection range:', lastSelectionRange.current);

    if (urls.length === 0) {
      console.log('Early return - no urls provided');
      setIsMediaLibraryOpen(false);
      return;
    }

    if (!quillRef.current) {
      console.error('Quill ref is not available');
      setIsMediaLibraryOpen(false);
      return;
    }

    const quill = quillRef.current;
    console.log('Quill instance available:', !!quill);

    // Close the media library first to restore focus
    setIsMediaLibraryOpen(false);

    // Use setTimeout to ensure the dialog is fully closed and editor can regain focus
    setTimeout(() => {
      try {
        // Restore focus to the editor first
        quill.focus();

        // Determine insertion index from saved range
        let index = 0;

        if (lastSelectionRange.current && typeof lastSelectionRange.current.index === 'number') {
          index = lastSelectionRange.current.index;
          console.log('Using saved selection index:', index);
        } else {
          // Try to get current selection as fallback
          const currentSelection = quill.getSelection();
          if (currentSelection && typeof currentSelection.index === 'number') {
            index = currentSelection.index;
            console.log('Using current selection index:', index);
          } else {
            // Last resort: insert at the end
            index = quill.getLength() - 1; // -1 to account for the trailing newline
            console.log('No selection found, using end of document:', index);
          }
        }

        console.log('Final insertion index:', index, 'Document length:', quill.getLength());

        const imageUrl = urls[0];
        console.log('Inserting image:', imageUrl);

        // Insert image at the determined position
        quill.insertEmbed(index, 'customImage', { url: imageUrl.url, alt: imageUrl.caption || '' }, 'user');
        console.log('Image inserted successfully at index:', index);

        // Insert a newline after the image to ensure proper spacing
        quill.insertText(index + 1, '\n', 'user');

        // Update the editor value to trigger onChange
        const newContent = quill.root.innerHTML;
        setEditorValue(newContent);
        onChange(newContent);

        // Move cursor after the image and newline
        setTimeout(() => {
          try {
            quill.setSelection(index + 2, 0);
            console.log('Cursor moved to:', index + 2);
          } catch (e) {
            console.error('Failed to set cursor position:', e);
          }
        }, 50);

        // Clear the saved range after use
        lastSelectionRange.current = null;
        isInsertingImage.current = false;
      } catch (error) {
        console.error('Failed to insert image:', error);
        isInsertingImage.current = false;
      }
    }, 100);
  };

  const handleReplaceImage = () => {
    setIsMediaLibraryOpen(true);
  };

  const handleReplaceSelectedImage = (urls: ImageWithCaption[]) => {
    if (urls.length === 0 || !selectedImage || !quillRef.current) return;
    const newImage = urls[0];
    const quill = quillRef.current;

    quill.deleteText(selectedImage.blot.offset(quill.scroll), 1, 'user');
    quill.insertEmbed(selectedImage.blot.offset(quill.scroll), 'customImage', { url: newImage.url, alt: newImage.caption || '' }, 'user');

    // Update the editor value to trigger onChange
    const newContent = quill.root.innerHTML;
    setEditorValue(newContent);
    onChange(newContent);

    setSelectedImage(null);

    // Close the media library after a small delay
    setTimeout(() => {
      setIsMediaLibraryOpen(false);
    }, 100);
  };

  const handleUpdateImageAlt = (newAlt: string) => {
    if (!selectedImage || !quillRef.current) return;
    const { blot } = selectedImage;
    blot.format('alt', newAlt);

    // Update the editor value to trigger onChange
    const newContent = quillRef.current.root.innerHTML;
    setEditorValue(newContent);
    onChange(newContent);

    quillRef.current.setSelection(quillRef.current.getSelection()); // To refresh selection
    setSelectedImage(null);
  };

  const handleDeleteImage = () => {
    if (!selectedImage || !quillRef.current) return;
    const quill = quillRef.current;

    // Delete the image
    quill.deleteText(selectedImage.blot.offset(quill.scroll), 1, 'user');

    // Update the editor value to trigger onChange
    const newContent = quill.root.innerHTML;
    setEditorValue(newContent);
    onChange(newContent);

    setSelectedImage(null);
  }

  const handleSanitize = () => {
    if (!quillRef.current) return;
    const quill = quillRef.current;
    const range = quill.getSelection();

    const sanitizeHtml = (html: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const allElements = doc.body.querySelectorAll('*');
      allElements.forEach(el => {
        el.removeAttribute('class');
        el.removeAttribute('id');
        el.removeAttribute('style');
        // Also remove any data attributes
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            el.removeAttribute(attr.name);
          }
        });
      });
      return doc.body.innerHTML;
    };

    if (range && range.length > 0) {
      const index = range.index;
      const length = range.length;

      // Get the HTML of the selection
      let html = "";
      if (typeof (quill as any).getSemanticHTML === 'function') {
        html = (quill as any).getSemanticHTML(index, length);
      } else {
        const delta = quill.getContents(index, length);
        const tempContainer = document.createElement('div');
        const tempQuill = new (quill.constructor as any)(tempContainer);
        tempQuill.setContents(delta);
        html = tempQuill.root.innerHTML;
      }

      const sanitizedHtml = sanitizeHtml(html);

      // Replace selection with sanitized HTML
      quill.deleteText(index, length, 'user');
      quill.clipboard.dangerouslyPasteHTML(index, sanitizedHtml, 'user');
    } else {
      // Sanitize entire content if nothing is selected
      const html = quill.root.innerHTML;
      const sanitizedHtml = sanitizeHtml(html);
      
      // Replace entire content
      quill.setContents([] as any); // Clear content
      quill.clipboard.dangerouslyPasteHTML(0, sanitizedHtml, 'user');
    }

    // Update state
    const newContent = quill.root.innerHTML;
    setEditorValue(newContent);
    onChange(newContent);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'link'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['image', 'sanitize'],
      ],
      handlers: {
        'image': imageHandler,
        'sanitize': handleSanitize,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const getQuillRef = (el: any) => {
    if (typeof window !== 'undefined' && el && !quillRef.current) {
      console.log('getQuillRef called, initializing Quill...');
      quillRef.current = el.getEditor();
      if (quillRef.current) {
        console.log('Quill editor obtained:', quillRef.current);

        // Register sanitize icon
        const Quill = quillRef.current.constructor as any;
        const icons = Quill.import('ui/icons');
        if (icons) {
          icons['sanitize'] = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l4.4 4.4c1 1 1 2.5 0 3.4L13 21Z"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>';
        }

        // Add selection change listener to track cursor position
        quillRef.current.on('selection-change', (range: any, oldRange: any, source: string) => {
          // Don't track selection changes while inserting an image
          if (isInsertingImage.current) {
            console.log('Selection change ignored - inserting image');
            return;
          }

          // Only save the range if it's valid and not null
          if (range && typeof range.index === 'number') {
            lastSelectionRange.current = range;
            console.log('Selection changed, saved range:', range);
          }
          // When editor loses focus (range is null), keep the last saved range
        });

        // Correctly get the Quill static from the instance
        const BlockEmbed = Quill.import('blots/block/embed');
        console.log('BlockEmbed imported:', BlockEmbed);

        class ImageBlot extends BlockEmbed {
          static blotName = 'customImage';
          static tagName = 'figure';
          static className = 'ql-custom-image-container';

          static create(value: { url: string; alt: string }) {
            console.log('ImageBlot.create called with:', value);
            const node = super.create();
            node.setAttribute('contenteditable', 'false');
            const img = document.createElement('img');
            img.setAttribute('src', value.url);
            img.setAttribute('alt', value.alt || '');
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            node.appendChild(img);
            console.log('ImageBlot node created:', node);
            return node;
          }

          static value(node: HTMLElement) {
            const img = node.querySelector('img');
            return {
              url: img?.getAttribute('src') || '',
              alt: img?.getAttribute('alt') || '',
            };
          }

          format(name: string, value: any) {
            if (name === 'alt') {
              const img = this.domNode.querySelector('img');
              if (img) {
                img.setAttribute('alt', value);
              }
            } else {
              super.format(name, value);
            }
          }
        }

        try {
          Quill.register(ImageBlot, true);
          console.log('ImageBlot registered successfully');
        } catch (error) {
          console.error('Failed to register ImageBlot:', error);
        }
      }
    }
  };

  const getToolbarPosition = () => {
    if (!selectedImage || !editorRef.current) return { top: 0, left: 0, width: 0 };
    const editorRect = editorRef.current.getBoundingClientRect();
    const imageRect = selectedImage.rect;

    return {
      top: imageRect.bottom - editorRect.top + window.scrollY,
      left: imageRect.left - editorRect.left + window.scrollX,
      width: imageRect.width
    };
  };

  if (!mounted) {
    return <div className="h-40 rounded-md border bg-muted/20 animate-pulse" />;
  }

  return (
    <div className="rich-text-editor-container relative mb-16" style={{ height: '500px' }} ref={editorRef} onClick={handleEditorClick}>
      {/* @ts-ignore */}
      <ReactQuill
        ref={getQuillRef}
        theme="snow"
        value={editorValue}
        onChange={(val: string) => {
          setEditorValue(val);
          onChange(val);
        }}
        modules={modules}
        placeholder={placeholder}
        readOnly={disabled}
        className="bg-card rounded-md"
        style={{ height: '500px' }}
      />
      {selectedImage && (
        <ImageToolbar
          position={getToolbarPosition()}
          initialAlt={selectedImage.blot.value().alt}
          onUpdate={handleUpdateImageAlt}
          onReplace={handleReplaceImage}
          onDelete={handleDeleteImage}
        />
      )}
      <MediaLibraryDialog
        isOpen={isMediaLibraryOpen}
        onClose={() => {
          setIsMediaLibraryOpen(false);
          isInsertingImage.current = false;
        }}
        onSelect={selectedImage ? handleReplaceSelectedImage : handleImageSelect}
        defaultCategory="blog"
      />
    </div>
  );
}
