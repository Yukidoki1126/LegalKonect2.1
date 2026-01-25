import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/services/api';
import { Appointment } from '@/types';
import LawFirmLayoutNew from '@/components/lawfirm/LawFirmLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    User,
    Mail,
    Phone,
    FileText,
    AlertCircle,
    Bell
} from 'lucide-react';

export default function Appointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);
    const [showScheduleModal, setShowScheduleModal] = useState<Appointment | null>(null);
    const [viewingClient, setViewingClient] = useState<Appointment | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'cancelled' | 'completed'>('pending');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleNotes, setScheduleNotes] = useState('');
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [newRequestCount, setNewRequestCount] = useState(0);
    const previousPendingCountRef = useRef<number>(0);

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await api.getLawFirmAppointments();

            // Check for new pending appointments
            const newPendingCount = data.filter(a => a.status === 'pending').length;

            if (previousPendingCountRef.current > 0 && newPendingCount > previousPendingCountRef.current) {
                const difference = newPendingCount - previousPendingCountRef.current;
                setNewRequestCount(difference);
                // Show browser notification if supported
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('New Appointment Request!', {
                        body: `You have ${difference} new appointment request(s)`,
                        icon: '/favicon.ico'
                    });
                }
                // Clear the count after 5 seconds
                setTimeout(() => setNewRequestCount(0), 5000);
            }

            previousPendingCountRef.current = newPendingCount;
            setAppointments(data);
            setLastRefresh(new Date());
        } catch {
            console.error('Failed to load appointments');
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();

        // Request notification permission on component mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Auto-refresh every 5 seconds to check for new appointment requests
        const refreshInterval = setInterval(() => {
            loadData(true); // Silent refresh (don't show loading spinner)
        }, 5000); // 5 seconds for very frequent updates on appointments page

        return () => clearInterval(refreshInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleUpdateStatus = async (id: number, status: string, scheduledAt?: string, notes?: string) => {
        setUpdating(id);
        try {
            // If scheduledAt is provided from datetime-local, it's in local time.
            // We should convert it to a proper ISO string that includes the timezone or is UTC.
            let formattedDate = scheduledAt;
            if (scheduledAt && !scheduledAt.includes('Z') && !scheduledAt.includes('+')) {
                // If it's a datetime-local value (YYYY-MM-DDTHH:mm), convert it to ISO string
                // which will be in UTC when sent to the backend.
                formattedDate = new Date(scheduledAt).toISOString();
            }

            await api.updateAppointment(id, { 
                status,
                scheduled_at: formattedDate,
                notes: notes
            });
            setShowScheduleModal(null);
            loadData();
        } catch {
            console.error('Failed to update appointment');
        } finally {
            setUpdating(null);
        }
    };

    const openScheduleModal = (apt: Appointment) => {
        setShowScheduleModal(apt);
        
        // When opening the modal, we want to show the current scheduled time in the user's local time
        // for the datetime-local input (format: YYYY-MM-DDTHH:mm)
        if (apt.scheduled_at) {
            const dateStr = apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z';
            const localDate = new Date(dateStr);
            
            // Format to YYYY-MM-DDTHH:mm for datetime-local input
            const year = localDate.getFullYear();
            const month = String(localDate.getMonth() + 1).padStart(2, '0');
            const day = String(localDate.getDate()).padStart(2, '0');
            const hours = String(localDate.getHours()).padStart(2, '0');
            const minutes = String(localDate.getMinutes()).padStart(2, '0');
            
            setScheduleDate(`${year}-${month}-${day}T${hours}:${minutes}`);
        } else {
            setScheduleDate('');
        }
        
        setScheduleNotes('');
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary';
            case 'confirmed': return 'default';
            case 'completed': return 'outline';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-3 w-3" />;
            case 'confirmed': return <CheckCircle className="h-3 w-3" />;
            case 'completed': return <CheckCircle className="h-3 w-3" />;
            case 'cancelled': return <XCircle className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

    if (loading) {
        return (
            <LawFirmLayoutNew>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading appointments...</p>
                    </div>
                </div>
            </LawFirmLayoutNew>
        );
    }

    return (
        <LawFirmLayoutNew>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointments</h1>
                        <p className="text-muted-foreground">
                            Manage client appointments and consultations
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Last updated: {lastRefresh.toLocaleTimeString()}
                    </div>
                </div>

                {/* New Request Alert */}
                {newRequestCount > 0 && (
                    <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                        <CardContent className="flex items-center gap-3 pt-6">
                            <Bell className="h-5 w-5 text-green-600 animate-pulse" />
                            <p className="font-medium text-green-900 dark:text-green-100">
                                🎉 {newRequestCount} new appointment request{newRequestCount > 1 ? 's' : ''}!
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs */}
                <Tabs defaultValue="pending" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="pending" className="gap-2">
                            <Clock className="h-4 w-4" />
                            Pending ({appointments.filter(a => a.status === 'pending').length})
                        </TabsTrigger>
                        <TabsTrigger value="confirmed" className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Confirmed ({appointments.filter(a => a.status === 'confirmed').length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Completed ({appointments.filter(a => a.status === 'completed').length})
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="gap-2">
                            <XCircle className="h-4 w-4" />
                            Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="space-y-4 mt-6">
                        {appointments.filter(a => a.status === activeTab).length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        No {activeTab} appointments found
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            appointments.filter(a => a.status === activeTab).map(apt => (
                                <Card key={apt.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg text-foreground">
                                                        {apt.client?.user?.name || 'Client'}
                                                    </CardTitle>
                                                    <CardDescription className="flex flex-col gap-1 mt-1">
                                                        {apt.status === 'pending' ? (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                Requested: {new Date(apt.created_at.includes('T') ? apt.created_at : apt.created_at.replace(' ', 'T') + 'Z').toLocaleString()}
                                                            </span>
                                                        ) : apt.status === 'cancelled' ? (
                                                            <span className="flex items-center gap-1">
                                                                <XCircle className="h-3 w-3" />
                                                                Cancelled: {new Date(apt.updated_at.includes('T') ? apt.updated_at : apt.updated_at.replace(' ', 'T') + 'Z').toLocaleDateString()}
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z').toLocaleString()}
                                                            </span>
                                                        )}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge variant={getStatusBadgeClass(apt.status)} className="gap-1">
                                                {getStatusIcon(apt.status)}
                                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {apt.status === 'cancelled' && apt.cancellation_reason && (
                                            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                                <p className="text-sm text-destructive font-medium mb-1">Cancellation Reason:</p>
                                                <p className="text-sm text-foreground">{apt.cancellation_reason}</p>
                                            </div>
                                        )}

                                        {apt.notes && (
                                            <div className="mb-4 p-3 rounded-lg bg-muted">
                                                <p className="text-sm text-muted-foreground font-medium mb-1">Client Notes:</p>
                                                <p className="text-sm text-foreground">{apt.notes}</p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setViewingClient(apt)}
                                            >
                                                <User className="mr-2 h-4 w-4" />
                                                View Details
                                            </Button>

                                            {apt.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => openScheduleModal(apt)}
                                                        disabled={updating === apt.id}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Approve & Schedule
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                                        disabled={updating === apt.id}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Decline
                                                    </Button>
                                                </>
                                            )}

                                            {apt.status === 'confirmed' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                                        disabled={updating === apt.id || new Date(apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z') > new Date()}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Mark Completed
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openScheduleModal(apt)}
                                                        disabled={updating === apt.id}
                                                    >
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        Reschedule
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                                        disabled={updating === apt.id}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>

                {/* View Client Dialog */}
                <Dialog open={!!viewingClient} onOpenChange={() => setViewingClient(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground">
                                <User className="h-5 w-5" />
                                Client Information
                            </DialogTitle>
                            <DialogDescription className="text-foreground">
                                Contact and consultation details
                            </DialogDescription>
                        </DialogHeader>

                        {viewingClient && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label className="text-foreground">Name</Label>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-foreground">{viewingClient.client?.user?.name}</span>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-foreground">Email</Label>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a 
                                            href={`mailto:${viewingClient.client?.user?.email}`}
                                            className="text-primary hover:underline"
                                        >
                                            {viewingClient.client?.user?.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-foreground">Phone</Label>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {viewingClient.client?.phone ? (
                                            <a 
                                                href={`tel:${viewingClient.client.phone}`}
                                                className="text-primary hover:underline"
                                            >
                                                {viewingClient.client.phone}
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">Not provided</span>
                                        )}
                                    </div>
                                </div>

                                {viewingClient.client?.specializations && viewingClient.client.specializations.length > 0 && (
                                    <div className="grid gap-2">
                                        <Label className="text-foreground">Looking for</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {viewingClient.client.specializations.map(s => (
                                                <Badge key={s.id} variant="secondary">
                                                    {s.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {viewingClient.notes && (
                                    <div className="grid gap-2">
                                        <Label className="text-foreground">Client's Notes</Label>
                                        <div className="p-3 rounded-lg bg-muted">
                                            <p className="text-sm whitespace-pre-wrap text-foreground">
                                                {viewingClient.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button onClick={() => setViewingClient(null)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Schedule Dialog */}
                <Dialog open={!!showScheduleModal} onOpenChange={() => setShowScheduleModal(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground">
                                <Calendar className="h-5 w-5" />
                                Schedule Appointment
                            </DialogTitle>
                            <DialogDescription className="text-foreground">
                                Set the date and time for consultation with <strong>{showScheduleModal?.client?.user?.name}</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label className="text-foreground">Date & Time</Label>
                                <Input
                                    id="schedule-date"
                                    type="datetime-local"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    min={new Date().toISOString().substring(0, 16)}
                                    className="text-foreground"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="schedule-notes" className="text-foreground">Note (Optional)</Label>
                                <Textarea
                                    id="schedule-notes"
                                    value={scheduleNotes}
                                    onChange={(e) => setScheduleNotes(e.target.value)}
                                    placeholder="Add a note for the client..."
                                    rows={4}
                                    className="text-foreground"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowScheduleModal(null)} className="text-foreground">
                                Cancel
                            </Button>
                            <Button
                                disabled={!scheduleDate || updating !== null}
                                onClick={() => showScheduleModal && handleUpdateStatus(showScheduleModal.id, 'confirmed', scheduleDate, scheduleNotes)}
                            >
                                {updating === showScheduleModal?.id ? 'Saving...' : 'Confirm Schedule'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </LawFirmLayoutNew>
    );
}
