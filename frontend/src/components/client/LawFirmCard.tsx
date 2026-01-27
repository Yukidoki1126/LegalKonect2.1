import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { 
    Building2, 
    MapPin, 
    Phone, 
    Star, 
    Navigation, 
    Calendar,
    Award,
    CheckCircle,
    Sparkles,
    Clock,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LawFirm, Recommendation } from '@/types';

interface LawFirmCardProps {
    recommendation: Recommendation;
    rank: number;
    matchScore: number;
    onViewDetails: (id: number) => void;
    onGetDirections: (lat: number, lng: number) => void;
    onBook: (firm: LawFirm) => void;
    showMatchScore?: boolean;
}

export function LawFirmCard({
    recommendation,
    rank,
    matchScore,
    onViewDetails,
    onGetDirections,
    onBook,
    showMatchScore = true,
}: LawFirmCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const firm = recommendation.law_firm;

    const getMatchScoreColor = (score: number) => {
        if (score >= 80) return { bg: 'from-cyan-500 to-teal-500', text: 'text-cyan-700', light: 'bg-cyan-50' };
        if (score >= 60) return { bg: 'from-blue-500 to-indigo-500', text: 'text-blue-700', light: 'bg-blue-50' };
        if (score >= 40) return { bg: 'from-amber-500 to-orange-500', text: 'text-amber-700', light: 'bg-amber-50' };
        return { bg: 'from-slate-400 to-slate-500', text: 'text-slate-700', light: 'bg-slate-50' };
    };

    const scoreColors = getMatchScoreColor(matchScore);

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={cn(
                            "h-3.5 w-3.5 transition-all duration-300",
                            star <= rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600'
                        )}
                    />
                ))}
            </div>
        );
    };

    const isTopRated = recommendation.average_rating >= 4.5 && recommendation.rating_count >= 3;
    const isVerified = true; // Assuming all firms are verified

    return (
        <Card 
            className={cn(
                "group relative overflow-hidden transition-all duration-500 flex flex-col h-full",
                "border-2 hover:border-blue-400/50",
                "hover:shadow-2xl hover:shadow-blue-500/10",
                "dark:hover:shadow-blue-500/5",
                isHovered && "scale-[1.02]"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Gradient Overlay on Hover */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            )} />

            {/* Top Badges Row */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                {/* Left badges */}
                <div className="flex flex-col gap-1.5">
                    {rank <= 3 && (
                        <Badge 
                            className={cn(
                                "gap-1 font-bold shadow-lg",
                                rank === 1 && "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0",
                                rank === 2 && "bg-gradient-to-r from-slate-400 to-slate-500 text-white border-0",
                                rank === 3 && "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-0"
                            )}
                        >
                            <Award className="h-3 w-3" />
                            #{rank} {rank === 1 && 'Top Pick'}
                        </Badge>
                    )}
                    {isTopRated && (
                        <Badge className="gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                            <Sparkles className="h-3 w-3" />
                            Top Rated
                        </Badge>
                    )}
                </div>

                {/* Match Score - Animated Circle */}
                {showMatchScore && (
                    <div className={cn(
                        "relative w-14 h-14 rounded-full shadow-lg",
                        "transform transition-transform duration-500",
                        isHovered && "scale-110"
                    )}>
                        {/* Background Circle */}
                        <svg className="w-14 h-14 -rotate-90">
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="white"
                                className="text-slate-200 dark:text-slate-700"
                            />
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke="url(#scoreGradient)"
                                strokeWidth="4"
                                fill="transparent"
                                strokeLinecap="round"
                                strokeDasharray={`${(matchScore / 100) * 150.8} 150.8`}
                                className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" className={cn(
                                        matchScore >= 80 ? "stop-color: #06b6d4" :
                                        matchScore >= 60 ? "stop-color: #3b82f6" :
                                        matchScore >= 40 ? "stop-color: #f59e0b" :
                                        "stop-color: #64748b"
                                    )} style={{ stopColor: matchScore >= 80 ? '#06b6d4' : matchScore >= 60 ? '#3b82f6' : matchScore >= 40 ? '#f59e0b' : '#64748b' }} />
                                    <stop offset="100%" className={cn(
                                        matchScore >= 80 ? "stop-color: #14b8a6" :
                                        matchScore >= 60 ? "stop-color: #6366f1" :
                                        matchScore >= 40 ? "stop-color: #f97316" :
                                        "stop-color: #94a3b8"
                                    )} style={{ stopColor: matchScore >= 80 ? '#14b8a6' : matchScore >= 60 ? '#6366f1' : matchScore >= 40 ? '#f97316' : '#94a3b8' }} />
                                </linearGradient>
                            </defs>
                        </svg>
                        {/* Score Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={cn("text-sm font-bold", scoreColors.text)}>{matchScore}%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Card Content */}
            <CardHeader className="pt-20 pb-3">
                <div className="flex items-start gap-3">
                    {/* Firm Avatar */}
                    <div className={cn(
                        "relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0",
                        "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30",
                        "ring-2 ring-white dark:ring-slate-800 shadow-lg",
                        "group-hover:ring-blue-400/50 transition-all duration-300"
                    )}>
                        {firm.profile_image_url ? (
                            <OptimizedImage
                                src={firm.profile_image_url}
                                alt={firm.firm_name}
                                className="w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                            </div>
                        )}
                        {/* Verified Badge */}
                        {isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 shadow-md">
                                <CheckCircle className="h-3.5 w-3.5 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Firm Info */}
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold truncate leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {firm.firm_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1.5">
                            {renderStars(Math.round(recommendation.average_rating))}
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {recommendation.average_rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-400">
                                ({recommendation.rating_count} {recommendation.rating_count === 1 ? 'review' : 'reviews'})
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 flex-1 flex flex-col pt-0">
                {/* Specializations */}
                <div className="min-h-[52px]">
                    <div className="flex flex-wrap gap-1.5">
                        {firm.specializations?.slice(0, 3).map((s) => (
                            <Badge
                                key={s.id}
                                variant={recommendation.matching_specializations.includes(s.name) ? 'default' : 'secondary'}
                                className={cn(
                                    "text-xs font-medium transition-all duration-300",
                                    recommendation.matching_specializations.includes(s.name) 
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 hover:shadow-md" 
                                        : "hover:bg-slate-200 dark:hover:bg-slate-700"
                                )}
                            >
                                {recommendation.matching_specializations.includes(s.name) && (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                {s.name}
                            </Badge>
                        ))}
                        {firm.specializations && firm.specializations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{firm.specializations.length - 3} more
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm group/item">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/30 transition-colors">
                            <MapPin className="h-3.5 w-3.5 text-slate-500 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-900 dark:text-white">{recommendation.distance_km}</span> km away
                        </span>
                    </div>
                    {firm.phone && (
                        <div className="flex items-center gap-2 text-sm group/item">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/30 transition-colors">
                                <Phone className="h-3.5 w-3.5 text-slate-500 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors" />
                            </div>
                            <a 
                                href={`tel:${firm.phone}`} 
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium truncate"
                            >
                                {firm.phone}
                            </a>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 mt-auto border-t border-slate-100 dark:border-slate-800">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 group/btn hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => onViewDetails(firm.id)}
                    >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                    {firm.latitude && firm.longitude && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => onGetDirections(firm.latitude!, firm.longitude!)}
                        >
                            <Navigation className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className={cn(
                            "flex-1 bg-gradient-to-r from-blue-600 to-cyan-500",
                            "hover:from-blue-500 hover:to-cyan-400",
                            "shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30",
                            "transition-all duration-300 text-white"
                        )}
                        onClick={() => onBook(firm)}
                    >
                        <Calendar className="mr-1.5 h-4 w-4" />
                        Book Now
                    </Button>
                </div>
            </CardContent>

            {/* Bottom Glow Effect on Hover */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400",
                "transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
            )} />
        </Card>
    );
}

export default LawFirmCard;
