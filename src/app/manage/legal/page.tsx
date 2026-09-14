'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@neup/components/ui/card";
import { FileText, Gavel, ShieldCheck } from "lucide-react";
import { Link } from "@neup/components/ui/link";

const legalPages = [
    {
        title: "Legal Documents",
        description: "Manage company registration, licenses, and other official documents.",
        href: "/manage/legal/documents",
        icon: FileText
    },
    {
        title: "Privacy Policy",
        description: "Edit the privacy policy page for your website.",
        href: "/manage/legal/privacy",
        icon: ShieldCheck
    },
    {
        title: "Terms of Service",
        description: "Edit the terms of service page for your website.",
        href: "/manage/legal/terms",
        icon: Gavel
    }
]

export default function LegalPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold !font-headline">Legal Information</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your company's legal documents and public policies.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {legalPages.map(page => (
                    <Link key={page.href} href={page.href} className="block hover:shadow-lg transition-shadow rounded-lg">
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <page.icon className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>{page.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{page.description}</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
