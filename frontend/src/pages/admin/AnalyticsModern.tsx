import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    TrendingUp, 
    Award, 
    Star, 
    Building2,
    BarChart3,
    Activity,
    Users,
    Target
} from 'lucide-react';
import { Appointment } from '@/types';

export default function Analytics() {
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
            const [dashboardData, appointmentData, appointmentsResponse] = await Promise.all([
                api.getAdminDashboard(),
                api.getAppointmentAnalytics(),
                api.getAdminAppointments()
            ]);

            const topSpecsData = Array.isArray(dashboardData.top_specializations)
                ? dashboardData.top_specializations
                : [];

            const descriptiveData = appointmentData.descriptive || {
                most_performing: null,
                most_rated: null,
                insights: []
            };

            // Calculate top firms
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
                <div className="flex items-center justify-center h-96">
                    <div className="text-lg text-muted-foreground">Loading analytics...</div>
                </div>
            </AdminLayout>
        );
    }

    const maxSpecCount = Math.max(...topSpecs.map(s => s.count), 1);

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
                    <p className="text-muted-foreground mt-2">
                        Platform performance metrics and trends
                    </p>
                </div>

                {/* Top Performers */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Most Performing Firm */}
                    <Card className="border-blue-500/50 bg-blue-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-500">
                                <Award className="h-5 w-5" />
                                Top Performing Firm
                            </CardTitle>
                            <CardDescription>
                                Most completed appointments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {descriptive?.most_performing ? (
                                <div className="space-y-2">
                                    <p className="text-2xl font-bold">
                                        {descriptive.most_performing.firm_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {descriptive.most_performing.completed_appointments} completed appointments
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No data available yet
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Highest Rated Firm */}
                    <Card className="border-yellow-500/50 bg-yellow-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-500">
                                <Star className="h-5 w-5" />
                                Highest Rated Firm
                            </CardTitle>
                            <CardDescription>
                                Best client satisfaction
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {descriptive?.most_rated ? (
                                <div className="space-y-2">
                                    <p className="text-2xl font-bold">
                                        {descriptive.most_rated.firm_name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                        i < Math.round(descriptive.most_rated?.average_rating || 0)
                                                            ? 'fill-yellow-500 text-yellow-500'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {descriptive.most_rated.average_rating.toFixed(1)} ({descriptive.most_rated.rating_count} reviews)
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No ratings available yet
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="specializations" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="specializations" className="gap-2">
                            <Target className="h-4 w-4" />
                            Specializations
                        </TabsTrigger>
                        <TabsTrigger value="firms" className="gap-2">
                            <Building2 className="h-4 w-4" />
                            Top Firms
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="gap-2">
                            <Activity className="h-4 w-4" />
                            Insights
                        </TabsTrigger>
                    </TabsList>

                    {/* Specializations Tab */}
                    <TabsContent value="specializations" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Practice Area Trends</CardTitle>
                                <CardDescription>
                                    Distribution of law firms by specialization
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {topSpecs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                                        <p className="text-sm text-muted-foreground">
                                            No specialization data available
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {topSpecs.map((spec, index) => (
                                            <div key={spec.name} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                                            {index + 1}
                                                        </div>
                                                        <span className="font-medium">{spec.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="secondary">
                                                            {spec.count} {spec.count === 1 ? 'firm' : 'firms'}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground w-12 text-right">
                                                            {((spec.count / maxSpecCount) * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{
                                                            width: `${(spec.count / maxSpecCount) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Top Firms Tab */}
                    <TabsContent value="firms" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performing Firms</CardTitle>
                                <CardDescription>
                                    Law firms with most completed appointments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {topFirms.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                                        <p className="text-sm text-muted-foreground">
                                            No firm performance data available
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {topFirms.map((firm, index) => (
                                            <div
                                                key={firm.id}
                                                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-lg ${
                                                        index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                        index === 1 ? 'bg-gray-500/20 text-gray-400' :
                                                        index === 2 ? 'bg-orange-500/20 text-orange-500' :
                                                        'bg-primary/10 text-primary'
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{firm.firm_name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {firm.completed_appointments} completed appointments
                                                        </p>
                                                    </div>
                                                </div>
                                                {index === 0 && (
                                                    <Award className="h-6 w-6 text-yellow-500" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Insights Tab */}
                    <TabsContent value="insights" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>AI-Generated Insights</CardTitle>
                                <CardDescription>
                                    Key observations and recommendations
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!descriptive?.insights || descriptive.insights.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                                        <p className="text-sm text-muted-foreground text-center">
                                            No insights generated yet<br />
                                            More data needed for AI analysis
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {descriptive.insights.map((insight, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-3 p-4 rounded-lg border border-border bg-accent/30"
                                            >
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <TrendingUp className="h-4 w-4 text-primary" />
                                                    </div>
                                                </div>
                                                <p className="text-sm leading-relaxed">{insight}</p>
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
