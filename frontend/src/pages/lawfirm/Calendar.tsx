import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { CalendarEvent, Appointment } from '../../types';
import LawFirmLayout from '../../components/lawfirm/LawFirmLayout';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './LawFirmDashboard.css';

export default function Calendar() {
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

    return (
        <LawFirmLayout>
            <div className="law-firm-calendar">
                <div className="page-header">
                    <div className="header-with-action">
                        <div>
                            <h2>📅 Appointment Calendar ({appointments.length})</h2>
                            <p>Manage and schedule your client meetings</p>
                        </div>
                    </div>
                </div>

                <div className="calendar-section">
                    {loading ? (
                        <div className="loading">Loading calendar...</div>
                    ) : (
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
                    )}
                </div>

                {selectedAppointment && (
                    <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
                        <div className="modal client-details-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>📅 Appointment Details</h3>
                                <button className="close-button" onClick={() => setSelectedAppointment(null)}>✕</button>
                            </div>
                            <div className="client-details-body">
                                <div className="detail-row">
                                    <span className="detail-label">Client Name:</span>
                                    <span className="detail-value">{selectedAppointment.client?.user?.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Specialization:</span>
                                    <span className="detail-value">{selectedAppointment.specialization?.name || 'General Legal Consultation'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className={`status-badge ${selectedAppointment.status}`}>{selectedAppointment.status}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Date & Time:</span>
                                    <span className="detail-value">
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
                                <div className="detail-row">
                                    <span className="detail-label">Client's Notes:</span>
                                    <p className="detail-value" style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                        {selectedAppointment.notes || 'No notes provided'}
                                    </p>
                                </div>
                                {selectedAppointment.cancellation_reason && (
                                    <div className="detail-row">
                                        <span className="detail-label">Cancellation Reason:</span>
                                        <p className="detail-value" style={{ color: '#ef4444', fontSize: '0.95rem' }}>
                                            {selectedAppointment.cancellation_reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <button className="btn-primary" onClick={() => setSelectedAppointment(null)}>Close</button>
                                <button 
                                    className="btn-text-only" 
                                    onClick={() => window.location.href='/law-firm/appointments'}
                                >
                                    Manage
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LawFirmLayout>
    );
}
