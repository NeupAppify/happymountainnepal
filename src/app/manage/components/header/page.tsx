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
    ChevronRight,
    Pencil
} from 'lucide-react';
import { LinkButton } from "@neup/components/ui/link-button";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NavLink {
    title: string;
    href?: string;
    description?: string;
    children?: NavLink[];
}

interface NavigationData {
    header: {
        links: NavLink[];
    };
    footer: {
        links: NavLink[];
    };
}

interface NavigationLevel {
    items: NavLink[];
    title: string;
    path: number[];
}

export default function HeaderManagementPage() {
    const [links, setLinks] = useState<NavLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [navigationStack, setNavigationStack] = useState<NavigationLevel[]>([]);
    const [draggedItem, setDraggedItem] = useState<{ item: NavLink; index: number } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editingItem, setEditingItem] = useState<{ item: NavLink; path: number[] } | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        // Initialize navigation stack with root level
        if (links.length > 0 && navigationStack.length === 0) {
            setNavigationStack([{ items: links, title: 'Level 1 - Main Navigation', path: [] }]);
        }
    }, [links]);

    const loadData = async () => {
        try {
            const response = await fetch('/api/navigation-components');
            if (!response.ok) throw new Error('Failed to fetch');
            const data: NavigationData = await response.json();
            setLinks(data.header.links || []);
            setNavigationStack([{ items: data.header.links || [], title: 'Level 1 - Main Navigation', path: [] }]);
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
            const response = await fetch('/api/navigation-components');
            if (!response.ok) throw new Error('Failed to fetch current data');
            const data: NavigationData = await response.json();

            data.header.links = links;

            const saveResponse = await fetch('/api/navigation-components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!saveResponse.ok) throw new Error('Failed to save');

            toast({
                title: 'Success',
                description: 'Header navigation updated successfully',
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

    const updateLinksAtPath = (path: number[], updater: (items: NavLink[]) => NavLink[]) => {
        const newLinks = JSON.parse(JSON.stringify(links));

        if (path.length === 0) {
            const updated = updater(newLinks);
            setLinks(updated);
            setNavigationStack([{ items: updated, title: 'Level 1 - Main Navigation', path: [] }]);
            return;
        }

        let current: any = newLinks;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]].children;
        }

        current[path[path.length - 1]].children = updater(current[path[path.length - 1]].children || []);
        setLinks(newLinks);

        // Update navigation stack
        const currentLevel = navigationStack[navigationStack.length - 1];
        const newStack = [...navigationStack];
        newStack[newStack.length - 1] = {
            ...currentLevel,
            items: current[path[path.length - 1]].children
        };
        setNavigationStack(newStack);
    };

    const navigateToChildren = (item: NavLink, index: number) => {
        if (!item.children || item.children.length === 0) return;

        const currentLevel = navigationStack[navigationStack.length - 1];
        const newPath = [...currentLevel.path, index];
        const level = newPath.length + 1;

        setNavigationStack([
            ...navigationStack,
            {
                items: item.children,
                title: `Level ${level} - ${item.title}`,
                path: newPath
            }
        ]);
    };

    const navigateBack = () => {
        if (navigationStack.length > 1) {
            setNavigationStack(navigationStack.slice(0, -1));
        }
    };

    const addItem = () => {
        const currentLevel = navigationStack[navigationStack.length - 1];
        const level = currentLevel.path.length + 1;

        const newItem: NavLink = {
            title: 'New LinkButton',
            ...(level >= 2 ? { href: '#', description: '' } : {})
        };

        updateLinksAtPath(currentLevel.path, (items) => [...items, newItem]);
    };

    const deleteItem = (index: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const currentLevel = navigationStack[navigationStack.length - 1];
        updateLinksAtPath(currentLevel.path, (items) => items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof NavLink, value: string) => {
        const currentLevel = navigationStack[navigationStack.length - 1];
        updateLinksAtPath(currentLevel.path, (items) => {
            const newItems = [...items];
            newItems[index] = { ...newItems[index], [field]: value };
            return newItems;
        });
    };

    // Drag and drop handlers
    const handleDragStart = (item: NavLink, index: number) => {
        setDraggedItem({ item, index });
    };

    const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedItem || draggedItem.index === targetIndex) return;

        const currentLevel = navigationStack[navigationStack.length - 1];
        updateLinksAtPath(currentLevel.path, (items) => {
            const newItems = [...items];
            const [removed] = newItems.splice(draggedItem.index, 1);
            newItems.splice(targetIndex, 0, removed);
            return newItems;
        });

        setDraggedItem({ ...draggedItem, index: targetIndex });
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setIsUpdating(false);
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.stopPropagation();
        handleDragEnd();
    };

    const currentLevel = navigationStack[navigationStack.length - 1];
    const canHaveChildren = currentLevel && currentLevel.path.length < 2;

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
                                Back to Components
                            </LinkButton>
                    </div>
                    <h1 className="text-3xl font-bold font-headline mt-2">Header Navigation</h1>
                    <p className="text-muted-foreground mt-1">
                        {currentLevel?.title || 'Manage your website\'s main navigation menu structure'}
                    </p>
                </div>

                <Button onClick={saveData} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <Card className="relative">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {navigationStack.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={navigateBack}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1" />
                                        Back
                                    </Button>
                                )}
                                {currentLevel?.title}
                            </CardTitle>
                            <CardDescription>
                                Drag and drop items to reorder them. Click items with children to navigate deeper.
                            </CardDescription>
                        </div>
                        {isUpdating && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Updating...
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {currentLevel?.items.map((item, index) => (
                        <div
                            key={index}
                            draggable
                            onDragStart={() => handleDragStart(item, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => handleDrop(e, index)}
                            className={cn(
                                "border rounded-lg p-4 bg-background transition-all duration-200 cursor-move",
                                draggedItem?.index === index && "opacity-50 scale-95 rotate-1",
                                !draggedItem && "hover:border-primary hover:shadow-md",
                                isUpdating && "pointer-events-none"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab active:cursor-grabbing flex-shrink-0" />

                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                                Level {currentLevel.path.length + 1}
                                            </span>
                                            {item.children && item.children.length > 0 && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                    {item.children.length} {item.children.length === 1 ? 'child' : 'children'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {item.children && item.children.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => navigateToChildren(item, index)}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    const currentPath = JSON.stringify([...currentLevel.path, index]);
                                                    const editingPath = editingItem ? JSON.stringify(editingItem.path) : null;
                                                    setEditingItem(editingPath === currentPath ? null : { item, path: [...currentLevel.path, index] });
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => deleteItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>

                                    {editingItem && JSON.stringify(editingItem.path) === JSON.stringify([...currentLevel.path, index]) ? (
                                        <div className="space-y-3 pt-2 border-t">
                                            <div>
                                                <Label htmlFor={`title-${index}`}>Title</Label>
                                                <Input
                                                    id={`title-${index}`}
                                                    value={item.title}
                                                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                                                    placeholder="LinkButton title"
                                                />
                                            </div>

                                            {currentLevel.path.length >= 0 && (
                                                <>
                                                    <div>
                                                        <Label htmlFor={`href-${index}`}>URL {canHaveChildren && '(optional for parent items)'}</Label>
                                                        <Input
                                                            id={`href-${index}`}
                                                            value={item.href || ''}
                                                            onChange={(e) => updateItem(index, 'href', e.target.value)}
                                                            placeholder="/path or https://example.com"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor={`desc-${index}`}>Description</Label>
                                                        <textarea
                                                            id={`desc-${index}`}
                                                            value={item.description || ''}
                                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                            placeholder="Brief description"
                                                            rows={2}
                                                            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {canHaveChildren && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const newLinks = JSON.parse(JSON.stringify(links));
                                                        let current: any = newLinks;
                                                        const path = [...currentLevel.path, index];

                                                        for (let i = 0; i < path.length - 1; i++) {
                                                            current = current[path[i]].children;
                                                        }

                                                        if (!current[path[path.length - 1]].children) {
                                                            current[path[path.length - 1]].children = [];
                                                        }

                                                        current[path[path.length - 1]].children.push({
                                                            title: 'New Child LinkButton',
                                                            href: '#',
                                                            description: ''
                                                        });

                                                        setLinks(newLinks);

                                                        // Navigate to the child level immediately
                                                        const updatedItem = current[path[path.length - 1]];
                                                        const level = path.length + 1;

                                                        setNavigationStack([
                                                            ...navigationStack,
                                                            {
                                                                items: updatedItem.children,
                                                                title: `Level ${level} - ${updatedItem.title}`,
                                                                path: path
                                                            }
                                                        ]);

                                                        // Close the edit view
                                                        setEditingItem(null);
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Child Item
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            {item.href && <p className="text-sm text-muted-foreground">{item.href}</p>}
                                            {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {currentLevel?.items.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p className="mb-4">No items in this level yet</p>
                            <Button onClick={addItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Item
                            </Button>
                        </div>
                    )}

                    {currentLevel?.items.length > 0 && (
                        <Button onClick={addItem} variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item to {currentLevel.title}
                        </Button>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="text-lg">Navigation Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>• <strong>Level 1:</strong> Top navigation items (shown in header bar)</p>
                    <p>• <strong>Level 2:</strong> Dropdown items (left column in mega menu)</p>
                    <p>• <strong>Level 3:</strong> Sub-items (right column in mega menu)</p>
                    <p>• Drag items to reorder them within the current level</p>
                    <p>• Click the edit icon to modify an item's details</p>
                    <p>• Click items with children to navigate into that level</p>
                    <p>• Use the back button to return to the previous level</p>
                </CardContent>
            </Card>
        </div>
    );
}
