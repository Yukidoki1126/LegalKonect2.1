import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayoutNew';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    MessageSquare,
    Search,
    Trash2,
    Eye,
    Mail,
    Clock,
    CheckCircle,
    Reply,
    Loader2,
    X,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    HelpCircle,
    Shield,
    UserPlus,
    Bug,
    FileCheck,
    MailOpen,
    Send,
} from 'lucide-react';
import api from '@/services/api';

interface ContactMsg {
    id: number;
    name: string;
    email: string;
    category: string;
    subject: string;
    message: string;
    status: string;
    admin_notes: string | null;
    admin_reply: string | null;
    replied_at: string | null;
    created_at: string;
    updated_at: string;
}

type StatusFilter = 'all' | 'unread' | 'read' | 'replied';

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-50 w-full max-w-lg mx-3 sm:mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

const categoryIcons: Record<string, React.ReactNode> = {
    general: <HelpCircle className="h-3.5 w-3.5" />,
    login: <Shield className="h-3.5 w-3.5" />,
    account: <UserPlus className="h-3.5 w-3.5" />,
    bug: <Bug className="h-3.5 w-3.5" />,
    verification: <FileCheck className="h-3.5 w-3.5" />,
    other: <MessageSquare className="h-3.5 w-3.5" />,
};

const categoryLabels: Record<string, string> = {
    general: 'General',
    login: 'Login Issue',
    account: 'Account',
    bug: 'Bug Report',
    verification: 'Verification',
    other: 'Other',
};

