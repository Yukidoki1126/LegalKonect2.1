import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
    className,
    variant = 'text',
    width,
    height,
    animation = 'pulse',
}: SkeletonProps) {
    const baseStyles = 'bg-muted';
    
    const variantStyles = {
        text: 'rounded-sm',
        circular: 'rounded-full',
        rectangular: 'rounded-none',
        rounded: 'rounded-lg',
    };

    const animationStyles = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer',
        none: '',
    };

    const style: React.CSSProperties = {
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
    };

    return (
        <div
            className={cn(
                baseStyles,
                variantStyles[variant],
                animationStyles[animation],
                className
            )}
            style={style}
        />
    );
}

// Card skeleton for law firm cards
export function LawFirmCardSkeleton() {
    return (
        <div className="p-4 border rounded-lg space-y-3">
            {/* Cover image */}
            <Skeleton variant="rounded" className="w-full h-32" />
            
            {/* Title */}
            <Skeleton className="h-6 w-3/4" />
            
            {/* Description */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            
            {/* Badges */}
            <div className="flex gap-2">
                <Skeleton variant="rounded" className="h-6 w-20" />
                <Skeleton variant="rounded" className="h-6 w-16" />
                <Skeleton variant="rounded" className="h-6 w-24" />
            </div>
            
            {/* Stats */}
            <div className="flex justify-between pt-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
            </div>
        </div>
    );
}

// Image skeleton
export function ImageSkeleton({ className }: { className?: string }) {
    return (
        <Skeleton 
            variant="rounded" 
            className={cn('w-full h-full', className)} 
            animation="pulse"
        />
    );
}

// Dashboard stats skeleton
export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                </div>
            ))}
        </div>
    );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4 p-3 bg-muted rounded-t-lg">
                {[...Array(columns)].map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            
            {/* Rows */}
            {[...Array(rows)].map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 p-3 border-b">
                    {[...Array(columns)].map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// Profile skeleton
export function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" className="h-24 w-24" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            
            {/* Details */}
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Skeleton;
