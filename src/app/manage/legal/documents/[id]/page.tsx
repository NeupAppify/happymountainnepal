'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react'; // React 19 equivalent of unwrapping params
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@neup/components/ui/card";
import { Button } from "@neup/components/ui/button";
import { Input } from '@neup/components/ui/input';
import { Textarea } from '@neup/components/ui/textarea';
import { Label } from '@neup/components/ui/label';
import { getLegalDocumentById, updateLegalDocument } from '@/lib/db';
import type { LegalDocument } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save, Upload as UploadIcon, FileText, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@neup/components/ui/switch';
import { LinkButton } from "@neup/components/ui/link-button";
import { cn } from '@/lib/utils';

export default function EditLegalDocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [document, setDocument] = useState<LegalDocument | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isHidden, setIsHidden] = useState(false);
    const [currentFileUrl, setCurrentFileUrl] = useState('');

    // New file upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadDestination, setUploadDestination] = useState<'api' | 'public'>('api');

    useEffect(() => {
        async function fetchDocument() {
            try {
                const doc = await getLegalDocumentById(id);
                if (doc) {
                    setDocument(doc);
                    setTitle(doc.title);
                    setDescription(doc.description || '');
                    setIsHidden(doc.isHidden || false);
                    setCurrentFileUrl(doc.url);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Document not found.' });
                    router.push('/manage/legal/documents');
                }
            } catch (error) {
                console.error("Failed to load document", error);
                toast({ variant: "destructive", title: "Error", description: "Could not load legal document." });
            } finally {
                setIsLoading(false);
            }
        }
        fetchDocument();
    }, [id, router, toast]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Title is required.' });
            return;
        }

        setIsSaving(true);
        try {
            let fileUrl = currentFileUrl;

            // Check if a new file is being uploaded
            if (selectedFile) {
                if (uploadDestination === 'api') {
                    // Upload to neupgroup.com API
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    formData.append('platform', 'p3.happymountainnepal');
                    formData.append('contentIds', JSON.stringify(['legal-documents', 'admin-user', 'edit']));
                    formData.append('name', selectedFile.name.replace(/\.[^/.]+$/, ''));

                    const response = await fetch('https://neupgroup.com/content/bridge/api/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    const responseText = await response.text();
                    if (!response.ok) {
                        throw new Error(`Upload failed: ${response.status} ${responseText}`);
                    }

                    const result = JSON.parse(responseText);
                    if (result.success && result.url) {
                        fileUrl = result.url;

                        // Log upload
                        await fetch('/api/log-upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fileName: selectedFile.name,
                                url: fileUrl,
                                userId: 'admin',
                                fileType: selectedFile.type,
                                category: 'document',
                            }),
                        });
                    } else {
                        throw new Error(result.message || 'Unknown upload error');
                    }
                } else {
                    // Upload to local server /public
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    formData.append('compress', 'false');
                    formData.append('uploadType', 'server');
                    formData.append('serverPath', '');

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error('Upload failed');
                    }

                    const result = await response.json();
                    fileUrl = result.url;

                    // Log upload
                    await fetch('/api/log-upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fileName: selectedFile.name,
                            url: fileUrl,
                            userId: 'admin',
                            fileType: selectedFile.type,
                            category: 'document',
                        }),
                    });
                }
            }

            // Update in database
            await updateLegalDocument(id, {
                title: title.trim(),
                description: description.trim(),
                url: fileUrl,
                isHidden: isHidden,
            });

            toast({ title: 'Success', description: 'Document updated successfully.' });
            router.push('/manage/legal/documents');
            router.refresh();

        } catch (error: any) {
            console.error('Update error:', error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update document.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <LinkButton variant="ghost" className="pl-0 mb-4" href="/manage/legal/documents">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Documents
                    </LinkButton>
                <h1 className="text-3xl font-bold !font-headline">Edit Document</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Document Details</CardTitle>
                    <CardDescription>Update the title, description, or replace the file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Visibility Settings */}
                    <div className={cn(
                        "flex flex-row items-center justify-between rounded-lg border p-4 transition-colors",
                        isHidden
                            ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                            : "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                    )}>
                        <div className="space-y-0.5">
                            <Label className="text-base flex items-center gap-2">
                                {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                Public Visibility
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {isHidden
                                    ? "Document is hidden from the public site."
                                    : "Document is visible on the public site."
                                }
                            </p>
                        </div>
                        <Switch
                            checked={!isHidden}
                            onCheckedChange={(checked) => setIsHidden(!checked)}
                            disabled={isSaving}
                            className="data-[state=checked]:bg-green-600"
                        />
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Document Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Company Registration"
                            disabled={isSaving}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description for the document"
                            disabled={isSaving}
                            rows={4}
                        />
                    </div>

                    {/* Current File Info */}
                    <div className="space-y-2">
                        <Label>Current File</Label>
                        <div className="flex flex-col gap-2 p-3 border rounded-md bg-muted/50">
                            <div className="flex items-center">
                                <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                                <a
                                    href={currentFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline truncate flex-1"
                                >
                                    {currentFileUrl}
                                </a>
                            </div>
                            <div className="mt-2 relative w-full h-48 bg-white rounded border overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={currentFileUrl}
                                    alt="Document Preview"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Replace File */}
                    <div className="space-y-2 pt-2 border-t">
                        <Label className="text-base font-semibold">Replace File (Optional)</Label>
                        <div
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors mt-2"
                            onClick={() => window.document.getElementById('edit-file-input')?.click()}
                        >
                            <input
                                id="edit-file-input"
                                type="file"
                                className="hidden"
                                onChange={handleFileSelect}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                disabled={isSaving}
                            />
                            {selectedFile ? (
                                <div className="space-y-1">
                                    <FileText className="h-8 w-8 mx-auto text-green-500" />
                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB - Ready to upload
                                    </p>
                                    <Button variant="ghost" size="sm" onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                    }} className="mt-2 text-destructive">
                                        Remove Selection
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <UploadIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Click to upload a new version
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Leave empty to keep generic file
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Destination (only visible when file is selected) */}
                    {selectedFile && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label>Upload Destination</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={uploadDestination === 'api' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setUploadDestination('api')}
                                    className="flex-1"
                                    disabled={isSaving}
                                >
                                    API Storage
                                </Button>
                                <Button
                                    type="button"
                                    variant={uploadDestination === 'public' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setUploadDestination('public')}
                                    className="flex-1"
                                    disabled={isSaving}
                                >
                                    Public Folder
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {uploadDestination === 'api'
                                    ? 'Upload to external API storage (neupgroup.com)'
                                    : 'Upload to server /public folder'
                                }
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <LinkButton variant="outline" href="/manage/legal/documents">Cancel</LinkButton>
                        <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
