'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neup/components/ui/card';
import { Button } from '@neup/components/ui/button';
import { Layout, Navigation, ArrowRight } from 'lucide-react';
import { LinkButton } from "@neup/components/ui/link-button";

export default function ComponentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Component Management</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your website's header and footer navigation links
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Navigation className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Header Navigation</CardTitle>
                                <CardDescription>Manage header menu links and structure</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Configure your website's main navigation menu with multi-level support.
                            Supports up to 3 levels of navigation hierarchy.
                        </p>
                        <LinkButton className="w-full" variant="solid" href="/manage/components/header">
                                Manage Header
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </LinkButton>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Layout className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Footer Navigation</CardTitle>
                                <CardDescription>Manage footer links and sections</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Configure your website's footer navigation and link sections.
                            Organize links into categories for better user experience.
                        </p>
                        <LinkButton className="w-full" variant="outline" href="/manage/components/footer">
                                Manage Footer
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </LinkButton>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                            Navigation Levels
                        </h3>
                        <p className="text-sm text-muted-foreground ml-8">
                            The header supports up to 3 levels of navigation. Level 1 appears in the header bar,
                            Level 2 in the left column of the dropdown, and Level 3 in the right column.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                            Automatic Layout
                        </h3>
                        <p className="text-sm text-muted-foreground ml-8">
                            If a Level 1 item has only Level 2 children (no Level 3), they'll be displayed
                            horizontally. If Level 3 exists, a two-column layout is used automatically.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                            Mobile Experience
                        </h3>
                        <p className="text-sm text-muted-foreground ml-8">
                            On mobile devices, navigation uses progressive disclosure. Users tap to navigate
                            deeper into the menu hierarchy with smooth animations.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
