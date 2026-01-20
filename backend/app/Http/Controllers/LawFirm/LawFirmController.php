<?php

namespace App\Http\Controllers\LawFirm;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LawFirmController extends Controller
{
    /**
     * Get law firm profile
     */
    public function profile(Request $request): JsonResponse
    {
        $lawFirm = $request->user()->lawFirm->load('specializations');

        return response()->json($lawFirm);
    }

    /**
     * Update law firm profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firm_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'license_number' => 'nullable|string|max:100',
            'specialization_ids' => 'nullable|array',
            'specialization_ids.*' => 'exists:specializations,id',
        ]);

        $lawFirm = $request->user()->lawFirm;

        $lawFirm->update([
            'firm_name' => $validated['firm_name'] ?? $lawFirm->firm_name,
            'description' => $validated['description'] ?? $lawFirm->description,
            'phone' => $validated['phone'] ?? $lawFirm->phone,
            'email' => $validated['email'] ?? $lawFirm->email,
            'license_number' => $validated['license_number'] ?? $lawFirm->license_number,
        ]);

        if (isset($validated['specialization_ids'])) {
            $lawFirm->specializations()->sync($validated['specialization_ids']);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'law_firm' => $lawFirm->load('specializations'),
        ]);
    }

    /**
     * Update law firm location
     */
    public function updateLocation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'nullable|string|max:255',
        ]);

        $lawFirm = $request->user()->lawFirm;
        $lawFirm->update($validated);

        return response()->json([
            'message' => 'Location updated successfully',
            'law_firm' => $lawFirm,
        ]);
    }

    /**
     * Get law firm appointments
     */
    public function appointments(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $upcoming = $request->query('upcoming');

        $query = $request->user()->lawFirm
            ->appointments()
            ->with(['client.user', 'specialization']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($upcoming === 'true') {
            $query->upcoming();
        }

        $appointments = $query->orderBy('scheduled_at', 'desc')->get();

        return response()->json($appointments);
    }

    /**
     * Create appointment
     */
    public function createAppointment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'specialization_id' => 'nullable|exists:specializations,id',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'notes' => 'nullable|string|max:1000',
        ]);

        $lawFirm = $request->user()->lawFirm;

        $appointment = Appointment::create([
            'client_id' => $validated['client_id'],
            'law_firm_id' => $lawFirm->id,
            'specialization_id' => $validated['specialization_id'] ?? null,
            'scheduled_at' => $validated['scheduled_at'],
            'duration_minutes' => $validated['duration_minutes'] ?? 60,
            'status' => 'confirmed',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Appointment created successfully',
            'appointment' => $appointment->load(['client.user', 'specialization']),
        ], 201);
    }

    /**
     * Update appointment
     */
    public function updateAppointment(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'scheduled_at' => 'nullable|date|after:now',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'status' => 'nullable|in:pending,confirmed,cancelled,completed',
            'notes' => 'nullable|string|max:1000',
            'cancellation_reason' => 'nullable|string|max:500',
        ]);

        $appointment = $request->user()->lawFirm
            ->appointments()
            ->findOrFail($id);

        $appointment->update($validated);

        return response()->json([
            'message' => 'Appointment updated successfully',
            'appointment' => $appointment->load(['client.user', 'specialization']),
        ]);
    }

    /**
     * Cancel appointment
     */
    public function cancelAppointment(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'cancellation_reason' => 'nullable|string|max:500',
        ]);

        $appointment = $request->user()->lawFirm
            ->appointments()
            ->findOrFail($id);

        $appointment->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['cancellation_reason'] ?? null,
        ]);

        return response()->json([
            'message' => 'Appointment cancelled successfully',
            'appointment' => $appointment,
        ]);
    }

    /**
     * Get calendar data
     */
    public function calendar(Request $request): JsonResponse
    {
        $start = $request->query('start', now()->startOfMonth());
        $end = $request->query('end', now()->endOfMonth());

        $appointments = $request->user()->lawFirm
            ->appointments()
            ->with(['client.user', 'specialization'])
            ->whereBetween('scheduled_at', [$start, $end])
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'title' => $appointment->client->user->name,
                    'start' => $appointment->scheduled_at->toIso8601String(),
                    'end' => $appointment->scheduled_at->addMinutes($appointment->duration_minutes)->toIso8601String(),
                    'status' => $appointment->status,
                    'color' => $this->getStatusColor($appointment->status),
                    'extendedProps' => [
                        'client' => $appointment->client,
                        'specialization' => $appointment->specialization,
                        'notes' => $appointment->notes,
                    ],
                ];
            });

        return response()->json($appointments);
    }

    /**
     * Get clients who have contacted/booked
     */
    public function clients(Request $request): JsonResponse
    {
        $clientIds = $request->user()->lawFirm
            ->appointments()
            ->pluck('client_id')
            ->unique();

        $clients = Client::with('user')
            ->whereIn('id', $clientIds)
            ->get();

        return response()->json($clients);
    }

    private function getStatusColor(string $status): string
    {
        return match ($status) {
            'pending' => '#fbbf24',    // Yellow
            'confirmed' => '#3b82f6',   // Blue
            'completed' => '#22c55e',   // Green
            'cancelled' => '#ef4444',   // Red
            default => '#6b7280',       // Gray
        };
    }
}
