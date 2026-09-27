
import { match } from 'path-to-regexp';
import redirects from '@base/core/redirects.json';

interface RedirectRule {
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

// This function will be called by the middleware.
async function getRedirectsFromApi(): Promise<RedirectRule[]> {
    return redirects as RedirectRule[];
}

function convertPatternToPathRegexp(pattern: string): string {
    return pattern.replace(/\{\{([^}]+)\}\}/g, ':$1');
}

function replaceVariables(destination: string, params: Record<string, string>): string {
    let result = destination;
    for (const [key, value] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
}

function matchPattern(pattern: string, pathname: string): Record<string, string> | null {
    try {
        const matchFn = match(pattern, { decode: decodeURIComponent });
        const result = matchFn(pathname);
        if (!result || !result.params || typeof result.params !== 'object') return null;

        const params: Record<string, string> = {};
        for (const [key, value] of Object.entries(result.params)) {
            if (typeof value === 'string') {
                params[key] = value;
            }
        }
        return params;
    } catch (error) {
        return null;
    }
}

function normalizePath(pathname: string): string {
    if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
    return pathname;
}

export async function matchRedirectEdge(rawPathname: string): Promise<MatchResult | null> {
    const pathname = normalizePath(rawPathname);
    const redirects = await getRedirectsFromApi();

    for (const redirect of redirects) {
        try {
            const source = normalizePath(redirect.from);

            if (source === pathname) {
                return { destination: redirect.to, permanent: redirect.type === 'permanent', matched: true };
            }

            const pathRegexpPattern = convertPatternToPathRegexp(source);
            const params = matchPattern(pathRegexpPattern, pathname);

            if (params) {
                const finalDestination = replaceVariables(redirect.to, params);
                return { destination: finalDestination, permanent: redirect.type === 'permanent', matched: true };
            }
        } catch (error) {
            continue;
        }
    }

    return null;
}
