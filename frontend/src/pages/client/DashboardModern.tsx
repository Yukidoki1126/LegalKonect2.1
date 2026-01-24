import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Recommendation, LawFirm } from '@/types';
import ClientLayoutNew from '@/components/client/ClientLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    MapPin,
    Phone,
    Mail,
    Star,
    Navigation,
    Calendar,
    CheckCircle,
    Award,
    TrendingUp,
    Building2,
    AlertCircle,
    ChevronDown
} from 'lucide-react';

export default function DashboardModern() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewingFirm, setViewingFirm] = useState<LawFirm | null>(null);
    const [viewingData, setViewingData] = useState<{
        average_rating: number;
        rating_count: number;
        distance_km: number | null;
    } | null>(null);
    const [bookingFirm, setBookingFirm] = useState<LawFirm | null>(null);
    const [bookingNotes, setBookingNotes] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });
    const [showScoreDetails, setShowScoreDetails] = useState(false);

    useEffect(() => {
        loadRecommendations();
    }, [user?.client?.latitude, user?.client?.longitude]);

    const handleViewFirm = async (id: number) => {
        try {
            const data = await api.viewLawFirm(id);
            setViewingFirm(data.law_firm);
            setViewingData({
                average_rating: data.average_rating,
                rating_count: data.rating_count,
                distance_km: data.distance_km
            });
        } catch {
            setError('Failed to load firm details');
        }
    };

    const loadRecommendations = async () => {
        try {
            const data = await api.getRecommendations();
            setRecommendations(data);
        } catch {
            setError('Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleGetDirections = (lat: number, lng: number) => {
        let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        if (user?.client?.latitude && user?.client?.longitude) {
            url += `&origin=${user.client.latitude},${user.client.longitude}`;
        }
        window.open(url, '_blank');
    };

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingFirm) return;

        setBookingLoading(true);
        setBookingMessage({ type: '', text: '' });

        try {
            const scheduledAt = new Date().toISOString();
            await api.bookAppointment({
                law_firm_id: bookingFirm.id,
                scheduled_at: scheduledAt,
                notes: bookingNotes,
            });
            setBookingMessage({ type: 'success', text: 'Appointment requested successfully!' });
            setTimeout(() => {
                setBookingFirm(null);
                setBookingNotes('');
                setBookingMessage({ type: '', text: '' });
            }, 3000);
        } catch {
            setBookingMessage({ type: 'error', text: 'Failed to request appointment. Please try again.' });
        } finally {
            setBookingLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'fill-gray-200 text-gray-200'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const calculateMatchScore = (rec: Recommendation) => {
        let totalScore = 0;
        
        // 1. Specialization Match (40% weight)
        let specializationScore = 0;
        if (user?.client?.specializations && user.client.specializations.length > 0) {
            const matchCount = rec.matching_specializations.length;
            const totalPreferences = user.client.specializations.length;
            specializationScore = (matchCount / totalPreferences) * 100 * 0.4;
        } else {
            // If no preferences set, give partial score based on firm having specializations
            specializationScore = rec.law_firm.specializations && rec.law_firm.specializations.length > 0 ? 20 : 0;
        }
        
        // 2. Distance Score (20% weight) - closer is better
        let distanceScore = 0;
        if (rec.distance_km !== null && rec.distance_km !== undefined) {
            // Score based on distance brackets
            if (rec.distance_km <= 5) {
                distanceScore = 20; // Within 5km = full score
            } else if (rec.distance_km <= 10) {
                distanceScore = 16; // 5-10km = 80%
            } else if (rec.distance_km <= 20) {
                distanceScore = 12; // 10-20km = 60%
            } else if (rec.distance_km <= 50) {
                distanceScore = 8; // 20-50km = 40%
            } else {
                distanceScore = 4; // >50km = 20%
            }
        } else {
            distanceScore = 10; // No distance data = 50%
        }
        
        // 3. Rating Score (25% weight)
        let ratingScore = 0;
        if (rec.average_rating > 0) {
            // Convert 5-star rating to percentage (5 stars = 100%)
            ratingScore = (rec.average_rating / 5) * 100 * 0.25;
        } else {
            ratingScore = 12.5; // No ratings = 50% of weight
        }
        
        // 4. Experience Score (15% weight) - based on number of reviews
        let experienceScore = 0;
        if (rec.rating_count > 0) {
            // Score based on review count brackets
            if (rec.rating_count >= 50) {
                experienceScore = 15; // 50+ reviews = full score
            } else if (rec.rating_count >= 20) {
                experienceScore = 12; // 20-49 reviews = 80%
            } else if (rec.rating_count >= 10) {
                experienceScore = 9; // 10-19 reviews = 60%
            } else if (rec.rating_count >= 5) {
                experienceScore = 6; // 5-9 reviews = 40%
            } else {
                experienceScore = 3; // 1-4 reviews = 20%
            }
        } else {
            experienceScore = 7.5; // No reviews = 50%
        }
        
        totalScore = specializationScore + distanceScore + ratingScore + experienceScore;
        
        // Ensure score is between 0-100
        return Math.round(Math.min(100, Math.max(0, totalScore)));
    };

    const getMatchScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    if (loading) {
        return (
            <ClientLayoutNew>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading recommendations...</p>
                    </div>
                </div>
            </ClientLayoutNew>
        );
    }

    return (
        <ClientLayoutNew>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Find Your Legal Assistance</h1>
                    <p className="text-muted-foreground">
                        Based on your location and legal needs, here are our recommended law firms
                    </p>
                    {user?.client?.specializations && user.client.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-sm text-muted-foreground">Looking for:</span>
                            {user.client.specializations.map((s) => (
                                <Badge key={s.id} variant="secondary">
                                    {s.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <Card className="border-destructive">
                        <CardContent className="flex items-center gap-3 pt-6">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Recommendations Grid */}
                {recommendations.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">
                                No law firms found matching your criteria.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {recommendations.map((rec, index) => {
                            const matchScore = calculateMatchScore(rec);
                            return (
                            <Card key={rec.law_firm.id} className="relative hover:shadow-lg transition-shadow flex flex-col h-full">
                                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                                    <Badge variant="outline" className="gap-1">
                                        <Award className="h-3 w-3" />
                                        #{index + 1}
                                    </Badge>
                                    {user?.client?.specializations && user.client.specializations.length > 0 && (
                                        <div className={`px-2 py-1 rounded-md text-xs font-semibold border ${getMatchScoreColor(matchScore)}`}>
                                            {matchScore}% Match
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start gap-3 pr-20">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Building2 className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg truncate leading-tight">
                                                {rec.law_firm.firm_name}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-2">
                                                {renderStars(Math.round(rec.average_rating))}
                                                <span className="text-sm text-muted-foreground">
                                                    {rec.average_rating.toFixed(1)} ({rec.rating_count})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1 flex flex-col">
                                    {/* Specializations - Fixed height */}
                                    <div className="min-h-[60px]">
                                        <div className="flex flex-wrap gap-1">
                                            {rec.law_firm.specializations?.slice(0, 3).map((s) => (
                                                <Badge
                                                    key={s.id}
                                                    variant={rec.matching_specializations.includes(s.name) ? 'default' : 'secondary'}
                                                    className="text-xs"
                                                >
                                                    {s.name}
                                                </Badge>
                                            ))}
                                            {rec.law_firm.specializations && rec.law_firm.specializations.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{rec.law_firm.specializations.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details - Fixed height */}
                                    <div className="space-y-4 min-h-[48px]">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <span className="text-muted-foreground">{rec.distance_km} km away</span>
                                        </div>
                                        {rec.law_firm.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <a href={`tel:${rec.law_firm.phone}`} className="text-primary hover:underline truncate">
                                                    {rec.law_firm.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions - Pushed to bottom */}
                                    <div className="flex gap-2 pt-2 mt-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleViewFirm(rec.law_firm.id)}
                                        >
                                            View Details
                                        </Button>
                                        {rec.law_firm.latitude && rec.law_firm.longitude && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleGetDirections(rec.law_firm.latitude!, rec.law_firm.longitude!)}
                                            >
                                                <Navigation className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => setBookingFirm(rec.law_firm)}
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Book
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                            );
                        })}
                    </div>
                )}

                {/* View Firm Dialog */}
                <Dialog open={!!viewingFirm} onOpenChange={() => { setViewingFirm(null); setViewingData(null); setShowScoreDetails(false); }}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
                        {viewingFirm && (
                            <>
                                {/* Scrollable Content including Cover Photo */}
                                <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
                                    {/* Cover Photo Banner */}
                                    <div className="relative h-48 overflow-hidden">
                                        {viewingFirm.profile_image_url ? (
                                            // Display uploaded cover photo
                                            <img 
                                                src={viewingFirm.profile_image_url} 
                                                alt={`${viewingFirm.firm_name} cover`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback to gradient if image fails to load
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement!.classList.add('bg-gradient-to-r', 'from-primary', 'via-primary/80', 'to-primary/60');
                                                }}
                                            />
                                        ) : (
                                            // Fallback gradient with pattern
                                            <div className="w-full h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                                                <div className="absolute inset-0 opacity-10">
                                                    <div className="absolute inset-0" style={{
                                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                                    }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content with padding */}
                                    <div className="px-6 pb-6">
                                        {/* Firm Name and Description Header */}
                                        <div className="pt-6 pb-4 border-b">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <DialogTitle className="text-2xl font-bold text-foreground mb-1">
                                                        {viewingFirm.firm_name}
                                                    </DialogTitle>
                                                    <DialogDescription className="text-base">
                                                        Comprehensive law firm profile
                                                    </DialogDescription>
                                                </div>
                                                {/* Match Score Badge */}
                                                {viewingData && (() => {
                                                    const rec = recommendations.find(r => r.law_firm.id === viewingFirm.id);
                                                    if (rec) {
                                                        const matchScore = calculateMatchScore(rec);
                                                        return (
                                                            <div className={`px-4 py-2 rounded-full text-sm font-bold border ${getMatchScoreColor(matchScore)}`}>
                                                                {matchScore}% Match
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>

                                    {viewingData && (
                                        <div className="space-y-6 pt-4">
                                            {/* Rating & Stats Cards */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <Card>
                                                    <CardContent className="pt-6">
                                                        <div className="text-center">
                                                            <div className="flex justify-center mb-2">
                                                                {renderStars(Math.round(viewingData.average_rating))}
                                                            </div>
                                                            <p className="text-2xl font-bold text-foreground">
                                                                {viewingData.average_rating.toFixed(1)}
                                                            </p>
                                                <p className="text-xs text-muted-foreground">Average Rating</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-primary">
                                                    {viewingData.rating_count}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">Client Reviews</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-primary">
                                                    {viewingData.distance_km ? `${viewingData.distance_km} km` : 'N/A'}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">Distance Away</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Match Score Breakdown */}
                                {(() => {
                                    const rec = recommendations.find(r => r.law_firm.id === viewingFirm.id);
                                    if (rec && user?.client?.specializations && user.client.specializations.length > 0) {
                                        const matchScore = calculateMatchScore(rec);
                                        const specializationMatch = rec.matching_specializations.length;
                                        const totalPreferences = user.client.specializations.length;
                                        const specializationPercent = Math.round((specializationMatch / totalPreferences) * 100);
                                        
                                        // Calculate individual component scores
                                        const specializationPoints = Math.round((specializationMatch / totalPreferences) * 40);
                                        
                                        let distancePoints = 0;
                                        if (viewingData.distance_km !== null) {
                                            if (viewingData.distance_km <= 5) distancePoints = 20;
                                            else if (viewingData.distance_km <= 10) distancePoints = 16;
                                            else if (viewingData.distance_km <= 20) distancePoints = 12;
                                            else if (viewingData.distance_km <= 50) distancePoints = 8;
                                            else distancePoints = 4;
                                        } else {
                                            distancePoints = 10;
                                        }
                                        
                                        const ratingPoints = viewingData.average_rating > 0 
                                            ? Math.round((viewingData.average_rating / 5) * 25) 
                                            : 12.5;
                                        
                                        let experiencePoints = 0;
                                        if (viewingData.rating_count >= 50) experiencePoints = 15;
                                        else if (viewingData.rating_count >= 20) experiencePoints = 12;
                                        else if (viewingData.rating_count >= 10) experiencePoints = 9;
                                        else if (viewingData.rating_count >= 5) experiencePoints = 6;
                                        else if (viewingData.rating_count > 0) experiencePoints = 3;
                                        else experiencePoints = 7.5;
                                        
                                        return (
                                            <Card className="border-primary/20 bg-primary/5">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base flex items-center justify-between">
                                                        <span className="flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4" />
                                                            Match Score Breakdown
                                                        </span>
                                                        <span className="text-2xl font-bold text-primary">{matchScore}%</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {/* Overall Score Bar */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground font-medium">Overall Match Score</span>
                                                            <span className="font-bold text-foreground">{matchScore}/100</span>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-3">
                                                            <div 
                                                                className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all" 
                                                                style={{ width: `${matchScore}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Collapsible Details Button */}
                                                    <button
                                                        onClick={() => setShowScoreDetails(!showScoreDetails)}
                                                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                                    >
                                                        <span>{showScoreDetails ? 'Hide' : 'Show'} Score Components</span>
                                                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showScoreDetails ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {/* Collapsible Score Details */}
                                                    {showScoreDetails && (
                                                        <div className="border-t pt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <p className="text-xs text-muted-foreground font-medium">Score Components:</p>
                                                            
                                                            {/* Specialization */}
                                                            <div className="space-y-1.5">
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-foreground">Specialization Match</span>
                                                                    <span className="font-semibold text-foreground">{specializationPoints}/40 pts</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1 bg-muted rounded-full h-2">
                                                                        <div 
                                                                            className="bg-blue-500 h-2 rounded-full transition-all" 
                                                                            style={{ width: `${(specializationPoints / 40) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground w-16 text-right">{specializationMatch}/{totalPreferences} match</span>
                                                                </div>
                                                            </div>

                                                            {/* Distance */}
                                                            <div className="space-y-1.5">
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-foreground">Distance</span>
                                                                    <span className="font-semibold text-foreground">{distancePoints}/20 pts</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1 bg-muted rounded-full h-2">
                                                                        <div 
                                                                            className="bg-green-500 h-2 rounded-full transition-all" 
                                                                            style={{ width: `${(distancePoints / 20) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground w-16 text-right">{viewingData.distance_km ? `${viewingData.distance_km}km` : 'N/A'}</span>
                                                                </div>
                                                            </div>

                                                            {/* Rating */}
                                                            <div className="space-y-1.5">
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-foreground">Rating</span>
                                                                    <span className="font-semibold text-foreground">{Math.round(ratingPoints)}/25 pts</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1 bg-muted rounded-full h-2">
                                                                        <div 
                                                                            className="bg-yellow-500 h-2 rounded-full transition-all" 
                                                                            style={{ width: `${(ratingPoints / 25) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground w-16 text-right">{viewingData.average_rating.toFixed(1)}⭐</span>
                                                                </div>
                                                            </div>

                                                            {/* Experience */}
                                                            <div className="space-y-1.5">
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-foreground">Experience</span>
                                                                    <span className="font-semibold text-foreground">{Math.round(experiencePoints)}/15 pts</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1 bg-muted rounded-full h-2">
                                                                        <div 
                                                                            className="bg-purple-500 h-2 rounded-full transition-all" 
                                                                            style={{ width: `${(experiencePoints / 15) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground w-16 text-right">{viewingData.rating_count} reviews</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* Specializations */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold text-foreground">Legal Specializations</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingFirm.specializations?.map((s) => {
                                            const rec = recommendations.find(r => r.law_firm.id === viewingFirm.id);
                                            const isMatching = rec?.matching_specializations.includes(s.name);
                                            return (
                                                <Badge 
                                                    key={s.id} 
                                                    variant={isMatching ? 'default' : 'secondary'}
                                                    className="text-sm py-1"
                                                >
                                                    {isMatching && <CheckCircle className="h-3 w-3 mr-1" />}
                                                    {s.name}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Description */}
                                {viewingFirm.description && (
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-foreground">About This Firm</Label>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                                    {viewingFirm.description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Experience and Lawyers */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Experience */}
                                    {(viewingFirm as any).experience_range && (
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold text-foreground">Years of Experience</Label>
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Award className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <p className="text-lg font-semibold text-foreground">
                                                            {(viewingFirm as any).experience_range}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Lawyers */}
                                    {(viewingFirm as any).lawyers && (viewingFirm as any).lawyers.length > 0 && (
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold text-foreground">Lawyers at Firm</Label>
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <Building2 className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            {(viewingFirm as any).lawyers.map((lawyer: string, index: number) => (
                                                                <p key={index} className="text-sm text-foreground">
                                                                    • {lawyer}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </div>

                                {/* Gallery Photos */}
                                {(viewingFirm as any).gallery_images_urls && (viewingFirm as any).gallery_images_urls.length > 0 && (
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-foreground">Office Gallery</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {(viewingFirm as any).gallery_images_urls.map((imageUrl: string, index: number) => (
                                                <div key={index} className="aspect-square rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={`${viewingFirm.firm_name} photo ${index + 1}`}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Contact Information */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold text-foreground">Contact Information</Label>
                                    <Card>
                                        <CardContent className="pt-6 space-y-3">
                                            {/* Contact Person Section */}
                                            {((viewingFirm as any).contact_person_name || (viewingFirm as any).contact_person_phone || (viewingFirm as any).contact_person_email) && (
                                                <div className="pb-3 border-b">
                                                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Contact Person</p>
                                                    
                                                    {(viewingFirm as any).contact_person_name && (
                                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-2">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <Building2 className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-muted-foreground">Name</p>
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {(viewingFirm as any).contact_person_name}
                                                                    {(viewingFirm as any).contact_person_role && (
                                                                        <span className="text-xs text-muted-foreground ml-2">
                                                                            ({(viewingFirm as any).contact_person_role})
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(viewingFirm as any).contact_person_phone && (
                                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-2">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <Phone className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-muted-foreground">Contact Phone</p>
                                                                <a href={`tel:${(viewingFirm as any).contact_person_phone}`} className="text-sm font-medium text-primary hover:underline">
                                                                    {(viewingFirm as any).contact_person_phone}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(viewingFirm as any).contact_person_email && (
                                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <Mail className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-muted-foreground">Contact Email</p>
                                                                <a href={`mailto:${(viewingFirm as any).contact_person_email}`} className="text-sm font-medium text-primary hover:underline">
                                                                    {(viewingFirm as any).contact_person_email}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Firm Contact Section */}
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Firm Contact</p>
                                                {viewingFirm.phone && (
                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-2">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Phone className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-muted-foreground">Firm Phone</p>
                                                            <a href={`tel:${viewingFirm.phone}`} className="text-sm font-medium text-primary hover:underline">
                                                                {viewingFirm.phone}
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-2">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Mail className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-muted-foreground">Firm Email</p>
                                                        <a href={`mailto:${viewingFirm.user?.email}`} className="text-sm font-medium text-primary hover:underline">
                                                            {viewingFirm.user?.email}
                                                        </a>
                                                    </div>
                                                </div>
                                                {viewingData.distance_km && (
                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <MapPin className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-muted-foreground">Distance</p>
                                                            <p className="text-sm font-medium text-foreground">{viewingData.distance_km} km from your location</p>
                                                        </div>
                                                        {viewingFirm.latitude && viewingFirm.longitude && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleGetDirections(viewingFirm.latitude!, viewingFirm.longitude!)}
                                                            >
                                                                <Navigation className="h-4 w-4 mr-1" />
                                                                Directions
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                        </div>
                                    )}
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex gap-2 justify-end px-6 py-4 border-t bg-muted/30">
                                    <Button variant="outline" className="text-foreground" onClick={() => { setViewingFirm(null); setViewingData(null); setShowScoreDetails(false); }}>
                                        Close
                                    </Button>
                                    <Button onClick={() => { setBookingFirm(viewingFirm); setViewingFirm(null); setShowScoreDetails(false); }} className="gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Book Appointment
                                    </Button>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Booking Dialog */}
                <Dialog open={!!bookingFirm} onOpenChange={() => { setBookingFirm(null); setBookingNotes(''); setBookingMessage({ type: '', text: '' }); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground">
                                <Calendar className="h-5 w-5" />
                                Request Appointment
                            </DialogTitle>
                            <DialogDescription>
                                Book a consultation with {bookingFirm?.firm_name}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleBookAppointment} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="booking-notes">Describe your legal needs (Optional)</Label>
                                <Textarea
                                    id="booking-notes"
                                    value={bookingNotes}
                                    onChange={(e) => setBookingNotes(e.target.value)}
                                    placeholder="Tell the law firm about your legal matter..."
                                    rows={4}
                                />
                            </div>

                            {bookingMessage.text && (
                                <div className={`p-3 rounded-lg border ${
                                    bookingMessage.type === 'success'
                                        ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
                                        : 'bg-destructive/10 border-destructive/20 text-destructive'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        {bookingMessage.type === 'success' ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4" />
                                        )}
                                        <p className="text-sm">{bookingMessage.text}</p>
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => { setBookingFirm(null); setBookingNotes(''); setBookingMessage({ type: '', text: '' }); }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={bookingLoading}>
                                    {bookingLoading ? 'Requesting...' : 'Request Appointment'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </ClientLayoutNew>
    );
}
