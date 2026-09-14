
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from "@neup/components/ui/card";
import { Button } from "@neup/components/ui/button";
import { getLegalDocuments, getLegalSettings, updateLegalSettings, updateLegalDocumentsOrder } from '@/lib/db';
import type { LegalDocument } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Upload as UploadIcon, Plus, ChevronRight, ShieldCheck, GripVertical } from 'lucide-react';
import { Link } from "@neup/components/ui/link";
import { Switch } from "@neup/components/ui/switch";
import { Reorder, useDragControls } from "framer-motion";
import { useRef } from 'react';
import { Separator } from "@neup/components/ui/separator";
import { cn } from "@/lib/utils";

function DraggableDocumentCard({ doc, isLast }: { doc: LegalDocument; isLast: boolean }) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={doc}
      id={doc.id}
      dragListener={false}
      dragControls={dragControls}
      className="relative bg-card"
    >
      <div className={cn(
        "flex items-center gap-4 p-4 hover:bg-accent/5 transition-colors",
        !isLast && "border-b"
      )}>
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing text-muted-foreground p-2 hover:bg-muted rounded transition-colors touch-none"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <Link
          href={`/manage/legal/documents/${doc.id}`}
          className="flex-1 flex items-center gap-4 min-w-0 group"
        >
          <div className="h-20 w-20 bg-muted rounded flex items-center justify-center overflow-hidden border">
            <div className="relative w-full h-full bg-white flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.url}
                alt={doc.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-base group-hover:text-primary transition-colors">{doc.title}</p>
            {doc.description ? (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {doc.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic mt-1">
                No description provided
              </p>
            )}
          </div>

          <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
            <ChevronRight className="h-5 w-5" />
          </div>
        </Link>
      </div>
    </Reorder.Item>
  );
}

export default function LegalDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGlobalProtectionEnabled, setIsGlobalProtectionEnabled] = useState(true);
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const [allDocs, settings] = await Promise.all([
        getLegalDocuments(),
        getLegalSettings()
      ]);
      setDocuments(allDocs);
      setIsGlobalProtectionEnabled(settings.requireEmailProtection);
    } catch (error) {
      console.error("Failed to load legal documents", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load legal documents.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleToggleGlobalProtection = async (enabled: boolean) => {
    // Optimistic update
    setIsGlobalProtectionEnabled(enabled);

    try {
      await updateLegalSettings({ requireEmailProtection: enabled });
      toast({
        title: enabled ? 'Protection Enabled' : 'Protection Disabled',
        description: enabled
          ? 'Users must now verify email to view documents.'
          : 'Documents are now publicly viewable (watermarked).'
      });
    } catch (error) {
      console.error("Failed to update settings", error);
      setIsGlobalProtectionEnabled(!enabled); // Revert
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update protection settings."
      });
    }
  };

  const handleReorder = (newOrder: LegalDocument[]) => {
    setDocuments(newOrder);

    // Debounce save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const updates = newOrder.map((doc, index) => ({ id: doc.id, orderIndex: index }));
        await updateLegalDocumentsOrder(updates);
        toast({ title: "Order saved" });
      } catch (error) {
        console.error("Failed to save order", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save document order."
        });
      }
    }, 1000); // 1 second debounce
  };



  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold !font-headline">
            Legal Documents
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage licenses, certificates, and legal files.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 border rounded-lg animate-pulse"
            >
              <div className="h-20 w-20 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Settings & Upload Block */}
          <Card className="mb-6 overflow-hidden border-blue-200/50">
            {/* Global Settings */}
            {/* Global Settings */}
            <div
              className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleToggleGlobalProtection(!isGlobalProtectionEnabled)}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <ShieldCheck className={cn("h-4 w-4", isGlobalProtectionEnabled ? "text-green-600 dark:text-green-400" : "text-muted-foreground")} />
                    Global Protection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isGlobalProtectionEnabled
                      ? "Documents protected by email gate."
                      : "Documents open, semi protected."
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium w-16 text-right",
                    isGlobalProtectionEnabled ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                  )}>
                    {isGlobalProtectionEnabled ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Upload New Document */}
            <Link href="/manage/legal/documents/upload" className="block hover:bg-muted/50 transition-colors">
              <div className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UploadIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-primary">Upload New Document</h3>
                  <p className="text-sm text-muted-foreground">
                    Click to upload a new legal document, certificate, or license.
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Link>
          </Card>

          {/* Document List Block */}
          {documents.length > 0 && (
            <Card className="overflow-hidden">
              <Reorder.Group axis="y" values={documents} onReorder={handleReorder} className="flex flex-col">
                {documents.map((doc, i) => (
                  <DraggableDocumentCard
                    key={doc.id}
                    doc={doc}
                    isLast={i === documents.length - 1}
                  />
                ))}
              </Reorder.Group>
            </Card>
          )}

          {documents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No documents found besides the option to add one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
