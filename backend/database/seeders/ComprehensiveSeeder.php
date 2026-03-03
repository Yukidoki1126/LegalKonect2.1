<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Client;
use App\Models\LawFirm;
use App\Models\Specialization;
use App\Models\Appointment;
use App\Models\Rating;
use Illuminate\Support\Facades\Hash;

class ComprehensiveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Specializations
        $specializations = [
            ['name' => 'Family Law', 'description' => 'Divorce, custody, adoption, and family matters'],
            ['name' => 'Criminal Law', 'description' => 'Defense for criminal charges and legal representation'],
            ['name' => 'Corporate Law', 'description' => 'Business formation, contracts, and corporate matters'],
            ['name' => 'Real Estate Law', 'description' => 'Property transactions, disputes, and regulations'],
            ['name' => 'Immigration Law', 'description' => 'Visas, citizenship, and immigration matters'],
            ['name' => 'Labor Law', 'description' => 'Employment disputes, labor rights, and workplace issues'],
            ['name' => 'Tax Law', 'description' => 'Tax planning, disputes, and compliance'],
            ['name' => 'Intellectual Property', 'description' => 'Patents, trademarks, and copyright protection'],
        ];

        $createdSpecializations = [];
        foreach ($specializations as $spec) {
            $createdSpecializations[] = Specialization::create($spec);
        }

        // Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@legalkonect.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create Law Firms (5 firms)
        $lawFirms = [
            [
                'firm_name' => 'Smith & Associates Law Firm',
                'license_number' => 'LIC-001-2024',
                'email' => 'firm1@legalkonect.com',
                'description' => 'Leading law firm specializing in corporate and family law with over 20 years of experience.',
                'experience_range' => '15-20 years',
                'contact_person_name' => 'John Smith',
                'contact_person_role' => 'Senior Partner',
                'contact_person_phone' => '+63 917 123 4567',
                'contact_person_email' => 'john.smith@smithlaw.com',
                'phone' => '+63 917 123 4567',
                'address' => '123 Ayala Avenue, Makati City, Metro Manila',
                'latitude' => 14.5547,
                'longitude' => 121.0244,
                'verification_status' => 'approved',
                'verified_at' => now(),
                'specializations' => [0, 2, 3], // Family, Corporate, Real Estate
            ],
            [
                'firm_name' => 'Rodriguez Legal Partners',
                'license_number' => 'LIC-002-2024',
                'email' => 'firm2@legalkonect.com',
                'description' => 'Expert legal services in criminal defense and labor law matters.',
                'experience_range' => '10-15 years',
                'contact_person_name' => 'Maria Rodriguez',
                'contact_person_role' => 'Managing Partner',
                'contact_person_phone' => '+63 917 234 5678',
                'contact_person_email' => 'maria.rodriguez@rodlaw.com',
                'phone' => '+63 917 234 5678',
                'address' => '456 Osmeña Boulevard, Cebu City',
                'latitude' => 10.3157,
                'longitude' => 123.8854,
                'verification_status' => 'approved',
                'verified_at' => now(),
                'specializations' => [1, 5, 6], // Criminal, Labor, Tax
            ],
            [
                'firm_name' => 'Dela Cruz Law Office',
                'license_number' => 'LIC-003-2024',
                'email' => 'firm3@legalkonect.com',
                'description' => 'Comprehensive legal services for immigration and real estate matters.',
                'experience_range' => '10-15 years',
                'contact_person_name' => 'Antonio Dela Cruz',
                'contact_person_role' => 'Lead Attorney',
                'contact_person_phone' => '+63 917 345 6789',
                'contact_person_email' => 'antonio@delacruzlaw.com',
                'phone' => '+63 917 345 6789',
                'address' => '789 J.P. Laurel Avenue, Davao City',
                'latitude' => 7.1907,
                'longitude' => 125.4553,
                'verification_status' => 'approved',
                'verified_at' => now(),
                'specializations' => [3, 4], // Real Estate, Immigration
            ],
            [
                'firm_name' => 'Santos Corporate Law Group',
                'license_number' => 'LIC-004-2024',
                'email' => 'firm4@legalkonect.com',
                'description' => 'Premier corporate law firm handling mergers, acquisitions, and intellectual property.',
                'experience_range' => '20+ years',
                'contact_person_name' => 'Isabella Santos',
                'contact_person_role' => 'CEO',
                'contact_person_phone' => '+63 917 456 7890',
                'contact_person_email' => 'isabella.santos@santoslaw.com',
                'phone' => '+63 917 456 7890',
                'address' => '321 Quezon Avenue, Quezon City',
                'latitude' => 14.6760,
                'longitude' => 121.0437,
                'verification_status' => 'approved',
                'verified_at' => now(),
                'specializations' => [2, 6, 7], // Corporate, Tax, IP
            ],
            [
                'firm_name' => 'Garcia & Partners Legal Services',
                'license_number' => 'LIC-005-2024',
                'email' => 'firm5@legalkonect.com',
                'description' => 'Full-service law firm with expertise in family, labor, and criminal law.',
                'experience_range' => '15-20 years',
                'contact_person_name' => 'Carlos Garcia',
                'contact_person_role' => 'Founding Partner',
                'contact_person_phone' => '+63 917 567 8901',
                'contact_person_email' => 'carlos@garciapartners.com',
                'phone' => '+63 917 567 8901',
                'address' => '555 BGC, Taguig City',
                'latitude' => 14.5176,
                'longitude' => 121.0509,
                'verification_status' => 'approved',
                'verified_at' => now(),
                'specializations' => [0, 1, 5], // Family, Criminal, Labor
            ],
        ];

        $createdLawFirms = [];
        foreach ($lawFirms as $firmData) {
            $specs = $firmData['specializations'];
            unset($firmData['specializations']);

            $user = User::create([
                'name' => $firmData['firm_name'],
                'email' => $firmData['email'],
                'password' => Hash::make('password'),
                'role' => 'law_firm',
            ]);

            $firm = LawFirm::create(array_merge($firmData, ['user_id' => $user->id]));
            
            // Attach specializations
            $specIds = array_map(fn($i) => $createdSpecializations[$i]->id, $specs);
            $firm->specializations()->attach($specIds);

            $createdLawFirms[] = $firm;
        }

        // Create Clients (10 clients)
        $clients = [
            ['name' => 'Juan Dela Cruz', 'email' => 'client1@legalkonect.com', 'phone' => '+63 917 111 2222', 'address' => 'Manila, Philippines', 'latitude' => 14.5995, 'longitude' => 120.9842, 'specializations' => [0, 1]],
            ['name' => 'Maria Santos', 'email' => 'client2@legalkonect.com', 'phone' => '+63 917 222 3333', 'address' => 'Quezon City, Philippines', 'latitude' => 14.6760, 'longitude' => 121.0437, 'specializations' => [2, 3]],
            ['name' => 'Pedro Garcia', 'email' => 'client3@legalkonect.com', 'phone' => '+63 917 333 4444', 'address' => 'Makati City, Philippines', 'latitude' => 14.5547, 'longitude' => 121.0244, 'specializations' => [4]],
            ['name' => 'Ana Rodriguez', 'email' => 'client4@legalkonect.com', 'phone' => '+63 917 444 5555', 'address' => 'Cebu City, Philippines', 'latitude' => 10.3157, 'longitude' => 123.8854, 'specializations' => [1, 5]],
            ['name' => 'Carlos Reyes', 'email' => 'client5@legalkonect.com', 'phone' => '+63 917 555 6666', 'address' => 'Davao City, Philippines', 'latitude' => 7.1907, 'longitude' => 125.4553, 'specializations' => [3, 4]],
            ['name' => 'Sofia Mendoza', 'email' => 'client6@legalkonect.com', 'phone' => '+63 917 666 7777', 'address' => 'Pasig City, Philippines', 'latitude' => 14.5764, 'longitude' => 121.0851, 'specializations' => [0]],
            ['name' => 'Miguel Torres', 'email' => 'client7@legalkonect.com', 'phone' => '+63 917 777 8888', 'address' => 'Taguig City, Philippines', 'latitude' => 14.5176, 'longitude' => 121.0509, 'specializations' => [2, 6, 7]],
            ['name' => 'Lucia Fernandez', 'email' => 'client8@legalkonect.com', 'phone' => '+63 917 888 9999', 'address' => 'Mandaluyong, Philippines', 'latitude' => 14.5794, 'longitude' => 121.0359, 'specializations' => [1]],
            ['name' => 'Roberto Cruz', 'email' => 'client9@legalkonect.com', 'phone' => '+63 917 999 0000', 'address' => 'Parañaque, Philippines', 'latitude' => 14.4793, 'longitude' => 121.0198, 'specializations' => [5, 6]],
            ['name' => 'Elena Martinez', 'email' => 'client10@legalkonect.com', 'phone' => '+63 917 000 1111', 'address' => 'Las Piñas, Philippines', 'latitude' => 14.4453, 'longitude' => 120.9820, 'specializations' => [7]],
        ];

        $createdClients = [];
        foreach ($clients as $clientData) {
            $specs = $clientData['specializations'];
            $name = $clientData['name'];
            $email = $clientData['email'];
            unset($clientData['specializations'], $clientData['name'], $clientData['email']);

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'client',
            ]);

            $client = Client::create(array_merge($clientData, ['user_id' => $user->id]));
            
            // Attach specializations
            $specIds = array_map(fn($i) => $createdSpecializations[$i]->id, $specs);
            $client->specializations()->attach($specIds);

            $createdClients[] = $client;
        }

        // Create Appointments (mix of pending, confirmed, completed, cancelled)
        $appointmentStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        $appointmentNotes = [
            'Need urgent consultation regarding family matter.',
            'Seeking legal advice for business contract review.',
            'Immigration visa application assistance needed.',
            'Property dispute resolution required.',
            'Employment termination case.',
            'Tax compliance consultation.',
            'Intellectual property protection inquiry.',
            'Criminal defense representation needed.',
        ];

        for ($i = 0; $i < 30; $i++) {
            $client = $createdClients[array_rand($createdClients)];
            $lawFirm = $createdLawFirms[array_rand($createdLawFirms)];
            $status = $appointmentStatuses[array_rand($appointmentStatuses)];
            
            // Create appointments within the last 30 days and next 30 days
            $daysOffset = rand(-30, 30);
            $hour = rand(9, 17);
            $minute = rand(0, 3) * 15; // 0, 15, 30, 45
            
            $scheduledAt = now()->addDays($daysOffset)->setTime($hour, $minute);

            $appointment = Appointment::create([
                'client_id' => $client->id,
                'law_firm_id' => $lawFirm->id,
                'specialization_id' => $createdSpecializations[array_rand($createdSpecializations)]->id,
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => rand(1, 2) * 30, // 30 or 60 minutes
                'status' => $status,
                'notes' => $appointmentNotes[array_rand($appointmentNotes)],
            ]);

            // Add cancellation reason if cancelled
            if ($status === 'cancelled') {
                $appointment->update([
                    'cancellation_reason' => 'Schedule conflict / Client requested cancellation'
                ]);
            }

            // Create ratings for completed appointments
            if ($status === 'completed' && rand(0, 1)) {
                Rating::create([
                    'client_id' => $client->id,
                    'law_firm_id' => $lawFirm->id,
                    'appointment_id' => $appointment->id,
                    'rating' => rand(3, 5),
                    'review' => 'Excellent service! Very professional and knowledgeable. Highly recommended.',
                ]);
            }
        }

        $this->command->info('✓ Database seeded successfully!');
        $this->command->info('✓ Created ' . count($createdSpecializations) . ' specializations');
        $this->command->info('✓ Created ' . count($createdLawFirms) . ' law firms');
        $this->command->info('✓ Created ' . count($createdClients) . ' clients');
        $this->command->info('✓ Created 30 appointments');
        $this->command->info('');
        $this->command->info('Login Credentials:');
        $this->command->info('Admin: admin@legalkonect.com / password');
        $this->command->info('Law Firm: firm1@legalkonect.com to firm5@legalkonect.com / password');
        $this->command->info('Client: client1@legalkonect.com to client10@legalkonect.com / password');
    }
}
