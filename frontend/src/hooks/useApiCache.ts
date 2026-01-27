import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface UseApiCacheOptions {
    /** Cache duration in milliseconds (default: 5 minutes) */
    cacheDuration?: number;
    /** Number of retry attempts (default: 3) */
    retryCount?: number;
    /** Initial retry delay in milliseconds (default: 1000) */
    retryDelay?: number;
    /** Enable stale-while-revalidate (default: true) */
    staleWhileRevalidate?: boolean;
    /** Callback on successful fetch */
    onSuccess?: (data: unknown) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
}

// Global cache storage
const apiCache = new Map<string, CacheEntry<unknown>>();

// Network status helper
function getNetworkStatus(): 'online' | 'offline' | 'slow' {
    if (!navigator.onLine) return 'offline';
    
    // Check for slow connection using Network Information API
    const connection = (navigator as any).connection;
    if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            return 'slow';
        }
    }
    
    return 'online';
}

export function useApiCache<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    options: UseApiCacheOptions = {}
): {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    isStale: boolean;
    networkStatus: 'online' | 'offline' | 'slow';
} {
    const {
        cacheDuration = 5 * 60 * 1000, // 5 minutes
        retryCount = 3,
        retryDelay = 1000,
        staleWhileRevalidate = true,
        onSuccess,
        onError,
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isStale, setIsStale] = useState(false);
    const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>(getNetworkStatus());
    
    const mountedRef = useRef(true);
    const fetchingRef = useRef(false);

    // Monitor network status
    useEffect(() => {
        const handleOnline = () => setNetworkStatus(getNetworkStatus());
        const handleOffline = () => setNetworkStatus('offline');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Monitor connection changes
        const connection = (navigator as any).connection;
        if (connection) {
            connection.addEventListener('change', handleOnline);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (connection) {
                connection.removeEventListener('change', handleOnline);
            }
        };
    }, []);

    const fetchWithRetry = useCallback(async (
        attempt: number = 0
    ): Promise<T> => {
        try {
            const result = await fetchFn();
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            
            // Check if we should retry
            if (attempt < retryCount && networkStatus !== 'offline') {
                // Exponential backoff with jitter
                const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 500;
                await new Promise((resolve) => setTimeout(resolve, delay));
                return fetchWithRetry(attempt + 1);
            }
            
            throw error;
        }
    }, [fetchFn, retryCount, retryDelay, networkStatus]);

    const fetchData = useCallback(async (forceRefresh: boolean = false) => {
        if (fetchingRef.current) return;
        
        const now = Date.now();
        const cached = apiCache.get(cacheKey) as CacheEntry<T> | undefined;

        // Return cached data if still valid
        if (!forceRefresh && cached && cached.expiresAt > now) {
            if (mountedRef.current) {
                setData(cached.data);
                setLoading(false);
                setError(null);
                setIsStale(false);
            }
            return;
        }

        // Use stale data while revalidating
        if (staleWhileRevalidate && cached) {
            if (mountedRef.current) {
                setData(cached.data);
                setIsStale(true);
            }
        }

        // If offline and we have cached data, use it
        if (networkStatus === 'offline' && cached) {
            if (mountedRef.current) {
                setData(cached.data);
                setLoading(false);
                setIsStale(true);
                setError(new Error('You are offline. Showing cached data.'));
            }
            return;
        }

        // Fetch new data
        fetchingRef.current = true;
        if (!cached) {
            setLoading(true);
        }

        try {
            const result = await fetchWithRetry();
            
            // Update cache
            apiCache.set(cacheKey, {
                data: result,
                timestamp: now,
                expiresAt: now + cacheDuration,
            });

            if (mountedRef.current) {
                setData(result);
                setError(null);
                setIsStale(false);
                onSuccess?.(result);
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            
            if (mountedRef.current) {
                setError(error);
                // Keep showing stale data if available
                if (!cached) {
                    setData(null);
                }
                onError?.(error);
            }
        } finally {
            fetchingRef.current = false;
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [cacheKey, fetchWithRetry, cacheDuration, staleWhileRevalidate, networkStatus, onSuccess, onError]);

    // Initial fetch
    useEffect(() => {
        mountedRef.current = true;
        fetchData();

        return () => {
            mountedRef.current = false;
        };
    }, [fetchData]);

    const refetch = useCallback(async () => {
        await fetchData(true);
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch,
        isStale,
        networkStatus,
    };
}

// Utility to clear specific cache entries
export function clearApiCache(keyPattern?: string | RegExp): void {
    if (!keyPattern) {
        apiCache.clear();
        return;
    }

    const pattern = typeof keyPattern === 'string' 
        ? new RegExp(keyPattern) 
        : keyPattern;

    for (const key of apiCache.keys()) {
        if (pattern.test(key)) {
            apiCache.delete(key);
        }
    }
}

// Utility to prefetch data
export async function prefetchApiData<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    cacheDuration: number = 5 * 60 * 1000
): Promise<void> {
    try {
        const now = Date.now();
        const result = await fetchFn();
        apiCache.set(cacheKey, {
            data: result,
            timestamp: now,
            expiresAt: now + cacheDuration,
        });
    } catch {
        // Silently fail prefetch
    }
}

export default useApiCache;
