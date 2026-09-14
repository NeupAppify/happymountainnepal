'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@neup/components/ui/dialog';
import { Badge } from '@neup/components/ui/badge';
import { Input } from '@neup/components/ui/input';
import type { FileUpload } from '@/lib/types';
import { format } from 'date-fns';
import { SmartImage } from '@/components/ui/smart-image';
import { FileIcon, ExternalLink, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@neup/components/ui/button';
import { Card, CardContent } from '@neup/components/ui/card';
import { updateFileUpload, deleteFileUpload } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

interface UploadDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileUpload | null;
  onUpdate?: () => void;
}

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start py-2 border-b">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-sm text-foreground sm:mt-0 text-right break-all">{value}</dd>
  </div>
);

const FilePreview = ({ file }: { file: FileUpload }) => {
  if (file.type?.startsWith('image/')) {
    return (
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
        <SmartImage
          src={file.url}
          alt={file.name}
          fill
          className="object-contain"
        />
      </div>
    );
  }

  if (file.type?.startsWith('video/')) {
    return (
      <video controls src={file.url} className="w-full rounded-lg bg-black">
        Your browser does not support the video tag.
      </video>
    );
  }

  if (file.type?.startsWith('audio/')) {
    return (
      <audio controls src={file.url} className="w-full">
        Your browser does not support the audio element.
      </audio>
    );
  }

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="font-semibold mb-2">No preview available</p>
        <Button asChild>
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview in New Tab
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};


export function UploadDetailDialog({ isOpen, onClose, file, onUpdate }: UploadDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedTags, setEditedTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Reset local state when file changes or dialog opens
  useEffect(() => {
    if (file) {
      setEditedName(file.name);
      setEditedTags(file.tags?.join(', ') || '');
      setIsEditing(false);
    }
  }, [file, isOpen]);

  if (!file) return null;

  const uploadedDate = file.uploadedOn ? format(new Date(file.uploadedOn), "PPP p") : "N/A";
  const fileDescription = file.meta?.find((m: any) => m.key === 'description')?.value;

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedName(file.name);
      setEditedTags(file.tags?.join(', ') || '');
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const tagsArray = editedTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      await updateFileUpload(file.id, {
        name: editedName,
        tags: tagsArray
      });
      toast({ title: 'Success', description: 'File updated successfully.' });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update file.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await deleteFileUpload(file.id);
      toast({ title: 'Deleted', description: 'File removed successfully.' });
      onClose();
      onUpdate?.();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete file.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate pr-4">{file.name}</span>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={handleEditToggle}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogTitle>
          {fileDescription && (
            <DialogDescription>{fileDescription}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          <FilePreview file={file} />

          <div>
            <h3 className="font-semibold mb-2">File Information</h3>
            <dl className="space-y-1">
              <div className="py-2 border-b">
                <dt className="text-sm font-medium text-muted-foreground mb-1">File Name</dt>
                <dd className="text-sm text-foreground break-all">
                  {isEditing ? (
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="h-9 bg-background w-full"
                    />
                  ) : file.name}
                </dd>
              </div>
              <DetailRow label="File Type" value={<Badge variant="outline">{file.type}</Badge>} />
              <DetailRow label="File Size" value={`${(file.size / 1024).toFixed(2)} KB`} />
              <DetailRow label="Uploaded By" value={file.uploadedBy} />
              <DetailRow label="Uploaded On" value={uploadedDate} />
              <div className="py-2 border-b">
                <dt className="text-sm font-medium text-muted-foreground mb-1">Tags</dt>
                <dd className="text-sm text-foreground break-all">
                  {isEditing ? (
                    <Input
                      value={editedTags}
                      onChange={(e) => setEditedTags(e.target.value)}
                      placeholder="comma, separated, tags"
                      className="h-9 bg-background w-full"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {file.tags?.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                  )}
                </dd>
              </div>
              <DetailRow label="URL" value={<a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{file.url}</a>} />
            </dl>
          </div>

          {file.meta && file.meta.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Metadata</h3>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                {JSON.stringify(file.meta, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || isSaving} size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Permanently
          </Button>

          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEditToggle} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Check className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
