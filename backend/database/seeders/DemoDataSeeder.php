<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\LawFirm;
use App\Models\Rating;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get specializations
        $specializations = Specialization::all();

        if ($specializations->isEmpty()) {
            $this->command->error('Please run SpecializationSeeder first!');
            return;
        }

        // Create demo clients
        $clients = [];
        $clientNames = [
            'Juan Dela Cruz',
            'Maria Santos',
            'Pedro Rodriguez',
            'Ana Reyes',
            'Jose Garcia',
            'Carmen Lopez',
            'Miguel Torres',
            'Sofia Hernandez'
        ];

        foreach ($clientNames as $i => $clientName) {
            // Check if email already exists
            $existingUser = User::where('email', "client$i@demo.com")->first();
            if ($existingUser) {
                $this->command->warn("Client client$i@demo.com already exists, loading existing...");
                $existingClient = Client::where('user_id', $existingUser->id)->first();
                if ($existingClient) {
                    $clients[] = $existingClient;
                }
                continue;
            }

            $user = User::create([
                'name' => $clientName,
                'email' => "client$i@demo.com",
                'password' => Hash::make('password'),
                'role' => 'client',
            ]);

            $client = Client::create([
                'user_id' => $user->id,
                'latitude' => 14.5995 + (rand(-100, 100) / 1000),
                'longitude' => 120.9842 + (rand(-100, 100) / 1000),
                'address' => 'Manila, Philippines',
            ]);

            // Attach random specializations
            $client->specializations()->attach(
                $specializations->random(rand(1, 3))->pluck('id')
            );

            $clients[] = $client;
        }

        // Create demo law firms
        $lawFirms = [];
        $firmNames = [
            'Santos & Associates Law Office',
            'Martinez Legal Consulting',
            'Cruz Law Partners',
            'Reyes & Co. Legal Services',
            'Garcia Legal Group',
            'Aquino Law Firm',
            'Ramos & Partners',
            'Villanueva Legal Solutions'
        ];

        foreach ($firmNames as $i => $firmName) {
            // Check if email already exists
            $existingUser = User::where('email', "lawfirm$i@demo.com")->first();
            if ($existingUser) {
                $this->command->warn("Law firm lawfirm$i@demo.com already exists, loading existing...");
                $existingLawFirm = LawFirm::where('user_id', $existingUser->id)->first();
                if ($existingLawFirm) {
                    $lawFirms[] = $existingLawFirm;
                }
                continue;
            }

            $user = User::create([
                'name' => "Attorney " . explode(' ', $firmName)[0],
                'email' => "lawfirm$i@demo.com",
                'password' => Hash::make('password'),
                'role' => 'law_firm',
            ]);

            $lawFirm = LawFirm::create([
                'user_id' => $user->id,
                'firm_name' => $firmName,
                'license_number' => 'LIC-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'phone' => '+63912345678' . $i,
                'address' => ($i + 1) . "F Building " . chr(65 + $i) . ", Makati Avenue, Makati City, Metro Manila, Philippines",
                'latitude' => 14.5547 + (rand(-50, 50) / 1000),
                'longitude' => 121.0244 + (rand(-50, 50) / 1000),
                'verification_status' => 'approved',
                'verified_at' => now()->subDays(rand(30, 180)),
            ]);

            // Attach random specializations
            $lawFirm->specializations()->attach(
                $specializations->random(rand(2, 4))->pluck('id')
            );

            $lawFirms[] = $lawFirm;
        }

        // Create demo appointments with more completed ones for analytics
        $statuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'pending', 'confirmed', 'cancelled'];
        $appointmentNotes = [
            'Need consultation regarding family law matter.',
            'Seeking advice on business contract review.',
            'Immigration documentation assistance required.',
            'Property dispute consultation needed.',
            'Employment law guidance requested.',
            'Criminal defense consultation.',
            'Intellectual property concerns.',
            'Tax law compliance questions.'
        ];

        $appointmentsCreated = 0;
        for ($i = 0; $i < 40; $i++) {
            if (empty($clients) || empty($lawFirms)) {
                $this->command->warn('Not enough clients or law firms to create appointments');
                break;
            }

            $client = $clients[array_rand($clients)];
            $lawFirm = $lawFirms[array_rand($lawFirms)];
            $status = $statuses[array_rand($statuses)];

            // Create more appointments in recent months for better analytics
            $daysAgo = $status === 'completed' ? rand(7, 90) : rand(1, 30);
            $scheduledAt = now()->subDays($daysAgo)->setTime(rand(8, 17), [0, 15, 30, 45][rand(0, 3)]);

            $appointment = Appointment::create([
                'client_id' => $client->id,
                'law_firm_id' => $lawFirm->id,
                'specialization_id' => $specializations->random()->id,
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => [30, 60, 90][rand(0, 2)],
                'status' => $status,
                'notes' => $appointmentNotes[array_rand($appointmentNotes)],
            ]);

            $appointmentsCreated++;

            // Add ratings for most completed appointments
            if ($status === 'completed' && rand(0, 100) > 20) { // 80% chance of rating
                $ratingValue = rand(3, 5);
                $comments = [
                    5 => [
                        'Excellent service! Very professional and knowledgeable.',
                        'Highly recommend! Solved my legal issues efficiently.',
                        'Outstanding consultation. Will definitely return.',
                        'Professional, thorough, and helpful. 5 stars!',
                    ],
                    4 => [
                        'Great service overall. Very satisfied with the consultation.',
                        'Good legal advice. Helpful and professional.',
                        'Very good experience. Would recommend.',
                    ],
                    3 => [
                        'Decent consultation. Got what I needed.',
                        'Satisfactory service. Met my expectations.',
                    ]
                ];

                Rating::create([
                    'client_id' => $client->id,
                    'law_firm_id' => $lawFirm->id,
                    'appointment_id' => $appointment->id,
                    'rating' => $ratingValue,
                    'review' => $comments[$ratingValue][array_rand($comments[$ratingValue])],
                    'created_at' => $scheduledAt->copy()->addDays(1),
                ]);
            }
        }

        $this->command->info('✓ Demo data seeded successfully!');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('📊 Summary:');
        $this->command->info('  • Clients created: ' . count($clients));
        $this->command->info('  • Law firms created: ' . count($lawFirms));
        $this->command->info('  • Appointments created: ' . $appointmentsCreated);
        $this->command->info('  • Ratings added: ' . Rating::count());
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('🔐 Login Credentials:');
        $this->command->info('  Client: client0@demo.com / password');
        $this->command->info('  Law Firm: lawfirm0@demo.com / password');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}
