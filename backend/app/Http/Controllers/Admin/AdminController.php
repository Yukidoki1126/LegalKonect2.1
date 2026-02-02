<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\LawFirm;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
}
