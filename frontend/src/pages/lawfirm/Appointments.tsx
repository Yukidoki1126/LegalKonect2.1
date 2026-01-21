import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import { Appointment } from '../../types';
import LawFirmLayout from '../../components/lawfirm/LawFirmLayout';
import './LawFirmDashboard.css';

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

        // Auto-refresh every 20 seconds to check for new appointment requests
        const refreshInterval = setInterval(() => {
            loadData(true); // Silent refresh (don't show loading spinner)
        }, 20000); // 20 seconds for more frequent updates on appointments page

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
            case 'pending': return 'status-badge pending';
            case 'confirmed': return 'status-badge confirmed';
            case 'completed': return 'status-badge completed';
            case 'cancelled': return 'status-badge cancelled';
            default: return 'status-badge';
        }
    };

    return (
        <LawFirmLayout>
            <div className="law-firm-appointments">
                <div className="page-header">
                    <h2>📋 Appointment Management</h2>
                    <p>Approve client requests and manage your schedule</p>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>🔄 Auto-refreshing every 20s • Last updated: {lastRefresh.toLocaleTimeString()}</span>
                        {newRequestCount > 0 && (
                            <span style={{
                                background: '#22c55e',
                                color: '#fff',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                animation: 'pulse 1s infinite'
                            }}>
                                🔔 {newRequestCount} New Request{newRequestCount > 1 ? 's' : ''}!
                            </span>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading appointments...</div>
                ) : (
                    <div className="appointments-container">
                        <div className="appointments-tabs">
                            <button 
                                className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
                                onClick={() => setActiveTab('pending')}
                            >
                                ⏳ Pending ({appointments.filter(a => a.status === 'pending').length})
                            </button>
                            <button 
                                className={`tab-item ${activeTab === 'confirmed' ? 'active' : ''}`}
                                onClick={() => setActiveTab('confirmed')}
                            >
                                ✅ Confirmed ({appointments.filter(a => a.status === 'confirmed').length})
                            </button>
                            <button 
                                className={`tab-item ${activeTab === 'completed' ? 'active' : ''}`}
                                onClick={() => setActiveTab('completed')}
                            >
                                ⭐ Completed ({appointments.filter(a => a.status === 'completed').length})
                            </button>
                            <button 
                                className={`tab-item ${activeTab === 'cancelled' ? 'active' : ''}`}
                                onClick={() => setActiveTab('cancelled')}
                            >
                                ✕ Declined ({appointments.filter(a => a.status === 'cancelled').length})
                            </button>
                        </div>

                        <div className="tab-content">
                            <div className="appointments-list-full">
                                {appointments.filter(a => a.status === activeTab).map(apt => (
                                    <div key={apt.id} className={`appointment-card-full ${apt.status}`}>
                                        <div className="apt-header">
                                            <div className="client-info-large">
                                                <div className="client-avatar-small" style={apt.status === 'cancelled' ? { background: '#ef4444' } : apt.status === 'completed' ? { background: '#22c55e' } : {}}>
                                                    {apt.client?.user?.name?.[0] || 'C'}
                                                </div>
                                                <div>
                                                    <h4>{apt.client?.user?.name}</h4>
                                                    {apt.status === 'pending' ? (
                                                        <span className="request-date">Requested: {new Date(apt.created_at.includes('T') ? apt.created_at : apt.created_at.replace(' ', 'T') + 'Z').toLocaleDateString()}</span>
                                                    ) : apt.status === 'cancelled' ? (
                                                        <span className="request-date">Declined on: {new Date(apt.updated_at.includes('T') ? apt.updated_at : apt.updated_at.replace(' ', 'T') + 'Z').toLocaleDateString()}</span>
                                                    ) : (
                                                        <span className="scheduled-time">📅 {new Date(apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z').toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="apt-status-actions">
                                                <span className={getStatusBadgeClass(apt.status)}>{apt.status}</span>
                                            </div>
                                        </div>
                                        
                                        {apt.status === 'cancelled' && apt.cancellation_reason && (
                                            <div className="apt-body">
                                                <div className="apt-detail">
                                                    <strong>Reason:</strong>
                                                    <p>{apt.cancellation_reason}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="apt-actions">
                                            <button 
                                                className="btn-text-small"
                                                onClick={() => setViewingClient(apt)}
                                                title="View Client Details"
                                            >
                                                👁 View
                                            </button>

                                            {apt.status === 'pending' && (
                                                <>
                                                    <button 
                                                        className="btn-primary-small"
                                                        onClick={() => openScheduleModal(apt)}
                                                        disabled={updating === apt.id}
                                                    >
                                                        Approve & Schedule
                                                    </button>
                                                    <button 
                                                        className="btn-danger-small"
                                                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                                        disabled={updating === apt.id}
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            )}

                                            {apt.status === 'confirmed' && (
                                                <>
                                                    <button 
                                                        className="btn-success-small"
                                                        onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                                        disabled={updating === apt.id || new Date(apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z') > new Date()}
                                                        title={new Date(apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z') > new Date() ? "Cannot mark as completed before scheduled time" : ""}
                                                    >
                                                        Mark Completed
                                                    </button>
                                                    <button 
                                                        className="btn-text-small"
                                                        onClick={() => openScheduleModal(apt)}
                                                        disabled={updating === apt.id}
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button 
                                                        className="btn-danger-small"
                                                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                                        disabled={updating === apt.id}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}

                                        </div>
                                    </div>
                                ))}
                                {appointments.filter(a => a.status === activeTab).length === 0 && (
                                    <p className="empty-column-msg">No {activeTab} appointments found</p>
                                )}
                            </div>
                        </div>
                    </div>
                )  }

                {viewingClient && (
                    <div className="modal-overlay" onClick={() => setViewingClient(null)}>
                        <div className="modal client-details-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>👤 Client Information</h3>
                                <button className="close-button" onClick={() => setViewingClient(null)}>✕</button>
                            </div>
                            <div className="client-details-body">
                                <div className="detail-row">
                                    <span className="detail-label">Name:</span>
                                    <span className="detail-value">{viewingClient.client?.user?.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">
                                        <a href={`mailto:${viewingClient.client?.user?.email}`}>{viewingClient.client?.user?.email}</a>
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Phone:</span>
                                    <span className="detail-value">
                                        {viewingClient.client?.phone ? (
                                            <a href={`tel:${viewingClient.client.phone}`}>{viewingClient.client.phone}</a>
                                        ) : 'Not provided'}
                                    </span>
                                </div>
                                <div className="detail-row specialization-detail">
                                    <span className="detail-label">Looking for:</span>
                                    <div className="specializations-tags">
                                        {viewingClient.client?.specializations && viewingClient.client.specializations.length > 0 ? (
                                            viewingClient.client.specializations.map(s => (
                                                <span key={s.id} className="tag-small">{s.name}</span>
                                            ))
                                        ) : (
                                            <span className="detail-value">General Consultation</span>
                                        )}
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Client's Notes:</span>
                                    <p className="detail-value" style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                        {viewingClient.notes || 'No notes provided'}
                                    </p>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-primary" onClick={() => setViewingClient(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {showScheduleModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Schedule Appointment</h3>
                            <p>Set the date and time for consultation with <strong>{showScheduleModal.client?.user?.name}</strong></p>
                            
                            <div className="form-group">
                                <label>Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    required
                                    min={new Date().toISOString().substring(0, 16)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Firm's Note (Optional)</label>
                                <textarea 
                                    value={scheduleNotes}
                                    onChange={(e) => setScheduleNotes(e.target.value)}
                                    placeholder="Type your note for the client here..."
                                    rows={4}
                                />
                            </div>

                            <div className="modal-actions">
                                <button onClick={() => setShowScheduleModal(null)}>Cancel</button>
                                <button 
                                    className="btn-primary" 
                                    disabled={!scheduleDate || updating !== null}
                                    onClick={() => handleUpdateStatus(showScheduleModal.id, 'confirmed', scheduleDate, scheduleNotes)}
                                >
                                    {updating === showScheduleModal.id ? 'Saving...' : 'Confirm Schedule'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LawFirmLayout>
    );
}
