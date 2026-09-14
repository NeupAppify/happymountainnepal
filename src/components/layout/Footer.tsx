
'use client';
import { Link } from '@neup/components/ui/link';
import { Mail, Phone, MapPin, Twitter, Instagram, Facebook } from 'lucide-react';
import { useSiteProfile } from '@/hooks/use-site-profile';
import Image from 'next/image';
import type { SiteProfile } from '@/lib/types';

export function Footer({ initialProfile }: { initialProfile?: SiteProfile | null }) {
  const { profile } = useSiteProfile(initialProfile);

  const tagline = profile?.footerTagline || 'Your gateway to Himalayan adventures.';
  const address = profile?.address || 'Thamel, Kathmandu, Nepal';
  const phone = profile?.phone || '+977 984-3725521';
  const email = profile?.contactEmail || 'info@happymountainnepal.com';
  const socials = profile?.socials;

  return (
    <footer className="border-t bg-footer-background">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://cdn.neupgroup.com/p3happymountainnepal/logo.png" alt="Happy Mountain Nepal Logo" width={24} height={24} className="h-6 w-6 object-contain" />
              <span className="text-xl font-bold font-headline">Happy Mountain Nepal</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {tagline}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                {profile?.locationUrl ? (
                  <a href={profile.locationUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    {profile?.location || address}
                  </a>
                ) : (
                  <span>{profile?.location || address}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" /> <a href={`tel:${phone}`} className="hover:text-primary">{phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" /> <a href={`mailto:${email}`} className="hover:text-primary">{email}</a>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              {socials?.facebook && (
                <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socials?.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socials?.twitter && (
                <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
          <div>
            <p className="font-headline text-lg font-semibold tracking-wider uppercase">Tours</p>
            <ul className="mt-4 space-y-2">
              <li><Link href="/tours?region=Everest" className="text-sm text-muted-foreground hover:text-primary">Everest</Link></li>
              <li><Link href="/tours?region=Annapurna" className="text-sm text-muted-foreground hover:text-primary">Annapurna</Link></li>
              <li><Link href="/tours?region=Langtang" className="text-sm text-muted-foreground hover:text-primary">Langtang</Link></li>
              <li><Link href="/tours" className="text-sm text-muted-foreground hover:text-primary">All Tours</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-headline text-lg font-semibold tracking-wider uppercase">Company</p>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/about/teams" className="text-sm text-muted-foreground hover:text-primary">Our Team</Link></li>
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link></li>
              <li><Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/checkout?method=wireTransfer" className="text-sm text-muted-foreground hover:text-primary">Bank Payment</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Happy Mountain Nepal Private Limited. All rights reserved.</p>
          <p className="mt-2">
            Developed by <a href="https://neupgroup.com/marketing" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Neup.Marketing</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
