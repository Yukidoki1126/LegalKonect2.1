import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats } from '@/types';
import {
    TrendingUp,
    Award,
    Star,
    Building2,
    BarChart3,
    Activity,
    Users,
    Target,
    Calendar,
    CheckCircle2,
    Clock,
    Lightbulb,
    Crown,
    Medal,
    Trophy,
    Loader2,
    Sparkles,
} from 'lucide-react';

// Color palette for specialization bars
const BAR_COLORS = [
    'from-blue-500 to-cyan-400',
    'from-violet-500 to-purple-400',
    'from-emerald-500 to-teal-400',
    'from-amber-500 to-yellow-400',
    'from-rose-500 to-pink-400',
    'from-indigo-500 to-blue-400',
    'from-orange-500 to-amber-400',
    'from-sky-500 to-cyan-400',
    'from-fuchsia-500 to-pink-400',
    'from-lime-500 to-green-400',
];

const MEDAL_ICONS = [Crown, Medal, Trophy];

export default function Analytics() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [topSpecs, setTopSpecs] = useState<{ name: string; count: number }[]>([]);
    const [topFirms, setTopFirms] = useState<{ id: number; firm_name: string; completed_appointments: number }[]>([]);
    const [descriptive, setDescriptive] = useState<{
        most_performing: { id: number; firm_name: string; completed_appointments: number } | null;
        most_rated: { id: number; firm_name: string; average_rating: number; rating_count: number } | null;
        insights: string[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dashboardData, appointmentData] = await Promise.all([
                api.getAdminDashboard(),
                api.getAppointmentAnalytics()
            ]);

            setStats(dashboardData.stats || null);

            const topSpecsData = Array.isArray(dashboardData.top_specializations)
                ? dashboardData.top_specializations
                : [];

            const descriptiveData = appointmentData.descriptive || {
                most_performing: null,
                most_rated: null,
                insights: []
            };

            const topFirmsData = appointmentData.top_firms || [];

            setTopSpecs(topSpecsData);
            setTopFirms(topFirmsData);
            setDescriptive(descriptiveData);
        } catch (error) {
            console.error('Failed to load analytics data:', error);
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
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-96 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-sm text-muted-foreground">Loading analytics...</p>
                </div>
            </AdminLayout>
        );
    }

    const maxSpecCount = Math.max(...topSpecs.map(s => s.count), 1);
    const totalSpecFirms = topSpecs.reduce((sum, s) => sum + s.count, 0);
    const maxFirmAppointments = topFirms.length > 0 ? Math.max(...topFirms.map(f => f.completed_appointments), 1) : 1;

    return (
        <AdminLayout>
            <div className="space-y-5 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Analytics & Insights</h1>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Platform performance metrics and trends
                        </p>
                    </div>
                    <Badge variant="secondary" className="text-xs sm:text-sm px-3 py-1.5 w-fit">
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                        Descriptive Analytics
                    </Badge>
                </div>

                {/* Summary Stats */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <Card className="relative overflow-hidden">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <Users className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground truncate">Total Clients</p>
                                        <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total_clients}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="h-5 w-5 text-violet-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground truncate">Law Firms</p>
                                        <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total_law_firms}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground truncate">Completed</p>
                                        <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.completed_appointments}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                        <Star className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground truncate">Avg Rating</p>
                                        <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.average_rating?.toFixed(1) || '—'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Spotlight: Top Performers */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Most Performing Firm */}
                    <Card className="relative overflow-hidden border-blue-500/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                        <CardContent className="p-4 sm:p-6 relative">
                            {descriptive?.most_performing ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                                            <Award className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs sm:text-sm font-medium text-blue-500 uppercase tracking-wider mb-1">Top Performer</p>
                                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-tight truncate">
                                                {descriptive.most_performing.firm_name}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-0 sm:ml-[68px]">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                                            <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                {descriptive.most_performing.completed_appointments}
                                            </span>
                                            <span className="text-xs text-blue-500/70">completed</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 py-2">
                                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                                        <Award className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Top Performing Firm</p>
                                        <p className="text-xs text-muted-foreground/70">No data available yet</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Highest Rated Firm */}
                    <Card className="relative overflow-hidden border-amber-500/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-yellow-500/5 pointer-events-none" />
                        <CardContent className="p-4 sm:p-6 relative">
                            {descriptive?.most_rated ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                                            <Star className="h-6 w-6 sm:h-7 sm:w-7 text-white fill-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs sm:text-sm font-medium text-amber-500 uppercase tracking-wider mb-1">Highest Rated</p>
                                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-tight truncate">
                                                {descriptive.most_rated.firm_name}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-0 sm:ml-[68px] flex-wrap">
                                        <div className="flex items-center gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                        i < Math.round(descriptive.most_rated?.average_rating || 0)
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-muted-foreground/30'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                            <span className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                {descriptive.most_rated.average_rating.toFixed(1)}
                                            </span>
                                            <span className="text-xs text-amber-500/70">
                                                ({descriptive.most_rated.rating_count} {descriptive.most_rated.rating_count === 1 ? 'review' : 'reviews'})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 py-2">
                                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                                        <Star className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Highest Rated Firm</p>
                                        <p className="text-xs text-muted-foreground/70">No ratings available yet</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="specializations" className="space-y-4">
                    <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
                        <TabsTrigger value="specializations" className="gap-1.5 text-xs sm:text-sm">
                            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Practice </span>Areas
                        </TabsTrigger>
                        <TabsTrigger value="firms" className="gap-1.5 text-xs sm:text-sm">
                            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Top Firms
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="gap-1.5 text-xs sm:text-sm">
                            <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Insights
                        </TabsTrigger>
                    </TabsList>

                    {/* Specializations Tab */}
                    <TabsContent value="specializations" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-2 sm:pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-base sm:text-lg">Practice Area Distribution</CardTitle>
                                        <CardDescription className="text-xs sm:text-sm">
                                            How law firms are distributed by specialization
                                        </CardDescription>
                                    </div>
                                    {topSpecs.length > 0 && (
                                        <Badge variant="outline" className="text-xs w-fit">
                                            {topSpecs.length} specializations &middot; {totalSpecFirms} firms
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {topSpecs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                            <BarChart3 className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">No specialization data available</p>
                                        <p className="text-xs text-muted-foreground/70 mt-1">Data will appear as law firms register</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 sm:space-y-5">
                                        {topSpecs.map((spec, index) => {
                                            const pct = ((spec.count / maxSpecCount) * 100);
                                            const barColor = BAR_COLORS[index % BAR_COLORS.length];
                                            return (
                                                <div key={spec.name} className="group">
                                                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                            <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br ${barColor} text-white text-xs sm:text-sm font-bold shadow-sm flex-shrink-0`}>
                                                                {index + 1}
                                                            </div>
                                                            <span className="font-medium text-sm sm:text-base text-foreground truncate">{spec.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                                                            <Badge variant="secondary" className="text-xs tabular-nums">
                                                                {spec.count} {spec.count === 1 ? 'firm' : 'firms'}
                                                            </Badge>
                                                            <span className="text-xs sm:text-sm text-muted-foreground w-10 sm:w-12 text-right tabular-nums font-medium">
                                                                {pct.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2.5 sm:h-3 rounded-full bg-secondary/60 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Top Firms Tab */}
                    <TabsContent value="firms" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-2 sm:pb-4">
                                <CardTitle className="text-base sm:text-lg">Top Performing Firms</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Ranked by most completed appointments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {topFirms.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                            <Building2 className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">No firm performance data</p>
                                        <p className="text-xs text-muted-foreground/70 mt-1">Data will appear as appointments are completed</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {topFirms.map((firm, index) => {
                                            const isTop3 = index < 3;
                                            const MedalIcon = MEDAL_ICONS[index] || null;
                                            const ringColors = [
                                                'ring-yellow-500/30 bg-gradient-to-br from-yellow-500/20 to-amber-500/10',
                                                'ring-slate-400/30 bg-gradient-to-br from-slate-400/20 to-gray-400/10',
                                                'ring-orange-500/30 bg-gradient-to-br from-orange-500/20 to-amber-600/10',
                                            ];
                                            const badgeColors = [
                                                'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
                                                'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                                                'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                                            ];
                                            const appointmentPct = (firm.completed_appointments / maxFirmAppointments) * 100;

                                            return (
                                                <div
                                                    key={firm.id}
                                                    className={`p-3 sm:p-4 rounded-xl border transition-all ${
                                                        isTop3
                                                            ? `ring-1 ${ringColors[index]} border-transparent`
                                                            : 'border-border hover:bg-accent/30'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <div className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl font-bold text-base sm:text-lg flex-shrink-0 ${
                                                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md shadow-yellow-500/20' :
                                                            index === 1 ? 'bg-gradient-to-br from-slate-300 to-gray-400 text-white shadow-md shadow-gray-400/20' :
                                                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-400/20' :
                                                            'bg-primary/10 text-primary'
                                                        }`}>
                                                            {isTop3 && MedalIcon ? (
                                                                <MedalIcon className="h-5 w-5" />
                                                            ) : (
                                                                index + 1
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                <p className="font-semibold text-sm sm:text-base text-foreground truncate">{firm.firm_name}</p>
                                                                {isTop3 && (
                                                                    <Badge variant="outline" className={`text-[10px] sm:text-xs border flex-shrink-0 ${badgeColors[index]}`}>
                                                                        #{index + 1}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-secondary/60 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                                                                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                                                                            index === 1 ? 'bg-gradient-to-r from-slate-400 to-gray-500' :
                                                                            index === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-500' :
                                                                            'bg-primary'
                                                                        }`}
                                                                        style={{ width: `${appointmentPct}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs sm:text-sm text-muted-foreground tabular-nums flex-shrink-0 font-medium">
                                                                    {firm.completed_appointments}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Insights Tab */}
                    <TabsContent value="insights" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-2 sm:pb-4">
                                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                                    Key Insights
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Observations and recommendations from your data
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!descriptive?.insights || descriptive.insights.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                            <Lightbulb className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">No insights generated yet</p>
                                        <p className="text-xs text-muted-foreground/70 mt-1">More data needed for analysis</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {descriptive.insights.map((insight, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border bg-gradient-to-r from-accent/40 to-transparent hover:from-accent/60 transition-colors"
                                            >
                                                <div className="flex-shrink-0">
                                                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 flex items-center justify-center">
                                                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Insight #{index + 1}</p>
                                                    <p className="text-xs sm:text-sm leading-relaxed text-foreground">{insight}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
