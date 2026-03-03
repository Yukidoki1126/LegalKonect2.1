import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const calendarRef = useRef<any>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [currentView, setCurrentView] = useState('dayGridMonth');

    const loadData = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) {
            setLoading(true);
        }
        try {
            const appointmentsData = await api.getLawFirmAppointments();
            setAppointments(appointmentsData);

            const events: CalendarEvent[] = appointmentsData.map((apt: Appointment) => {
                const startDate = new Date(apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z');
                const endDate = new Date(startDate.getTime() + (apt.duration_minutes || 60) * 60000);
                
                // Cap event end time to not extend past midnight (next day)
                const startDayEnd = new Date(startDate);
                startDayEnd.setHours(23, 59, 59, 999);
                
                const cappedEndDate = endDate > startDayEnd ? startDayEnd : endDate;
                
                return {
                    id: apt.id.toString(),
                    title: apt.client?.user?.name || 'Client',
                    start: startDate.toISOString(),
                    end: cappedEndDate.toISOString(),
                    status: apt.status,
                    color: '#22c55e',
                    borderColor: '#22c55e',
                    textColor: '#ffffff',
                    extendedProps: { appointment: apt },
                };
            });
            setCalendarEvents(events);
        } catch {
            console.error('Failed to load calendar data');
        } finally {
            if (isInitialLoad) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadData(true);

        // Silent auto-refresh every 15 seconds - updates data without resetting view
        const refreshInterval = setInterval(() => {
            loadData(false);
        }, 15000);

        return () => clearInterval(refreshInterval);
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
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
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
                        <div className="calendar-wrapper" key="calendar-container">
                            <style>{`
                                /* Base event styling */
                                .fc-event {
                                    cursor: pointer;
                                    border-radius: 3px;
                                }
                                
                                /* Month view - compact events */
                                .fc-daygrid-event {
                                    background-color: #22c55e !important;
                                    border: 1px solid #16a34a !important;
                                    border-radius: 3px !important;
                                    margin-bottom: 2px !important;
                                    padding: 0 !important;
                                }
                                
                                .fc-daygrid-event-harness {
                                    margin-top: 0 !important;
                                    margin-bottom: 2px !important;
                                }
                                
                                .fc-daygrid-block-event {
                                    padding: 2px 4px !important;
                                    font-size: 0.7rem !important;
                                }
                                
                                .fc-daygrid-block-event .fc-event-time {
                                    font-size: 0.65rem !important;
                                    font-weight: 600 !important;
                                }
                                
                                .fc-daygrid-block-event .fc-event-title {
                                    font-size: 0.65rem !important;
                                }
                                
                                /* More link styling */
                                .fc-daygrid-more-link {
                                    font-size: 0.7rem !important;
                                    color: #3b82f6 !important;
                                    font-weight: 600 !important;
                                    cursor: pointer !important;
                                    margin-top: 2px !important;
                                    padding: 2px !important;
                                    text-align: center !important;
                                    display: block !important;
                                }
                                
                                /* Day cell sizing */
                                .fc-daygrid-day-frame {
                                    min-height: 100px !important;
                                    position: relative;
                                }
                                
                                .fc-daygrid-day-events {
                                    margin-bottom: 0 !important;
                                }
                                
                                .fc-daygrid-day-bottom {
                                    margin-top: 2px !important;
                                }
                                
                                /* Week/Day view - time grid events */
                                .fc-timegrid-event {
                                    background-color: #22c55e !important;
                                    border-color: #16a34a !important;
                                    border-radius: 3px !important;
                                    font-size: 0.7rem !important;
                                    min-height: 40px !important;
                                }
                                
                                .fc-timegrid-event .fc-event-main {
                                    padding: 2px 4px !important;
                                }
                                
                                .fc-timegrid-event .fc-event-time {
                                    font-size: 0.6rem !important;
                                    font-weight: 600 !important;
                                }
                                
                                .fc-timegrid-event .fc-event-title {
                                    font-size: 0.6rem !important;
                                    overflow: hidden !important;
                                    text-overflow: ellipsis !important;
                                }
                                
                                /* Compact time slots */
                                .fc-timegrid-slot {
                                    height: 2.5em !important;
                                }
                                
                                /* Hide end times on short events */
                                .fc-timegrid-event-short .fc-event-time {
                                    display: block !important;
                                }
                                
                                /* Popover for "more" events */
                                .fc-popover {
                                    z-index: 9999 !important;
                                }
                                
                                .fc-popover-body {
                                    max-height: 300px;
                                    overflow-y: auto;
                                }
                            `}</style>
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView={currentView}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                }}
                                events={calendarEvents}
                                height="auto"
                                dayMaxEvents={2}
                                displayEventEnd={false}
                                nextDayThreshold="09:00:00"
                                slotEventOverlap={false}
                                eventMaxStack={3}
                                eventTimeFormat={{
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    meridiem: 'short',
                                }}
                                datesSet={(dateInfo) => {
                                    setCurrentView(dateInfo.view.type);
                                }}
                                eventContent={(eventInfo) => {
                                    const timeText = eventInfo.timeText.toUpperCase();
                                    const title = eventInfo.event.title;
                                    const viewType = eventInfo.view.type;
                                    
                                    // Truncate based on view
                                    let displayTitle = title;
                                    if (viewType === 'dayGridMonth' && title.length > 8) {
                                        displayTitle = title.substring(0, 8) + '...';
                                    } else if (viewType === 'timeGridWeek' && title.length > 10) {
                                        displayTitle = title.substring(0, 10) + '...';
                                    } else if (viewType === 'timeGridDay' && title.length > 20) {
                                        displayTitle = title.substring(0, 20) + '...';
                                    }
                                    
                                    return (
                                        <div style={{ 
                                            overflow: 'hidden',
                                            padding: '1px 2px',
                                            lineHeight: '1.2'
                                        }}>
                                            <div style={{ 
                                                fontSize: '0.65rem',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {timeText}
                                            </div>
                                            <div style={{ 
                                                fontSize: '0.65rem',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {displayTitle}
                                            </div>
                                        </div>
                                    );
                                }}
                                moreLinkText={(num) => `+${num} more`}
                                eventClick={(info) => {
                                    setSelectedAppointment(info.event.extendedProps.appointment);
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Appointment Details Dialog */}
                <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
                    <DialogContent className="text-foreground">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground">
                                <CalendarIcon className="h-5 w-5" />
                                Appointment Details
                            </DialogTitle>
                            <DialogDescription className="text-foreground/70">
                                View consultation information
                            </DialogDescription>
                        </DialogHeader>

                        {selectedAppointment && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label className="text-foreground">Client</Label>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-foreground">{selectedAppointment.client?.user?.name}</span>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-foreground">Specialization</Label>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-foreground">{selectedAppointment.specialization?.name || 'General Legal Consultation'}</span>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-foreground">Status</Label>
                                    {getStatusBadge(selectedAppointment.status)}
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-foreground">Date & Time</Label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-foreground">
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
                                        <Label className="text-foreground">Client's Notes</Label>
                                        <div className="p-3 rounded-lg bg-muted">
                                            <p className="text-sm whitespace-pre-wrap text-foreground">
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
