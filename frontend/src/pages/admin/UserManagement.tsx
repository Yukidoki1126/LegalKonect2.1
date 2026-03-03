import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayoutNew';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Search,
    Trash2,
    Shield,
    UserCog,
    Building2,
    User as UserIcon,
    ChevronLeft,
    ChevronRight,
    KeyRound,
    AlertTriangle,
    Loader2,
    X,
    Eye,
    Mail,
    Calendar,
    MapPin,
    Phone,
} from 'lucide-react';
import { User } from '@/types';
import api from '@/services/api';

type RoleFilter = 'all' | 'client' | 'law_firm' | 'admin';

// Simple modal component
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

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Modal states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
    const [newRole, setNewRole] = useState<string>('');
    const [newPassword, setNewPassword] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getAdminUsers({
                role: roleFilter,
                search: searchQuery,
                page: currentPage,
            });
            setUsers(data.data);
            setTotalPages(data.last_page);
            setTotalUsers(data.total);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    }, [roleFilter, searchQuery, currentPage]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Debounce search
    const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => {
            setCurrentPage(1);
        }, 300));
    };

    const handleRoleFilterChange = (role: RoleFilter) => {
        setRoleFilter(role);
        setCurrentPage(1);
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
            case 'law_firm':
                return <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0"><Building2 className="h-3 w-3 mr-1" />Law Firm</Badge>;
            case 'client':
                return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"><UserIcon className="h-3 w-3 mr-1" />Client</Badge>;
            default:
                return <Badge variant="secondary">{role}</Badge>;
        }
    };

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setViewModalOpen(true);
    };

    const handleOpenRoleModal = (user: User) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setRoleModalOpen(true);
        setActionMessage(null);
    };

    const handleOpenDeleteModal = (user: User) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
        setActionMessage(null);
    };

    const handleOpenResetPasswordModal = (user: User) => {
        setSelectedUser(user);
        setNewPassword('');
        setResetPasswordModalOpen(true);
        setActionMessage(null);
    };

    const handleChangeRole = async () => {
        if (!selectedUser || !newRole) return;
        setActionLoading(true);
        setActionMessage(null);
        try {
            await api.updateUserRole(selectedUser.id, newRole);
            setActionMessage({ type: 'success', text: 'Role updated successfully.' });
            loadUsers();
            setTimeout(() => setRoleModalOpen(false), 1000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setActionMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update role.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        setActionMessage(null);
        try {
            await api.deleteUser(selectedUser.id);
            setActionMessage({ type: 'success', text: 'User deleted successfully.' });
            loadUsers();
            setTimeout(() => setDeleteModalOpen(false), 1000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setActionMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete user.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser || !newPassword) return;
        if (newPassword.length < 8) {
            setActionMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
            return;
        }
        setActionLoading(true);
        setActionMessage(null);
        try {
            await api.resetUserPassword(selectedUser.id, newPassword);
            setActionMessage({ type: 'success', text: 'Password reset successfully.' });
            setNewPassword('');
            setTimeout(() => setResetPasswordModalOpen(false), 1000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setActionMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reset password.' });
        } finally {
            setActionLoading(false);
        }
    };

    const roleFilters: { label: string; value: RoleFilter; icon: React.ReactNode }[] = [
        { label: 'All Users', value: 'all', icon: <Users className="h-4 w-4" /> },
        { label: 'Clients', value: 'client', icon: <UserIcon className="h-4 w-4" /> },
        { label: 'Law Firms', value: 'law_firm', icon: <Building2 className="h-4 w-4" /> },
        { label: 'Admins', value: 'admin', icon: <Shield className="h-4 w-4" /> },
    ];

    return (
        <AdminLayout>
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">User Management</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">Manage users, roles, and permissions</p>
                    </div>
                    <Badge variant="secondary" className="text-sm px-4 py-2 w-fit">
                        <Users className="h-4 w-4 mr-2" />
                        {totalUsers} Total Users
                    </Badge>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            {/* Role Filter */}
                            <div className="grid grid-cols-2 sm:flex gap-2 sm:flex-wrap">
                                {roleFilters.map((filter) => (
                                    <Button
                                        key={filter.value}
                                        variant={roleFilter === filter.value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleRoleFilterChange(filter.value)}
                                        className="gap-1.5 text-xs sm:text-sm"
                                    >
                                        {filter.icon}
                                        {filter.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No users found</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                                                                {user.name?.substring(0, 2).toUpperCase() || '??'}
                                                            </div>
                                                            <span className="font-medium text-foreground">{user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                                                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                                                    <td className="py-3 px-4 text-sm text-muted-foreground">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)} title="View Details">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleOpenRoleModal(user)} title="Change Role">
                                                                <UserCog className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleOpenResetPasswordModal(user)} title="Reset Password">
                                                                <KeyRound className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleOpenDeleteModal(user)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete User">
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
                                    {users.map((user) => (
                                        <div key={user.id} className="p-3 sm:p-4 rounded-xl border border-border bg-card">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                                                    {user.name?.substring(0, 2).toUpperCase() || '??'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-foreground truncate">{user.name}</p>
                                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mt-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {getRoleBadge(user.role)}
                                                    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                                        Joined {new Date(user.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center flex-shrink-0">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewUser(user)} title="View">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenRoleModal(user)} title="Change Role">
                                                        <UserCog className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenResetPasswordModal(user)} title="Reset Password">
                                                        <KeyRound className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleOpenDeleteModal(user)} title="Delete">
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

            {/* View User Modal */}
            <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)}>
                {selectedUser && (
                    <div>
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-foreground">User Details</h3>
                            <Button variant="ghost" size="sm" onClick={() => setViewModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                                    {selectedUser.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-foreground">{selectedUser.name}</h4>
                                    {getRoleBadge(selectedUser.role)}
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground">{selectedUser.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground">Joined {new Date(selectedUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                {selectedUser.client && (
                                    <>
                                        {selectedUser.client.phone && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-foreground">{selectedUser.client.phone}</span>
                                            </div>
                                        )}
                                        {selectedUser.client.address && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-foreground">{selectedUser.client.address}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                {selectedUser.law_firm && (
                                    <div className="mt-4 p-3 rounded-lg bg-accent/50 border border-border">
                                        <p className="text-sm font-medium text-foreground mb-1">
                                            <Building2 className="h-4 w-4 inline mr-1" />
                                            {selectedUser.law_firm.firm_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Status: <span className="capitalize">{selectedUser.law_firm.verification_status}</span>
                                        </p>
                                        {selectedUser.law_firm.address && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {selectedUser.law_firm.address}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Change Role Modal */}
            <Modal open={roleModalOpen} onClose={() => setRoleModalOpen(false)}>
                {selectedUser && (
                    <div>
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-foreground">Change User Role</h3>
                            <Button variant="ghost" size="sm" onClick={() => setRoleModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Changing role for <span className="font-medium text-foreground">{selectedUser.name}</span>
                            </p>
                            <div className="space-y-2">
                                {(['client', 'law_firm', 'admin'] as const).map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setNewRole(role)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                                            newRole === role
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-border hover:bg-accent/50'
                                        }`}
                                    >
                                        {role === 'admin' && <Shield className="h-5 w-5 text-purple-500" />}
                                        {role === 'law_firm' && <Building2 className="h-5 w-5 text-blue-500" />}
                                        {role === 'client' && <UserIcon className="h-5 w-5 text-emerald-500" />}
                                        <div>
                                            <p className="font-medium text-foreground capitalize">{role.replace('_', ' ')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {role === 'admin' && 'Full system access and management'}
                                                {role === 'law_firm' && 'Can manage firm profile and appointments'}
                                                {role === 'client' && 'Can search firms and book appointments'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {actionMessage && (
                                <div className={`p-3 rounded-lg text-sm ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {actionMessage.text}
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setRoleModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleChangeRole}
                                    disabled={actionLoading || newRole === selectedUser.role}
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCog className="h-4 w-4 mr-2" />}
                                    Update Role
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete User Modal */}
            <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                {selectedUser && (
                    <div>
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-red-600">Delete User</h3>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                        This action cannot be undone
                                    </p>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                        This will permanently delete the user account and all associated data including profiles, appointments, and reviews.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                                    {selectedUser.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{selectedUser.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                </div>
                            </div>
                            {actionMessage && (
                                <div className={`p-3 rounded-lg text-sm ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {actionMessage.text}
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setDeleteModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleDeleteUser}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                    Delete User
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reset Password Modal */}
            <Modal open={resetPasswordModalOpen} onClose={() => setResetPasswordModalOpen(false)}>
                {selectedUser && (
                    <div>
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-foreground">Reset Password</h3>
                            <Button variant="ghost" size="sm" onClick={() => setResetPasswordModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Reset password for <span className="font-medium text-foreground">{selectedUser.name}</span> ({selectedUser.email})
                            </p>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
                                <Input
                                    type="password"
                                    placeholder="Enter new password (min 8 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            {actionMessage && (
                                <div className={`p-3 rounded-lg text-sm ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {actionMessage.text}
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setResetPasswordModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleResetPassword}
                                    disabled={actionLoading || newPassword.length < 8}
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
                                    Reset Password
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
