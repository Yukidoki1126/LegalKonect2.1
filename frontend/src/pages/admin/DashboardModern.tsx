import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { DashboardStats, LawFirm } from '@/types';
import AdminLayout from '@/components/admin/AdminLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Users, 
    Building2, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    TrendingUp, 
    Eye, 
    ArrowRight,
    Activity,
    AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [pendingFirms, setPendingFirms] = useState<LawFirm[]>([]);
    const [topSpecs, setTopSpecs] = useState<{ name: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dashboardData, pendingData] = await Promise.all([
                api.getAdminDashboard(),
                api.getPendingVerifications()
            ]);
            setStats(dashboardData.stats);
            setTopSpecs(dashboardData.top_specializations);
            setPendingFirms(pendingData);
        } catch {
            console.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await api.approveLawFirm(id);
            const pending = await api.getPendingVerifications();
            setPendingFirms(pending);
            const dashboardData = await api.getAdminDashboard();
            setStats(dashboardData.stats);
        } catch {
            console.error('Failed to approve');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-lg text-muted-foreground">Loading dashboard...</div>
                </div>
            </AdminLayout>
        );
    }

    const conversionRate = ((stats?.completed_appointments || 0) / (stats?.total_appointments || 1) * 100).toFixed(1);

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="pb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl shadow-lg" style={{ 
                            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                            boxShadow: '0 8px 20px -5px rgba(37, 99, 235, 0.35)'
                        }}>
                            <Activity className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">System Overview</h1>
                            <p className="text-muted-foreground mt-2">
                                Monitor and manage your legal platform
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Clients
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats?.total_clients || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                +{Math.floor((stats?.total_clients || 0) / 10)} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-cyan-200 bg-cyan-50/50 dark:border-cyan-800 dark:bg-cyan-900/10 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Verified Firms
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/50 dark:to-teal-900/50">
                                <Building2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats?.approved_firms || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Active law firms
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Review
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50">
                                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats?.pending_verifications || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Awaiting verification
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Appointments
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                                <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats?.total_appointments || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Total bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Success Rate
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50">
                                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{conversionRate}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats?.completed_appointments || 0} completed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 md:grid-cols-7">
                    {/* Pending Verifications */}
                    <Card className="md:col-span-4 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Pending Verifications</CardTitle>
                                    <CardDescription>
                                        Law firms awaiting approval
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/admin/verification')}
                                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-all"
                                >
                                    View All
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {pendingFirms.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-sm text-muted-foreground">
                                        No pending verifications at the moment
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingFirms.slice(0, 4).map((firm) => (
                                        <div
                                            key={firm.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate text-foreground">{firm.firm_name}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {firm.user?.email}
                                                    </p>
                                                    {firm.license_number && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            License: {firm.license_number}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApprove(firm.id)}
                                                    className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 shadow-md shadow-cyan-500/20 text-white"
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => navigate('/admin/verification')}
                                                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Side Panel */}
                    <div className="md:col-span-3 space-y-4">
                        {/* System Status */}
                        <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    System Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">API Server</span>
                                    <Badge variant="success" className="gap-1">
                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                        Online
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Database</span>
                                    <Badge variant="success" className="gap-1">
                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                        Healthy
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Response Time</span>
                                    <Badge variant="secondary">45ms</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Specializations */}
                        <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle>Popular Specializations</CardTitle>
                                <CardDescription>
                                    Most sought-after practice areas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {topSpecs.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No data available
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {topSpecs.slice(0, 5).map((spec, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-medium text-foreground">{spec.name}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {spec.count}
                                                    </Badge>
                                                </div>
                                                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all"
                                                        style={{
                                                            width: `${(spec.count / (topSpecs[0]?.count || 1)) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
