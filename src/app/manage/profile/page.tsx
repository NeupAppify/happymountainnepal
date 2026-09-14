'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@neup/components/ui/card";
import { useSiteProfile } from "@/hooks/use-site-profile";
import { Image, Info, Share2, ThumbsUp, ArrowRight, AlertCircle } from "lucide-react";
import { Link } from "@neup/components/ui/link";
import { Skeleton } from "@neup/components/ui/skeleton";

export default function ProfilePage() {
  const { profile, isLoading, error } = useSiteProfile();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Company Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your site-wide company information, such as contact details and public stats.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">Failed to load profile data. Please try refreshing.</p>
        </div>
      )}

      <div className="space-y-4">
        <Link href="/manage/profile/hero" className="block group">
          <Card className="transition-all group-hover:border-primary/50 group-hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-6">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Image className="h-5 w-5" />
                  </div>
                  Hero Section
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  Manage homepage hero content, background images, and taglines.
                </CardDescription>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
          </Card>
        </Link>

        <Link href="/manage/profile/why-us" className="block group">
          <Card className="transition-all group-hover:border-primary/50 group-hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-6">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <ThumbsUp className="h-5 w-5" />
                  </div>
                  Why Choose Us
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  Update the "Why Trek With Us" features and highlights.
                </CardDescription>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
          </Card>
        </Link>

        <Link href="/manage/profile/info" className="block group">
          <Card className="transition-all group-hover:border-primary/50 group-hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-6">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Info className="h-5 w-5" />
                  </div>
                  Company Info
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  Edit general company details, contact info, and website settings.
                </CardDescription>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
          </Card>
        </Link>

        <Link href="/manage/profile/socials" className="block group">
          <Card className="transition-all group-hover:border-primary/50 group-hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-6">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Share2 className="h-5 w-5" />
                  </div>
                  Social Media
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  Manage links to your social media profiles.
                </CardDescription>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
