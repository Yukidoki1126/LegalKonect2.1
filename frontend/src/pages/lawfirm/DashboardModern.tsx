import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Appointment } from '@/types';
import LawFirmLayoutNew from '@/components/lawfirm/LawFirmLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    ClipboardList,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Users,
    Star,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function DashboardModern() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const lawFirm = user?.law_firm;
    const isApproved = lawFirm?.verification_status === 'approved';
    const isPending = lawFirm?.verification_status === 'pending';

    const loadData = async () => {
        try {
            const appointmentsData = await api.getLawFirmAppointments();
            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Failed to load appointments', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isApproved) {
            loadData();
            const refreshInterval = setInterval(() => {
                loadData();
            }, 30000);
            return () => clearInterval(refreshInterval);
        } else {
            setLoading(false);
        }
    }, [isApproved]);

    useEffect(() => {
        if (isPending) {
            const statusCheckInterval = setInterval(async () => {
                await refreshUser();
            }, 10000);
            return () => clearInterval(statusCheckInterval);
        }
    }, [isPending, refreshUser]);

    const stats = useMemo(() => {
        if (!isApproved) return null;

        const pending = appointments.filter(a => a.status === 'pending').length;
        const confirmed = appointments.filter(a => a.status === 'confirmed').length;
        const completed = appointments.filter(a => a.status === 'completed').length;
        const cancelled = appointments.filter(a => a.status === 'cancelled').length;

        return { pending, confirmed, completed, cancelled, total: appointments.length };
    }, [appointments, isApproved]);

    const graphData = useMemo(() => {
        if (!isApproved) return [];

        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const counts = last7Days.reduce((acc, date) => {
            acc[date] = { confirmed: 0, completed: 0 };
            return acc;
        }, {} as Record<string, { confirmed: number, completed: number }>);

        appointments.forEach(apt => {
            const dateStr = apt.scheduled_at.includes('T') ? apt.scheduled_at : apt.scheduled_at.replace(' ', 'T') + 'Z';
            const date = dateStr.split('T')[0];

            if (counts[date] !== undefined) {
                if (apt.status === 'confirmed') counts[date].confirmed++;
                if (apt.status === 'completed') counts[date].completed++;
            }
        });

        return last7Days.map(date => ({
            date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            confirmed: counts[date].confirmed,
            completed: counts[date].completed
        }));
    }, [appointments, isApproved]);

    const recentAppointments = useMemo(() => {
        return appointments
            .filter(a => a.status === 'pending' || a.status === 'confirmed')
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
            .slice(0, 5);
    }, [appointments]);

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await api.updateAppointment(id, { status });
            loadData();
        } catch {
            console.error('Failed to update appointment');
        }
    };

    if (!isApproved) {
        return (
            <LawFirmLayoutNew>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="max-w-lg w-full">
                        <CardHeader className="text-center">
                            {isPending ? (
                                <>
                                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                        <Clock className="h-8 w-8 text-yellow-500" />
                                    </div>
                                    <CardTitle className="text-2xl">Verification Pending</CardTitle>
                                    <CardDescription className="text-base">
                                        Your law firm registration is being reviewed by our admin team. You'll be able to access the full dashboard once approved.
                                    </CardDescription>
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                        <XCircle className="h-8 w-8 text-destructive" />
                                    </div>
                                    <CardTitle className="text-2xl">Verification Rejected</CardTitle>
                                    <CardDescription className="text-base">
                                        {lawFirm?.rejection_reason || 'No reason provided'}
                                    </CardDescription>
                                </>
                            )}
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                {isPending ? 'Please check back later or contact support for more information.' : 'Please update your information and resubmit.'}
                            </p>
                            <Button variant="outline" onClick={() => navigate('/law-firm/settings')}>
                                Go to Settings
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </LawFirmLayoutNew>
        );
    }

    if (loading) {
        return (
            <LawFirmLayoutNew>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading dashboard...</p>
                    </div>
                </div>
            </LawFirmLayoutNew>
        );
    }

    return (
        <LawFirmLayoutNew>
            <div className="space-y-8 p-6">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-lg">
                        Welcome back, {lawFirm?.firm_name}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Appointments</CardTitle>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <ClipboardList className="h-5 w-5 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.total || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">All time appointments</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
                            <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.pending || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
                            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.confirmed || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Upcoming appointments</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.completed || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Appointment Trends</CardTitle>
                        <CardDescription>Last 7 days performance</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={graphData}>
                                    <defs>
                                        <linearGradient id="confirmed" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="date" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="confirmed"
                                        stroke="hsl(var(--primary))"
                                        fillOpacity={1}
                                        fill="url(#confirmed)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="completed"
                                        stroke="hsl(142 76% 36%)"
                                        fillOpacity={1}
                                        fill="url(#completed)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Appointments */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Recent Appointments</CardTitle>
                            <CardDescription className="mt-1">Pending and upcoming consultations</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate('/law-firm/appointments')}>
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentAppointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Calendar className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">No upcoming appointments</p>
                                <p className="text-xs text-muted-foreground mt-1">New appointments will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-all hover:shadow-sm"
                                    >
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Users className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-base">{apt.client?.user?.name || 'Client'}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(apt.scheduled_at).toLocaleString(undefined, {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short'
                                                    })}
                                                </p>
                                                {apt.notes && (
                                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                        {apt.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                            {apt.status === 'pending' ? (
                                                <>
                                                    <Badge variant="secondary" className="whitespace-nowrap">
                                                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                                                        Pending
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                                        className="whitespace-nowrap"
                                                    >
                                                        <CheckCircle className="mr-1.5 h-4 w-4" />
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Badge className="whitespace-nowrap">
                                                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                                    Confirmed
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </LawFirmLayoutNew>
    );
}
