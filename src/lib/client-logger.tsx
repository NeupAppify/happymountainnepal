'use client';

import { useEffect } from 'react';
import { classifyUserAgent } from '@/lib/log-classification';
import { usePathname } from 'next/navigation';

type PageViewLogResponse = {
    success: boolean;
    logId?: string;
};

// Log a page view
export async function logPageView(pathname: string): Promise<string | null> {
    try {
        const userAgent = navigator.userAgent;
        const response = await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // The cookieId will be extracted from headers on the server-side via the middleware
                pageAccessed: pathname,
                resourceType: 'page',
                method: 'GET',
                statusCode: 200,
                referrer: document.referrer || undefined,
                userAgent,
                isBot: classifyUserAgent(userAgent).isBot,
                metadata: {
                    source: 'client-navigation',
                    screenWidth: window.innerWidth,
                    screenHeight: window.innerHeight,
                },
            }),
        });

        if (!response.ok) {
            return null;
        }

        const payload = await response.json() as PageViewLogResponse;
        return payload.logId || null;
    } catch (error) {
        console.error('Failed to log page view:', error);
        return null;
    }
}

// Component to track page views on client-side navigation
export function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        void logPageView(pathname);
    }, [pathname]);

    return null;
}
