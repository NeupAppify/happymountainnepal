'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neup/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@neup/components/ui/alert';
import { Info, Cookie } from 'lucide-react';

export default function SessionManagementPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold !font-headline">Session Management</h1>
                <p className="text-muted-foreground mt-2">
                    Authentication system information
                </p>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Cookie-Based Authentication</AlertTitle>
                <AlertDescription>
                    This application now uses simple cookie-based authentication instead of session management.
                    Sessions are no longer tracked or stored.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cookie className="h-5 w-5" />
                        Current Authentication Method
                    </CardTitle>
                    <CardDescription>
                        How the authentication system works
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Cookie-Based Authentication</h3>
                        <p className="text-sm text-muted-foreground">
                            When you log in, your credentials are stored in secure HTTP-only cookies:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                            <li><code className="bg-muted px-1 rounded">manager_username</code> - Your username</li>
                            <li><code className="bg-muted px-1 rounded">manager_password</code> - Your password</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Benefits</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>No database or file writes required</li>
                            <li>Faster authentication checks</li>
                            <li>No session expiration management needed</li>
                            <li>Simpler codebase and maintenance</li>
                            <li>Works seamlessly in Edge Runtime</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Security</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Cookies are HTTP-only (not accessible via JavaScript)</li>
                            <li>Cookies are secure (HTTPS only in production)</li>
                            <li>SameSite protection enabled (CSRF protection)</li>
                            <li>7-day cookie expiration</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Logout</h3>
                        <p className="text-sm text-muted-foreground">
                            When you log out, both cookies are deleted immediately, and you are logged out.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
