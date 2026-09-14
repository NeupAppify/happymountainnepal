
'use client' 

import { useEffect } from 'react'
import { logError } from '@/lib/db'
import { usePathname } from 'next/navigation'
import { Button } from '@neup/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname()

  useEffect(() => {
    // Log the error to the database
    logError({
        message: error.message,
        stack: error.stack,
        pathname: pathname,
        // @ts-ignore
        componentStack: error.componentStack
    }).catch(console.error);

  }, [error, pathname])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="text-center p-8">
            <h1 className="text-4xl font-bold !font-headline mb-4">Something went wrong!</h1>
            <p className="text-muted-foreground mb-8">
                We've been notified about the issue and are working to fix it. Please try again later.
            </p>
            <Button onClick={() => reset()}>
                Try again
            </Button>
        </div>
    </div>
  )
}
