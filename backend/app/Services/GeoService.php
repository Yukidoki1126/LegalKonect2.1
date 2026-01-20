<?php

namespace App\Services;

class GeoService
{
    private const EARTH_RADIUS_KM = 6371;

    /**
     * Calculate distance between two coordinates using Haversine formula
     *
     * @param  float  $lat1  Latitude of point 1
     * @param  float  $lon1  Longitude of point 1
     * @param  float  $lat2  Latitude of point 2
     * @param  float  $lon2  Longitude of point 2
     * @return float Distance in kilometers
     */
    public function calculateDistance(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        // Convert degrees to radians
        $lat1Rad = deg2rad($lat1);
        $lat2Rad = deg2rad($lat2);
        $deltaLat = deg2rad($lat2 - $lat1);
        $deltaLon = deg2rad($lon2 - $lon1);

        // Haversine formula
        $a = sin($deltaLat / 2) ** 2
            + cos($lat1Rad) * cos($lat2Rad) * sin($deltaLon / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return self::EARTH_RADIUS_KM * $c;
    }

    /**
     * Check if coordinates are valid
     */
    public function isValidCoordinates(?float $lat, ?float $lon): bool
    {
        if ($lat === null || $lon === null) {
            return false;
        }

        return $lat >= -90 && $lat <= 90 && $lon >= -180 && $lon <= 180;
    }
}
