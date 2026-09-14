
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Link } from "@neup/components/ui/link";
import { cn } from '@/lib/utils';
import { Button } from '@neup/components/ui/button';
import type { Tour } from '@/lib/types';

interface TourNavProps {
  tour: Tour;
  hasReviews: boolean;
}

const allNavItems = [
  { href: '#key-facts', label: 'Key Facts', isVisible: (tour: Tour) => true },
  { href: '#itinerary', label: 'Itinerary', isVisible: (tour: Tour) => tour.itinerary && tour.itinerary.length > 0 },
  { href: '#inclusions', label: 'Inclusions', isVisible: (tour: Tour) => tour.inclusions && tour.inclusions.length > 0 },
  { href: '#map', label: 'Map', isVisible: (tour: Tour) => !!tour.map },
  { href: '#gallery', label: 'Gallery', isVisible: (tour: Tour) => tour.images && tour.images.length > 0 },
  { href: '#faq', label: 'FAQ', isVisible: (tour: Tour) => tour.faq && tour.faq.length > 0 },
  { href: '#reviews', label: 'Reviews', isVisible: (tour: Tour, hasReviews: boolean) => hasReviews },
  { href: '#gears', label: 'Gears', isVisible: (tour: Tour) => tour.gears && tour.gears.length > 0 },
  { href: '#additional-info', label: 'More Info', isVisible: (tour: Tour) => tour.additionalInfoSections && tour.additionalInfoSections.length > 0 },
  { href: '#guides', label: 'Guides', isVisible: (tour: Tour) => tour.guides && tour.guides.length > 0 },
];

export function TourNav({ tour, hasReviews }: TourNavProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const navItems = useMemo(() => {
    return allNavItems.filter(item => item.isVisible(tour, hasReviews));
  }, [tour, hasReviews]);

  useEffect(() => {
    const handleScroll = () => {
      // Adjust this value to be just above the nav bar's usual position
      const stickyThreshold = 300;
      if (window.scrollY > stickyThreshold) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }

      const sections = navItems.map(item => document.getElementById(item.href.substring(1)));
      let currentSection = '';

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section) {
          const sectionTop = section.offsetTop - 150; // Offset for better accuracy
          if (window.scrollY >= sectionTop) {
            currentSection = section.id;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navItems]);

  return (
    <div className={cn(
      "transition-all duration-300 z-30",
      isSticky ? 'sticky top-16 shadow-md' : 'relative mt-8'
    )}>
      <div className="bg-secondary/80 backdrop-blur-sm">
        <div className="container mx-auto overflow-x-auto">
          <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 py-2">
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "block whitespace-nowrap px-3 py-2 text-sm font-medium rounded-md",
                  "transition-colors duration-200 cursor-pointer",
                  activeSection === item.href.substring(1)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
