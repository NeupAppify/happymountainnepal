import { LinkButton } from "@neup/components/ui/link-button";
import { Frown } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 text-center">
      <Frown className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-5xl md:text-7xl font-bold !font-headline mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <LinkButton href="/" size="lg" variant="outlined">Go to Homepage</LinkButton>
    </div>
  );
}
