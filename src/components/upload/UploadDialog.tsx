
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@neup/components/ui/dialog';
import { LinkButton } from '@neup/components/ui/link-button';
import { Button } from '@neup/components/ui/button';
import { Upload, X, Check, Save, Settings2 } from 'lucide-react';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { Input } from '@neup/components/ui/input';
import { Label } from '@neup/components/ui/label';
import { Switch } from '@neup/components/ui/switch';
import { Separator } from '@neup/components/ui/separator';
import imageCompression from 'browser-image-compression';

interface UploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploadComplete: () => void;
}

export function UploadDialog({ open, onOpenChange, onUploadComplete }: UploadDialogProps) {
    const { profile } = useSiteProfile();

    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // New State for Upload Details
    const [compress, setCompress] = useState(true);
    const [fileName, setFileName] = useState('');
    const [fileExtension, setFileExtension] = useState('');
    const [location, setLocation] = useState('assets');
    const [compressedSize, setCompressedSize] = useState<number | null>(null);
    const [isCompressingPreview, setIsCompressingPreview] = useState(false);

    // Handle extraction of name and extension when file is selected
    useEffect(() => {
        if (selectedFile) {
            const lastDotIndex = selectedFile.name.lastIndexOf('.');
            if (lastDotIndex !== -1) {
                const name = selectedFile.name.substring(0, lastDotIndex);
                const ext = selectedFile.name.substring(lastDotIndex); // includes the dot
                setFileName(sanitizeName(name));
                setFileExtension(ext);
            } else {
                setFileName(sanitizeName(selectedFile.name));
                setFileExtension('');
            }
        }
    }, [selectedFile]);

    // Handle preview compression size
    useEffect(() => {
        const calculateCompressedSize = async () => {
            if (selectedFile && compress && selectedFile.type.startsWith('image/')) {
                setIsCompressingPreview(true);
                try {
                    const options = {
                        maxSizeMB: 0.3, // Back to 300KB as requested
                        maxWidthOrHeight: 2048,
                        useWebWorker: true,
                        initialQuality: 0.8,
                    };
                    const compressedBlob = await imageCompression(selectedFile, options);
                    setCompressedSize(compressedBlob.size);
                } catch (err) {
                    console.error('Preview compression failed', err);
                    setCompressedSize(null);
                } finally {
                    setIsCompressingPreview(false);
                }
            } else {
                setCompressedSize(null);
            }
        };

        calculateCompressedSize();
    }, [selectedFile, compress]);

    const sanitizeName = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleNameChange = (val: string) => {
        // Automatically sanitize as user types
        const sanitized = val.toLowerCase().replace(/[^a-z0-9]/g, '-');
        setFileName(sanitized);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            let fileToUpload = selectedFile;

            // Client-side compression if enabled
            if (compress && selectedFile.type.startsWith('image/')) {
                try {
                    const options = {
                        maxSizeMB: 0.3, // Back to 300KB as requested
                        maxWidthOrHeight: 2048,
                        useWebWorker: true,
                        initialQuality: 0.8,
                    };
                    const compressedBlob = await imageCompression(selectedFile, options);

                    // Create a new file object with the sanitized name and original type
                    fileToUpload = new File([compressedBlob], fileName + fileExtension, {
                        type: selectedFile.type,
                        lastModified: Date.now(),
                    });
                } catch (compressionError) {
                    console.error('Compression failed, falling back to original:', compressionError);
                }
            }

            const formData = new FormData();
            formData.append('file', fileToUpload);

            // Site identifier as corrected by user
            formData.append('platform', 'p3happymountainnepal');

            // Derive contentIds (folder path) from the location string
            const pathParts = location.split('/').filter(p => p.trim() !== '');
            formData.append('contentIds', JSON.stringify(pathParts));

            formData.append('name', fileName);
            formData.append('compress', 'false'); // Set to false because we already compressed it on client
            formData.append('location', location);

            const response = await fetch('https://cdn.neupgroup.com/bridge/api/v1/upload', {
                method: 'POST',
                body: formData,
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${responseText}`);
            }

            const result = JSON.parse(responseText);

            if (result.success && result.url) {
                await fetch('/api/log-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: fileName + fileExtension,
                        url: result.url,
                        uploadedBy: 'admin',
                        type: selectedFile.type,
                        size: fileToUpload.size,
                        tags: ['general'],
                        meta: {
                            compress,
                            location,
                            originalName: selectedFile.name,
                            finalPath: `${location.endsWith('/') ? location : location + '/'}${fileName}${fileExtension}`
                        },
                    }),
                });

                setSelectedFile(null);
                onUploadComplete();
                onOpenChange(false);
            } else {
                throw new Error(result.message || 'Unknown upload error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const resetDialog = () => {
        setSelectedFile(null);
        setIsDragging(false);
        setCompress(true);
        setLocation('assets');
        setFileName('');
        setFileExtension('');
        setCompressedSize(null);
        setIsCompressingPreview(false);
    };

    return (
        <Dialog open={open} onOpenChange={(open) => {
            onOpenChange(open);
            if (!open) resetDialog();
        }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Media to NeupCDN</DialogTitle>
                    <DialogDescription>
                        Drag and drop a file or click to browse
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                            transition-colors
                            ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
                            ${selectedFile ? 'bg-muted/50' : ''}
                        `}
                        onClick={() => document.getElementById('file-input')?.click()}
                    >
                        <input
                            id="file-input"
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                            accept="image/*,video/*"
                        />

                        {selectedFile ? (
                            <div className="space-y-2">
                                <Check className="h-12 w-12 mx-auto text-green-500" />
                                <p className="font-medium text-sm truncate max-w-[300px] mx-auto">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground flex flex-col items-center gap-1">
                                    {isCompressingPreview ? (
                                        <span className="animate-pulse">Calculating optimized size...</span>
                                    ) : compressedSize ? (
                                        <>
                                            <span className="line-through opacity-50">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                            <span className="text-green-600 font-bold">{(compressedSize / 1024 / 1024).toFixed(2)} MB (Optimized)</span>
                                        </>
                                    ) : (
                                        <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                    )}
                                </p>
                                <LinkButton
                                    variant="plain"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                    }}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Remove
                                </LinkButton>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Drag and drop your file here, or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Supports images and videos
                                </p>
                            </div>
                        )}
                    </div>

                    {selectedFile && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Separator />

                            <div className="grid gap-4 bg-muted/30 p-4 rounded-lg border border-primary/10">
                                <div className="space-y-2">
                                    <Label htmlFor="fileName" className="text-sm font-semibold flex items-center gap-2">
                                        <Save className="h-4 w-4 text-primary" />
                                        File Name
                                    </Label>
                                    <div className="flex items-center gap-0 group">
                                        <Input
                                            id="fileName"
                                            value={fileName}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            className="border-primary/20 focus-visible:ring-primary"
                                            placeholder="my-awesome-file"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Only lowercase letters, numbers, and hyphens allowed.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-sm font-semibold flex items-center gap-2">
                                        <Settings2 className="h-4 w-4 text-primary" />
                                        Storage Location
                                    </Label>
                                    <Input
                                        id="location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="border-primary/20 focus-visible:ring-primary"
                                        placeholder="uploads/admin-user/upload-dialog/"
                                    />
                                </div>

                                <Separator className="bg-primary/10" />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="compress" className="text-sm font-semibold">Compress Image</Label>
                                        <p className="text-xs text-muted-foreground">Automatically optimize file size</p>
                                    </div>
                                    <Switch
                                        id="compress"
                                        checked={compress}
                                        onCheckedChange={setCompress}
                                    />
                                </div>

                                <div className="mt-2 text-[10px] text-muted-foreground bg-primary/5 p-2 rounded italic">
                                    Final Path: {location.endsWith('/') ? location : location + '/'}{fileName}{fileExtension}
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleFileUpload}
                        disabled={!selectedFile || isUploading}
                        className="w-full"
                    >
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        Files are uploaded to NeupCDN storage.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
