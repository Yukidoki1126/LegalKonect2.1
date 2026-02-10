import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Recommendation, LawFirm } from '@/types';
import ClientLayoutNew from '@/components/client/ClientLayoutNew';
import { LawFirmCard } from '@/components/client/LawFirmCard';
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
    ChevronDown,
    Scale,
    Sparkles
} from 'lucide-react';
import { OptimizedImage } from '@/components/common/OptimizedImage';

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

        // Auto-refresh every 60 seconds
        const refreshInterval = setInterval(() => {
            loadRecommendations();
        }, 60000);

        return () => clearInterval(refreshInterval);
    }, [user?.client?.latitude, user?.client?.longitude, user?.client?.specializations]);

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
            
            // Filter to only show law firms that have at least one matching specialization
            // when the client has specialization preferences set
            let filteredData = data;
            if (user?.client?.specializations && user.client.specializations.length > 0) {
                filteredData = data.filter((rec: Recommendation) => 
                    rec.matching_specializations && rec.matching_specializations.length > 0
                );
                
                // Apply 60% match score threshold - only show firms with 60% or higher match
                const MATCH_SCORE_THRESHOLD = 60;
                filteredData = filteredData.filter((rec: Recommendation) => {
                    // Calculate match score inline for filtering
                    let totalScore = 0;
                    
                    // 1. Specialization Match (40% weight)
                    const matchCount = rec.matching_specializations.length;
                    const totalPreferences = user.client!.specializations!.length;
                    const specializationScore = (matchCount / totalPreferences) * 100 * 0.4;
                    
                    // 2. Distance Score (20% weight)
                    let distanceScore = 0;
                    if (rec.distance_km !== null && rec.distance_km !== undefined) {
                        if (rec.distance_km <= 5) distanceScore = 20;
                        else if (rec.distance_km <= 10) distanceScore = 16;
                        else if (rec.distance_km <= 20) distanceScore = 12;
                        else if (rec.distance_km <= 50) distanceScore = 8;
                        else distanceScore = 4;
                    } else {
                        distanceScore = 10;
                    }
                    
                    // 3. Rating Score (25% weight)
                    let ratingScore = 0;
                    if (rec.rating_count > 0 && rec.average_rating > 0) {
                        ratingScore = (rec.average_rating / 5) * 100 * 0.25;
                    }
                    
                    // 4. Experience Score (15% weight) — 8+ years = full score
                    let experienceScore = 0;
                    const expRange = rec.law_firm.experience_range;
                    if (expRange) {
                        if (expRange.includes('8-10') || expRange.includes('8 - 10')) experienceScore = 15;
                        else if (expRange.includes('10+') || expRange.includes('10 +')) experienceScore = 15;
                        else if (expRange.includes('5-8') || expRange.includes('5 - 8')) experienceScore = 12;
                        else if (expRange.includes('3-5') || expRange.includes('3 - 5')) experienceScore = 9;
                        else experienceScore = 6;
                    }
                    
                    totalScore = specializationScore + distanceScore + ratingScore + experienceScore;
                    const matchScore = Math.round(Math.min(100, Math.max(0, totalScore)));
                    
                    return matchScore >= MATCH_SCORE_THRESHOLD;
                });
            }
            
            setRecommendations(filteredData);
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
            
            // Reload recommendations to reflect any changes
            loadRecommendations();
            
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
        if (rec.rating_count > 0 && rec.average_rating > 0) {
            // Convert 5-star rating to percentage (5 stars = 100%)
            ratingScore = (rec.average_rating / 5) * 100 * 0.25;
        }
        // No reviews = 0 points (transparent scoring)
        
        // 4. Experience Score (15% weight) — 8+ years = full score
        let experienceScore = 0;
        const expRange = rec.law_firm.experience_range;
        if (expRange) {
            // Score based on experience range — 8+ years is realistically max
            if (expRange.includes('8-10') || expRange.includes('8 - 10')) {
                experienceScore = 15; // 8-10 years = full score (peak)
            } else if (expRange.includes('10+') || expRange.includes('10 +')) {
                experienceScore = 15; // 10+ years = full score
            } else if (expRange.includes('5-8') || expRange.includes('5 - 8')) {
                experienceScore = 12; // 5-8 years = 80%
            } else if (expRange.includes('3-5') || expRange.includes('3 - 5')) {
                experienceScore = 9; // 3-5 years = 60%
            } else {
                experienceScore = 6; // 1-3 years = 40%
            }
        }
        // No experience data = 0 points (transparent scoring)
        
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
                {/* Header - Clean & Integrated */}
                <div className="relative pb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl shadow-lg" style={{ 
                            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                            boxShadow: '0 8px 20px -5px rgba(37, 99, 235, 0.35)'
                        }}>
                            <Scale className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                                Find Your Legal Assistance
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                                Based on your location and legal needs, here are our recommended law firms ranked by match score, proximity, and ratings.
                            </p>
                        </div>
                    </div>
                    {user?.client?.specializations && user.client.specializations.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 mt-5">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Looking for:
                            </span>
                            {user.client.specializations.map((s) => (
                                <Badge 
                                    key={s.id} 
                                    className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                >
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
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                <Scale className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">No Law Firms Found</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm">
                                We couldn't find any law firms matching your criteria. Try adjusting your preferences or check back later.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/30">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Found</span>
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{recommendations.length}</span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">law firms</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Ranked by match score and proximity</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/40">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                    <span className="text-amber-700 dark:text-amber-300">Top Pick</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600/40">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                                    <span className="text-slate-600 dark:text-slate-300">Runner Up</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/40">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-600"></div>
                                    <span className="text-orange-700 dark:text-orange-300">Top 3</span>
                                </div>
                            </div>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {recommendations.map((rec, index) => {
                                const matchScore = calculateMatchScore(rec);
                                return (
                                    <LawFirmCard
                                        key={rec.law_firm.id}
                                        recommendation={rec}
                                        rank={index + 1}
                                        matchScore={matchScore}
                                        showMatchScore={!!(user?.client?.specializations && user.client.specializations.length > 0)}
                                        onViewDetails={handleViewFirm}
                                        onGetDirections={handleGetDirections}
                                        onBook={setBookingFirm}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}

                {/* View Firm Dialog */}
                <Dialog open={!!viewingFirm} onOpenChange={() => { setViewingFirm(null); setViewingData(null); setShowScoreDetails(false); }}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-white dark:bg-slate-900 border-0 shadow-2xl">
                        {viewingFirm && (
                            <>
                                {/* Scrollable Content */}
                                <div className="overflow-y-auto max-h-[calc(90vh-5rem)]" style={{ scrollbarWidth: 'thin' }}>
                                    {/* Cover Photo Banner with Gradient Overlay */}
                                    <div className="relative h-56 overflow-hidden">
                                        {viewingFirm.profile_image_url ? (
                                            <OptimizedImage 
                                                src={viewingFirm.profile_image_url} 
                                                alt={`${viewingFirm.firm_name} cover`}
                                                className="w-full h-full"
                                                retryCount={3}
                                                priority={true}
                                                fallback={
                                                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 50%, #2563eb 100%)' }}>
                                                        <div className="absolute inset-0 opacity-10">
                                                            <div className="absolute inset-0" style={{
                                                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                                            }}></div>
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        ) : (
                                            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 50%, #2563eb 100%)' }}>
                                                <div className="absolute inset-0 opacity-10">
                                                    <div className="absolute inset-0" style={{
                                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                                    }}></div>
                                                </div>
                                            </div>
                                        )}
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                        
                                        {/* Firm Name on Cover */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6">
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <DialogTitle className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                                                        {viewingFirm.firm_name}
                                                    </DialogTitle>
                                                    <DialogDescription className="text-white/80 text-sm">
                                                        {viewingFirm.specializations?.slice(0, 3).map(s => s.name).join(' • ')}
                                                    </DialogDescription>
                                                </div>
                                                {/* Match Score Badge */}
                                                {viewingData && (() => {
                                                    const rec = recommendations.find(r => r.law_firm.id === viewingFirm.id);
                                                    if (rec) {
                                                        const matchScore = calculateMatchScore(rec);
                                                        const scoreColor = matchScore >= 70 ? 'from-cyan-400 to-teal-500' : matchScore >= 50 ? 'from-amber-400 to-orange-500' : 'from-slate-400 to-slate-500';
                                                        return (
                                                            <div className={`px-5 py-2.5 rounded-2xl text-white font-bold text-lg shadow-xl bg-gradient-to-r ${scoreColor}`}>
                                                                {matchScore}% Match
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="px-6 pb-6">
                                    {viewingData && (
                                        <div className="space-y-6 pt-6">
                                            {/* Quick Stats Row */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800/30">
                                                    <div className="flex justify-center mb-2">
                                                        {renderStars(Math.round(viewingData.average_rating))}
                                                    </div>
                                                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                                        {viewingData.average_rating.toFixed(1)}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average Rating</p>
                                                </div>
                                                <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
                                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                        {viewingData.rating_count}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Client Reviews</p>
                                                </div>
                                                <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/30">
                                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                                        {viewingData.distance_km ? `${viewingData.distance_km}` : 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{viewingData.distance_km ? 'km Away' : 'Distance'}</p>
                                                </div>
                                            </div>

                                            {/* Match Score Breakdown */}
                                            {(() => {
                                                const rec = recommendations.find(r => r.law_firm.id === viewingFirm.id);
                                                if (rec && user?.client?.specializations && user.client.specializations.length > 0) {
                                                    const matchScore = calculateMatchScore(rec);
                                                    const specializationMatch = rec.matching_specializations.length;
                                                    const totalPreferences = user.client.specializations.length;
                                                    
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
                                                    
                                                    const ratingPoints = (viewingData.rating_count > 0 && viewingData.average_rating > 0)
                                                        ? Math.round((viewingData.average_rating / 5) * 25) 
                                                        : 0;
                                                    
                                                    let experiencePoints = 0;
                                                    const expRange = viewingFirm.experience_range;
                                                    if (expRange) {
                                                        if (expRange.includes('20+') || expRange.includes('20 +')) experiencePoints = 15;
                                                        else if (expRange.includes('15-20') || expRange.includes('15 - 20')) experiencePoints = 12;
                                                        else if (expRange.includes('10-15') || expRange.includes('10 - 15')) experiencePoints = 9;
                                                        else if (expRange.includes('5-10') || expRange.includes('5 - 10')) experiencePoints = 6;
                                                        else experiencePoints = 3;
                                                    }
                                                    
                                                    return (
                                                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <TrendingUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                                                    <span className="font-semibold text-slate-900 dark:text-white">Match Score Breakdown</span>
                                                                </div>
                                                                <span className="text-2xl font-bold text-slate-900 dark:text-white">{matchScore}%</span>
                                                            </div>
                                                            
                                                            {/* Overall Progress Bar */}
                                                            <div className="mb-4">
                                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                                                    <div 
                                                                        className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-indigo-500" 
                                                                        style={{ width: `${matchScore}%` }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Expand Button */}
                                                            <button
                                                                onClick={() => setShowScoreDetails(!showScoreDetails)}
                                                                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                            >
                                                                <span>{showScoreDetails ? 'Hide Details' : 'View Score Details'}</span>
                                                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showScoreDetails ? 'rotate-180' : ''}`} />
                                                            </button>

                                                            {/* Detailed Breakdown */}
                                                            {showScoreDetails && (
                                                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                                                    {/* Specialization */}
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                                            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex justify-between text-sm mb-1">
                                                                                <span className="font-medium text-slate-700 dark:text-slate-300">Specialization Match</span>
                                                                                <span className="font-semibold text-slate-900 dark:text-white">{specializationPoints}/40</span>
                                                                            </div>
                                                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(specializationPoints / 40) * 100}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Distance */}
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                                            <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex justify-between text-sm mb-1">
                                                                                <span className="font-medium text-slate-700 dark:text-slate-300">Distance</span>
                                                                                <span className="font-semibold text-slate-900 dark:text-white">{distancePoints}/20</span>
                                                                            </div>
                                                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(distancePoints / 20) * 100}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Rating */}
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                                            <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex justify-between text-sm mb-1">
                                                                                <span className="font-medium text-slate-700 dark:text-slate-300">Rating</span>
                                                                                <span className="font-semibold text-slate-900 dark:text-white">{ratingPoints}/25</span>
                                                                            </div>
                                                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(ratingPoints / 25) * 100}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Experience */}
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                                            <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex justify-between text-sm mb-1">
                                                                                <span className="font-medium text-slate-700 dark:text-slate-300">Experience</span>
                                                                                <span className="font-semibold text-slate-900 dark:text-white">{experiencePoints}/15</span>
                                                                            </div>
                                                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(experiencePoints / 15) * 100}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            {/* Specializations */}
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Legal Specializations</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {viewingFirm.specializations?.map((s) => {
                                                        const rec = recommendations.find(r => r.law_firm.id === viewingFirm.id);
                                                        const isMatching = rec?.matching_specializations.includes(s.name);
                                                        return (
                                                            <span 
                                                                key={s.id} 
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                                    isMatching 
                                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50' 
                                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                                                }`}
                                                            >
                                                                {isMatching && <CheckCircle className="h-3.5 w-3.5" />}
                                                                {s.name}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {viewingFirm.description && (
                                                <div className="space-y-3">
                                                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">About This Firm</h3>
                                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                        {viewingFirm.description}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Experience and Lawyers Grid */}
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {(viewingFirm as any).experience_range && (
                                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                                                                <Award className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Experience</p>
                                                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                                    {(viewingFirm as any).experience_range}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {(viewingFirm as any).lawyers && (viewingFirm as any).lawyers.length > 0 && (
                                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0">
                                                                <Building2 className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Lawyers</p>
                                                                {(viewingFirm as any).lawyers.map((lawyer: string, index: number) => (
                                                                    <p key={index} className="text-sm font-medium text-slate-900 dark:text-white">
                                                                        {lawyer}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Gallery */}
                                            {(viewingFirm as any).gallery_images_urls && (viewingFirm as any).gallery_images_urls.length > 0 && (
                                                <div className="space-y-3">
                                                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Office Gallery</h3>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {(viewingFirm as any).gallery_images_urls.map((imageUrl: string, index: number) => (
                                                            <div key={index} className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02]">
                                                                <OptimizedImage 
                                                                    src={imageUrl} 
                                                                    alt={`${viewingFirm.firm_name} photo ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                    lazy={true}
                                                                    retryCount={3}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Contact Information */}
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact Information</h3>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {viewingFirm.phone && (
                                                        <a href={`tel:${viewingFirm.phone}`} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                                                                <p className="font-medium text-slate-900 dark:text-white">{viewingFirm.phone}</p>
                                                            </div>
                                                        </a>
                                                    )}
                                                    
                                                    <a href={`mailto:${viewingFirm.user?.email}`} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                                                            <p className="font-medium text-slate-900 dark:text-white truncate">{viewingFirm.user?.email}</p>
                                                        </div>
                                                    </a>

                                                    {viewingData.distance_km && viewingFirm.latitude && viewingFirm.longitude && (
                                                        <button 
                                                            onClick={() => handleGetDirections(viewingFirm.latitude!, viewingFirm.longitude!)}
                                                            className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group text-left"
                                                        >
                                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                <Navigation className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">Distance</p>
                                                                <p className="font-medium text-slate-900 dark:text-white">{viewingData.distance_km} km away</p>
                                                            </div>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                </div>

                                {/* Footer Actions - Sticky */}
                                <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => { setViewingFirm(null); setViewingData(null); setShowScoreDetails(false); }}
                                        className="px-6 text-foreground"
                                    >
                                        Close
                                    </Button>
                                    <Button 
                                        onClick={() => { setBookingFirm(viewingFirm); setViewingFirm(null); setShowScoreDetails(false); }} 
                                        className="px-6 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                    >
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
                    <DialogContent className="text-foreground">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground">
                                <Calendar className="h-5 w-5" />
                                Request Appointment
                            </DialogTitle>
                            <DialogDescription className="text-foreground/70">
                                Book a consultation with {bookingFirm?.firm_name}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleBookAppointment} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="booking-notes" className="text-foreground">Describe your legal needs (Optional)</Label>
                                <Textarea
                                    id="booking-notes"
                                    value={bookingNotes}
                                    onChange={(e) => setBookingNotes(e.target.value)}
                                    placeholder="Tell the law firm about your legal matter..."
                                    rows={4}
                                    className="text-foreground"
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
