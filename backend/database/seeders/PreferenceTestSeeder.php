<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\LawFirm;
use App\Models\Rating;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PreferenceTestSeeder extends Seeder
{
    /**
     * Seed law firms that cover all preference filter combinations.
     *
     * Creates firms across:
     *  - Experience: 0-5, 5-10, 10-15, 15-20, 20+ years
     *  - Distance: ~2km, ~8km, ~15km, ~35km, ~60km from Davao center (7.0731, 125.6122)
     *  - Ratings: 2.5, 3.0, 3.5, 4.0, 4.5, 5.0 stars
     *  - Specializations: mix of Family, Corporate, Criminal, Labor, Real Estate, Immigration
     */
    public function run(): void
    {
        $availableSpecializations = Specialization::all();

        if ($availableSpecializations->isEmpty()) {
            $this->command->error('❌ No specializations found! Run SpecializationSeeder first.');
            return;
        }

        // Davao center: 7.0731, 125.6122
        // ~1° latitude ≈ 111 km
        $firms = [
            // ─── CLOSE (≤5km) ─── Various experience & ratings
            [
                'firm_name' => 'Davao Starter Legal Aid',
                'email' => 'starter@davaolegal.ph',
                'attorney_name' => 'Attorney Ana Reyes',
                'license_number' => 'LIC-PT001',
                'phone' => '+639170001001',
                'address' => 'Door 5, Torres Building, San Pedro Street, Davao City',
                'latitude' => 7.0745,
                'longitude' => 125.6130,
                'specializations' => ['Family Law', 'Criminal Law'],
                'experience_range' => '1-3 years',
                'description' => 'A young firm passionate about accessible family and criminal law services for Davao residents.',
                'target_rating' => 3.0,
                'num_ratings' => 4,
            ],
            [
                'firm_name' => 'Mindanao Rising Legal Group',
                'email' => 'rising@mndalegal.ph',
                'attorney_name' => 'Attorney Leo Bautista',
                'license_number' => 'LIC-PT002',
                'phone' => '+639170001002',
                'address' => '2nd Floor, Uyanguren Commercial, C.M. Recto Avenue, Davao City',
                'latitude' => 7.0720,
                'longitude' => 125.6100,
                'specializations' => ['Corporate Law', 'Tax Law'],
                'experience_range' => '5-8 years',
                'description' => 'Serving Davao businesses with corporate and tax law solutions for over 7 years.',
                'target_rating' => 4.5,
                'num_ratings' => 5,
            ],
            [
                'firm_name' => 'Pearl of Mindanao Law Center',
                'email' => 'pearl@mindanaolaw.ph',
                'attorney_name' => 'Attorney Rosa Aquino',
                'license_number' => 'LIC-PT003',
                'phone' => '+639170001003',
                'address' => '4th Floor, Pacific Heights Tower, Davao City',
                'latitude' => 7.0715,
                'longitude' => 125.6140,
                'specializations' => ['Labor Law', 'Immigration Law'],
                'experience_range' => '8-10 years',
                'description' => 'Expert labor and immigration lawyers proudly serving the working community of Davao.',
                'target_rating' => 4.0,
                'num_ratings' => 6,
            ],

            // ─── MEDIUM CLOSE (5-10km) ─── Various experience & ratings
            [
                'firm_name' => 'Toril Community Legal Services',
                'email' => 'community@torillegal.ph',
                'attorney_name' => 'Attorney Pedro Navarro',
                'license_number' => 'LIC-PT004',
                'phone' => '+639170001004',
                'address' => 'Toril Proper, Davao City',
                'latitude' => 7.0180,
                'longitude' => 125.5700,
                'specializations' => ['Family Law', 'Real Estate Law'],
                'experience_range' => '3-5 years',
                'description' => 'Community-based law practice serving Toril families with affordable legal aid.',
                'target_rating' => 2.5,
                'num_ratings' => 3,
            ],
            [
                'firm_name' => 'Sasa Harbor Law Office',
                'email' => 'harbor@sasalaw.ph',
                'attorney_name' => 'Attorney Maria Del Rosario',
                'license_number' => 'LIC-PT005',
                'phone' => '+639170001005',
                'address' => 'Sasa Wharf Road, Sasa, Davao City',
                'latitude' => 7.1200,
                'longitude' => 125.6400,
                'specializations' => ['Corporate Law', 'Real Estate Law', 'Tax Law'],
                'experience_range' => '10+ years',
                'description' => 'Established firm serving the Sasa business district with corporate and property law expertise.',
                'target_rating' => 4.5,
                'num_ratings' => 5,
            ],
            [
                'firm_name' => 'Matina Legal Partners',
                'email' => 'partners@matinalaw.ph',
                'attorney_name' => 'Attorney Juan Cruz Mendoza',
                'license_number' => 'LIC-PT006',
                'phone' => '+639170001006',
                'address' => 'McArthur Highway, Matina, Davao City',
                'latitude' => 7.0400,
                'longitude' => 125.5900,
                'specializations' => ['Criminal Law', 'Labor Law'],
                'experience_range' => '5-8 years',
                'description' => 'Matina-based law practice focused on criminal defense and labor rights.',
                'target_rating' => 3.5,
                'num_ratings' => 4,
            ],

            // ─── MEDIUM (10-20km) ─── Various experience & ratings
            [
                'firm_name' => 'Buhangin Pro Bono Firm',
                'email' => 'probono@buhanginlaw.ph',
                'attorney_name' => 'Attorney Carlos Villareal',
                'license_number' => 'LIC-PT007',
                'phone' => '+639170001007',
                'address' => 'Buhangin Proper, Davao City',
                'latitude' => 7.1100,
                'longitude' => 125.6050,
                'specializations' => ['Family Law', 'Immigration Law', 'Criminal Law'],
                'experience_range' => '1-3 years',
                'description' => 'New firm with a mission to provide accessible legal services in the Buhangin community.',
                'target_rating' => 5.0,
                'num_ratings' => 2,
            ],
            [
                'firm_name' => 'Panacan Trade Law Associates',
                'email' => 'trade@panacanlegal.ph',
                'attorney_name' => 'Attorney Sandra Lim',
                'license_number' => 'LIC-PT008',
                'phone' => '+639170001008',
                'address' => 'Panacan Commercial Area, Davao City',
                'latitude' => 7.1500,
                'longitude' => 125.6500,
                'specializations' => ['Corporate Law', 'Tax Law', 'Real Estate Law'],
                'experience_range' => '10+ years',
                'description' => 'Two decades of excellence in trade, corporate, and tax law for Mindanao enterprises.',
                'target_rating' => 4.0,
                'num_ratings' => 7,
            ],

            // ─── FAR (20-50km) ─── Still within Davao City (Calinan, Marilog districts)
            [
                'firm_name' => 'Calinan Agricultural Law Office',
                'email' => 'agrilaw@calinanlegal.ph',
                'attorney_name' => 'Attorney Roberto Salcedo',
                'license_number' => 'LIC-PT009',
                'phone' => '+639170001009',
                'address' => 'Calinan Public Market Area, Calinan, Davao City',
                'latitude' => 7.1658,
                'longitude' => 125.4500,
                'specializations' => ['Family Law', 'Labor Law', 'Real Estate Law'],
                'experience_range' => '8-10 years',
                'description' => 'Calinan\'s trusted firm for family matters, labor disputes, and agricultural property transactions.',
                'target_rating' => 3.0,
                'num_ratings' => 3,
            ],
            [
                'firm_name' => 'Tugbok District Legal Services',
                'email' => 'legal@tugboklaw.ph',
                'attorney_name' => 'Attorney Elena Magbanua',
                'license_number' => 'LIC-PT010',
                'phone' => '+639170001010',
                'address' => 'Mintal Highway, Tugbok District, Davao City',
                'latitude' => 7.0250,
                'longitude' => 125.5050,
                'specializations' => ['Criminal Law', 'Corporate Law', 'Immigration Law'],
                'experience_range' => '10+ years',
                'description' => 'Serving the growing Tugbok district with comprehensive legal services for residents and businesses.',
                'target_rating' => 4.5,
                'num_ratings' => 6,
            ],

            // ─── VERY FAR (30-50km) ─── Outer Davao City districts (Marilog, Baguio)
            [
                'firm_name' => 'Marilog Highlands Law Group',
                'email' => 'highlands@mariloglaw.ph',
                'attorney_name' => 'Attorney Miguel Santos',
                'license_number' => 'LIC-PT011',
                'phone' => '+639170001011',
                'address' => 'Marilog District, Davao City',
                'latitude' => 7.2800,
                'longitude' => 125.4200,
                'specializations' => ['Family Law', 'Corporate Law', 'Labor Law'],
                'experience_range' => '10+ years',
                'description' => 'Experienced firm serving the highland communities of Marilog district with dedicated legal care.',
                'target_rating' => 5.0,
                'num_ratings' => 8,
            ],
            [
                'firm_name' => 'Baguio District Legal Clinic',
                'email' => 'clinic@baguiodistrictlaw.ph',
                'attorney_name' => 'Attorney Fatima Dimaampao',
                'license_number' => 'LIC-PT012',
                'phone' => '+639170001012',
                'address' => 'Baguio District, Davao City',
                'latitude' => 7.2400,
                'longitude' => 125.4600,
                'specializations' => ['Family Law', 'Criminal Law', 'Real Estate Law'],
                'experience_range' => '3-5 years',
                'description' => 'A community-oriented firm providing affordable legal services in outer Davao City districts.',
                'target_rating' => 3.5,
                'num_ratings' => 2,
            ],

            // ─── ADDITIONAL DOWNTOWN FIRMS (≤3km) ─── More variety
            [
                'firm_name' => 'Downtown Corporate Solutions',
                'email' => 'solutions@downtowncorp.ph',
                'attorney_name' => 'Attorney James Lim',
                'license_number' => 'LIC-PT013',
                'phone' => '+639170001013',
                'address' => 'Magallanes Street, Poblacion District, Davao City',
                'latitude' => 7.0750,
                'longitude' => 125.6110,
                'specializations' => ['Corporate Law', 'Tax Law', 'Real Estate Law'],
                'experience_range' => '8-10 years',
                'description' => 'Premier corporate law practice in the heart of downtown Davao.',
                'target_rating' => 4.5,
                'num_ratings' => 10,
            ],
            [
                'firm_name' => 'Roxas Avenue Legal Center',
                'email' => 'contact@roxaslegal.ph',
                'attorney_name' => 'Attorney Sarah Chen',
                'license_number' => 'LIC-PT014',
                'phone' => '+639170001014',
                'address' => 'Roxas Avenue, Davao City',
                'latitude' => 7.0680,
                'longitude' => 125.6080,
                'specializations' => ['Family Law', 'Immigration Law'],
                'experience_range' => '5-8 years',
                'description' => 'Compassionate family law services in downtown Davao.',
                'target_rating' => 4.0,
                'num_ratings' => 8,
            ],
            [
                'firm_name' => 'Davao Premier Legal Associates',
                'email' => 'premier@davaolegal.com',
                'attorney_name' => 'Attorney Roberto Martinez',
                'license_number' => 'LIC-PT015',
                'phone' => '+639170001015',
                'address' => 'Bolton Street, Davao City',
                'latitude' => 7.0730,
                'longitude' => 125.6095,
                'specializations' => ['Criminal Law', 'Labor Law'],
                'experience_range' => '10+ years',
                'description' => 'Experienced criminal defense and labor law specialists.',
                'target_rating' => 5.0,
                'num_ratings' => 12,
            ],
            [
                'firm_name' => 'Quirino Avenue Law Office',
                'email' => 'office@quirinolegal.ph',
                'attorney_name' => 'Attorney Linda Tan',
                'license_number' => 'LIC-PT016',
                'phone' => '+639170001016',
                'address' => 'Quirino Avenue, Davao City',
                'latitude' => 7.0765,
                'longitude' => 125.6125,
                'specializations' => ['Real Estate Law', 'Corporate Law'],
                'experience_range' => '3-5 years',
                'description' => 'Young and dynamic firm focused on property and business law.',
                'target_rating' => 3.5,
                'num_ratings' => 5,
            ],
            [
                'firm_name' => 'Claro M. Recto Legal Hub',
                'email' => 'hub@rectolegal.ph',
                'attorney_name' => 'Attorney Mark Gonzales',
                'license_number' => 'LIC-PT017',
                'phone' => '+639170001017',
                'address' => 'C.M. Recto Avenue, Davao City',
                'latitude' => 7.0710,
                'longitude' => 125.6105,
                'specializations' => ['Tax Law', 'Corporate Law'],
                'experience_range' => '1-3 years',
                'description' => 'Fresh perspective on tax and corporate compliance.',
                'target_rating' => 3.0,
                'num_ratings' => 3,
            ],

            // ─── ADDITIONAL MEDIUM DISTANCE (5-12km) ─── More variety
            [
                'firm_name' => 'Talomo Legal Services',
                'email' => 'services@talomolaw.ph',
                'attorney_name' => 'Attorney Grace Villanueva',
                'license_number' => 'LIC-PT018',
                'phone' => '+639170001018',
                'address' => 'McArthur Highway, Talomo, Davao City',
                'latitude' => 7.0500,
                'longitude' => 125.6050,
                'specializations' => ['Family Law', 'Criminal Law', 'Labor Law'],
                'experience_range' => '8-10 years',
                'description' => 'Dedicated legal representation for Talomo residents.',
                'target_rating' => 4.5,
                'num_ratings' => 9,
            ],
            [
                'firm_name' => 'Agdao Community Lawyers',
                'email' => 'community@agdaolaw.ph',
                'attorney_name' => 'Attorney Ramon Castro',
                'license_number' => 'LIC-PT019',
                'phone' => '+639170001019',
                'address' => 'Agdao District, Davao City',
                'latitude' => 7.0850,
                'longitude' => 125.6200,
                'specializations' => ['Labor Law', 'Immigration Law', 'Family Law'],
                'experience_range' => '5-8 years',
                'description' => 'Serving working-class families with affordable legal aid.',
                'target_rating' => 3.5,
                'num_ratings' => 6,
            ],
            [
                'firm_name' => 'Lanang Business Law Group',
                'email' => 'business@lananglaw.com',
                'attorney_name' => 'Attorney Patricia Ong',
                'license_number' => 'LIC-PT020',
                'phone' => '+639170001020',
                'address' => 'J.P. Laurel Avenue, Lanang, Davao City',
                'latitude' => 7.0900,
                'longitude' => 125.6280,
                'specializations' => ['Corporate Law', 'Tax Law', 'Real Estate Law'],
                'experience_range' => '10+ years',
                'description' => 'Expert business law services for Lanang enterprises.',
                'target_rating' => 5.0,
                'num_ratings' => 15,
            ],
            [
                'firm_name' => 'Ecoland Legal Associates',
                'email' => 'associates@ecolandlaw.ph',
                'attorney_name' => 'Attorney Daniel Reyes',
                'license_number' => 'LIC-PT021',
                'phone' => '+639170001021',
                'address' => 'Ecoland Drive, Matina, Davao City',
                'latitude' => 7.0600,
                'longitude' => 125.6150,
                'specializations' => ['Real Estate Law', 'Family Law'],
                'experience_range' => '3-5 years',
                'description' => 'Modern law firm serving the Ecoland community.',
                'target_rating' => 4.0,
                'num_ratings' => 7,
            ],
            [
                'firm_name' => 'Panacan Harbor Law',
                'email' => 'harbor@panacanlaw.ph',
                'attorney_name' => 'Attorney Victor Santos',
                'license_number' => 'LIC-PT022',
                'phone' => '+639170001022',
                'address' => 'Panacan, Davao City',
                'latitude' => 7.1400,
                'longitude' => 125.6450,
                'specializations' => ['Corporate Law', 'Labor Law'],
                'experience_range' => '1-3 years',
                'description' => 'Young firm specializing in maritime and labor law.',
                'target_rating' => 2.5,
                'num_ratings' => 2,
            ],

            // ─── ADDITIONAL FAR FIRMS (15-30km) ─── More variety
            [
                'firm_name' => 'Catalunan Grande Legal Center',
                'email' => 'center@catalunanlaw.ph',
                'attorney_name' => 'Attorney Maria Lopez',
                'license_number' => 'LIC-PT023',
                'phone' => '+639170001023',
                'address' => 'Catalunan Grande, Davao City',
                'latitude' => 7.1100,
                'longitude' => 125.5800,
                'specializations' => ['Family Law', 'Real Estate Law', 'Criminal Law'],
                'experience_range' => '8-10 years',
                'description' => 'Trusted legal services in the Catalunan district.',
                'target_rating' => 4.0,
                'num_ratings' => 8,
            ],
            [
                'firm_name' => 'Mintal District Law Firm',
                'email' => 'firm@mintallaw.ph',
                'attorney_name' => 'Attorney Jose Ramirez',
                'license_number' => 'LIC-PT024',
                'phone' => '+639170001024',
                'address' => 'Mintal, Tugbok District, Davao City',
                'latitude' => 7.0300,
                'longitude' => 125.5100,
                'specializations' => ['Labor Law', 'Criminal Law', 'Tax Law'],
                'experience_range' => '5-8 years',
                'description' => 'Defending workers\' rights in Tugbok district.',
                'target_rating' => 3.5,
                'num_ratings' => 5,
            ],
            [
                'firm_name' => 'Toril Highland Legal Partners',
                'email' => 'partners@torilhighland.ph',
                'attorney_name' => 'Attorney Angela Cruz',
                'license_number' => 'LIC-PT025',
                'phone' => '+639170001025',
                'address' => 'Toril District, Davao City',
                'latitude' => 7.0100,
                'longitude' => 125.5650,
                'specializations' => ['Real Estate Law', 'Family Law', 'Corporate Law'],
                'experience_range' => '10+ years',
                'description' => 'Comprehensive legal services for southern Davao.',
                'target_rating' => 4.5,
                'num_ratings' => 11,
            ],
            [
                'firm_name' => 'Bago Aplaya Coastal Law',
                'email' => 'coastal@bagoaplay.ph',
                'attorney_name' => 'Attorney Christopher Lee',
                'license_number' => 'LIC-PT026',
                'phone' => '+639170001026',
                'address' => 'Bago Aplaya, Talomo District, Davao City',
                'latitude' => 7.0200,
                'longitude' => 125.6200,
                'specializations' => ['Family Law', 'Immigration Law'],
                'experience_range' => '3-5 years',
                'description' => 'Serving coastal communities with accessible legal aid.',
                'target_rating' => 3.0,
                'num_ratings' => 4,
            ],

            // ─── VERY FAR BUT HIGH QUALITY (25-35km) ─── Various ratings
            [
                'firm_name' => 'Calinan Premier Law Associates',
                'email' => 'premier@calinanlegal.com',
                'attorney_name' => 'Attorney Benjamin Tan',
                'license_number' => 'LIC-PT027',
                'phone' => '+639170001027',
                'address' => 'Calinan District, Davao City',
                'latitude' => 7.1700,
                'longitude' => 125.4550,
                'specializations' => ['Corporate Law', 'Real Estate Law', 'Tax Law'],
                'experience_range' => '10+ years',
                'description' => 'Premium corporate law services in rural Davao.',
                'target_rating' => 5.0,
                'num_ratings' => 10,
            ],
            [
                'firm_name' => 'Baguio Pro Bono Legal Clinic',
                'email' => 'clinic@baguioprobono.ph',
                'attorney_name' => 'Attorney Diana Flores',
                'license_number' => 'LIC-PT028',
                'phone' => '+639170001028',
                'address' => 'Baguio District, Davao City',
                'latitude' => 7.2350,
                'longitude' => 125.4650,
                'specializations' => ['Family Law', 'Labor Law'],
                'experience_range' => '1-3 years',
                'description' => 'Affordable legal aid for highland communities.',
                'target_rating' => 4.0,
                'num_ratings' => 5,
            ],
            [
                'firm_name' => 'Marilog Environmental Law Group',
                'email' => 'environment@mariloglaw.com',
                'attorney_name' => 'Attorney Michael Ramos',
                'license_number' => 'LIC-PT029',
                'phone' => '+639170001029',
                'address' => 'Marilog District, Davao City',
                'latitude' => 7.2750,
                'longitude' => 125.4250,
                'specializations' => ['Corporate Law', 'Real Estate Law', 'Tax Law'],
                'experience_range' => '5-8 years',
                'description' => 'Sustainable development and environmental law experts.',
                'target_rating' => 4.5,
                'num_ratings' => 7,
            ],
            [
                'firm_name' => 'Calinan Family Law Center',
                'email' => 'family@calinanlaw.ph',
                'attorney_name' => 'Attorney Rosalie Garcia',
                'license_number' => 'LIC-PT030',
                'phone' => '+639170001030',
                'address' => 'Calinan Public Market, Calinan, Davao City',
                'latitude' => 7.1680,
                'longitude' => 125.4480,
                'specializations' => ['Family Law', 'Criminal Law'],
                'experience_range' => '8-10 years',
                'description' => 'Compassionate family law representation for rural families.',
                'target_rating' => 3.5,
                'num_ratings' => 6,
            ],
        ];

        $clients = Client::all();
        if ($clients->isEmpty()) {
            $this->command->error('❌ No clients found! Create a client account first to generate ratings.');
            return;
        }

        $comments = [
            'Professional and approachable. Excellent service!',
            'Very knowledgeable about the law. Highly recommend.',
            'Handled my case with care and expertise.',
            'Great communication throughout the process.',
            'Responsive and effective. Got exactly the outcome I needed.',
            'Disappointing experience, not very responsive.',
            'Average service, could be better.',
            'Outstanding legal representation!',
        ];

        $created = 0;
        $skipped = 0;

        foreach ($firms as $firmData) {
            // Skip if email exists
            if (User::where('email', $firmData['email'])->exists()) {
                $this->command->warn("⚠️  Skipped [{$firmData['firm_name']}] — email already exists");
                $skipped++;
                continue;
            }

            // Create user
            $user = User::create([
                'name' => $firmData['attorney_name'],
                'email' => $firmData['email'],
                'password' => Hash::make('password123'),
                'role' => 'law_firm',
            ]);

            // Create law firm
            $lawFirm = LawFirm::create([
                'user_id' => $user->id,
                'firm_name' => $firmData['firm_name'],
                'license_number' => $firmData['license_number'],
                'phone' => $firmData['phone'],
                'address' => $firmData['address'],
                'latitude' => $firmData['latitude'],
                'longitude' => $firmData['longitude'],
                'experience_range' => $firmData['experience_range'],
                'description' => $firmData['description'],
                'verification_status' => 'approved',
                'verified_at' => now(),
            ]);

            // Attach specializations
            $specIds = [];
            foreach ($firmData['specializations'] as $specName) {
                $spec = $availableSpecializations->firstWhere('name', $specName);
                if ($spec) {
                    $specIds[] = $spec->id;
                }
            }
            if (!empty($specIds)) {
                $lawFirm->specializations()->attach($specIds);
            }

            // Create ratings to match the target average
            $targetRating = $firmData['target_rating'];
            $numRatings = $firmData['num_ratings'];

            for ($i = 0; $i < $numRatings; $i++) {
                $client = $clients->random();

                // Vary ratings slightly around the target (±0.5) but clamp to 1-5
                $variation = ($i % 2 === 0) ? 0.5 : -0.5;
                $rating = max(1, min(5, round($targetRating + $variation)));

                // Keep last rating at exact target to pull average closer
                if ($i === $numRatings - 1) {
                    $rating = $targetRating;
                }

                Rating::create([
                    'client_id' => $client->id,
                    'law_firm_id' => $lawFirm->id,
                    'rating' => $rating,
                    'review' => $comments[array_rand($comments)],
                ]);
            }

            $this->command->info("✅ {$firmData['firm_name']}");
            $this->command->line("   📍 ~{$this->estimateDistance($firmData['latitude'], $firmData['longitude'])} km | ⭐ {$targetRating} ({$numRatings} reviews) | 🏢 {$firmData['experience_range']}");
            $this->command->line("   ⚖️  " . implode(', ', $firmData['specializations']));
            $this->command->newLine();

            $created++;
        }

        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════════════');
        $this->command->info('        PREFERENCE TEST SEEDER SUMMARY');
        $this->command->info('═══════════════════════════════════════════════');
        $this->command->info("✅ Created:  {$created} law firm(s) with ratings");
        if ($skipped > 0) {
            $this->command->warn("⚠️  Skipped:  {$skipped} (already exist)");
        }
        $this->command->newLine();
        $this->command->info('🔍 Test your preferences with these combos:');
        $this->command->line('   Rating 3.0+  → filters out 2.5-star firm');
        $this->command->line('   Rating 4.5+  → shows only 4.5+ star firms');
        $this->command->line('   Distance 5km → downtown Davao firms only');
        $this->command->line('   Distance 10km → includes Matina/Sasa/Toril');
        $this->command->line('   Distance 20km → includes Buhangin/Panacan');
        $this->command->line('   Distance 50km → includes Calinan/Tugbok/Marilog/Baguio');
        $this->command->line('   Exp 1-3 yrs  → only brand new firms');
        $this->command->line('   Exp 8-10 yrs → firms at peak experience');
        $this->command->line('   Exp 10+ yrs  → most experienced firms');
        $this->command->info('═══════════════════════════════════════════════');
    }

    /**
     * Estimate distance from Davao center (7.0731, 125.6122) in km.
     */
    private function estimateDistance(float $lat, float $lng): float
    {
        $dLat = abs($lat - 7.0731) * 111;
        $dLng = abs($lng - 125.6122) * 111 * cos(deg2rad(7.0731));
        return round(sqrt($dLat * $dLat + $dLng * $dLng), 1);
    }
}
