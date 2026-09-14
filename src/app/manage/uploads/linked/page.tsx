'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@neup/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neup/components/ui/card';
import { Label } from '@neup/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Link } from "@neup/components/ui/link";
import { LinkButton } from "@neup/components/ui/link-button";

export default function LinkedUploadPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [urls, setUrls] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number; success: number; failed: number; skipped: number } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const urlList = urls.split('\n').map(u => u.trim()).filter(u => u.length > 0);

        if (urlList.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please enter at least one URL',
            });
            return;
        }

        setIsSubmitting(true);
        setProgress({ current: 0, total: urlList.length, success: 0, failed: 0, skipped: 0 });

        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < urlList.length; i++) {
            const url = urlList[i];
            try {
                const response = await fetch('/api/add-linked-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: url,
                        // No custom name for bulk upload, let it auto-detect
                    }),
                });

                if (response.status === 409) {
                    skippedCount++;
                } else if (!response.ok) {
                    throw new Error('Failed');
                } else {
                    successCount++;
                }
            } catch (error) {
                console.error(`Error adding linked upload for ${url}:`, error);
                failCount++;
            }

            setProgress({
                current: i + 1,
                total: urlList.length,
                success: successCount,
                failed: failCount,
                skipped: skippedCount
            });
        }

        setIsSubmitting(false);

        toast({
            title: 'Batch Complete',
            description: `Processed ${urlList.length} links. Success: ${successCount}, Skipped: ${skippedCount}, Failed: ${failCount}`,
            variant: failCount > 0 ? 'destructive' : 'default',
        });

        if (successCount > 0) {
            // Wait a moment then redirect if there were successes
            setTimeout(() => {
                router.push('/manage/uploads');
            }, 2000);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <div className="mb-8">
                <LinkButton variant="ghost" className="-ml-4" href="/manage/uploads">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Uploads
                    </LinkButton>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        Add Images from URLs
                    </CardTitle>
                    <CardDescription>
                        Paste multiple image URLs (one per line) to add them to your library in batches.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="urls">Image URLs *</Label>
                            <textarea
                                id="urls"
                                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg\n..."}
                                value={urls}
                                onChange={(e) => setUrls(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter one URL per line. Duplicates will be skipped.
                            </p>
                        </div>

                        {progress && (
                            <div className="space-y-2 bg-muted p-4 rounded-md">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Processing... {progress.current} / {progress.total}</span>
                                    <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                                </div>
                                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-primary h-full transition-all duration-300"
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                                    <span className="text-green-600 flex items-center gap-1">
                                        ✓ {progress.success} Added
                                    </span>
                                    <span className="text-yellow-600 flex items-center gap-1">
                                        ⚠ {progress.skipped} Skipped
                                    </span>
                                    <span className="text-destructive flex items-center gap-1">
                                        ✕ {progress.failed} Failed
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={isSubmitting || !urls.trim()}
                                className="flex-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <LinkIcon className="h-4 w-4 mr-2" />
                                        Add Images
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/manage/uploads')}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">How it works:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Paste multiple URLs, each on a new line</li>
                    <li>The system will process them one by one</li>
                    <li>Invalid URLs or fetch errors will be skipped</li>
                    <li>Successfully processed images will show up in your library</li>
                </ul>
            </div>
        </div>
    );
}
