'use client';

import * as React from 'react';
import { LinkButton } from "@neup/components/ui/link-button";
import { Link } from "@neup/components/ui/link";
import { Mountain, Search, User, Menu } from 'lucide-react';
import { Button } from '@neup/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@neup/components/ui/sheet';
import { HeaderV2Nav, type NavLink, MobileNavLink } from './HeaderV2Nav';
import { usePathname } from 'next/navigation';

const navLinks: NavLink[] = [
  { href: '/tours', title: 'Tours' },
  {
    title: 'Destinations',
    children: [
      {
        title: 'Everest',
        href: '/tours?region=Everest',
        description: "Home to the world's highest peak.",
      },
      {
        title: 'Annapurna',
        href: '/tours?region=Annapurna',
        description: 'Diverse treks with stunning views.',
      },
      {
        title: 'Langtang',
        href: '/tours?region=Langtang',
        description: 'Accessible treks near Kathmandu.',
      },
    ],
  },
  {
    title: 'About',
    children: [
      {
        title: 'Company',
        description: 'Our story and team.',
        children: [
          {
            title: 'About Us',
            href: '/about',
            description: 'Learn about our mission and values.',
          },
          {
            title: 'Our Team',
            href: '/about/teams',
            description: 'Meet the experts behind your adventure.',
          },
        ],
      },
      {
        title: 'Community',
        description: 'Stories and feedback.',
        children: [
          {
            title: 'Reviews',
            href: '/reviews',
            description: 'Read stories from our happy travelers.',
          },
          {
            title: 'Blog',
            href: '/blog',
            description: 'Guides, stories, and advice.',
          },
        ],
      },
       {
        title: 'Legal',
        description: 'Policies and documents.',
        children: [
            {
                title: 'Documents',
                href: '/legal/documents',
                description: "View our company's legal licenses."
            },
            {
                title: 'Terms & Conditions',
                href: '/legal/terms',
                description: 'Read our terms and conditions.'
            },
            {
                title: 'Privacy Policy',
                href: '/legal/privacy',
                description: 'Our commitment to your privacy.'
            }
        ]
      },
    ],
  },
  { href: '/contact', title: 'Contact' },
  { href: '/search', title: 'Search' },
];

function renderMobileNavLinks(links: NavLink[], setOpen: (open: boolean) => void): React.ReactNode[] {
    const pathname = usePathname();
    return links.map(link => {
        if(link.children) {
            return (
                <div className="py-2" key={link.title}>
                    <h3 className="font-semibold text-muted-foreground px-4 mb-2">{link.title}</h3>
                    <div className="flex flex-col">
                        {renderMobileNavLinks(link.children, setOpen)}
                    </div>
                </div>
            )
        }
        return (
            <MobileNavLink
                key={link.href}
                href={link.href!}
                pathname={pathname}
                setOpen={setOpen}
            >
                {link.title}
            </MobileNavLink>
        )
    })
  }


export function HeaderV2() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
                <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 w-full sm:max-w-xs">
                <Link
                href="/"
                className="mb-6 flex items-center px-4"
                onClick={() => setIsMobileMenuOpen(false)}
                >
                <Mountain className="mr-2 h-6 w-6 text-primary" />
                <span className="font-bold">Happy Mountain</span>
                </Link>
                <div className="flex flex-col space-y-1">
                    {renderMobileNavLinks(navLinks, setIsMobileMenuOpen)}
                </div>
            </SheetContent>
            </Sheet>
        </div>
        
        <div className="hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="font-bold">Happy Mountain</span>
          </Link>
        </div>
        
        <div className="flex flex-1 justify-center">
            <HeaderV2Nav links={navLinks} />
        </div>
        
        <div className="flex items-center justify-end">
          <LinkButton variant="ghost" size="icon" href="/profile">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </LinkButton>
        </div>
      </div>
    </header>
  );
}