export default function ContactMessages() {
    const [messages, setMessages] = useState<ContactMsg[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMessages, setTotalMessages] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);

    const [selectedMessage, setSelectedMessage] = useState<ContactMsg | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [replyText, setReplyText] = useState('');

    const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const loadMessages = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await api.getContactMessages({
                status: statusFilter,
                search: searchQuery,
                page: currentPage,
            });
            setMessages(data.data);
            setTotalPages(data.last_page);
            setTotalMessages(data.total);
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error('Failed to load contact messages:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [statusFilter, searchQuery, currentPage]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    // Real-time polling every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            loadMessages(true);
        }, 15000);
        return () => clearInterval(interval);
    }, [loadMessages]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => {
            setCurrentPage(1);
        }, 300));
    };

    const handleStatusFilterChange = (status: StatusFilter) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handleViewMessage = async (msg: ContactMsg) => {
        try {
            const full = await api.getContactMessage(msg.id);
            setSelectedMessage(full);
            setAdminNotes(full.admin_notes || '');
            setReplyText(full.admin_reply || '');
            setViewModalOpen(true);
            setActionMsg(null);
            // Refresh the list to update read status
            loadMessages(true);
        } catch {
            setSelectedMessage(msg);
            setAdminNotes(msg.admin_notes || '');
            setReplyText(msg.admin_reply || '');
            setViewModalOpen(true);
        }
    };

    const handleMarkStatus = async (status: string) => {
        if (!selectedMessage) return;
        setActionLoading(true);
        setActionMsg(null);
        try {
            await api.updateContactMessageStatus(selectedMessage.id, status, adminNotes || undefined);
            setActionMsg({ type: 'success', text: `Marked as ${status}.` });
            setSelectedMessage({ ...selectedMessage, status, admin_notes: adminNotes });
            loadMessages(true);
        } catch {
            setActionMsg({ type: 'error', text: 'Failed to update status.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendReply = async () => {
        if (!selectedMessage || !replyText.trim()) return;
        setActionLoading(true);
        setActionMsg(null);
        try {
            const result = await api.replyContactMessage(selectedMessage.id, replyText.trim(), adminNotes || undefined);
            if (result.email_sent) {
                setActionMsg({ type: 'success', text: `Reply sent to ${selectedMessage.email}` });
            } else {
                setActionMsg({ type: 'error', text: result.message || 'Reply saved but email delivery failed.' });
            }
            setSelectedMessage({ ...selectedMessage, status: 'replied', admin_reply: replyText, replied_at: new Date().toISOString(), admin_notes: adminNotes });
            loadMessages(true);
        } catch {
            setActionMsg({ type: 'error', text: 'Failed to send reply.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenDeleteModal = (msg: ContactMsg) => {
        setSelectedMessage(msg);
        setDeleteModalOpen(true);
        setActionMsg(null);
    };

    const handleDeleteMessage = async () => {
        if (!selectedMessage) return;
        setActionLoading(true);
        setActionMsg(null);
        try {
            await api.deleteContactMessage(selectedMessage.id);
            setActionMsg({ type: 'success', text: 'Message deleted.' });
            loadMessages(true);
            setTimeout(() => setDeleteModalOpen(false), 800);
        } catch {
            setActionMsg({ type: 'error', text: 'Failed to delete message.' });
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'unread':
                return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"><Mail className="h-3 w-3 mr-1" />Unread</Badge>;
            case 'read':
                return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"><MailOpen className="h-3 w-3 mr-1" />Read</Badge>;
            case 'replied':
                return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"><Reply className="h-3 w-3 mr-1" />Replied</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        return (
            <Badge variant="outline" className="text-xs gap-1">
                {categoryIcons[category] || <HelpCircle className="h-3.5 w-3.5" />}
                {categoryLabels[category] || category}
            </Badge>
        );
    };

    const statusFilters: { label: string; value: StatusFilter; icon: React.ReactNode }[] = [
        { label: 'All', value: 'all', icon: <MessageSquare className="h-4 w-4" /> },
        { label: 'Unread', value: 'unread', icon: <Mail className="h-4 w-4" /> },
        { label: 'Read', value: 'read', icon: <MailOpen className="h-4 w-4" /> },
        { label: 'Replied', value: 'replied', icon: <Reply className="h-4 w-4" /> },
    ];

    return (
        <AdminLayout>
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Contact Messages</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">Review and respond to user inquiries</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Badge className="bg-blue-500 text-white border-0 px-3 py-1.5">
                                <Mail className="h-3.5 w-3.5 mr-1.5" />
                                {unreadCount} Unread
                            </Badge>
                        )}
                        <Badge variant="secondary" className="text-sm px-3 py-1.5">
                            {totalMessages} Total
                        </Badge>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or subject..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="grid grid-cols-4 sm:flex gap-2">
                                {statusFilters.map((filter) => (
                                    <Button
                                        key={filter.value}
                                        variant={statusFilter === filter.value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleStatusFilterChange(filter.value)}
                                        className="gap-1 text-xs sm:text-sm"
                                    >
                                        {filter.icon}
                                        <span className="hidden sm:inline">{filter.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Messages List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No messages found</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sender</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subject</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {messages.map((msg) => (
                                                <tr
                                                    key={msg.id}
                                                    className={`border-b border-border/50 hover:bg-accent/50 transition-colors ${msg.status === 'unread' ? 'bg-blue-500/5' : ''}`}
                                                >
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <p className={`text-sm ${msg.status === 'unread' ? 'font-semibold' : 'font-medium'} text-foreground`}>{msg.name}</p>
                                                            <p className="text-xs text-muted-foreground">{msg.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className={`text-sm ${msg.status === 'unread' ? 'font-semibold' : ''} text-foreground truncate max-w-[200px]`}>{msg.subject}</p>
                                                    </td>
                                                    <td className="py-3 px-4">{getCategoryBadge(msg.category)}</td>
                                                    <td className="py-3 px-4">{getStatusBadge(msg.status)}</td>
                                                    <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                                                        {new Date(msg.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => handleViewMessage(msg)} title="View">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleOpenDeleteModal(msg)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-3">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`p-3 rounded-xl border border-border ${msg.status === 'unread' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-card'}`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className={`text-sm ${msg.status === 'unread' ? 'font-semibold' : 'font-medium'} text-foreground truncate`}>{msg.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                                                </div>
                                                {getStatusBadge(msg.status)}
                                            </div>
                                            <p className={`text-sm ${msg.status === 'unread' ? 'font-semibold' : ''} text-foreground mb-2 truncate`}>{msg.subject}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getCategoryBadge(msg.category)}
                                                    <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewMessage(msg)}>
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleOpenDeleteModal(msg)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            Page {currentPage} of {totalPages}
                                        </p>
                                        <div className="flex gap-1.5 sm:gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="px-2 sm:px-3"
                                            >
                                                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                                                <span className="hidden sm:inline">Previous</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-2 sm:px-3"
                                            >
                                                <span className="hidden sm:inline">Next</span>
                                                <ChevronRight className="h-4 w-4 sm:ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View Message Modal */}
            <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)}>
                {selectedMessage && (
                    <div>
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-foreground">Message Details</h3>
                            <Button variant="ghost" size="sm" onClick={() => setViewModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            {/* Sender info */}
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                    {selectedMessage.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-foreground">{selectedMessage.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                                </div>
                                {getStatusBadge(selectedMessage.status)}
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                {getCategoryBadge(selectedMessage.category)}
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(selectedMessage.created_at).toLocaleString()}
                                </span>
                            </div>

                            {/* Subject & Message */}
                            <div className="space-y-2 p-3 sm:p-4 rounded-xl bg-accent/30 border border-border">
                                <p className="font-semibold text-sm text-foreground">{selectedMessage.subject}</p>
                                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                            </div>

                            {/* Previous Reply (if already replied) */}
                            {selectedMessage.admin_reply && (
                                <div className="space-y-2 p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                            Reply Sent {selectedMessage.replied_at && `on ${new Date(selectedMessage.replied_at).toLocaleString()}`}
                                        </p>
                                    </div>
                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{selectedMessage.admin_reply}</p>
                                </div>
                            )}

                            {/* Reply Section */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Reply className="h-3.5 w-3.5" />
                                    {selectedMessage.admin_reply ? 'Send New Reply' : 'Reply to User'}
                                </label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Type your reply to ${selectedMessage.name}... This will be emailed to ${selectedMessage.email}`}
                                    rows={4}
                                    className="w-full px-3 py-2 bg-accent/50 border border-blue-500/30 rounded-lg text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                />
                            </div>

                            {/* Admin Notes (internal) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Notes (internal only)</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add internal notes (not sent to user)..."
                                    rows={2}
                                    className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            {/* Status message */}
                            {actionMsg && (
                                <div className={`p-3 rounded-lg text-sm ${actionMsg.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {actionMsg.text}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                {selectedMessage.status !== 'unread' && (
                                    <Button variant="outline" size="sm" onClick={() => handleMarkStatus('unread')} disabled={actionLoading} className="gap-1.5">
                                        <Mail className="h-3.5 w-3.5" />
                                        Unread
                                    </Button>
                                )}
                                {selectedMessage.status !== 'read' && (
                                    <Button variant="outline" size="sm" onClick={() => handleMarkStatus('read')} disabled={actionLoading} className="gap-1.5">
                                        <MailOpen className="h-3.5 w-3.5" />
                                        Read
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    onClick={handleSendReply}
                                    disabled={actionLoading || !replyText.trim()}
                                    className="gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 ml-auto"
                                >
                                    {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                    Send Reply via Email
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                {selectedMessage && (
                    <div>
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-red-600">Delete Message</h3>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    This will permanently delete this contact message.
                                </p>
                            </div>
                            <div className="p-3 rounded-lg border border-border">
                                <p className="font-medium text-foreground text-sm">{selectedMessage.subject}</p>
                                <p className="text-xs text-muted-foreground">From: {selectedMessage.name} ({selectedMessage.email})</p>
                            </div>
                            {actionMsg && (
                                <div className={`p-3 rounded-lg text-sm ${actionMsg.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {actionMsg.text}
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setDeleteModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" className="flex-1" onClick={handleDeleteMessage} disabled={actionLoading}>
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
