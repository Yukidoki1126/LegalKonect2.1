<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\LawFirm;
use App\Models\Rating;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    private GeoService $geoService;

    public function __construct(GeoService $geoService)
    {
        $this->geoService = $geoService;
    }

    /**
     * Get dashboard statistics for admin
     */
    public function getDashboardStats(): array
    {
        return [
            'total_clients' => Client::count(),
            'total_law_firms' => LawFirm::count(),
            'approved_firms' => LawFirm::approved()->count(),
            'pending_verifications' => LawFirm::pending()->count(),
            'rejected_firms' => LawFirm::where('verification_status', 'rejected')->count(),
            'total_appointments' => Appointment::count(),
            'appointments_this_month' => Appointment::whereMonth('scheduled_at', now()->month)
                ->whereYear('scheduled_at', now()->year)
                ->count(),
            'completed_appointments' => Appointment::completed()->count(),
            'average_rating' => round(Rating::avg('rating') ?? 0, 1),
        ];
    }

    /**
     * Get top requested specializations
     */
    public function getTopSpecializations(int $limit = 5): Collection
    {
        return DB::table('client_specializations')
            ->select('specializations.name', DB::raw('COUNT(*) as count'))
            ->join('specializations', 'specializations.id', '=', 'client_specializations.specialization_id')
            ->groupBy('specializations.id', 'specializations.name')
            ->orderByDesc('count')
            ->limit($limit)
            ->get();
    }

    /**
     * Get monthly appointment trends
     */
    public function getMonthlyAppointments(int $months = 12): Collection
    {
        return Appointment::query()
            ->select(
                DB::raw('DATE_FORMAT(scheduled_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed'),
                DB::raw('SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled')
            )
            ->where('scheduled_at', '>=', now()->subMonths($months))
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    /**
     * Get appointment status distribution
     */
    public function getAppointmentStatusDistribution(): Collection
    {
        return Appointment::query()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();
    }

    /**
     * Calculate average distance between clients and their booked firms
     */
    public function getAverageClientFirmDistance(): float
    {
        $appointments = Appointment::with(['client', 'lawFirm'])->get();

        $distances = [];
        foreach ($appointments as $appointment) {
            $client = $appointment->client;
            $firm = $appointment->lawFirm;

            if (
                $this->geoService->isValidCoordinates($client->latitude, $client->longitude) &&
                $this->geoService->isValidCoordinates($firm->latitude, $firm->longitude)
            ) {
                $distances[] = $this->geoService->calculateDistance(
                    $client->latitude,
                    $client->longitude,
                    $firm->latitude,
                    $firm->longitude
                );
            }
        }

        return count($distances) > 0 ? round(array_sum($distances) / count($distances), 2) : 0;
    }

    /**
     * Get distance distribution histogram data
     */
    public function getDistanceDistribution(): array
    {
        $ranges = [
            '0-5' => 0,
            '5-10' => 0,
            '10-15' => 0,
            '15-20' => 0,
            '20-30' => 0,
            '30+' => 0,
        ];

        $appointments = Appointment::with(['client', 'lawFirm'])->get();

        foreach ($appointments as $appointment) {
            $client = $appointment->client;
            $firm = $appointment->lawFirm;

            if (
                $this->geoService->isValidCoordinates($client->latitude, $client->longitude) &&
                $this->geoService->isValidCoordinates($firm->latitude, $firm->longitude)
            ) {
                $distance = $this->geoService->calculateDistance(
                    $client->latitude,
                    $client->longitude,
                    $firm->latitude,
                    $firm->longitude
                );

                if ($distance <= 5)
                    $ranges['0-5']++;
                elseif ($distance <= 10)
                    $ranges['5-10']++;
                elseif ($distance <= 15)
                    $ranges['10-15']++;
                elseif ($distance <= 20)
                    $ranges['15-20']++;
                elseif ($distance <= 30)
                    $ranges['20-30']++;
                else
                    $ranges['30+']++;
            }
        }

        return $ranges;
    }

    /**
     * Get registration trends
     */
    public function getRegistrationTrends(int $months = 12): array
    {
        $clientTrends = Client::query()
            ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', now()->subMonths($months))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        $firmTrends = LawFirm::query()
            ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', now()->subMonths($months))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        return [
            'clients' => $clientTrends,
            'law_firms' => $firmTrends,
        ];
    }

    /**
     * Get descriptive analytics for top performing and most rated firms
     */
    public function getDescriptiveAnalytics(): array
    {
        // Most performing (most completed appointments)
        $mostPerforming = LawFirm::query()
            ->select('law_firms.*', DB::raw('COUNT(appointments.id) as completed_count'))
            ->join('appointments', 'law_firms.id', '=', 'appointments.law_firm_id')
            ->where('appointments.status', 'completed')
            ->groupBy('law_firms.id')
            ->orderByDesc('completed_count')
            ->first();

        // Most rated (highest average rating with at least 1 rating)
        // We'll also consider the count of ratings to break ties or ensure significance
        $mostRated = LawFirm::query()
            ->select('law_firms.*', DB::raw('AVG(ratings.rating) as average_rating'), DB::raw('COUNT(ratings.id) as rating_count'))
            ->join('ratings', 'law_firms.id', '=', 'ratings.law_firm_id')
            ->groupBy('law_firms.id')
            ->having('rating_count', '>', 0)
            ->orderByDesc('average_rating')
            ->orderByDesc('rating_count')
            ->first();

        return [
            'most_performing' => $mostPerforming ? [
                'id' => $mostPerforming->id,
                'firm_name' => $mostPerforming->firm_name,
                'completed_appointments' => $mostPerforming->completed_count,
            ] : null,
            'most_rated' => $mostRated ? [
                'id' => $mostRated->id,
                'firm_name' => $mostRated->firm_name,
                'average_rating' => round($mostRated->average_rating, 1),
                'rating_count' => $mostRated->rating_count,
            ] : null,
        ];
    }
}
