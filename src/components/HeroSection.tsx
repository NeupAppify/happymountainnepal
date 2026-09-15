
"use client";

import { LinkButton } from "@neup/components/ui/link-button";
import Image from 'next/image';
import { Button } from '@neup/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@neup/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@neup/components/ui/skeleton';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { motion, AnimatePresence } from 'framer-motion';

export function HeroSection({ initialProfile }: { initialProfile?: any }) {
  const router = useRouter();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { profile, isLoading } = useSiteProfile(initialProfile);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Use an array for images
  const heroImages = profile?.heroImages && profile.heroImages.length > 0
    ? profile.heroImages
    : (profile?.heroImage ? [profile.heroImage] : []);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const intervalTime = (profile?.heroTransitionInterval || 5) * 1000;

    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        // Pick a random next index that is different from current
        let nextIndex;
        if (heroImages.length === 2) {
          nextIndex = prev === 0 ? 1 : 0;
        } else {
          do {
            nextIndex = Math.floor(Math.random() * heroImages.length);
          } while (nextIndex === prev);
        }
        return nextIndex;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [heroImages, profile?.heroTransitionInterval]);

  const heroContent = {
    title: profile?.heroTitle || 'Discover Your Next Adventure',
    description: profile?.heroDescription || 'Explore breathtaking treks and cultural tours in the heart of the Himalayas. Unforgettable journeys await.',
  };

  useEffect(() => {
    if (isSearchActive) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchActive]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
      }
    }

    if (isSearchActive) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchActive]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search/${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchActive(false);
    }
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSearchActive(true);
  };

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white bg-black overflow-hidden">
      <AnimatePresence>
        {heroImages.length > 0 && (
          <motion.div
            key={heroImages[currentIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={heroImages[currentIndex]}
              alt="Hero Background"
              fill
              className="object-cover"
              priority
              loading="eager"
            />
            {/* Dark Overlay inside the motion div or outside? Outside is better to stay consistent */}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/50 z-0" />

      <div className="relative z-10 p-4 max-w-4xl mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center w-full">
            <div className="space-y-4 w-full max-w-2xl">
              <Skeleton className="h-16 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3 mx-auto" />
            </div>
            <div className="mt-8 flex gap-4 justify-center">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold !font-headline mb-4 animate-fade-in-down">
              {heroContent.title}
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-in-up">
              {heroContent.description}
            </p>
          </>
        )}

        {!isLoading && (
          <div ref={searchContainerRef} className="flex flex-col items-center w-full">
            {isSearchActive ? (
              <form onSubmit={handleSearch} className="max-w-lg mx-auto animate-fade-in-up relative">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for tours, e.g., 'Everest'"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/90 text-foreground placeholder:text-muted-foreground w-full rounded-full py-6 pl-6 pr-16 border-2 border-primary/50 focus:border-primary focus:ring-primary/20 focus:ring-4 transition-all"
                />
                <Button
                  variant="solid"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </form>
            ) : (
              <div className="flex gap-4 justify-center animate-fade-in-up">
                <LinkButton href="/tours" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" variant="solid">
                    Explore Tours
                  </LinkButton>
                <Button
                  size="lg"
                  variant="solid"
                  onClick={handleSearchClick}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search for Experience
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
