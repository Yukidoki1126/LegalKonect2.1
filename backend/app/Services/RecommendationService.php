<?php

namespace App\Services;

use App\Models\Client;
use App\Models\LawFirm;
use Illuminate\Support\Collection;

class RecommendationService
{
    private const WEIGHT_DISTANCE = 0.40;

    private const WEIGHT_RATING = 0.35;

    private const WEIGHT_SPECIALIZATION = 0.25;

    private const MAX_DISTANCE_KM = 50;

    private GeoService $geoService;

    public function __construct(GeoService $geoService)
    {
        $this->geoService = $geoService;
    }

    /**
     * Get recommended law firms for a client sorted by weighted score
     */
    public function getRecommendations(Client $client): Collection
    {
        $clientSpecializations = $client->specializations->pluck('id')->toArray();

        $lawFirms = LawFirm::query()
            ->approved()
            ->with(['specializations', 'ratings', 'user'])
            ->get();

        return $lawFirms->map(function ($firm) use ($client, $clientSpecializations) {
            // Calculate distance
            $distance = 0;
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
            }

            // Calculate scores
            $distanceScore = $this->normalizeDistance($distance);
            $ratingScore = $this->normalizeRating($firm->ratings->avg('rating') ?? 0);
            $specializationScore = $this->calculateSpecializationMatch(
                $firm->specializations->pluck('id')->toArray(),
                $clientSpecializations
            );

            // Calculate weighted total
            $totalScore = (self::WEIGHT_DISTANCE * $distanceScore)
                + (self::WEIGHT_RATING * $ratingScore)
                + (self::WEIGHT_SPECIALIZATION * $specializationScore);

            return [
                'law_firm' => $firm,
                'distance_km' => round($distance, 2),
                'average_rating' => round($firm->ratings->avg('rating') ?? 0, 1),
                'rating_count' => $firm->ratings->count(),
                'specialization_match' => $specializationScore > 0,
                'matching_specializations' => $firm->specializations
                    ->whereIn('id', $clientSpecializations)
                    ->pluck('name'),
                'scores' => [
                    'distance' => round($distanceScore, 4),
                    'rating' => round($ratingScore, 4),
                    'specialization' => round($specializationScore, 4),
                ],
                'total_score' => round($totalScore, 4),
            ];
        })
            ->sortByDesc('total_score')
            ->values();
    }

    /**
     * Normalize distance score (0-1, higher is better/closer)
     */
    private function normalizeDistance(float $distance): float
    {
        return 1 - min($distance / self::MAX_DISTANCE_KM, 1);
    }

    /**
     * Normalize rating score (0-1)
     */
    private function normalizeRating(float $rating): float
    {
        return $rating / 5;
    }

    /**
     * Calculate specialization match score (0 or 1)
     */
    private function calculateSpecializationMatch(array $firmSpecs, array $clientSpecs): float
    {
        if (empty($clientSpecs)) {
            return 1; // If client has no preferences, all firms match
        }

        $matches = array_intersect($firmSpecs, $clientSpecs);

        return count($matches) > 0 ? 1 : 0;
    }
}
