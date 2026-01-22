import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { LawFirm } from '@/types';
import AdminLayout from '@/components/admin/AdminLayoutNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { 
    Building2, 
    Mail, 
    Phone, 
    MapPin, 
    CheckCircle2, 
    XCircle, 
    Eye,
    FileText,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function Verification() {
    const [pendingFirms, setPendingFirms] = useState<LawFirm[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
    const [viewingFirm, setViewingFirm] = useState<LawFirm | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const pending = await api.getPendingVerifications();
            setPendingFirms(pending);
        } catch {
            console.error('Failed to load pending verifications');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await api.approveLawFirm(id);
            setViewingFirm(null);
            loadData();
        } catch {
            console.error('Failed to approve');
        }
    };

    const handleReject = async (id: number) => {
        if (!rejectReason.trim()) return;
        try {
            await api.rejectLawFirm(id, rejectReason);
            setShowRejectModal(null);
            setRejectReason('');
            setViewingFirm(null);
            loadData();
        } catch {
            console.error('Failed to reject');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-lg text-muted-foreground">Loading verifications...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Law Firm Verification</h1>
                    <p className="text-muted-foreground mt-2">
                        Review and approve new law firm registrations
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Review
                            </CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingFirms.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Verifications</CardTitle>
                        <CardDescription>
                            {pendingFirms.length} law firms awaiting approval
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pendingFirms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <CheckCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium">All Caught Up!</p>
                                <p className="text-sm text-muted-foreground">
                                    No pending verifications at the moment
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingFirms.map((firm) => (
                                    <div
                                        key={firm.id}
                                        className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors gap-4"
                                    >
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Building2 className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div>
                                                    <p className="font-semibold text-lg">{firm.firm_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {firm.user?.name}
                                                    </p>
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                        <span className="text-muted-foreground truncate">
                                                            {firm.user?.email}
                                                        </span>
                                                    </div>
                                                    {firm.phone && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                            <span className="text-muted-foreground">
                                                                {firm.phone}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {firm.license_number && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                            <Badge variant="outline" className="font-mono text-xs">
                                                                {firm.license_number}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>

                                                {firm.specializations && firm.specializations.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {firm.specializations.map((s) => (
                                                            <Badge key={s.id} variant="secondary" className="text-xs">
                                                                {s.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setViewingFirm(firm)}
                                                className="w-full"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(firm.id)}
                                                className="w-full"
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => setShowRejectModal(firm.id)}
                                                className="w-full"
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View Details Dialog */}
            <Dialog open={!!viewingFirm} onOpenChange={() => setViewingFirm(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {viewingFirm?.firm_name}
                        </DialogTitle>
                        <DialogDescription>
                            Law firm verification details
                        </DialogDescription>
                    </DialogHeader>

                    {viewingFirm && (
                        <div className="space-y-6">
                            {/* Contact Information */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Email:</span>
                                        <span className="text-muted-foreground">{viewingFirm.user?.email}</span>
                                    </div>
                                    {viewingFirm.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Phone:</span>
                                            <span className="text-muted-foreground">{viewingFirm.phone}</span>
                                        </div>
                                    )}
                                    {viewingFirm.address && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <span className="font-medium">Address:</span>
                                            <span className="text-muted-foreground flex-1">{viewingFirm.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* License Information */}
                            {viewingFirm.license_number && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">License Information</h3>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="outline" className="font-mono">
                                            {viewingFirm.license_number}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {/* Specializations */}
                            {viewingFirm.specializations && viewingFirm.specializations.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Specializations</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingFirm.specializations.map((s) => (
                                            <Badge key={s.id} variant="secondary">
                                                {s.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {viewingFirm.description && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">About</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {viewingFirm.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingFirm(null)}>
                            Close
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setShowRejectModal(viewingFirm?.id || null);
                            }}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                        </Button>
                        <Button onClick={() => viewingFirm && handleApprove(viewingFirm.id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={!!showRejectModal} onOpenChange={() => setShowRejectModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Reject Law Firm
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this law firm application
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="reason">Rejection Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Enter the reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="mt-2"
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectModal(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => showRejectModal && handleReject(showRejectModal)}
                            disabled={!rejectReason.trim()}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject Application
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
