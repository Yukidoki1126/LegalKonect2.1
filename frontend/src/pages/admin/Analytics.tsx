import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { Appointment } from '../../types';
import './AdminDashboard.css';

export default function Analytics() {
    const [topSpecs, setTopSpecs] = useState<{ name: string; count: number }[]>([]);
    const [topFirms, setTopFirms] = useState<{ id: number; firm_name: string; completed_appointments: number }[]>([]);
    const [descriptive, setDescriptive] = useState<{
        most_performing: { id: number; firm_name: string; completed_appointments: number } | null;
        most_rated: { id: number; firm_name: string; average_rating: number; rating_count: number } | null;
        insights: string[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [dashboardData, appointmentData, appointmentsResponse] = await Promise.all([
                api.getAdminDashboard(),
                api.getAppointmentAnalytics(),
                api.getAdminAppointments()
            ]);

            console.log('===== ANALYTICS DEBUG =====');
            console.log('Dashboard Data:', dashboardData);
            console.log('Appointment Data:', appointmentData);
            console.log('==========================');

            // Handle empty data gracefully
            const topSpecsData = Array.isArray(dashboardData.top_specializations)
                ? dashboardData.top_specializations
                : [];

            const descriptiveData = appointmentData.descriptive || {
                most_performing: null,
                most_rated: null,
                insights: []
            };

            // Calculate top 5 performing firms from appointments
            const appointments = appointmentsResponse.data || [];
            const firmPerformance: { [key: string]: { id: number; firm_name: string; count: number } } = {};

            appointments.forEach((apt: Appointment) => {
                if (apt.status === 'completed' && apt.law_firm) {
                    const firmId = apt.law_firm.id;
                    if (!firmPerformance[firmId]) {
                        firmPerformance[firmId] = {
                            id: firmId,
                            firm_name: apt.law_firm.firm_name,
                            count: 0
                        };
                    }
                    firmPerformance[firmId].count++;
                }
            });

            const topFirmsData = Object.values(firmPerformance)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(firm => ({
                    id: firm.id,
                    firm_name: firm.firm_name,
                    completed_appointments: firm.count
                }));

            setTopSpecs(topSpecsData);
            setTopFirms(topFirmsData);
            setDescriptive(descriptiveData);

            // Log if data is empty to help debugging
            if (topSpecsData.length === 0) {
                console.warn('⚠️ No specialization data found.');
            } else {
                console.log('✅ Loaded', topSpecsData.length, 'specializations');
            }

            if (descriptiveData.insights && descriptiveData.insights.length > 0) {
                console.log('✅ Loaded', descriptiveData.insights.length, 'insights');
            } else {
                console.warn('⚠️ No insights generated yet.');
            }

            console.log('✅ Loaded', topFirmsData.length, 'top performing firms');
        } catch (error) {
            console.error('❌ Failed to load analytics data:', error);
            // Set empty state on error
            setTopSpecs([]);
            setTopFirms([]);
            setDescriptive({
                most_performing: null,
                most_rated: null,
                insights: []
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                {/* Header Section */}
                <div className="page-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.5rem' }}>System Analytics</h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                            Comprehensive insights and performance metrics
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading analytics...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Top Performance Metrics */}
                        <section>
                            <h3 style={{
                                fontSize: '1.1rem',
                                marginBottom: '1.25rem',
                                fontWeight: '600',
                                color: 'rgba(255,255,255,0.95)'
                            }}>
                                Performance Overview
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1.5fr 1fr',
                                gap: '1.5rem'
                            }}>
                                {/* Top 5 Performing Firms Histogram */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    padding: '1.5rem',
                                    borderRadius: '12px'
                                }}>
                                    <h4 style={{
                                        fontSize: '0.85rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        opacity: 0.7,
                                        marginBottom: '1.25rem'
                                    }}>
                                        Top 5 Performing Law Firms
                                    </h4>
                                    {topFirms && topFirms.length > 0 ? (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-around',
                                            gap: '0.5rem',
                                            padding: '1rem 0.5rem',
                                        }}>
                                            {topFirms.map((firm, index) => {
                                                const maxHeight = 150;
                                                const barHeight = (firm.completed_appointments / (topFirms[0]?.completed_appointments || 1)) * maxHeight;
                                                const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

                                                return (
                                                    <div key={firm.id} style={{
                                                        flex: '0 1 18%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        minWidth: '60px'
                                                    }}>
                                                        {/* Count label on top */}
                                                        <div style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '700',
                                                            color: colors[index],
                                                            marginBottom: '0.5rem',
                                                            height: '1.5rem'
                                                        }}>
                                                            {firm.completed_appointments}
                                                        </div>

                                                        {/* Bar container with fixed height */}
                                                        <div style={{
                                                            width: '100%',
                                                            height: `${maxHeight}px`,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'flex-end',
                                                            borderBottom: '2px solid rgba(255,255,255,0.1)',
                                                            paddingBottom: 0
                                                        }}>
                                                            {/* Vertical bar */}
                                                            <div style={{
                                                                width: '100%',
                                                                height: `${barHeight}px`,
                                                                background: `linear-gradient(180deg, ${colors[index]} 0%, ${colors[index]}dd 100%)`,
                                                                borderRadius: '8px 8px 0 0',
                                                                transition: 'all 0.6s ease',
                                                                boxShadow: index === 0 ? `0 0 20px ${colors[index]}80` : `0 4px 10px ${colors[index]}40`,
                                                                position: 'relative',
                                                                cursor: 'pointer'
                                                            }}
                                                            title={`${firm.firm_name}: ${firm.completed_appointments} completed`}
                                                            >
                                                                {/* Subtle shine effect */}
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    height: '50%',
                                                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                                                                    borderRadius: '8px 8px 0 0'
                                                                }}></div>
                                                            </div>
                                                        </div>

                                                        {/* Firm name below */}
                                                        <div style={{
                                                            fontSize: '0.7rem',
                                                            textAlign: 'center',
                                                            color: 'rgba(255,255,255,0.7)',
                                                            fontWeight: '500',
                                                            lineHeight: '1.2',
                                                            marginTop: '0.75rem',
                                                            height: '2rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            {firm.firm_name.split(' ').slice(0, 2).join(' ')}
                                                        </div>

                                                        {/* Rank badge */}
                                                        <div style={{
                                                            fontSize: '0.65rem',
                                                            fontWeight: '600',
                                                            color: colors[index],
                                                            background: `${colors[index]}20`,
                                                            padding: '0.15rem 0.5rem',
                                                            borderRadius: '10px',
                                                            marginTop: '0.25rem'
                                                        }}>
                                                            #{index + 1}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p style={{ textAlign: 'center', opacity: 0.6, padding: '2rem' }}>
                                            No performance data available
                                        </p>
                                    )}
                                </div>

                                {/* Highest Rated Firm */}
                                <div className="analytics-card highlight" style={{
                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{
                                            width: '3rem',
                                            height: '3rem',
                                            borderRadius: '12px',
                                            background: 'rgba(245, 158, 11, 0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            color: '#f59e0b',
                                            fontWeight: 'bold'
                                        }}>
                                            ★
                                        </div>
                                        <div className="card-content" style={{ flex: 1 }}>
                                            <h4 style={{
                                                fontSize: '0.85rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                opacity: 0.7,
                                                marginBottom: '0.75rem'
                                            }}>
                                                Highest Rated Firm
                                            </h4>
                                            {descriptive?.most_rated ? (
                                                <>
                                                    <p className="firm-name" style={{
                                                        fontSize: '1.25rem',
                                                        fontWeight: '600',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        {descriptive.most_rated.firm_name}
                                                    </p>
                                                    <p style={{
                                                        fontSize: '0.9rem',
                                                        color: 'rgba(255,255,255,0.7)'
                                                    }}>
                                                        <strong style={{ color: '#f59e0b', fontSize: '1.5rem' }}>
                                                            {descriptive.most_rated.average_rating}
                                                        </strong> average rating from {descriptive.most_rated.rating_count} reviews
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="no-data">No data available</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Two Column Layout: Specializations + Insights */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '2rem',
                            alignItems: 'start'
                        }}>
                            {/* Specializations Chart - Compact */}
                            <section style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <h3 style={{
                                    fontSize: '1rem',
                                    marginBottom: '1rem',
                                    fontWeight: '600',
                                    color: 'rgba(255,255,255,0.95)'
                                }}>
                                    Top Legal Specializations
                                </h3>
                                <div className="specialization-chart">
                                    {topSpecs && Array.isArray(topSpecs) && topSpecs.length > 0 ? (
                                        topSpecs.slice(0, 5).map((spec, index) => (
                                            <div key={spec.name} style={{ marginBottom: '1rem' }}>
                                                <div style={{
                                                    marginBottom: '0.4rem',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{
                                                            fontWeight: '600',
                                                            color: '#3b82f6',
                                                            fontSize: '0.75rem',
                                                            minWidth: '1.5rem'
                                                        }}>
                                                            #{index + 1}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.9rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            {spec.name}
                                                        </span>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '0.95rem',
                                                        fontWeight: '600',
                                                        color: '#3b82f6'
                                                    }}>
                                                        {spec.count}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    height: '6px',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    borderRadius: '3px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div
                                                        style={{
                                                            width: `${(spec.count / (topSpecs[0]?.count || 1)) * 100}%`,
                                                            height: '100%',
                                                            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                                            transition: 'width 0.6s ease'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.7 }}>
                                                No data available
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Specializations Distribution Pie Chart */}
                            <section style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                height: '100%'
                            }}>
                                <h3 style={{
                                    fontSize: '1rem',
                                    marginBottom: '1rem',
                                    fontWeight: '600',
                                    color: 'rgba(255,255,255,0.95)'
                                }}>
                                    Distribution Overview
                                </h3>
                                {topSpecs && Array.isArray(topSpecs) && topSpecs.length > 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '1.5rem',
                                        marginTop: '1rem'
                                    }}>
                                        {/* Pie Chart */}
                                        <div style={{
                                            width: '180px',
                                            height: '180px',
                                            borderRadius: '50%',
                                            position: 'relative',
                                            background: (() => {
                                                const total = topSpecs.reduce((sum, s) => sum + s.count, 0);
                                                const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                                                const gradientStops: string[] = [];
                                                let currentPercent = 0;

                                                topSpecs.slice(0, 5).forEach((spec, index) => {
                                                    const percentage = (spec.count / total) * 100;
                                                    gradientStops.push(`${colors[index]} ${currentPercent}% ${currentPercent + percentage}%`);
                                                    currentPercent += percentage;
                                                });

                                                return `conic-gradient(${gradientStops.join(', ')})`;
                                            })()
                                        }}>
                                            {/* Center hole for donut effect */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: '110px',
                                                height: '110px',
                                                borderRadius: '50%',
                                                background: 'rgba(17, 24, 39, 0.95)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#3b82f6' }}>
                                                    {topSpecs.reduce((sum, s) => sum + s.count, 0)}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Total
                                                </div>
                                            </div>
                                        </div>

                                        {/* Legend */}
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.6rem',
                                            width: '100%'
                                        }}>
                                            {topSpecs.slice(0, 5).map((spec, index) => {
                                                const total = topSpecs.reduce((sum, s) => sum + s.count, 0);
                                                const percentage = ((spec.count / total) * 100).toFixed(1);
                                                const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                                                return (
                                                    <div key={spec.name} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.6rem',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        <div style={{
                                                            width: '10px',
                                                            height: '10px',
                                                            borderRadius: '2px',
                                                            background: colors[index],
                                                            flexShrink: 0
                                                        }}></div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <span style={{
                                                                fontWeight: '500',
                                                                marginRight: '0.5rem'
                                                            }}>
                                                                {spec.name}
                                                            </span>
                                                            <span style={{
                                                                opacity: 0.6,
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                {percentage}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                            No distribution data
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Key Insights Section */}
                        <section>
                            <h3 style={{
                                fontSize: '1.1rem',
                                marginBottom: '1.25rem',
                                fontWeight: '600',
                                color: 'rgba(255,255,255,0.95)'
                            }}>
                                Key Insights
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {descriptive?.insights && Array.isArray(descriptive.insights) && descriptive.insights.length > 0 ? (
                                    descriptive.insights.map((insight, index) => (
                                        <div key={index} style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            padding: '1.5rem',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            gap: '1rem'
                                        }}>
                                            <div style={{
                                                fontSize: '1.25rem',
                                                fontWeight: 'bold',
                                                width: '2.5rem',
                                                height: '2.5rem',
                                                borderRadius: '8px',
                                                background: 'rgba(59, 130, 246, 0.15)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#3b82f6',
                                                flexShrink: 0
                                            }}>
                                                {index + 1}
                                            </div>
                                            <p style={{
                                                fontSize: '0.95rem',
                                                lineHeight: '1.6',
                                                color: 'rgba(255,255,255,0.85)'
                                            }}>
                                                {insight}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        textAlign: 'center',
                                        padding: '3rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{
                                            fontSize: '2.5rem',
                                            color: 'rgba(255,255,255,0.2)',
                                            marginBottom: '1rem'
                                        }}>
                                            ○
                                        </div>
                                        <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                                            No insights available yet
                                        </p>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                                            Insights will be generated once there are completed appointments and ratings
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
