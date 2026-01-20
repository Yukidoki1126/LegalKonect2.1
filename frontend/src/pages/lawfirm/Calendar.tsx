import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Client, CalendarEvent, Appointment } from '../../types';
import LawFirmLayout from '../../components/lawfirm/LawFirmLayout';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './LawFirmDashboard.css';

export default function Calendar() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewAppointment, setShowNewAppointment] = useState(false);
    const [selectedClient, setSelectedClient] = useState<number | null>(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentNotes, setAppointmentNotes] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [appointmentsData, clientsData] = await Promise.all([
                api.getLawFirmAppointments(),
                api.getLawFirmClients(),
            ]);
            setAppointments(appointmentsData);
            setClients(clientsData);

            const events: CalendarEvent[] = appointmentsData.map((apt: Appointment) => ({
                id: apt.id.toString(),
                title: apt.client?.user?.name || 'Client',
                start: apt.scheduled_at,
                end: new Date(new Date(apt.scheduled_at).getTime() + (apt.duration_minutes || 60) * 60000).toISOString(),
                status: apt.status,
                color: getStatusColor(apt.status),
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

    const handleCreateAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient || !appointmentDate) return;

        try {
            await api.createAppointment({
                client_id: selectedClient,
                scheduled_at: appointmentDate,
                notes: appointmentNotes,
            });
            setShowNewAppointment(false);
            setSelectedClient(null);
            setAppointmentDate('');
            setAppointmentNotes('');
            loadData();
        } catch {
            console.error('Failed to create appointment');
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
                        <button
                            className="btn-primary"
                            onClick={() => setShowNewAppointment(true)}
                        >
                            + New Appointment
                        </button>
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
                                eventClick={(info) => {
                                    const apt = info.event.extendedProps.appointment;
                                    alert(`Appointment with ${apt.client?.user?.name}\nDate: ${new Date(apt.scheduled_at).toLocaleString()}\nStatus: ${apt.status}\nNotes: ${apt.notes || 'None'}`);
                                }}
                            />
                        </div>
                    )}
                </div>

                {showNewAppointment && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Create New Appointment</h3>
                            <form onSubmit={handleCreateAppointment}>
                                <div className="form-group">
                                    <label>Select Client</label>
                                    <select
                                        value={selectedClient || ''}
                                        onChange={(e) => setSelectedClient(Number(e.target.value))}
                                        required
                                    >
                                        <option value="">Choose a client...</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.user?.name} - {client.phone || client.user?.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={appointmentDate}
                                        onChange={(e) => setAppointmentDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Notes (Optional)</label>
                                    <textarea
                                        value={appointmentNotes}
                                        onChange={(e) => setAppointmentNotes(e.target.value)}
                                        placeholder="Add any notes..."
                                        rows={3}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowNewAppointment(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Create Appointment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </LawFirmLayout>
    );
}
