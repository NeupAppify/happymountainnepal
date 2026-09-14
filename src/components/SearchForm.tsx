
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@neup/components/ui/input';
import { Button } from '@neup/components/ui/button';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

interface SearchFormProps {
    initialTerm?: string;
}

export function SearchForm({ initialTerm = '' }: SearchFormProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchTerm(initialTerm);
  }, [initialTerm]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsLoading(true);
      router.push(`/search/${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Input
        type="text"
        placeholder="Search for tours, e.g., 'Everest'"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-white/90 text-foreground placeholder:text-muted-foreground w-full rounded-full py-6 pl-6 pr-16 border-2 border-primary/50 focus:border-primary focus:ring-primary/20 focus:ring-4 transition-all"
      />
      <Button type="submit" size="icon" disabled={isLoading}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <SearchIcon className="h-5 w-5" />
        )}
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}
