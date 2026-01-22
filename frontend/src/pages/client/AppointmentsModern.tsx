import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Appointment } from '@/types';
import ClientLayoutNew from '@/components/client/ClientLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    FileText,
    Star,
    CheckCircle,
    XCircle,
    AlertCircle,
    Building2
} from 'lucide-react';

export default function AppointmentsModern() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Rating modal state
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadAppointments();

        // Auto-refresh every 30 seconds
        const refreshInterval = setInterval(() => {
            loadAppointments();
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, []);

    const loadAppointments = async () => {
        try {
            const data = await api.getClientAppointments();
            setAppointments(data);
        } catch {
            setError('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleRateClick = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setRating(0);
        setReview('');
        setShowRatingModal(true);
    };

    const handleSubmitRating = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppointment) return;

        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            await api.submitRating({
                law_firm_id: selectedAppointment.law_firm_id,
                appointment_id: selectedAppointment.id,
                rating,
                review
            });
            setShowRatingModal(false);
            setRating(0);
            setReview('');
            loadAppointments();
        } catch {
            alert('Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: { variant: 'outline' as const, icon: Clock, color: 'text-yellow-600' },
            confirmed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
            completed: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-blue-600' },
            cancelled: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
        };
        const config = variants[status as keyof typeof variants] || variants.pending;
        const Icon = config.icon;
        
        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const renderStars = (count: number, interactive: boolean = false, onClick?: (num: number) => void) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                    <Star
                        key={num}
                        className={`h-5 w-5 ${
                            num <= count
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'fill-gray-200 text-gray-200'
                        } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                        onClick={() => interactive && onClick && onClick(num)}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString.includes('T') ? dateString : dateString.replace(' ', 'T') + 'Z');
        return date.toLocaleDateString(undefined, { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString.includes('T') ? dateString : dateString.replace(' ', 'T') + 'Z');
        return date.toLocaleTimeString(undefined, { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const upcomingAppointments = appointments.filter(apt => 
        apt.status === 'pending' || apt.status === 'confirmed'
    ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    const pastAppointments = appointments.filter(apt => 
        apt.status === 'completed' || apt.status === 'cancelled'
    ).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

    const renderAppointmentCard = (apt: Appointment) => (
        <Card key={apt.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-xl">{apt.law_firm?.firm_name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                {apt.specialization?.name || 'General Legal'}
                                {apt.law_firm?.phone && (
                                    <>
                                        <span className="text-muted-foreground">•</span>
                                        <a href={`tel:${apt.law_firm.phone}`} className="text-primary hover:underline">
                                            {apt.law_firm.phone}
                                        </a>
                                    </>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                    {getStatusBadge(apt.status)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Details Grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Date</p>
                            <p className="text-sm text-muted-foreground">{formatDate(apt.scheduled_at)}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Clock className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Time</p>
                            <p className="text-sm text-muted-foreground">{formatTime(apt.scheduled_at)}</p>
                        </div>
                    </div>
                    {apt.law_firm?.address && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 sm:col-span-2">
                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-muted-foreground">{apt.law_firm.address}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notes */}
                {apt.notes && (
                    <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start gap-2 mb-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-sm font-medium">Your Notes</p>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{apt.notes}</p>
                    </div>
                )}

                {/* Cancellation Reason */}
                {apt.cancellation_reason && (
                    <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                        <div className="flex items-start gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                            <p className="text-sm font-medium text-destructive">Cancellation Reason</p>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{apt.cancellation_reason}</p>
                    </div>
                )}

                {/* Rating Section */}
                {apt.status === 'completed' && !apt.rating && (
                    <div className="flex items-center justify-between p-4 rounded-lg border-2 border-dashed">
                        <div>
                            <p className="text-sm font-medium">How was your consultation?</p>
                            <p className="text-sm text-muted-foreground">Share your experience</p>
                        </div>
                        <Button onClick={() => handleRateClick(apt)} className="gap-2">
                            <Star className="h-4 w-4" />
                            Rate Now
                        </Button>
                    </div>
                )}

                {apt.rating && (
                    <div className="p-4 rounded-lg border bg-card space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Your Rating & Review</p>
                            {renderStars(apt.rating.rating)}
                        </div>
                        {apt.rating.review && (
                            <p className="text-sm text-muted-foreground italic">"{apt.rating.review}"</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <ClientLayoutNew>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading appointments...</p>
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
                    <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
                    <p className="text-muted-foreground">
                        Track and manage your legal consultations
                    </p>
                </div>

                {error && (
                    <Card className="border-destructive">
                        <CardContent className="flex items-center gap-3 pt-6">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs */}
                <Tabs defaultValue="upcoming" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="upcoming" className="gap-2">
                            Upcoming
                            <Badge variant="secondary">{upcomingAppointments.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="past" className="gap-2">
                            Past & Cancelled
                            <Badge variant="secondary">{pastAppointments.length}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-4">
                        {upcomingAppointments.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        You don't have any upcoming appointments
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            upcomingAppointments.map(renderAppointmentCard)
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="space-y-4">
                        {pastAppointments.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        No past appointments found
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            pastAppointments.map(renderAppointmentCard)
                        )}
                    </TabsContent>
                </Tabs>

                {/* Rating Dialog */}
                <Dialog open={showRatingModal} onOpenChange={() => {
                    setShowRatingModal(false);
                    setRating(0);
                    setReview('');
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Rate Your Consultation
                            </DialogTitle>
                            <DialogDescription>
                                Share your experience with {selectedAppointment?.law_firm?.firm_name}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmitRating} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Rating</Label>
                                <div className="flex justify-center">
                                    {renderStars(rating, true, setRating)}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="review">Your Review (Optional)</Label>
                                <Textarea
                                    id="review"
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    placeholder="Share your thoughts about the consultation..."
                                    rows={4}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowRatingModal(false);
                                        setRating(0);
                                        setReview('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting || rating === 0}>
                                    {submitting ? 'Submitting...' : 'Submit Rating'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </ClientLayoutNew>
    );
}
