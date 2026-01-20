import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Appointment } from '../../types';
import LawFirmLayout from '../../components/lawfirm/LawFirmLayout';
import './LawFirmDashboard.css';

export default function LawFirmDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const lawFirm = user?.law_firm;
    const isApproved = lawFirm?.verification_status === 'approved';
    const isPending = lawFirm?.verification_status === 'pending';

    useEffect(() => {
        if (isApproved) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [isApproved]);

    const loadData = async () => {
        try {
            const appointmentsData = await api.getLawFirmAppointments();
            setAppointments(appointmentsData);
        } catch {
            console.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await api.updateAppointment(id, { status });
            loadData();
        } catch {
            console.error('Failed to update appointment');
        }
    };

    return (
        <LawFirmLayout>
            <div className="law-firm-dashboard">
                <div className="page-header">
                    <h2>📊 Dashboard Overview</h2>
                    <p>Manage your appointments and client interactions</p>
                </div>

                {!isApproved ? (
                    <div className="status-banner">
                        {isPending ? (
                            <>
                                <div className="status-icon pending">⏳</div>
                                <h2>Verification Pending</h2>
                                <p>Your law firm registration is being reviewed by our admin team. You'll be able to access the full dashboard once approved.</p>
                            </>
                        ) : (
                            <>
                                <div className="status-icon rejected">❌</div>
                                <h2>Verification Rejected</h2>
                                <p>Reason: {lawFirm?.rejection_reason || 'No reason provided'}</p>
                                <p>Please contact support for more information.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="dashboard-grid">
                        <section className="stats-overview">
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-content">
                                    <h3>{appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length}</h3>
                                    <p>Upcoming Appointments</p>
                                </div>
                            </div>
                            <div className="stat-card success">
                                <div className="stat-icon">✅</div>
                                <div className="stat-content">
                                    <h3>{appointments.filter(a => a.status === 'completed').length}</h3>
                                    <p>Completed Cases</p>
                                </div>
                            </div>
                        </section>

                        <section className="appointments-section">
                            <div className="section-header">
                                <h3>📋 Recent Appointments</h3>
                                <button className="btn-text" onClick={() => window.location.href='/law-firm/calendar'}>View All</button>
                            </div>
                            <div className="appointments-list">
                                {loading ? (
                                    <div className="loading">Loading...</div>
                                ) : appointments.length === 0 ? (
                                    <p className="no-data">No appointments found</p>
                                ) : (
                                    appointments
                                        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
                                        .slice(0, 5)
                                        .map((apt) => (
                                            <div key={apt.id} className="appointment-card">
                                                <div className="apt-info">
                                                    <h4>{apt.client?.user?.name}</h4>
                                                    <p>{new Date(apt.scheduled_at).toLocaleString()}</p>
                                                    <span className={`status-badge ${apt.status}`}>{apt.status}</span>
                                                </div>
                                                <div className="apt-actions">
                                                    {apt.status === 'pending' && (
                                                        <button className="btn-approve" onClick={() => handleUpdateStatus(apt.id, 'confirmed')}>Confirm</button>
                                                    )}
                                                    {apt.status === 'confirmed' && (
                                                        <button className="btn-approve" onClick={() => handleUpdateStatus(apt.id, 'completed')}>Complete</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </LawFirmLayout>
    );
}
