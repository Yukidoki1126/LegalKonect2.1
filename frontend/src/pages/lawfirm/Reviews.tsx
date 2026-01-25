import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Rating, LawFirm } from '@/types';
import LawFirmLayoutNew from '@/components/lawfirm/LawFirmLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, Calendar, TrendingUp, MessageSquare } from 'lucide-react';

export default function Reviews() {
    const [lawFirm, setLawFirm] = useState<LawFirm | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();

        // Auto-refresh every 20 seconds to check for new reviews
        const refreshInterval = setInterval(() => {
            loadData();
        }, 20000);

        return () => clearInterval(refreshInterval);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getLawFirmProfile();
            setLawFirm(data);
        } catch {
            console.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const averageRating = lawFirm?.ratings && lawFirm.ratings.length > 0
        ? (lawFirm.ratings.reduce((acc, r) => acc + r.rating, 0) / lawFirm.ratings.length).toFixed(1)
        : '0.0';

    const ratingDistribution = lawFirm?.ratings ? {
        5: lawFirm.ratings.filter(r => r.rating === 5).length,
        4: lawFirm.ratings.filter(r => r.rating === 4).length,
        3: lawFirm.ratings.filter(r => r.rating === 3).length,
        2: lawFirm.ratings.filter(r => r.rating === 2).length,
        1: lawFirm.ratings.filter(r => r.rating === 1).length,
    } : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
        const iconSize = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${iconSize} ${
                            star <= rating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'fill-gray-200 text-gray-200'
                        }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <LawFirmLayoutNew>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading reviews...</p>
                    </div>
                </div>
            </LawFirmLayoutNew>
        );
    }

    return (
        <LawFirmLayoutNew>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Client Reviews</h1>
                    <p className="text-muted-foreground">
                        Feedback and ratings from your clients
                    </p>
                </div>

                {/* Rating Summary */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Overall Rating */}
                    <Card className="col-span-full lg:col-span-1">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-3">
                            <div className="text-6xl font-bold">{averageRating}</div>
                            {renderStars(Math.round(Number(averageRating)), 'lg')}
                            <p className="text-sm text-muted-foreground">
                                Based on {lawFirm?.ratings?.length || 0} review{lawFirm?.ratings?.length !== 1 ? 's' : ''}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Rating Distribution */}
                    <Card className="col-span-full lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Rating Distribution</CardTitle>
                            <CardDescription>Breakdown of client ratings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                                    const total = lawFirm?.ratings?.length || 1;
                                    const percentage = (count / total) * 100;

                                    return (
                                        <div key={rating} className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 w-16">
                                                <span className="text-sm font-medium">{rating}</span>
                                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                                    <div
                                                        className="h-full bg-yellow-500 transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-sm text-muted-foreground w-12 text-right">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reviews List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Reviews</CardTitle>
                        <CardDescription>
                            Recent client feedback and testimonials
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {lawFirm?.ratings && lawFirm.ratings.length > 0 ? (
                            <div className="space-y-4">
                                {lawFirm.ratings
                                    .sort((a, b) => {
                                        const dateB = b.created_at.includes('T') ? b.created_at : b.created_at.replace(' ', 'T') + 'Z';
                                        const dateA = a.created_at.includes('T') ? a.created_at : a.created_at.replace(' ', 'T') + 'Z';
                                        return new Date(dateB).getTime() - new Date(dateA).getTime();
                                    })
                                    .map((rating) => (
                                        <div
                                            key={rating.id}
                                            className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-sm font-semibold text-primary">
                                                            {rating.client?.user?.name?.[0] || 'C'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium">
                                                            {rating.client?.user?.name || 'Anonymous'}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                                            <p className="text-sm text-muted-foreground">
                                                                {new Date(rating.created_at.includes('T') ? rating.created_at : rating.created_at.replace(' ', 'T') + 'Z').toLocaleDateString(undefined, {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {renderStars(rating.rating)}
                                                </div>
                                            </div>
                                            {rating.review && (
                                                <div className="pl-13">
                                                    <div className="p-3 rounded-lg bg-muted">
                                                        <div className="flex items-start gap-2">
                                                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                            <p className="text-sm leading-relaxed text-foreground">
                                                                {rating.review}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Star className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    No reviews received yet.
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Reviews will appear here after clients rate your services.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </LawFirmLayoutNew>
    );
}
