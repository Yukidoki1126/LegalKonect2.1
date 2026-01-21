<?php

use App\Services\AnalyticsService;
use App\Services\GeoService;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$analyticsService = new AnalyticsService(new GeoService());

echo "Testing Analytics Service...\n";
echo "============================\n\n";

try {
    echo "1. Testing Dashboard Stats...\n";
    $stats = $analyticsService->getDashboardStats();
    print_r($stats);
    echo "\n";

    echo "2. Testing Top Specializations...\n";
    $topSpecs = $analyticsService->getTopSpecializations(5);
    print_r($topSpecs->toArray());
    echo "\n";

    echo "3. Testing Monthly Appointments...\n";
    $monthly = $analyticsService->getMonthlyAppointments(12);
    print_r($monthly->toArray());
    echo "\n";

    echo "4. Testing Descriptive Analytics...\n";
    $descriptive = $analyticsService->getDescriptiveAnalytics();
    print_r($descriptive);
    echo "\n";

    echo "✅ All tests passed!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
