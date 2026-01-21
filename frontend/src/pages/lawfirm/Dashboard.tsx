import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Appointment } from '../../types';
import LawFirmLayout from '../../components/lawfirm/LawFirmLayout';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './LawFirmDashboard.css';

export default function LawFirmDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'year'>('7days');

    const lawFirm = user?.law_firm;
    const isApproved = lawFirm?.verification_status === 'approved';
    const isPending = lawFirm?.verification_status === 'pending';

    const loadData = async () => {
        try {
            const appointmentsData = await api.getLawFirmAppointments();
            setAppointments(appointmentsData);
            setLastRefresh(new Date());
        } catch (error) {
            console.error('Failed to load appointments', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isApproved) {
            loadData();

            // Auto-refresh every 30 seconds to check for new appointment requests
            const refreshInterval = setInterval(() => {
                loadData();
            }, 30000); // 30 seconds

            return () => clearInterval(refreshInterval);
        } else {
            setLoading(false);
        }
    }, [isApproved]);

    const graphData = useMemo(() => {
        // Determine number of days based on selected range
        let numDays: number;
        let dateFormat: Intl.DateTimeFormatOptions;

        switch (timeRange) {
            case '7days':
                numDays = 7;
                dateFormat = { month: 'short', day: 'numeric' };
                break;
            case '30days':
                numDays = 30;
                dateFormat = { month: 'short', day: 'numeric' };
                break;
            case '90days':
                numDays = 90;
                dateFormat = { month: 'short', day: 'numeric' };
                break;
            case 'year':
                numDays = 365;
                dateFormat = { month: 'short', day: 'numeric' };
                break;
        }

        const dateRange = [...Array(numDays)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (numDays - 1 - i));
            return d.toISOString().split('T')[0];
        });

        const counts = dateRange.reduce((acc, date) => {
            acc[date] = { confirmed: 0, cancelled: 0, completed: 0 };
            return acc;
        }, {} as Record<string, { confirmed: number, cancelled: number, completed: number }>);

        appointments.forEach(apt => {
            const dateStr = apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z';
            const date = dateStr.split('T')[0];

            if (counts[date] !== undefined) {
                if (apt.status === 'confirmed') {
                    counts[date].confirmed++;
                } else if (apt.status === 'cancelled') {
                    counts[date].cancelled++;
                } else if (apt.status === 'completed') {
                    counts[date].completed++;
                }
            }
        });

        // For large ranges, aggregate data to avoid too many data points
        let aggregatedData;
        if (timeRange === 'year') {
            // Group by month for year view
            const monthlyData: Record<string, { confirmed: number, cancelled: number, completed: number }> = {};
            dateRange.forEach(date => {
                const monthKey = date.substring(0, 7); // YYYY-MM
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { confirmed: 0, cancelled: 0, completed: 0 };
                }
                monthlyData[monthKey].confirmed += counts[date].confirmed;
                monthlyData[monthKey].cancelled += counts[date].cancelled;
                monthlyData[monthKey].completed += counts[date].completed;
            });

            aggregatedData = Object.keys(monthlyData).sort().map(monthKey => ({
                date: new Date(monthKey + '-01').toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
                confirmed: monthlyData[monthKey].confirmed,
                cancelled: monthlyData[monthKey].cancelled,
                completed: monthlyData[monthKey].completed
            }));
        } else if (timeRange === '90days') {
            // Group by week for 90 days view
            const weeklyData: Record<string, { confirmed: number, cancelled: number, completed: number, startDate: string }> = {};
            dateRange.forEach(date => {
                const d = new Date(date);
                const weekStart = new Date(d);
                weekStart.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
                const weekKey = weekStart.toISOString().split('T')[0];

                if (!weeklyData[weekKey]) {
                    weeklyData[weekKey] = { confirmed: 0, cancelled: 0, completed: 0, startDate: weekKey };
                }
                weeklyData[weekKey].confirmed += counts[date].confirmed;
                weeklyData[weekKey].cancelled += counts[date].cancelled;
                weeklyData[weekKey].completed += counts[date].completed;
            });

            aggregatedData = Object.keys(weeklyData).sort().map(weekKey => ({
                date: new Date(weekKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                confirmed: weeklyData[weekKey].confirmed,
                cancelled: weeklyData[weekKey].cancelled,
                completed: weeklyData[weekKey].completed
            }));
        } else {
            // Daily data for 7 and 30 days
            aggregatedData = dateRange.map(date => ({
                date: new Date(date).toLocaleDateString(undefined, dateFormat),
                confirmed: counts[date].confirmed,
                cancelled: counts[date].cancelled,
                completed: counts[date].completed
            }));
        }

        return aggregatedData;
    }, [appointments, timeRange]);

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
                    {isApproved && (
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                            🔄 Auto-refreshing • Last updated: {lastRefresh.toLocaleTimeString()}
                        </div>
                    )}
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

                        <div className="dashboard-main-row">
                            <section className="analytics-section">
                                <div className="section-header">
                                    <h3>📈 Appointment Trends</h3>
                                    <div className="time-range-filters">
                                        <button
                                            className={`filter-btn ${timeRange === '7days' ? 'active' : ''}`}
                                            onClick={() => setTimeRange('7days')}
                                        >
                                            7 Days
                                        </button>
                                        <button
                                            className={`filter-btn ${timeRange === '30days' ? 'active' : ''}`}
                                            onClick={() => setTimeRange('30days')}
                                        >
                                            30 Days
                                        </button>
                                        <button
                                            className={`filter-btn ${timeRange === '90days' ? 'active' : ''}`}
                                            onClick={() => setTimeRange('90days')}
                                        >
                                            90 Days
                                        </button>
                                        <button
                                            className={`filter-btn ${timeRange === 'year' ? 'active' : ''}`}
                                            onClick={() => setTimeRange('year')}
                                        >
                                            Last Year
                                        </button>
                                    </div>
                                </div>
                                <div className="chart-container">
                                    {appointments.length === 0 ? (
                                        <div style={{
                                            height: '300px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'rgba(255,255,255,0.5)',
                                            fontSize: '14px'
                                        }}>
                                            No appointment data available for the selected time range
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={graphData}>
                                                <defs>
                                                    <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                                    </linearGradient>
                                                    <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                    allowDecimals={false}
                                                    domain={[0, 'auto']}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#1a1a2e',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                    itemStyle={{ fontSize: '12px' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="confirmed"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorConfirmed)"
                                                    name="Confirmed"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="completed"
                                                    stroke="#22c55e"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorCompleted)"
                                                    name="Completed"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="cancelled"
                                                    stroke="#ef4444"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorCancelled)"
                                                    name="Cancelled"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </section>

                            <section className="appointments-section smaller">
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
                                            .sort((a, b) => {
                                                const dateB = b.scheduled_at.includes('T') ? b.scheduled_at : b.scheduled_at.replace(' ', 'T') + 'Z';
                                                const dateA = a.scheduled_at.includes('T') ? a.scheduled_at : a.scheduled_at.replace(' ', 'T') + 'Z';
                                                return new Date(dateB).getTime() - new Date(dateA).getTime();
                                            })
                                            .slice(0, 5)
                                            .map((apt) => {
                                                const dateStr = apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z';
                                                return (
                                                    <div key={apt.id} className="appointment-card mini">
                                                        <div className="apt-info">
                                                            <h4>{apt.client?.user?.name}</h4>
                                                            <p>{new Date(dateStr).toLocaleDateString()}</p>
                                                            <span className={`status-badge ${apt.status}`}>{apt.status}</span>
                                                        </div>
                                                        <div className="apt-actions">
                                                            {apt.status === 'pending' && (
                                                                <button className="btn-approve-mini" onClick={() => handleUpdateStatus(apt.id, 'confirmed')} title="Confirm">✓</button>
                                                            )}
                                                            {apt.status === 'confirmed' && (
                                                                <button 
                                                                    className="btn-approve-mini" 
                                                                    onClick={() => handleUpdateStatus(apt.id, 'completed')} 
                                                                    title={new Date(dateStr) > new Date() ? "Cannot mark as completed before scheduled time" : "Complete"}
                                                                    disabled={new Date(dateStr) > new Date()}
                                                                >★</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>
        </LawFirmLayout>
    );
}
