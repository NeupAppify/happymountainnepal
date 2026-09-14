'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neup/components/ui/card';
import { Button } from '@neup/components/ui/button';
import { Input } from '@neup/components/ui/input';
import { Label } from '@neup/components/ui/label';
import {
    Plus,
    Trash2,
    Save,
    GripVertical,
    ArrowLeft,
    Eye,
    EyeOff
} from 'lucide-react';
import { LinkButton } from "@neup/components/ui/link-button";
import { useToast } from '@/hooks/use-toast';

interface FooterLink {
    title: string;
    href: string;
    description?: string;
}

interface FooterSection {
    title: string;
    links: FooterLink[];
}

interface NavigationData {
    header: {
        links: any[];
    };
    footer: {
        links: FooterSection[];
    };
}

export default function FooterManagementPage() {
    const [sections, setSections] = useState<FooterSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await fetch('/api/navigation-components');
            if (!response.ok) throw new Error('Failed to fetch');
            const data: NavigationData = await response.json();
            setSections(data.footer.links || []);
        } catch (error) {
            console.error('Error loading navigation data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load navigation data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const saveData = async () => {
        setSaving(true);
        try {
            // Load current data
            const response = await fetch('/api/navigation-components');
            if (!response.ok) throw new Error('Failed to fetch current data');
            const data: NavigationData = await response.json();

            // Update footer links
            data.footer.links = sections;

            // Save to file via API
            const saveResponse = await fetch('/api/navigation-components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!saveResponse.ok) throw new Error('Failed to save');

            toast({
                title: 'Success',
                description: 'Footer navigation updated successfully',
            });
        } catch (error) {
            console.error('Error saving navigation data:', error);
            toast({
                title: 'Error',
                description: 'Failed to save navigation data',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const addSection = () => {
        setSections([...sections, { title: 'New Section', links: [] }]);
    };

    const updateSection = (index: number, field: keyof FooterSection, value: any) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setSections(newSections);
    };

    const deleteSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const addLink = (sectionIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].links.push({
            title: 'New LinkButton',
            href: '#',
            description: ''
        });
        setSections(newSections);
    };

    const updateLink = (sectionIndex: number, linkIndex: number, field: keyof FooterLink, value: string) => {
        const newSections = [...sections];
        newSections[sectionIndex].links[linkIndex] = {
            ...newSections[sectionIndex].links[linkIndex],
            [field]: value
        };
        setSections(newSections);
    };

    const deleteLink = (sectionIndex: number, linkIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].links = newSections[sectionIndex].links.filter((_, i) => i !== linkIndex);
        setSections(newSections);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-2">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading navigation data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <LinkButton variant="ghost" size="sm" href="/manage/components">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </LinkButton>
                    </div>
                    <h1 className="text-3xl font-bold font-headline mt-2">Footer Navigation</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your website's footer links and sections
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        {previewMode ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide Preview
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show Preview
                            </>
                        )}
                    </Button>
                    <Button onClick={saveData} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {previewMode && (
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Preview</CardTitle>
                        <CardDescription>
                            This is how your footer structure looks (simplified view)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-xs overflow-auto max-h-96 bg-background p-4 rounded-lg">
                            {JSON.stringify(sections, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Footer Sections</h2>
                    <Button onClick={addSection}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                    </Button>
                </div>

                {sections.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground mb-4">No footer sections yet</p>
                            <Button onClick={addSection}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Section
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {sections.map((section, sectionIndex) => (
                            <Card key={sectionIndex} className="border-l-4 border-l-primary">
                                <CardHeader>
                                    <div className="flex items-start gap-2">
                                        <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Section {sectionIndex + 1}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteSection(sectionIndex)}
                                                    className="text-destructive hover:text-destructive h-8"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div>
                                                <Label htmlFor={`section-title-${sectionIndex}`}>Section Title</Label>
                                                <Input
                                                    id={`section-title-${sectionIndex}`}
                                                    value={section.title}
                                                    onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                                                    placeholder="e.g., Quick Links, Company, Support"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold">Links</Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addLink(sectionIndex)}
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add LinkButton
                                            </Button>
                                        </div>

                                        {section.links.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No links in this section
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {section.links.map((link, linkIndex) => (
                                                    <Card key={linkIndex} className="bg-muted/50">
                                                        <CardContent className="pt-4 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-muted-foreground">
                                                                    LinkButton {linkIndex + 1}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => deleteLink(sectionIndex, linkIndex)}
                                                                    className="text-destructive hover:text-destructive h-6 w-6 p-0"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>

                                                            <div>
                                                                <Label htmlFor={`link-title-${sectionIndex}-${linkIndex}`}>
                                                                    Title
                                                                </Label>
                                                                <Input
                                                                    id={`link-title-${sectionIndex}-${linkIndex}`}
                                                                    value={link.title}
                                                                    onChange={(e) => updateLink(sectionIndex, linkIndex, 'title', e.target.value)}
                                                                    placeholder="LinkButton title"
                                                                    className="h-8"
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label htmlFor={`link-href-${sectionIndex}-${linkIndex}`}>
                                                                    URL
                                                                </Label>
                                                                <Input
                                                                    id={`link-href-${sectionIndex}-${linkIndex}`}
                                                                    value={link.href}
                                                                    onChange={(e) => updateLink(sectionIndex, linkIndex, 'href', e.target.value)}
                                                                    placeholder="/path or https://example.com"
                                                                    className="h-8"
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label htmlFor={`link-desc-${sectionIndex}-${linkIndex}`}>
                                                                    Description (optional)
                                                                </Label>
                                                                <textarea
                                                                    id={`link-desc-${sectionIndex}-${linkIndex}`}
                                                                    value={link.description || ''}
                                                                    onChange={(e) => updateLink(sectionIndex, linkIndex, 'description', e.target.value)}
                                                                    placeholder="Brief description"
                                                                    rows={2}
                                                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                                />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="text-lg">Footer Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>• Organize links into logical sections (e.g., Company, Support, Legal)</p>
                    <p>• Keep section titles short and descriptive</p>
                    <p>• Use relative URLs (e.g., /about) for internal pages</p>
                    <p>• Use absolute URLs (e.g., https://example.com) for external links</p>
                    <p>• Descriptions are optional but can provide helpful context</p>
                </CardContent>
            </Card>
        </div>
    );
}
