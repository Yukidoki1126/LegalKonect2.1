import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, User, Specialization, Recommendation, Appointment, LawFirm, DashboardStats, CalendarEvent, Client } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const TIMEOUT_MS = 30000; // 30 seconds timeout

// Check if error is retryable
function isRetryableError(error: AxiosError): boolean {
    // Retry on network errors
    if (!error.response) return true;
    
    // Retry on 5xx server errors and 408 timeout
    const status = error.response.status;
    return status >= 500 || status === 408 || status === 429;
}

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            withCredentials: true,
            timeout: TIMEOUT_MS,
        });

        // Add token to requests
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            // Add retry count to config
            (config as any).__retryCount = (config as any).__retryCount || 0;
            return config;
        });

        // Handle errors with retry logic
        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const config = error.config as InternalAxiosRequestConfig & { __retryCount?: number };
                
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Don't retry logout requests - fail fast
                if (config?.url?.includes('/auth/logout')) {
                    return Promise.reject(error);
                }

                // Check if we should retry
                const retryCount = config?.__retryCount || 0;
                if (config && isRetryableError(error) && retryCount < MAX_RETRIES) {
                    config.__retryCount = retryCount + 1;
                    
                    // Exponential backoff with jitter
                    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount) + Math.random() * 500;
                    console.log(`[API] Retry ${retryCount + 1}/${MAX_RETRIES} after ${Math.round(delay)}ms`);
                    
                    await sleep(delay);
                    return this.api.request(config);
                }
                
                return Promise.reject(error);
            }
        );
    }

    // Auth
    async registerClient(data: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone?: string;
        address?: string;
        latitude?: number;
        longitude?: number;
        specialization_ids?: number[];
    }): Promise<AuthResponse> {
        const response = await this.api.post('/auth/register/client', data);
        return response.data;
    }

    async registerLawFirm(data: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        firm_name: string;
        license_number?: string;
        description?: string;
        phone?: string;
        firm_email?: string;
        address?: string;
        latitude?: number;
        longitude?: number;
        specialization_ids?: number[];
    }): Promise<AuthResponse> {
        const response = await this.api.post('/auth/register/law-firm', data);
        return response.data;
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await this.api.post('/auth/login', { email, password });
        return response.data;
    }

    async logout(): Promise<void> {
        // Use shorter timeout for logout (5 seconds)
        await this.api.post('/auth/logout', {}, { timeout: 5000 });
    }

    async getUser(): Promise<User> {
        const response = await this.api.get('/auth/user');
        return response.data;
    }

    // Specializations
    async getSpecializations(): Promise<Specialization[]> {
        const response = await this.api.get('/specializations');
        return response.data;
    }

    // Client endpoints
    async getClientProfile(): Promise<Client> {
        const response = await this.api.get('/client/profile');
        return response.data;
    }

    async updateClientProfile(data: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        specialization_ids?: number[];
        preferred_min_rating?: number | null;
        preferred_max_distance?: number | null;
        preferred_experience?: string | null;
    }): Promise<{ message: string; client: Client }> {
        const response = await this.api.put('/client/profile', data);
        return response.data;
    }

    async updateClientLocation(data: {
        latitude: number;
        longitude: number;
        address?: string;
    }): Promise<{ message: string; client: Client }> {
        const response = await this.api.put('/client/location', data);
        return response.data;
    }

    async getRecommendations(): Promise<Recommendation[]> {
        const response = await this.api.get('/client/recommendations');
        return response.data;
    }

    async getClientAppointments(): Promise<Appointment[]> {
        const response = await this.api.get('/client/appointments');
        return response.data;
    }

    async bookAppointment(data: {
        law_firm_id: number;
        specialization_id?: number;
        scheduled_at: string;
        notes?: string;
    }): Promise<{ message: string; appointment: Appointment }> {
        const response = await this.api.post('/client/appointments', data);
        return response.data;
    }

    async submitRating(data: {
        law_firm_id: number;
        appointment_id?: number;
        rating: number;
        review?: string;
    }): Promise<void> {
        await this.api.post('/client/ratings', data);
    }

    async viewLawFirm(id: number): Promise<{
        law_firm: LawFirm;
        average_rating: number;
        rating_count: number;
        distance_km: number | null;
    }> {
        const response = await this.api.get(`/client/law-firms/${id}`);
        return response.data;
    }

    // Law Firm endpoints
    async getLawFirmProfile(): Promise<LawFirm> {
        const response = await this.api.get('/law-firm/profile');
        return response.data;
    }

    async updateLawFirmProfile(data: {
        firm_name?: string;
        description?: string;
        experience_range?: string;
        lawyers?: string[];
        contact_person_name?: string;
        contact_person_role?: string;
        contact_person_phone?: string;
        contact_person_email?: string;
        phone?: string;
        email?: string;
        license_number?: string;
        specialization_ids?: number[];
    }): Promise<{ message: string; law_firm: LawFirm }> {
        const response = await this.api.put('/law-firm/profile', data);
        return response.data;
    }

    async updateLawFirmLocation(data: {
        latitude: number;
        longitude: number;
        address?: string;
    }): Promise<{ message: string; law_firm: LawFirm }> {
        const response = await this.api.put('/law-firm/location', data);
        return response.data;
    }

    async getLawFirmAppointments(status?: string, upcoming?: boolean): Promise<Appointment[]> {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (upcoming) params.append('upcoming', 'true');
        const response = await this.api.get(`/law-firm/appointments?${params}`);
        return response.data;
    }

    async createAppointment(data: {
        client_id: number;
        specialization_id?: number;
        scheduled_at: string;
        duration_minutes?: number;
        notes?: string;
    }): Promise<{ message: string; appointment: Appointment }> {
        const response = await this.api.post('/law-firm/appointments', data);
        return response.data;
    }

    async updateAppointment(id: number, data: {
        scheduled_at?: string;
        duration_minutes?: number;
        status?: string;
        notes?: string;
        cancellation_reason?: string;
    }): Promise<{ message: string; appointment: Appointment }> {
        const response = await this.api.put(`/law-firm/appointments/${id}`, data);
        return response.data;
    }

    async cancelAppointment(id: number, reason?: string): Promise<void> {
        await this.api.delete(`/law-firm/appointments/${id}`, {
            data: { cancellation_reason: reason },
        });
    }

    async getCalendarEvents(start: string, end: string): Promise<CalendarEvent[]> {
        const response = await this.api.get(`/law-firm/calendar?start=${start}&end=${end}`);
        return response.data;
    }

    async getLawFirmClients(): Promise<Client[]> {
        const response = await this.api.get('/law-firm/clients');
        return response.data;
    }

    async uploadLawFirmProfileImage(file: File): Promise<{ message: string; profile_image_url: string }> {
        const formData = new FormData();
        formData.append('image', file);
        // Unset Content-Type so Axios can set multipart/form-data with proper boundary
        const response = await this.api.post('/law-firm/profile/image', formData, {
            headers: {
                'Content-Type': undefined,
            },
        });
        return response.data;
    }

    async deleteLawFirmProfileImage(): Promise<{ message: string }> {
        const response = await this.api.delete('/law-firm/profile/image');
        return response.data;
    }

    async uploadLawFirmGalleryImage(file: File): Promise<{ message: string; gallery_images_urls: string[] }> {
        const formData = new FormData();
        formData.append('image', file);
        const response = await this.api.post('/law-firm/profile/gallery', formData, {
            headers: {
                'Content-Type': undefined,
            },
        });
        return response.data;
    }

    async deleteLawFirmGalleryImage(index: number): Promise<{ message: string; gallery_images_urls: string[] }> {
        const response = await this.api.delete(`/law-firm/profile/gallery/${index}`);
        return response.data;
    }

    // Admin endpoints
    async getAdminDashboard(): Promise<{ stats: DashboardStats; top_specializations: { name: string; count: number }[] }> {
        const response = await this.api.get('/admin/dashboard');
        return response.data;
    }

    async getAdminLawFirms(status?: string): Promise<{ data: LawFirm[] }> {
        const params = status ? `?status=${status}` : '';
        const response = await this.api.get(`/admin/law-firms${params}`);
        return response.data;
    }

    async getPendingVerifications(): Promise<LawFirm[]> {
        const response = await this.api.get('/admin/law-firms/pending');
        return response.data;
    }

    async approveLawFirm(id: number): Promise<{ message: string; law_firm: LawFirm }> {
        const response = await this.api.put(`/admin/law-firms/${id}/approve`);
        return response.data;
    }

    async rejectLawFirm(id: number, reason: string): Promise<{ message: string; law_firm: LawFirm }> {
        const response = await this.api.put(`/admin/law-firms/${id}/reject`, { rejection_reason: reason });
        return response.data;
    }

    async getAdminClients(): Promise<{ data: Client[] }> {
        const response = await this.api.get('/admin/clients');
        return response.data;
    }

    async getAdminAppointments(status?: string): Promise<{ data: Appointment[] }> {
        const params = status ? `?status=${status}` : '';
        const response = await this.api.get(`/admin/appointments${params}`);
        return response.data;
    }

    async getSpecializationAnalytics(): Promise<{ name: string; count: number }[]> {
        const response = await this.api.get('/admin/analytics/specializations');
        return response.data;
    }

    async getAppointmentAnalytics(): Promise<{
        monthly_trends: { month: string; total: number; completed: number; cancelled: number }[];
        status_distribution: { status: string; count: number }[];
        descriptive: {
            most_performing: { id: number; firm_name: string; completed_appointments: number } | null;
            most_rated: { id: number; firm_name: string; average_rating: number; rating_count: number } | null;
            insights: string[];
        };
        top_firms: { id: number; firm_name: string; completed_appointments: number }[];
    }> {
        const response = await this.api.get('/admin/analytics/appointments');
        return response.data;
    }

    async getDistanceAnalytics(): Promise<{
        average_distance: number;
        distribution: Record<string, number>;
    }> {
        const response = await this.api.get('/admin/analytics/distances');
        return response.data;
    }

    // Admin User Management
    async getAdminUsers(params?: { role?: string; search?: string; page?: number }): Promise<{
        data: User[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    }> {
        const searchParams = new URLSearchParams();
        if (params?.role && params.role !== 'all') searchParams.append('role', params.role);
        if (params?.search) searchParams.append('search', params.search);
        if (params?.page) searchParams.append('page', params.page.toString());
        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.api.get(`/admin/users${query}`);
        return response.data;
    }

    async getAdminUser(id: number): Promise<User> {
        const response = await this.api.get(`/admin/users/${id}`);
        return response.data;
    }

    async updateUserRole(id: number, role: string): Promise<{ message: string; user: User }> {
        const response = await this.api.put(`/admin/users/${id}/role`, { role });
        return response.data;
    }

    async deleteUser(id: number): Promise<{ message: string }> {
        const response = await this.api.delete(`/admin/users/${id}`);
        return response.data;
    }

    async resetUserPassword(id: number, password: string): Promise<{ message: string }> {
        const response = await this.api.put(`/admin/users/${id}/reset-password`, { password });
        return response.data;
    }

    async changePassword(data: {
        current_password: string;
        new_password: string;
    }): Promise<{ message: string }> {
        const response = await this.api.put('/auth/change-password', data);
        return response.data;
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const response = await this.api.post('/auth/forgot-password', { email });
        return response.data;
    }

    async resetPassword(data: {
        email: string;
        token: string;
        password: string;
        password_confirmation: string;
    }): Promise<{ message: string }> {
        const response = await this.api.post('/auth/reset-password', data);
        return response.data;
    }

    // Contact form (public)
    async submitContactMessage(data: {
        name: string;
        email: string;
        category: string;
        subject: string;
        message: string;
    }): Promise<{ message: string; id: number }> {
        const response = await this.api.post('/contact', data);
        return response.data;
    }

    // Admin Contact Messages
    async getContactMessages(params?: { status?: string; search?: string; page?: number }): Promise<{
        data: {
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
        }[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        unread_count: number;
    }> {
        const searchParams = new URLSearchParams();
        if (params?.status && params.status !== 'all') searchParams.append('status', params.status);
        if (params?.search) searchParams.append('search', params.search);
        if (params?.page) searchParams.append('page', params.page.toString());
        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.api.get(`/admin/contact-messages${query}`);
        return response.data;
    }

    async getContactMessage(id: number): Promise<{
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
    }> {
        const response = await this.api.get(`/admin/contact-messages/${id}`);
        return response.data;
    }

    async updateContactMessageStatus(id: number, status: string, adminNotes?: string): Promise<{ message: string }> {
        const response = await this.api.put(`/admin/contact-messages/${id}/status`, {
            status,
            admin_notes: adminNotes,
        });
        return response.data;
    }

    async replyContactMessage(id: number, reply: string, adminNotes?: string): Promise<{ message: string; email_sent: boolean }> {
        const response = await this.api.post(`/admin/contact-messages/${id}/reply`, {
            reply,
            admin_notes: adminNotes,
        });
        return response.data;
    }

    async deleteContactMessage(id: number): Promise<{ message: string }> {
        const response = await this.api.delete(`/admin/contact-messages/${id}`);
        return response.data;
    }

    async getUnreadContactCount(): Promise<{ count: number }> {
        const response = await this.api.get('/admin/contact-messages/unread-count');
        return response.data;
    }
}

export const api = new ApiService();
export default api;
