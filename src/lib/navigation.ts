import type { NavLink } from '@/components/layout/HeaderV3Nav';
import { readBaseFile } from './base';

interface NavigationData {
    header: {
        links: NavLink[];
    };
    footer: {
        links: any[];
    };
}

export async function getNavigationData(): Promise<NavigationData> {
    try {
        return await readBaseFile<NavigationData>('custom/navigation.json');
    } catch (error) {
        console.error('Error loading navigation data:', error);
        // Return default structure if file doesn't exist
        return {
            header: { links: [] },
            footer: { links: [] }
        };
    }
}

export async function getHeaderLinks(): Promise<NavLink[]> {
    const data = await getNavigationData();
    return data.header.links;
}

export async function getFooterLinks(): Promise<any[]> {
    const data = await getNavigationData();
    return data.footer.links;
}
