import { Link } from "@neup/components/ui/link"; // Not strictly used here but kept imports similar? No, remove unused.
import Image, { ImageProps } from 'next/image';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { resolveUrlTemplates } from '@/lib/url-utils';

interface SmartImageProps extends Omit<ImageProps, 'src'> {
    src: string;
}

const OPTIMIZABLE_DOMAINS = [
    'placehold.co',
    'images.unsplash.com',
    'picsum.photos',
    'example.com',
    'neupgroup.com',
    'cdn.neupgroup.com',
    'neupcdn.com',
    'happymountainnepal.com',
    'localhost'
];

/**
 * SmartImage component that handles URL templates like {{neupcdn}} and {{local}}
 * and automatically sets unoptimized={true} for external domains not in next.config
 */
export function SmartImage({ src, ...props }: SmartImageProps) {
    const { profile } = useSiteProfile();
    const imageSrc = resolveUrlTemplates(src, profile?.basePath);

    let isOptimizable = true;
    try {
        if (imageSrc.startsWith('http')) {
            const url = new URL(imageSrc);
            isOptimizable = OPTIMIZABLE_DOMAINS.includes(url.hostname);
        } else if (imageSrc.startsWith('/')) {
            isOptimizable = true; // Local images are optimizable
        }
    } catch (e) {
        // If URL parsing fails, assume optimizable (let Next.js handle error) or unoptimizable?
        // Safest to let Next.js try or fail, but let's assume valid relative path if simple string
        isOptimizable = true;
    }

    return <Image src={imageSrc} unoptimized={!isOptimizable} {...props} />;
}
