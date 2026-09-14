'use client';

import { GearItem } from '@/lib/types';
import { Check, Info, Backpack, CircleCheck } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@neup/components/ui/card';
import { Badge } from '@neup/components/ui/badge';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GearsSectionProps {
    gears: GearItem[];
}

const COOKIE_OPT_OUT = 'hmn_gears_opt_out'; // "Gears.no"
const COOKIE_OWNED = 'hmn_gears_owned';     // "Gears"

const getJSONCookie = (name: string): string[] => {
    if (typeof document === 'undefined') return [];
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        try {
            return JSON.parse(decodeURIComponent(parts.pop()?.split(';').shift() || '[]'));
        } catch { return []; }
    }
    return [];
};

const setJSONCookie = (name: string, value: string[]) => {
    if (typeof document === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${date.toUTCString()};path=/`;
};

export function GearsSection({ gears }: GearsSectionProps) {
    if (!gears || gears.length === 0) return null;

    // Use globalId or name as unique identifier for sync
    const getGearId = (gear: GearItem) => gear.globalId || gear.name;

    const [optOutList, setOptOutList] = useState<string[]>([]);
    const [ownedList, setOwnedList] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setOptOutList(getJSONCookie(COOKIE_OPT_OUT));
        setOwnedList(getJSONCookie(COOKIE_OWNED));
        setMounted(true);
    }, []);

    const savePreferences = (newOptOut: string[], newOwned: string[]) => {
        setOptOutList(newOptOut);
        setOwnedList(newOwned);
        setJSONCookie(COOKIE_OPT_OUT, newOptOut);
        setJSONCookie(COOKIE_OWNED, newOwned);
    };

    const handleToggle = (gear: GearItem) => {
        const id = getGearId(gear);
        const isDefaultProvided = gear.provided;

        let newOptOut = [...optOutList];
        let newOwned = [...ownedList];

        const isOptedOut = newOptOut.includes(id);
        const isOwned = newOwned.includes(id);

        // Determine current logical state
        let currentState: 'provided' | 'unchecked' | 'own' = 'unchecked';
        if (isDefaultProvided) {
            if (isOwned) currentState = 'own';
            else if (isOptedOut) currentState = 'unchecked';
            else currentState = 'provided';
        } else {
            currentState = isOwned ? 'own' : 'unchecked';
        }

        // Determine next state
        if (isDefaultProvided) {
            // Cycle: provided -> unchecked -> own -> provided
            if (currentState === 'provided') {
                // To Unchecked: Add to OptOut, Ensure not in Owned
                if (!newOptOut.includes(id)) newOptOut.push(id);
                newOwned = newOwned.filter(x => x !== id);
            } else if (currentState === 'unchecked') {
                // To Own: Ensure in OptOut (implied), Add to Owned
                if (!newOptOut.includes(id)) newOptOut.push(id);
                if (!newOwned.includes(id)) newOwned.push(id);
            } else {
                // To Provided: Remove from OptOut, Remove from Owned
                newOptOut = newOptOut.filter(x => x !== id);
                newOwned = newOwned.filter(x => x !== id);
            }
        } else {
            // Toggle: unchecked <-> own
            if (currentState === 'unchecked') {
                if (!newOwned.includes(id)) newOwned.push(id);
            } else {
                newOwned = newOwned.filter(x => x !== id);
            }
        }

        savePreferences(newOptOut, newOwned);
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold !font-headline">Gears & Equipment</h2>
                <p className="text-muted-foreground text-lg">
                    Proper gear is essential for a safe and enjoyable trek. Use the checklist below to prepare.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gears.sort((a, b) => (a.provided === b.provided ? 0 : a.provided ? 1 : -1)).map((gear) => {
                    const id = getGearId(gear);
                    const isDefaultProvided = gear.provided;

                    // Derive state
                    let currentState: 'provided' | 'unchecked' | 'own' = 'unchecked';
                    if (mounted) {
                        const isOptedOut = optOutList.includes(id);
                        const isOwned = ownedList.includes(id);

                        if (isDefaultProvided) {
                            if (isOwned) currentState = 'own';
                            else if (isOptedOut) currentState = 'unchecked';
                            else currentState = 'provided';
                        } else {
                            currentState = isOwned ? 'own' : 'unchecked';
                        }
                    } else {
                        // Server/Initial render state
                        currentState = isDefaultProvided ? 'provided' : 'unchecked';
                    }

                    const isProvidedState = currentState === 'provided';
                    const isOwnState = currentState === 'own';
                    const isUnchecked = currentState === 'unchecked';

                    return (
                        <div
                            key={gear.id}
                            onClick={() => handleToggle(gear)}
                            className={cn(
                                "group relative flex flex-col gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer select-none hover:shadow-md",
                                isProvidedState && "bg-primary/5 border-primary/20",
                                isOwnState && "bg-green-50/50 border-green-500/20",
                                isUnchecked && "bg-card border-border hover:border-primary/50"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted border">
                                    {gear.image ? (
                                        <Image src={gear.image} alt={gear.name} fill className="object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            {isProvidedState ? (
                                                <Check className="h-8 w-8 text-primary/40" />
                                            ) : (
                                                <Info className="h-8 w-8 text-muted-foreground/30" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="pt-1">
                                    <div className={cn(
                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                        isProvidedState ? "bg-primary border-primary" :
                                            isOwnState ? "bg-green-500 border-green-500" :
                                                "border-muted-foreground/30 group-hover:border-primary"
                                    )}>
                                        {(isProvidedState || isOwnState) && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1 flex-grow">
                                <h4 className={cn("font-bold text-lg leading-tight",
                                    isProvidedState ? "text-primary" : isOwnState ? "text-green-800" : "text-foreground"
                                )}>
                                    {gear.name}
                                </h4>
                                {gear.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                        {gear.description}
                                    </p>
                                )}
                            </div>

                            {/* Footer Badge */}
                            {isProvidedState ? (
                                <div className="mt-2 pt-3 border-t border-primary/10 flex items-center text-xs font-medium text-primary uppercase tracking-wide">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                        Provided by Us
                                    </Badge>
                                </div>
                            ) : isOwnState && isDefaultProvided ? (
                                <div className="mt-2 pt-3 border-t border-green-500/20 flex items-center text-xs font-medium text-green-700 uppercase tracking-wide">
                                    <span className="flex items-center gap-1">
                                        <CircleCheck className="h-3 w-3" /> Bringing my own
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
