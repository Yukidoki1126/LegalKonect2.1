<?php

namespace App\Http\Controllers\Client;

use App\Events\AppointmentCreated;
use App\Events\RatingSubmitted;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\LawFirm;
use App\Models\Rating;
use App\Services\RecommendationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    private RecommendationService $recommendationService;

    public function __construct(RecommendationService $recommendationService)
    {
        $this->recommendationService = $recommendationService;
    }

    /**
     * Get client profile
     */
    public function profile(Request $request): JsonResponse
    {
        $client = $request->user()->client->load(['specializations', 'user']);

        return response()->json($client);
    }

    /**
     * Update client profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $request->user()->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'specialization_ids' => 'nullable|array',
            'specialization_ids.*' => 'exists:specializations,id',
        ]);

        $user = $request->user();
        $user->update([
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
        ]);

        $client = $user->client;
        $client->update([
            'phone' => $validated['phone'] ?? $client->phone,
            'address' => $validated['address'] ?? $client->address,
        ]);

        if (isset($validated['specialization_ids'])) {
            $client->specializations()->sync($validated['specialization_ids']);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'client' => $client->load(['specializations', 'user']),
        ]);
    }

    /**
     * Update client location
     */
    public function updateLocation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'nullable|string|max:255',
        ]);

        $client = $request->user()->client;
        $client->update($validated);

        return response()->json([
            'message' => 'Location updated successfully',
            'client' => $client,
        ]);
    }

    /**
     * Get recommended law firms
     */
    public function recommendations(Request $request): JsonResponse
    {
        $client = $request->user()->client->load('specializations');
        $recommendations = $this->recommendationService->getRecommendations($client);

        return response()->json($recommendations);
    }

    /**
     * Get client appointments
     */
    public function appointments(Request $request): JsonResponse
    {
        $appointments = $request->user()->client
            ->appointments()
            ->with(['lawFirm.user', 'specialization', 'rating'])
            ->orderBy('scheduled_at', 'desc')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Get single appointment
     */
    public function showAppointment(Request $request, $id): JsonResponse
    {
        $appointment = $request->user()->client
            ->appointments()
            ->with(['lawFirm.user', 'specialization', 'rating'])
            ->findOrFail($id);

        return response()->json($appointment);
    }

    /**
     * Submit a rating for a law firm
     */
    public function submitRating(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'law_firm_id' => 'required|exists:law_firms,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'rating' => 'required|integer|between:1,5',
            'review' => 'nullable|string|max:1000',
        ]);

        $client = $request->user()->client;

        // Check if already rated this appointment
        if ($validated['appointment_id']) {
            $existingRating = Rating::where('client_id', $client->id)
                ->where('appointment_id', $validated['appointment_id'])
                ->first();

            if ($existingRating) {
                return response()->json([
                    'message' => 'You have already rated this appointment',
                ], 422);
            }
        }

        $rating = Rating::create([
            'client_id' => $client->id,
            'law_firm_id' => $validated['law_firm_id'],
            'appointment_id' => $validated['appointment_id'] ?? null,
            'rating' => $validated['rating'],
            'review' => $validated['review'] ?? null,
        ]);

        broadcast(new RatingSubmitted($rating->load('client.user')))->toOthers();

        return response()->json([
            'message' => 'Rating submitted successfully',
            'rating' => $rating,
        ], 201);
    }

    /**
     * View a law firm profile
     */
    public function viewLawFirm(Request $request, $id): JsonResponse
    {
        $lawFirm = LawFirm::with(['user', 'specializations', 'ratings.client.user'])
            ->approved()
            ->findOrFail($id);

        $client = $request->user()->client;
        $distance = null;

        if ($client->latitude && $client->longitude && $lawFirm->latitude && $lawFirm->longitude) {
            $geoService = app(\App\Services\GeoService::class);
            $distance = round($geoService->calculateDistance(
                $client->latitude,
                $client->longitude,
                $lawFirm->latitude,
                $lawFirm->longitude
            ), 2);
        }

        return response()->json([
            'law_firm' => $lawFirm,
            'average_rating' => round($lawFirm->ratings->avg('rating') ?? 0, 1),
            'rating_count' => $lawFirm->ratings->count(),
            'distance_km' => $distance,
        ]);
    }

    /**
     * Create an appointment (client initiated)
     */
    public function createAppointment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'law_firm_id' => 'required|exists:law_firms,id',
            'specialization_id' => 'nullable|exists:specializations,id',
            'scheduled_at' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $client = $request->user()->client;

        // Check if law firm is approved
        $lawFirm = LawFirm::approved()->findOrFail($validated['law_firm_id']);

        $appointment = Appointment::create([
            'client_id' => $client->id,
            'law_firm_id' => $lawFirm->id,
            'specialization_id' => $validated['specialization_id'] ?? null,
            'scheduled_at' => $validated['scheduled_at'] ?? now(),
            'duration_minutes' => 60, // Default duration
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        broadcast(new AppointmentCreated($appointment->load(['lawFirm.user', 'specialization', 'client.user'])))->toOthers();

        return response()->json([
            'message' => 'Appointment request sent successfully',
            'appointment' => $appointment->load(['lawFirm.user', 'specialization']),
        ], 201);
    }
}
