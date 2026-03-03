<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\ContactMessage;
use App\Models\LawFirm;
use App\Models\User;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use App\Mail\ContactReplyMail;

class AdminController extends Controller
{
    private AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get dashboard statistics
     */
    public function dashboard(): JsonResponse
    {
        $stats = $this->analyticsService->getDashboardStats();
        $topSpecializations = $this->analyticsService->getTopSpecializations();

        return response()->json([
            'stats' => $stats,
            'top_specializations' => $topSpecializations,
        ]);
    }

    /**
     * Get all law firms
     */
    public function lawFirms(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $query = LawFirm::with(['user', 'specializations']);

        if ($status) {
            $query->where('verification_status', $status);
        }

        $lawFirms = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($lawFirms);
    }

    /**
     * Get pending verifications
     */
    public function pendingVerifications(): JsonResponse
    {
        $pending = LawFirm::with(['user', 'specializations'])
            ->pending()
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($pending);
    }

    /**
     * Approve a law firm
     */
    public function approveLawFirm($id): JsonResponse
    {
        $lawFirm = LawFirm::findOrFail($id);

        $lawFirm->update([
            'verification_status' => 'approved',
            'verified_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'message' => 'Law firm approved successfully',
            'law_firm' => $lawFirm->load(['user', 'specializations']),
        ]);
    }

    /**
     * Reject a law firm
     */
    public function rejectLawFirm(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $lawFirm = LawFirm::findOrFail($id);

        $lawFirm->update([
            'verification_status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return response()->json([
            'message' => 'Law firm rejected',
            'law_firm' => $lawFirm->load(['user', 'specializations']),
        ]);
    }

    /**
     * Get all clients
     */
    public function clients(): JsonResponse
    {
        $clients = Client::with(['user', 'specializations'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($clients);
    }

    /**
     * Get all appointments
     */
    public function appointments(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $query = Appointment::with(['client.user', 'lawFirm.user', 'specialization']);

        if ($status) {
            $query->where('status', $status);
        }

        $appointments = $query->orderBy('scheduled_at', 'desc')->paginate(20);

        return response()->json($appointments);
    }

    /**
     * Get specialization analytics
     */
    public function specializationAnalytics(): JsonResponse
    {
        $topSpecializations = $this->analyticsService->getTopSpecializations(10);

        return response()->json($topSpecializations);
    }

    /**
     * Get appointment analytics
     */
    public function appointmentAnalytics(): JsonResponse
    {
        try {
            return response()->json([
                'monthly_trends' => $this->analyticsService->getMonthlyAppointments(),
                'status_distribution' => $this->analyticsService->getAppointmentStatusDistribution(),
                'descriptive' => $this->analyticsService->getDescriptiveAnalytics(),
                'top_firms' => $this->analyticsService->getTopPerformingFirms(),
            ]);
        } catch (\Exception $e) {
            Log::error('Appointment analytics error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to load appointment analytics',
                'message' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get distance analytics
     */
    public function distanceAnalytics(): JsonResponse
    {
        try {
            return response()->json([
                'average_distance' => $this->analyticsService->getAverageClientFirmDistance(),
                'distribution' => $this->analyticsService->getDistanceDistribution(),
            ]);
        } catch (\Exception $e) {
            Log::error('Distance analytics error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to load distance analytics',
                'message' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get registration trends
     */
    public function registrationTrends(): JsonResponse
    {
        return response()->json($this->analyticsService->getRegistrationTrends());
    }

    /**
     * Get all users with optional filtering
     */
    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        // Filter by role
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $query->with(['client', 'lawFirm']);

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($users);
    }

    /**
     * Get a single user
     */
    public function showUser($id): JsonResponse
    {
        $user = User::with(['client.specializations', 'lawFirm.specializations'])->findOrFail($id);

        return response()->json($user);
    }

    /**
     * Update a user's role
     */
    public function updateUserRole(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(['client', 'law_firm', 'admin'])],
        ]);

        $user = User::findOrFail($id);

        // Prevent admin from changing their own role
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot change your own role.',
            ], 403);
        }

        $user->update(['role' => $validated['role']]);

        return response()->json([
            'message' => 'User role updated successfully.',
            'user' => $user->load(['client', 'lawFirm']),
        ]);
    }

    /**
     * Delete a user
     */
    public function deleteUser(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent admin from deleting themselves
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 403);
        }

        // Delete related records
        if ($user->client) {
            $user->client->specializations()->detach();
            $user->client->delete();
        }

        if ($user->lawFirm) {
            $user->lawFirm->specializations()->detach();
            $user->lawFirm->delete();
        }

        // Delete user tokens
        $user->tokens()->delete();

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    /**
     * Reset a user's password
     */
    public function resetUserPassword(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user = User::findOrFail($id);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Revoke all existing tokens
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successfully.',
        ]);
    }

    // ===== Contact Messages Management =====

    public function contactMessages(Request $request): JsonResponse
    {
        $query = ContactMessage::query()->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $messages = $query->paginate(15);

        // Also return unread count for badge
        $unreadCount = ContactMessage::unread()->count();

        return response()->json([
            'data' => $messages->items(),
            'current_page' => $messages->currentPage(),
            'last_page' => $messages->lastPage(),
            'total' => $messages->total(),
            'per_page' => $messages->perPage(),
            'unread_count' => $unreadCount,
        ]);
    }

    public function showContactMessage($id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);

        // Auto-mark as read when admin views it
        if ($message->status === 'unread') {
            $message->update(['status' => 'read']);
        }

        return response()->json($message);
    }

    public function updateContactMessageStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:unread,read,replied',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $message = ContactMessage::findOrFail($id);
        $message->update($validated);

        return response()->json([
            'message' => 'Status updated successfully.',
            'contact_message' => $message->fresh(),
        ]);
    }

    public function deleteContactMessage($id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'message' => 'Message deleted successfully.',
        ]);
    }

    public function replyContactMessage(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'reply' => 'required|string|max:5000',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $message = ContactMessage::findOrFail($id);

        $message->update([
            'admin_reply' => $validated['reply'],
            'status' => 'replied',
            'replied_at' => now(),
            'admin_notes' => $validated['admin_notes'] ?? $message->admin_notes,
        ]);

        // Send reply email to the user
        try {
            Mail::to($message->email)->send(new ContactReplyMail($message, $validated['reply']));
            Log::info('Contact reply email sent to: ' . $message->email);
        } catch (\Exception $e) {
            Log::error('Failed to send contact reply email: ' . $e->getMessage());
            // Still mark as replied even if email fails
            return response()->json([
                'message' => 'Reply saved but email delivery failed. The user may not receive the email.',
                'email_sent' => false,
                'contact_message' => $message->fresh(),
            ]);
        }

        return response()->json([
            'message' => 'Reply sent successfully to ' . $message->email,
            'email_sent' => true,
            'contact_message' => $message->fresh(),
        ]);
    }

    public function unreadContactCount(): JsonResponse
    {
        return response()->json([
            'count' => ContactMessage::unread()->count(),
        ]);
    }
}
