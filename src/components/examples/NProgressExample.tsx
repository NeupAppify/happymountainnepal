'use client';

import { useState } from 'react';
import { useNProgress } from '@/hooks/useNProgress';
import { Button } from '@neup/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neup/components/ui/card';

/**
 * Example component demonstrating nprogress usage
 * This can be used as a reference or removed if not needed
 */
export function NProgressExample() {
    const { start, done, set, inc } = useNProgress();
    const [isLoading, setIsLoading] = useState(false);

    // Example 1: Simple async operation
    const handleSimpleAsync = async () => {
        start();
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Operation completed');
        } finally {
            done();
            setIsLoading(false);
        }
    };

    // Example 2: Multi-step operation with progress updates
    const handleMultiStep = async () => {
        start();
        setIsLoading(true);
        try {
            // Step 1
            await new Promise(resolve => setTimeout(resolve, 1000));
            set(0.33);

            // Step 2
            await new Promise(resolve => setTimeout(resolve, 1000));
            set(0.66);

            // Step 3
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('All steps completed');
        } finally {
            done();
            setIsLoading(false);
        }
    };

    // Example 3: Incremental progress
    const handleIncremental = async () => {
        start();
        setIsLoading(true);
        try {
            for (let i = 0; i < 5; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                inc(0.2); // Increment by 20% each time
            }
            console.log('Incremental operation completed');
        } finally {
            done();
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>NProgress Examples</CardTitle>
                <CardDescription>
                    Click the buttons below to see nprogress in action
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h3 className="font-semibold">Example 1: Simple Async Operation</h3>
                    <p className="text-sm text-muted-foreground">
                        Shows progress bar for a 2-second operation
                    </p>
                    <Button
                        onClick={handleSimpleAsync}
                        disabled={isLoading}
                        className="w-full"
                    >
                        Run Simple Async
                    </Button>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold">Example 2: Multi-Step Operation</h3>
                    <p className="text-sm text-muted-foreground">
                        Updates progress bar at 33%, 66%, and 100%
                    </p>
                    <Button
                        onClick={handleMultiStep}
                        disabled={isLoading}
                        variant="secondary"
                        className="w-full"
                    >
                        Run Multi-Step
                    </Button>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold">Example 3: Incremental Progress</h3>
                    <p className="text-sm text-muted-foreground">
                        Increments progress by 20% five times
                    </p>
                    <Button
                        onClick={handleIncremental}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full"
                    >
                        Run Incremental
                    </Button>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                        <strong>Note:</strong> For navigation, nprogress works automatically -
                        just click any link in the app to see it in action!
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
