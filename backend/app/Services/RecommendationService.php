<?php

namespace App\Services;

use App\Models\Client;
use App\Models\LawFirm;
use Illuminate\Support\Collection;

class RecommendationService
{
    // Weights aligned with frontend match score calculation
    private const WEIGHT_SPECIALIZATION = 0.40;  // Specialization match is most important

    private const WEIGHT_RATING = 0.25;

    private const WEIGHT_DISTANCE = 0.20;

    private const WEIGHT_EXPERIENCE = 0.15;  // Based on number of reviews

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
            $averageRating = round($firm->ratings->avg('rating') ?? 0, 1);
            $ratingScore = $this->normalizeRating($averageRating, $firm->ratings->count());
            $ratingCount = $firm->ratings->count();
            $specializationScore = $this->calculateSpecializationMatch(
                $firm->specializations->pluck('id')->toArray(),
                $clientSpecializations
            );
            $experienceScore = $this->normalizeExperience($firm->experience_range);

            // Calculate weighted total (aligned with frontend match score)
            $totalScore = (self::WEIGHT_SPECIALIZATION * $specializationScore)
                + (self::WEIGHT_DISTANCE * $distanceScore)
                + (self::WEIGHT_RATING * $ratingScore)
                + (self::WEIGHT_EXPERIENCE * $experienceScore);

            return [
                'law_firm' => $firm,
                'distance_km' => round($distance, 2),
                'average_rating' => $averageRating,
                'rating_count' => $ratingCount,
                'specialization_match' => $specializationScore > 0,
                'matching_specializations' => $firm->specializations
                    ->whereIn('id', $clientSpecializations)
                    ->pluck('name'),
                'scores' => [
                    'distance' => round($distanceScore, 4),
                    'rating' => round($ratingScore, 4),
                    'specialization' => round($specializationScore, 4),
                    'experience' => round($experienceScore, 4),
                ],
                'total_score' => round($totalScore, 4),
            ];
        })
            // Filter by client preferences
            ->when($client->preferred_min_rating, function ($collection) use ($client) {
                return $collection->filter(function ($item) use ($client) {
                    // Keep firms with no ratings or firms meeting the minimum rating
                    return $item['rating_count'] === 0 || $item['average_rating'] >= $client->preferred_min_rating;
                });
            })
            ->when($client->preferred_max_distance, function ($collection) use ($client) {
                return $collection->filter(function ($item) use ($client) {
                    // Keep firms within the max distance (0 distance means no location data, keep those)
                    return $item['distance_km'] == 0 || $item['distance_km'] <= $client->preferred_max_distance;
                });
            })
            ->when($client->preferred_experience, function ($collection) use ($client) {
                return $collection->filter(function ($item) use ($client) {
                    $firmExperience = $item['law_firm']->experience_range;
                    // Keep firms with no experience data
                    if (empty($firmExperience)) {
                        return true;
                    }
                    $firmLevel = $this->experienceToLevel($firmExperience);
                    $preferredLevel = $this->experienceToLevel($client->preferred_experience);
                    return $firmLevel === $preferredLevel;
                });
            })
            ->sortByDesc('total_score')
            ->values();
    }

    /**
     * Convert experience range string to a numeric level for comparison
     */
    private function experienceToLevel(?string $experienceRange): int
    {
        if (empty($experienceRange)) {
            return 0;
        }

        if (str_contains($experienceRange, '10+') || str_contains($experienceRange, '10 +')) {
            return 5;
        } elseif (str_contains($experienceRange, '8-10') || str_contains($experienceRange, '8 - 10')) {
            return 4;
        } elseif (str_contains($experienceRange, '5-8') || str_contains($experienceRange, '5 - 8')) {
            return 3;
        } elseif (str_contains($experienceRange, '3-5') || str_contains($experienceRange, '3 - 5')) {
            return 2;
        } else {
            return 1; // 1-3 years
        }
    }

    /**
     * Normalize distance score (0-1, higher is better/closer)
     * Uses distance brackets matching frontend logic
     */
    private function normalizeDistance(float $distance): float
    {
        if ($distance <= 5) {
            return 1.0;    // Within 5km = full score
        } elseif ($distance <= 10) {
            return 0.8;    // 5-10km = 80%
        } elseif ($distance <= 20) {
            return 0.6;    // 10-20km = 60%
        } elseif ($distance <= 50) {
            return 0.4;    // 20-50km = 40%
        } else {
            return 0.2;    // >50km = 20%
        }
    }

    /**
     * Normalize rating score (0-1)
     * Firms with no ratings get 0 for transparent scoring
     */
    private function normalizeRating(float $rating, int $ratingCount): float
    {
        if ($ratingCount === 0) {
            return 0; // No ratings = 0 score (transparent scoring)
        }
        return $rating / 5;
    }

    /**
     * Normalize experience score based on years of experience (0-1)
     * 8+ years is considered peak experience for practical legal work
     */
    private function normalizeExperience(?string $experienceRange): float
    {
        if (empty($experienceRange)) {
            return 0;    // No experience data = 0 (transparent scoring)
        }
        
        // Score based on experience range — 8+ years is realistically max
        if (str_contains($experienceRange, '8-10') || str_contains($experienceRange, '8 - 10')) {
            return 1.0;    // 8-10 years = full score (peak experience)
        } elseif (str_contains($experienceRange, '10+') || str_contains($experienceRange, '10 +')) {
            return 1.0;    // 10+ years = full score
        } elseif (str_contains($experienceRange, '5-8') || str_contains($experienceRange, '5 - 8')) {
            return 0.8;    // 5-8 years = 80%
        } elseif (str_contains($experienceRange, '3-5') || str_contains($experienceRange, '3 - 5')) {
            return 0.6;    // 3-5 years = 60%
        } else {
            return 0.4;    // 1-3 years = 40%
        }
    }

    /**
     * Calculate specialization match score (0-1, proportional to matches)
     * Higher score for matching more of the client's preferred specializations
     */
    private function calculateSpecializationMatch(array $firmSpecs, array $clientSpecs): float
    {
        if (empty($clientSpecs)) {
            // If client has no preferences, give partial score based on firm having specializations
            return count($firmSpecs) > 0 ? 0.5 : 0;
        }

        $matches = array_intersect($firmSpecs, $clientSpecs);
        
        // Proportional match: matching 2 out of 2 preferences = 1.0, matching 1 out of 2 = 0.5
        return count($matches) / count($clientSpecs);
    }
}
