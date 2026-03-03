import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff, RefreshCw, Loader2 } from 'lucide-react';

interface OptimizedImageProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
    fallbackClassName?: string;
    placeholderClassName?: string;
    fallback?: React.ReactNode;
    onLoad?: () => void;
    onError?: () => void;
    retryCount?: number;
    retryDelay?: number;
    lazy?: boolean;
    showRetryButton?: boolean;
    priority?: boolean;
}

// Simple in-memory cache for image load states
const imageCache = new Map<string, 'loading' | 'loaded' | 'error'>();

export function OptimizedImage({
    src,
    alt,
    className,
    fallbackClassName,
    placeholderClassName,
    fallback,
    onLoad,
    onError,
    retryCount = 3,
    retryDelay = 1000,
    lazy = true,
    showRetryButton = true,
    priority = false,
}: OptimizedImageProps) {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [retries, setRetries] = useState(0);
    const [showPlaceholder, setShowPlaceholder] = useState(true);
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [isInView, setIsInView] = useState(priority || !lazy);

    // Check cache on mount
    useEffect(() => {
        if (src && imageCache.get(src) === 'loaded') {
            setStatus('loaded');
            setShowPlaceholder(false);
        }
    }, [src]);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!lazy || priority || !imgRef.current) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observerRef.current?.disconnect();
                    }
                });
            },
            {
                rootMargin: '100px', // Start loading 100px before element is in view
                threshold: 0.01,
            }
        );

        observerRef.current.observe(imgRef.current);

        return () => {
            observerRef.current?.disconnect();
        };
    }, [lazy, priority]);

    const handleLoad = useCallback(() => {
        if (src) {
            imageCache.set(src, 'loaded');
        }
        setStatus('loaded');
        setShowPlaceholder(false);
        onLoad?.();
    }, [src, onLoad]);

    const handleError = useCallback(() => {
        if (retries < retryCount) {
            // Auto-retry with exponential backoff
            setTimeout(() => {
                setRetries((prev) => prev + 1);
                setStatus('loading');
            }, retryDelay * Math.pow(2, retries));
        } else {
            if (src) {
                imageCache.set(src, 'error');
            }
            setStatus('error');
            onError?.();
        }
    }, [retries, retryCount, retryDelay, src, onError]);

    const handleRetry = useCallback(() => {
        setRetries(0);
        setStatus('loading');
        if (src) {
            imageCache.delete(src);
        }
    }, [src]);

    // If no src provided
    if (!src) {
        if (fallback) {
            return <>{fallback}</>;
        }
        return (
            <div className={cn(
                'flex items-center justify-center bg-muted',
                fallbackClassName || className
            )}>
                <ImageOff className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
        );
    }

    // Generate cache-busted URL for retries
    const imageUrl = retries > 0 
        ? `${src}${src.includes('?') ? '&' : '?'}retry=${retries}&t=${Date.now()}`
        : src;

    return (
        <div className={cn('relative overflow-hidden', className)} ref={imgRef as any}>
            {/* Placeholder/Loading state */}
            {showPlaceholder && status !== 'error' && (
                <div className={cn(
                    'absolute inset-0 flex items-center justify-center bg-muted animate-pulse',
                    placeholderClassName
                )}>
                    <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                </div>
            )}

            {/* Actual Image */}
            {isInView && status !== 'error' && (
                <img
                    src={imageUrl}
                    alt={alt}
                    className={cn(
                        'w-full h-full object-cover transition-opacity duration-300',
                        showPlaceholder ? 'opacity-0' : 'opacity-100'
                    )}
                    loading={lazy && !priority ? 'lazy' : 'eager'}
                    decoding="async"
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}

            {/* Error state */}
            {status === 'error' && (
                <div className={cn(
                    'absolute inset-0 flex flex-col items-center justify-center bg-muted gap-2',
                    fallbackClassName
                )}>
                    {fallback || (
                        <>
                            <ImageOff className="h-8 w-8 text-muted-foreground opacity-50" />
                            {showRetryButton && (
                                <button
                                    onClick={handleRetry}
                                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Retry
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// Preload critical images
export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (imageCache.get(src) === 'loaded') {
            resolve();
            return;
        }

        const img = new Image();
        img.onload = () => {
            imageCache.set(src, 'loaded');
            resolve();
        };
        img.onerror = () => {
            imageCache.set(src, 'error');
            reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
    });
}

// Preload multiple images with concurrency limit
export async function preloadImages(
    urls: string[],
    concurrency: number = 3
): Promise<void> {
    const queue = [...urls];
    const executing: Promise<void>[] = [];

    while (queue.length > 0 || executing.length > 0) {
        while (executing.length < concurrency && queue.length > 0) {
            const url = queue.shift()!;
            const promise = preloadImage(url)
                .catch(() => {}) // Ignore individual failures
                .finally(() => {
                    executing.splice(executing.indexOf(promise), 1);
                });
            executing.push(promise);
        }

        if (executing.length > 0) {
            await Promise.race(executing);
        }
    }
}

export default OptimizedImage;
