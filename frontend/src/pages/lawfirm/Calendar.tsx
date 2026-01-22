import React, { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { CalendarEvent, Appointment } from '@/types';
import LawFirmLayoutNew from '@/components/lawfirm/LawFirmLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon, User, Clock, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';

export default function Calendar() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const appointmentsData = await api.getLawFirmAppointments();
            setAppointments(appointmentsData);

            const events: CalendarEvent[] = appointmentsData.map((apt: Appointment) => ({
                id: apt.id.toString(),
                title: apt.client?.user?.name || 'Client',
                start: apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z',
                end: new Date(new Date(apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z').getTime() + (apt.duration_minutes || 60) * 60000).toISOString(),
                status: apt.status,
                color: getStatusColor(apt.status),
                textColor: '#ffffff',
                extendedProps: { appointment: apt },
            }));
            setCalendarEvents(events);
        } catch {
            console.error('Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#fbbf24';
            case 'confirmed': return '#3b82f6';
            case 'completed': return '#22c55e';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            pending: 'secondary',
            confirmed: 'default',
            completed: 'outline',
            cancelled: 'destructive'
        };

        const icons: Record<string, React.ReactNode> = {
            pending: <Clock className="h-3 w-3" />,
            confirmed: <CheckCircle className="h-3 w-3" />,
            completed: <CheckCircle className="h-3 w-3" />,
            cancelled: <XCircle className="h-3 w-3" />
        };

        return (
            <Badge variant={variants[status] || 'secondary'} className="gap-1">
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    if (loading) {
        return (
            <LawFirmLayoutNew>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading calendar...</p>
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
                        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                        <p className="text-muted-foreground">
                            View and manage your appointment schedule
                        </p>
                    </div>
                    <Badge variant="outline" className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {appointments.length} Appointment{appointments.length !== 1 ? 's' : ''}
                    </Badge>
                </div>

                {/* Legend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Status Legend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
                                <span className="text-sm text-muted-foreground">Pending</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                                <span className="text-sm text-muted-foreground">Confirmed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                                <span className="text-sm text-muted-foreground">Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                                <span className="text-sm text-muted-foreground">Cancelled</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Calendar */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="calendar-wrapper">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                }}
                                events={calendarEvents}
                                height="auto"
                                eventTimeFormat={{
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    meridiem: 'short',
                                }}
                                eventContent={(eventInfo) => {
                                    const timeText = eventInfo.timeText.toUpperCase();
                                    return (
                                        <>
                                            <div className="fc-event-time">{timeText}</div>
                                            <div className="fc-event-title">{eventInfo.event.title}</div>
                                        </>
                                    );
                                }}
                                eventClick={(info) => {
                                    setSelectedAppointment(info.event.extendedProps.appointment);
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Appointment Details Dialog */}
                <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5" />
                                Appointment Details
                            </DialogTitle>
                            <DialogDescription>
                                View consultation information
                            </DialogDescription>
                        </DialogHeader>

                        {selectedAppointment && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Client</Label>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedAppointment.client?.user?.name}</span>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Specialization</Label>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedAppointment.specialization?.name || 'General Legal Consultation'}</span>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    {getStatusBadge(selectedAppointment.status)}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Date & Time</Label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {new Date(selectedAppointment.scheduled_at.includes('T') ? 
                                                selectedAppointment.scheduled_at : 
                                                selectedAppointment.scheduled_at.replace(' ', 'T') + 'Z'
                                            ).toLocaleString(undefined, {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {selectedAppointment.notes && (
                                    <div className="grid gap-2">
                                        <Label>Client's Notes</Label>
                                        <div className="p-3 rounded-lg bg-muted">
                                            <p className="text-sm whitespace-pre-wrap">
                                                {selectedAppointment.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedAppointment.cancellation_reason && (
                                    <div className="grid gap-2">
                                        <Label className="text-destructive">Cancellation Reason</Label>
                                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                            <p className="text-sm text-destructive">
                                                {selectedAppointment.cancellation_reason}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                                Close
                            </Button>
                            <Button onClick={() => navigate('/law-firm/appointments')}>
                                Manage Appointments
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </LawFirmLayoutNew>
    );
}
