
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@neup/components/ui/dialog';
import { Button } from '@neup/components/ui/button';
import { Input } from '@neup/components/ui/input';
import { Label } from '@neup/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@neup/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { logFileUpload } from '@/lib/db';

interface AddLocalImageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tags?: string[];
}

export function AddLocalImageDialog({ isOpen, onClose, onSuccess, tags = ['general'] }: AddLocalImageDialogProps) {
    const [fileName, setFileName] = useState('');
    const [relativePath, setRelativePath] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>(tags);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!fileName || !relativePath) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please fill in all required fields.',
            });
            return;
        }

        const templatePath = `{{basePath}}${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;

        setIsSubmitting(true);
        try {
            await logFileUpload({
                name: fileName,
                url: templatePath,
                uploadedBy: 'admin-user',
                tags: selectedTags,
                type: 'image/jpeg', // Assuming local files are images for now
                size: 0,
                meta: [],
            });

            toast({
                title: 'Success',
                description: 'Local image reference added.',
            });

            setFileName('');
            setRelativePath('');
            setSelectedTags(tags);

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error adding local image:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to add local image reference.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Local Image Reference</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">This feature is for referencing files that already exist in your project's `/public` directory. It does not upload any files.</p>
                    <div className="space-y-2">
                        <Label htmlFor="fileName">File Name *</Label>
                        <Input
                            id="fileName"
                            placeholder="e.g., hero-image.jpg"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="relativePath">Relative Path *</Label>
                        <Input
                            id="relativePath"
                            placeholder="e.g., /images/hero.jpg"
                            value={relativePath}
                            onChange={(e) => setRelativePath(e.target.value)}
                        />
                         <p className="text-xs text-muted-foreground">
                            Path will be stored as: <code className="bg-muted px-1 rounded">{`{{basePath}}${relativePath || '/your/path.jpg'}`}</code>
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add to Library'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
