
// src/lib/redirect-matcher.ts - This file is for Node.js runtime only.
import { match } from 'path-to-regexp';
import redirects from '@base/core/redirects.json';

// Note: RedirectRule now uses 'from' and 'to' to match the API response
export interface RedirectRule {
    id: string;
    from: string;
    to: string;
    type: 'permanent' | 'temporary';
    created_on: string;
}

export interface MatchResult {
    destination: string;
    permanent: boolean;
    matched: boolean;
}

async function fetchRedirects(): Promise<RedirectRule[]> {
    return redirects as RedirectRule[];
}


/**
 * Convert /name/{{name}} -> /name/:name for path-to-regexp
 */
function convertPatternToPathRegexp(pattern: string): string {
    return pattern.replace(/\{\{([^}]+)\}\}/g, ':$1');
}

/**
 * Replace {{variable}} in destination with actual values
 */
function replaceVariables(destination: string, params: Record<string, string>): string {
    let result = destination;
    for (const [key, value] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
}

/**
 * Match a pathname with a pattern using path-to-regexp v8
 */
function matchPattern(pattern: string, pathname: string): Record<string, string> | null {
    try {
        const matchFn = match(pattern, { decode: decodeURIComponent });
        const result = matchFn(pathname);

        if (!result) return null;

        const params: Record<string, string> = {};
        if (result.params && typeof result.params === 'object') {
            for (const [key, value] of Object.entries(result.params)) {
                if (typeof value === 'string') {
                    params[key] = value;
                }
            }
        }
        return params;
    } catch (error) {
        console.error(`Error matching pattern ${pattern}:`, error);
        return null;
    }
}

/**
 * Normalize trailing slash (except root)
 */
function normalizePath(pathname: string): string {
    if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
    return pathname;
}

/**
 * Match a pathname against the redirect rules by fetching from the API.
 * This is for server-side (Node.js) environments only.
 * @param rawPathname - The pathname to match
 */
export async function matchRedirect(rawPathname: string): Promise<MatchResult | null> {
    const pathname = normalizePath(rawPathname);
    const redirects = await fetchRedirects();

    if (!redirects) return null;

    for (const redirect of redirects) {
        try {
            const source = normalizePath(redirect.from);

            // Exact match first
            if (source === pathname) {
                return { destination: redirect.to, permanent: redirect.type === 'permanent', matched: true };
            }

            // Pattern match with variables
            const pathRegexpPattern = convertPatternToPathRegexp(source);
            const params = matchPattern(pathRegexpPattern, pathname);

            if (params) {
                const finalDestination = replaceVariables(redirect.to, params);
                return { destination: finalDestination, permanent: redirect.type === 'permanent', matched: true };
            }
        } catch (error) {
            console.error(`Invalid redirect pattern: ${redirect.from}`, error);
            continue;
        }
    }

    return null;
}
