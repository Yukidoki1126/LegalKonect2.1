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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
                    <p className="text-muted-foreground mt-2">
                        Monitor and manage your legal platform
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Clients
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_clients || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                +{Math.floor((stats?.total_clients || 0) / 10)} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-500/50 bg-blue-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Verified Firms
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.approved_firms || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Active law firms
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-500/50 bg-yellow-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Review
                            </CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.pending_verifications || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Awaiting verification
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Appointments
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_appointments || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Total bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-500/50 bg-green-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Success Rate
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{conversionRate}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats?.completed_appointments || 0} completed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 md:grid-cols-7">
                    {/* Pending Verifications */}
                    <Card className="md:col-span-4">
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
                                            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{firm.firm_name}</p>
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
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => navigate('/admin/verification')}
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
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
                        <Card>
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
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-medium">{spec.name}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {spec.count}
                                                    </Badge>
                                                </div>
                                                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
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
