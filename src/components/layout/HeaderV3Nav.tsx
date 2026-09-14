
'use client';

import * as React from 'react';
import { Link } from "@neup/components/ui/link";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react'; // Import LucideIcon type

export interface NavLink {
  title: string;
  href?: string;
  description?: string;
  children?: NavLink[];
  icon?: LucideIcon; // Add icon property
  target?: string; // Add target property
}

interface HeaderV3NavProps {
  links: NavLink[];
  onLinkHover: (link: NavLink) => void;
}

export const HeaderV3Nav = ({ links, onLinkHover }: HeaderV3NavProps) => {
    const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

    return (
        <div className="relative">
            <nav className="flex items-center">
                {links.map(link => (
                    <div
                        key={link.title}
                        className="relative"
                        onMouseEnter={() => {
                            setHoveredItem(link.title);
                            onLinkHover(link);
                        }}
                    >
                        <Link
                            href={link.href || '#'}
                            className={cn(
                                "relative px-3 py-2 text-sm font-medium transition-colors duration-300",
                                "text-foreground/70 hover:text-foreground"
                            )}
                        >
                            {link.title}
                            {hoveredItem === link.title && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                    layoutId="underline"
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                />
                            )}
                        </Link>
                    </div>
                ))}
            </nav>
        </div>
    );
};
