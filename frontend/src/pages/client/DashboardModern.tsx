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
    AlertCircle
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
                    <h1 className="text-3xl font-bold tracking-tight">Find Your Legal Assistance</h1>
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
                <Dialog open={!!viewingFirm} onOpenChange={() => { setViewingFirm(null); setViewingData(null); }}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl">{viewingFirm?.firm_name}</DialogTitle>
                                        <DialogDescription>
                                            Comprehensive law firm profile
                                        </DialogDescription>
                                    </div>
                                </div>
                                {viewingFirm && viewingData && (() => {
                                    const rec = recommendations.find(r => r.law_firm.id === viewingFirm.id);
                                    if (rec) {
                                        const matchScore = calculateMatchScore(rec);
                                        return (
                                            <div className={`px-3 py-2 rounded-lg text-sm font-semibold border ${getMatchScoreColor(matchScore)}`}>
                                                {matchScore}% Match
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </DialogHeader>

                        {viewingFirm && viewingData && (
                            <div className="space-y-6">
                                {/* Rating & Stats Cards */}
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-center">
                                                <div className="flex justify-center mb-2">
                                                    {renderStars(Math.round(viewingData.average_rating))}
                                                </div>
                                                <p className="text-2xl font-bold">
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
                                        
                                        return (
                                            <Card className="border-primary/20 bg-primary/5">
                                                <CardHeader>
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4" />
                                                        Match Score Breakdown
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Specialization Match</span>
                                                            <span className="font-medium">{specializationMatch}/{totalPreferences} ({specializationPercent}%)</span>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-2">
                                                            <div 
                                                                className="bg-primary h-2 rounded-full transition-all" 
                                                                style={{ width: `${specializationPercent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                                        <div className="text-center p-2 rounded-lg bg-background">
                                                            <p className="text-xs text-muted-foreground">Distance</p>
                                                            <p className="text-sm font-semibold">{viewingData.distance_km ? `${viewingData.distance_km}km` : 'N/A'}</p>
                                                        </div>
                                                        <div className="text-center p-2 rounded-lg bg-background">
                                                            <p className="text-xs text-muted-foreground">Rating</p>
                                                            <p className="text-sm font-semibold">{viewingData.average_rating.toFixed(1)}⭐</p>
                                                        </div>
                                                        <div className="text-center p-2 rounded-lg bg-background">
                                                            <p className="text-xs text-muted-foreground">Experience</p>
                                                            <p className="text-sm font-semibold">{viewingData.rating_count} reviews</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* Specializations */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Legal Specializations</Label>
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
                                        <Label className="text-base font-semibold">About This Firm</Label>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                    {viewingFirm.description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Contact Information */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Contact Information</Label>
                                    <Card>
                                        <CardContent className="pt-6 space-y-3">
                                            {viewingFirm.phone && (
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Phone className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-muted-foreground">Phone</p>
                                                        <a href={`tel:${viewingFirm.phone}`} className="text-sm font-medium text-primary hover:underline">
                                                            {viewingFirm.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Mail className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground">Email</p>
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
                                                        <p className="text-sm font-medium">{viewingData.distance_km} km from your location</p>
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
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => { setViewingFirm(null); setViewingData(null); }}>
                                Close
                            </Button>
                            {viewingFirm && (
                                <Button onClick={() => { setBookingFirm(viewingFirm); setViewingFirm(null); }} className="gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Book Appointment
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Booking Dialog */}
                <Dialog open={!!bookingFirm} onOpenChange={() => { setBookingFirm(null); setBookingNotes(''); setBookingMessage({ type: '', text: '' }); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
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
