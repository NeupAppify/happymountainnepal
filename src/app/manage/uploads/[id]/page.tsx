'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFileUpload, updateFileUpload, deleteFileUpload } from '@/lib/db';
import type { FileUpload } from '@/lib/types';
import { format } from 'date-fns';
import { SmartImage } from '@/components/ui/smart-image';
import { FileIcon, ExternalLink, Trash2, Edit2, Check, X, ChevronLeft } from 'lucide-react';
import { Button } from '@neup/components/ui/button';
import { Card, CardContent } from '@neup/components/ui/card';
import { Input } from '@neup/components/ui/input';
import { Badge } from '@neup/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LinkButton } from "@neup/components/ui/link-button";

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-start py-3 border-b">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm text-foreground sm:mt-0 text-right break-all">{value}</dd>
    </div>
);

const FilePreview = ({ file }: { file: FileUpload }) => {
    if (file.type?.startsWith('image/')) {
        return (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted border shadow-sm">
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
            <video controls src={file.url} className="w-full rounded-xl bg-black shadow-sm">
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
        <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <FileIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="font-semibold text-lg mb-2">No preview available for this file type</p>
                <p className="text-muted-foreground mb-6 max-w-xs">{file.type}</p>
                <Button asChild variant="outline">
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in New Tab
                    </a>
                </Button>
            </CardContent>
        </Card>
    );
};

export default function UploadDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { toast } = useToast();

    const [file, setFile] = useState<FileUpload | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedTags, setEditedTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchFile = async () => {
            setIsLoading(true);
            try {
                const data = await getFileUpload(id);
                if (data) {
                    setFile(data);
                    setEditedName(data.name);
                    setEditedTags(data.tags || []);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'File not found.' });
                    router.push('/manage/uploads');
                }
            } catch (error) {
                console.error('Error fetching file:', error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load file details.' });
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchFile();
    }, [id, router, toast]);

    const handleEditToggle = () => {
        if (!isEditing && file) {
            setEditedName(file.name);
            setEditedTags(file.tags || []);
            setTagInput('');
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        if (!file) return;
        setIsSaving(true);
        try {
            // Include anything currently in the tag input
            let finalTags = [...editedTags];
            if (tagInput.trim()) {
                const newTag = tagInput.trim().replace(/,/g, '');
                if (newTag && !finalTags.includes(newTag)) {
                    finalTags.push(newTag);
                }
            }

            await updateFileUpload(file.id, {
                name: editedName,
                tags: finalTags
            });
            setFile({ ...file, name: editedName, tags: finalTags });
            setEditedTags(finalTags);
            setTagInput('');
            toast({ title: 'Success', description: 'File updated successfully.' });
            setIsEditing(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update file.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            const val = tagInput.trim().replace(/,/g, '');
            if (val && !editedTags.includes(val)) {
                setEditedTags([...editedTags, val]);
                setTagInput('');
            } else {
                setTagInput('');
            }
        } else if (e.key === 'Backspace' && !tagInput && editedTags.length > 0) {
            setEditedTags(editedTags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setEditedTags(editedTags.filter(t => t !== tagToRemove));
    };

    const handleDelete = async () => {
        if (!file) return;
        if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            await deleteFileUpload(file.id);
            toast({ title: 'Deleted', description: 'File removed successfully.' });
            router.push('/manage/uploads');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete file.' });
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-12 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading file details...</p>
            </div>
        );
    }

    if (!file) return null;

    const uploadedDate = file.uploadedOn ? format(new Date(file.uploadedOn), "PPP p") : "N/A";

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
                <LinkButton variant="ghost" className="-ml-4" href="/manage/uploads">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Library
                    </LinkButton>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={handleEditToggle}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Details
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={handleEditToggle} disabled={isSaving}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                <Check className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </>
                    )}
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting || isSaving}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <FilePreview file={file} />

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold text-lg mb-4">File Information</h3>
                            <dl className="space-y-1">
                                <div className="py-3 border-b">
                                    <dt className="text-sm font-medium text-muted-foreground mb-1">File Name</dt>
                                    <dd className="text-base text-foreground break-all">
                                        {isEditing ? (
                                            <Input
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                className="h-10 bg-background w-full"
                                            />
                                        ) : file.name}
                                    </dd>
                                </div>
                                <DetailRow label="File Type" value={<Badge variant="outline" className="font-mono">{file.type}</Badge>} />
                                <DetailRow label="File Size" value={`${(file.size / 1024).toFixed(2)} KB`} />
                                <DetailRow label="Uploaded By" value={file.uploadedBy} />
                                <DetailRow label="Uploaded On" value={uploadedDate} />
                                <div className="py-3 border-b">
                                    <dt className="text-sm font-medium text-muted-foreground mb-1">Tags</dt>
                                    <dd className="text-sm text-foreground break-all">
                                        {isEditing ? (
                                            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[40px] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 transition-all">
                                                {editedTags.map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 h-7">
                                                        {tag}
                                                        <button
                                                            onClick={() => removeTag(tag)}
                                                            className="hover:text-destructive transition-colors"
                                                            type="button"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                                <input
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={handleAddTag}
                                                    placeholder={editedTags.length === 0 ? "Type and press comma or enter..." : ""}
                                                    className="flex-grow bg-transparent outline-none h-7 text-sm min-w-[120px]"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1 justify-end">
                                                {file.tags?.map((tag) => <Badge key={tag} variant="secondary" className="px-2">{tag}</Badge>)}
                                            </div>
                                        )}
                                    </dd>
                                </div>
                                <div className="py-3 border-b">
                                    <dt className="text-sm font-medium text-muted-foreground mb-1">URL</dt>
                                    <dd className="text-sm text-primary hover:underline break-all">
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                            {file.url}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-4">Metadata</h3>
                            <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-auto max-h-[400px]">
                                <pre>{JSON.stringify(file.meta, null, 2)}</pre>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">Usage Help</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                This file is stored in your secure media library. You can use its URL in any tour or blog post.
                            </p>
                            <Button variant="outline" className="w-full" onClick={() => {
                                navigator.clipboard.writeText(file.url);
                                toast({ title: 'Copied', description: 'URL copied to clipboard.' });
                            }}>
                                Copy File URL
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
