<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\LawFirm;
use App\Models\Rating;
use Illuminate\Database\Seeder;

class DavaoRatingsSeeder extends Seeder
{
    /**
     * Seed ratings for Davao law firms to boost their match scores.
     */
    public function run(): void
    {
        $davaoFirms = LawFirm::whereIn('firm_name', [
            'Sudagar Law Office',
            'Cabanero Law Office',
            'Zamora Law Office',
            'Caubang Law Office',
            'Angeles Law Office',
            'Guinomla Law Firm',
            'Latog Law Office',
            'Bajenting Law Office'
        ])->get();

        if ($davaoFirms->isEmpty()) {
            $this->command->error('❌ No Davao law firms found! Please run LawFirmSeeder first.');
            return;
        }

        $clients = Client::all();

        if ($clients->isEmpty()) {
            $this->command->error('❌ No clients found! Please create client accounts first.');
            return;
        }

        $comments = [
            'Excellent legal service! Very professional and knowledgeable.',
            'Highly recommend! They handled my case with great expertise.',
            'Outstanding representation. Very responsive and thorough.',
            'Professional and reliable. Got great results for my case.',
            'Best law firm in Davao! Highly recommended.',
            'Very satisfied with their service. They are experts in their field.',
            'Efficient and effective legal assistance. Worth every peso.',
            'Top-notch legal services. Very patient in explaining everything.',
            'Exceptional legal expertise and customer service.',
            'Great experience! They made the legal process easy to understand.',
        ];

        $created = 0;

        foreach ($davaoFirms as $firm) {
            // Create 4-6 ratings per firm with high scores (4-5 stars)
            $numRatings = rand(4, 6);
            
            for ($i = 0; $i < $numRatings; $i++) {
                $client = $clients->random();
                
                // Check if rating already exists
                $existing = Rating::where('law_firm_id', $firm->id)
                    ->where('client_id', $client->id)
                    ->first();
                
                if (!$existing) {
                    Rating::create([
                        'law_firm_id' => $firm->id,
                        'client_id' => $client->id,
                        'rating' => rand(4, 5), // 4 or 5 stars
                        'review' => $comments[array_rand($comments)],
                        'created_at' => now()->subDays(rand(10, 120)),
                        'updated_at' => now()->subDays(rand(10, 120)),
                    ]);
                    $created++;
                }
            }
            
            // Calculate average rating
            $avgRating = Rating::where('law_firm_id', $firm->id)->avg('rating');
            $ratingCount = Rating::where('law_firm_id', $firm->id)->count();
            
            $this->command->info("✅ {$firm->firm_name}");
            $this->command->line("   ⭐ Average Rating: {$avgRating}/5.0 ({$ratingCount} reviews)");
        }

        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════');
        $this->command->info("✅ Created {$created} ratings for Davao law firms");
        $this->command->info('═══════════════════════════════════════');
    }
}
