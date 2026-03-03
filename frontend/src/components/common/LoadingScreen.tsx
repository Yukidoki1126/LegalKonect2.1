import React, { useState, useEffect } from 'react';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
    message?: string;
    timeout?: number;
}

export function LoadingScreen({ message = 'Loading...', timeout = 8000 }: LoadingScreenProps) {
    const [showTimeout, setShowTimeout] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        // Show timeout message after specified time
        const timer = setTimeout(() => {
            setShowTimeout(true);
        }, timeout);

        // Monitor online/offline status
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [timeout]);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center space-y-6 p-8 max-w-md">
                {/* Loading spinner or offline icon */}
                {isOffline ? (
                    <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <WifiOff className="h-8 w-8 text-destructive" />
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    </div>
                )}

                {/* Message */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-foreground">
                        {isOffline ? 'You\'re Offline' : message}
                    </h2>
                    
                    {isOffline ? (
                        <p className="text-muted-foreground">
                            Please check your internet connection and try again.
                        </p>
                    ) : showTimeout ? (
                        <p className="text-muted-foreground">
                            This is taking longer than expected. Your connection might be slow.
                        </p>
                    ) : (
                        <p className="text-muted-foreground">
                            Please wait while we load your content...
                        </p>
                    )}
                </div>

                {/* Action buttons */}
                {(showTimeout || isOffline) && (
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleRefresh}
                            className={cn(
                                "inline-flex items-center justify-center gap-2 px-6 py-3",
                                "bg-primary text-primary-foreground rounded-lg font-medium",
                                "hover:bg-primary/90 transition-colors",
                                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            )}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh Page
                        </button>

                        {!isOffline && (
                            <button
                                onClick={() => window.location.href = '/login'}
                                className={cn(
                                    "inline-flex items-center justify-center gap-2 px-6 py-3",
                                    "bg-secondary text-secondary-foreground rounded-lg font-medium",
                                    "hover:bg-secondary/80 transition-colors",
                                    "focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                                )}
                            >
                                Go to Login
                            </button>
                        )}
                    </div>
                )}

                {/* Connection tips */}
                {showTimeout && !isOffline && (
                    <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                        <p className="font-medium">Connection Tips:</p>
                        <ul className="text-left list-disc list-inside space-y-1">
                            <li>Check if you have a stable internet connection</li>
                            <li>Try moving to a location with better signal</li>
                            <li>Restart your router if possible</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoadingScreen;
