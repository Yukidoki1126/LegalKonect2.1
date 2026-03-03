import React from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetworkStatusProps {
    status: 'online' | 'offline' | 'slow';
    className?: string;
    showLabel?: boolean;
}

export function NetworkStatus({ status, className, showLabel = true }: NetworkStatusProps) {
    if (status === 'online') {
        return null; // Don't show anything when online
    }

    return (
        <div
            className={cn(
                'fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300',
                status === 'offline' 
                    ? 'bg-destructive text-destructive-foreground' 
                    : 'bg-yellow-500 text-white',
                className
            )}
        >
            {status === 'offline' ? (
                <>
                    <WifiOff className="h-4 w-4" />
                    {showLabel && <span>You're offline</span>}
                </>
            ) : (
                <>
                    <Signal className="h-4 w-4" />
                    {showLabel && <span>Slow connection</span>}
                </>
            )}
        </div>
    );
}

// Hook for network status
export function useNetworkStatus(): 'online' | 'offline' | 'slow' {
    const [status, setStatus] = React.useState<'online' | 'offline' | 'slow'>(() => {
        if (typeof window === 'undefined') return 'online';
        if (!navigator.onLine) return 'offline';
        
        const connection = (navigator as any).connection;
        if (connection) {
            const effectiveType = connection.effectiveType;
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                return 'slow';
            }
        }
        
        return 'online';
    });

    React.useEffect(() => {
        const updateStatus = () => {
            if (!navigator.onLine) {
                setStatus('offline');
                return;
            }
            
            const connection = (navigator as any).connection;
            if (connection) {
                const effectiveType = connection.effectiveType;
                if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                    setStatus('slow');
                    return;
                }
            }
            
            setStatus('online');
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        const connection = (navigator as any).connection;
        if (connection) {
            connection.addEventListener('change', updateStatus);
        }

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
            if (connection) {
                connection.removeEventListener('change', updateStatus);
            }
        };
    }, []);

    return status;
}

export default NetworkStatus;
