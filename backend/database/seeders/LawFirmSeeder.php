<?php

namespace Database\Seeders;

use App\Models\LawFirm;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class LawFirmSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * This seeder allows you to easily add new law firms to the database.
     * Simply add new entries to the $lawFirms array below.
     */
    public function run(): void
    {
        // Define law firms to seed
        $lawFirms = [
            // METRO MANILA LAW OFFICES - HIGH SCORING FIRMS
            [
                'firm_name' => 'Imperial Family Law Center',
                'email' => 'contact@imperialfamilylaw.ph',
                'password' => 'password123',
                'attorney_name' => 'Attorney Victoria Imperial',
                'license_number' => 'LIC-MNL001',
                'phone' => '+639171111001',
                'address' => '12th Floor, Petron Mega Plaza, 358 Sen. Gil Puyat Avenue, Makati City',
                'latitude' => 14.5608,
                'longitude' => 121.0194,
                'specializations' => ['Family Law', 'Criminal Law', 'Immigration Law'],
                'experience_range' => '20+ years',
                'description' => 'Imperial Family Law Center is Metro Manila\'s leading family law firm. With over 20 years of experience, we provide compassionate and effective legal representation in divorce, custody, adoption, and all family law matters.',
            ],
            [
                'firm_name' => 'Metro Corporate Law Group',
                'email' => 'info@metrocorporate.com',
                'password' => 'password123',
                'attorney_name' => 'Attorney Roberto Mendoza',
                'license_number' => 'LIC-MNL002',
                'phone' => '+639181111002',
                'address' => '20th Floor, Yuchengco Tower, RCBC Plaza, Makati City',
                'latitude' => 14.5561,
                'longitude' => 121.0242,
                'specializations' => ['Corporate Law', 'Tax Law', 'Labor Law'],
                'experience_range' => '20+ years',
                'description' => 'Metro Corporate Law Group specializes in corporate transactions, business formations, and commercial law. We serve startups to Fortune 500 companies with expert legal counsel and strategic business advice.',
            ],
            [
                'firm_name' => 'Prime Real Estate Legal Services',
                'email' => 'contact@primereal.ph',
                'password' => 'password123',
                'attorney_name' => 'Attorney Isabela Cortez',
                'license_number' => 'LIC-MNL003',
                'phone' => '+639191111003',
                'address' => '8th Floor, Rufino Pacific Tower, 6784 Ayala Avenue, Makati City',
                'latitude' => 14.5573,
                'longitude' => 121.0231,
                'specializations' => ['Real Estate Law', 'Corporate Law', 'Tax Law'],
                'experience_range' => '15-20 years',
                'description' => 'Prime Real Estate Legal Services is the premier choice for property law matters. We handle residential and commercial transactions, property disputes, zoning, and all aspects of real estate law with precision and expertise.',
            ],
            [
                'firm_name' => 'Stellar Family & Estate Law',
                'email' => 'hello@stellarfamily.ph',
                'password' => 'password123',
                'attorney_name' => 'Attorney Carmen Salazar',
                'license_number' => 'LIC-MNL004',
                'phone' => '+639201111004',
                'address' => '15th Floor, The Enterprise Center, 6766 Ayala Avenue, Makati City',
                'latitude' => 14.5555,
                'longitude' => 121.0248,
                'specializations' => ['Family Law', 'Real Estate Law', 'Criminal Law'],
                'experience_range' => '15-20 years',
                'description' => 'Stellar Family & Estate Law provides comprehensive legal services for families and individuals. From family disputes to estate planning and property matters, we protect your interests with dedication and skill.',
            ],
            [
                'firm_name' => 'BGC Corporate Partners',
                'email' => 'partners@bgccorporate.com',
                'password' => 'password123',
                'attorney_name' => 'Attorney Marco Evangelista',
                'license_number' => 'LIC-BGC001',
                'phone' => '+639211111005',
                'address' => '25th Floor, One Bonifacio High Street, BGC, Taguig City',
                'latitude' => 14.5501,
                'longitude' => 121.0503,
                'specializations' => ['Corporate Law', 'Intellectual Property', 'Tax Law'],
                'experience_range' => '10-15 years',
                'description' => 'BGC Corporate Partners is a modern law firm serving innovative businesses. We provide cutting-edge legal solutions in corporate law, IP protection, and tax compliance for companies in BGC and beyond.',
            ],
            [
                'firm_name' => 'Heritage Property Law Firm',
                'email' => 'contact@heritageproperty.ph',
                'password' => 'password123',
                'attorney_name' => 'Attorney Diego Fernandez',
                'license_number' => 'LIC-MNL005',
                'phone' => '+639221111006',
                'address' => '10th Floor, LKG Tower, 6801 Ayala Avenue, Makati City',
                'latitude' => 14.5567,
                'longitude' => 121.0253,
                'specializations' => ['Real Estate Law', 'Family Law', 'Corporate Law'],
                'experience_range' => '20+ years',
                'description' => 'Heritage Property Law Firm has been serving Metro Manila for over two decades. We specialize in complex property transactions, family estate planning, and corporate real estate matters.',
            ],
            [
                'firm_name' => 'Ortigas Family Law Associates',
                'email' => 'info@ortigasfamily.com',
                'password' => 'password123',
                'attorney_name' => 'Attorney Lucia Ramirez',
                'license_number' => 'LIC-ORT001',
                'phone' => '+639231111007',
                'address' => '18th Floor, Meralco Building, Ortigas Avenue, Pasig City',
                'latitude' => 14.5863,
                'longitude' => 121.0585,
                'specializations' => ['Family Law', 'Labor Law', 'Immigration Law'],
                'experience_range' => '15-20 years',
                'description' => 'Ortigas Family Law Associates is dedicated to protecting families in Metro Manila. We provide expert representation in all family law matters with compassion, integrity, and proven results.',
            ],
            [
                'firm_name' => 'Capital Corporate Lawyers',
                'email' => 'lawyers@capitalcorp.ph',
                'password' => 'password123',
                'attorney_name' => 'Attorney Benjamin Torres',
                'license_number' => 'LIC-MNL006',
                'phone' => '+639241111008',
                'address' => '22nd Floor, GT Tower International, Makati City',
                'latitude' => 14.5541,
                'longitude' => 121.0239,
                'specializations' => ['Corporate Law', 'Real Estate Law', 'Tax Law'],
                'experience_range' => '20+ years',
                'description' => 'Capital Corporate Lawyers provides comprehensive business legal services. With expertise in corporate governance, property transactions, and tax planning, we are the trusted advisors to major corporations.',
            ],
            [
                'firm_name' => 'Manila Bay Real Estate Law',
                'email' => 'contact@manilabaylaw.ph',
                'password' => 'password123',
                'attorney_name' => 'Attorney Sofia Velasco',
                'license_number' => 'LIC-MNL007',
                'phone' => '+639251111009',
                'address' => '14th Floor, Pearl of the Orient Tower, Roxas Boulevard, Manila',
                'latitude' => 14.5729,
                'longitude' => 120.9827,
                'specializations' => ['Real Estate Law', 'Corporate Law', 'Family Law'],
                'experience_range' => '15-20 years',
                'description' => 'Manila Bay Real Estate Law specializes in waterfront properties, condominium law, and commercial real estate. We serve developers, investors, and families with expert property legal services.',
            ],
            [
                'firm_name' => 'Quezon City Family Legal Center',
                'email' => 'help@qcfamily.org',
                'password' => 'password123',
                'attorney_name' => 'Attorney Gabriel Santos',
                'license_number' => 'LIC-QC001',
                'phone' => '+639261111010',
                'address' => '7th Floor, Tomas Morato Business Center, Quezon City',
                'latitude' => 14.6298,
                'longitude' => 121.0339,
                'specializations' => ['Family Law', 'Criminal Law', 'Labor Law'],
                'experience_range' => '10-15 years',
                'description' => 'Quezon City Family Legal Center provides accessible family law services to QC residents. We handle divorce, child support, custody, and domestic relations with dedication and expertise.',
            ],

            // DAVAO CITY LAW OFFICES
            [
                'firm_name' => 'Sudagar Law Office',
                'email' => 'contact@sudagarlaw.ph',
                'password' => 'password123',
                'attorney_name' => 'Attorney Ramon Sudagar',
                'license_number' => 'LIC-DVO001',
                'phone' => '+639171234501',
                'address' => '3rd Floor, Damosa Building, J.P. Laurel Avenue, Bajada, Davao City',
                'latitude' => 7.0731,
                'longitude' => 125.6122,
                'specializations' => ['Corporate Law', 'Real Estate Law', 'Family Law'],
                'experience_range' => '20+ years',
                'description' => 'Sudagar Law Office is one of Davao City\'s premier law firms, providing comprehensive legal services to individuals and businesses. With over two decades of experience, we are committed to delivering excellence in legal representation.',
            ],
            [
                'firm_name' => 'Cabanero Law Office',
                'email' => 'info@cabanerolaw.com',
                'password' => 'password123',
                'attorney_name' => 'Attorney Maria Cabanero',
                'license_number' => 'LIC-DVO002',
                'phone' => '+639181234502',
                'address' => '5th Floor, NCCC Mall, C.M. Recto Avenue, Davao City',
                'latitude' => 7.0644,
                'longitude' => 125.6085,
                'specializations' => ['Criminal Law', 'Labor Law', 'Human Rights'],
                'experience_range' => '15-20 years',
                'description' => 'Cabanero Law Office specializes in criminal defense and labor law matters. We are dedicated to protecting the rights of our clients with integrity and professionalism.',
            ],
            [
                'firm_name' => 'Zamora Law Office',
                'email' => 'zamora@zamoralegal.ph',
                'password' => 'password123',
                'attorney_name' => 'Attorney Carlos Zamora',
                'license_number' => 'LIC-DVO003',
                'phone' => '+639191234503',
                'address' => '2nd Floor, Gaisano Mall, Bajada, Davao City',
                'latitude' => 7.0764,
                'longitude' => 125.6147,
                'specializations' => ['Tax Law', 'Banking & Finance', 'Corporate Law'],
                'experience_range' => '10-15 years',
                'description' => 'Zamora Law Office provides expert legal counsel in taxation and financial matters. Our team ensures compliance and strategic planning for businesses throughout Mindanao.',
            ],
            [
                'firm_name' => 'Caubang Law Office',
                'email' => 'legal@caubanglaw.com',
                'password' => 'password123',
                'attorney_name' => 'Attorney Elena Caubang',
                'license_number' => 'LIC-DVO004',
                'phone' => '+639201234504',
                'address' => '4th Floor, SM Lanang Premier, J.P. Laurel Avenue, Lanang, Davao City',
                'latitude' => 7.0907,
                'longitude' => 125.6275,
                'specializations' => ['Family Law', 'Immigration Law', 'Real Estate Law'],
                'experience_range' => '15-20 years',
                'description' => 'Caubang Law Office is known for compassionate and effective representation in family law matters. We help families navigate legal challenges with sensitivity and expertise.',
            ],
            [
                'firm_name' => 'Angeles Law Office',
                'email' => 'contact@angeleslaw.ph',
                'password' => 'password123',
                'attorney_name' => 'Attorney Ricardo Angeles',
                'license_number' => 'LIC-DVO005',
                'phone' => '+639211234505',
                'address' => 'Ground Floor, Abreeza Mall, J.P. Laurel Avenue, Davao City',
                'latitude' => 7.0789,
                'longitude' => 125.6189,
                'specializations' => ['Intellectual Property', 'Technology Law', 'Corporate Law'],
                'experience_range' => '5-10 years',
                'description' => 'Angeles Law Office specializes in intellectual property and technology law, serving startups and established businesses in Davao and beyond. We protect innovation and creativity.',
            ],
            [
                'firm_name' => 'Guinomla Law Firm',
                'email' => 'info@guinomlalaw.com',
                'password' => 'password123',
                'attorney_name' => 'Attorney Jose Guinomla',
                'license_number' => 'LIC-DVO006',
                'phone' => '+639221234506',
                'address' => '6th Floor, Victoria Plaza Mall, Ilustre Street, Davao City',
                'latitude' => 7.0731,
                'longitude' => 125.6050,
                'specializations' => ['Environmental Law', 'Corporate Law', 'Real Estate Law'],
                'experience_range' => '20+ years',
                'description' => 'Guinomla Law Firm is a leading advocate for environmental protection and sustainable development. We provide comprehensive legal services for environmental compliance and land use matters.',
            ],
            [
                'firm_name' => 'Latog Law Office',
                'email' => 'latog@latoglegal.ph',
                'password' => 'password123',
                'attorney_name' => 'Attorney Patricia Latog',
                'license_number' => 'LIC-DVO007',
                'phone' => '+639231234507',
                'address' => '3rd Floor, Felcris Centrale Mall, Quimpo Boulevard, Davao City',
                'latitude' => 7.0682,
                'longitude' => 125.6095,
                'specializations' => ['Labor Law', 'Criminal Law', 'Civil Law'],
                'experience_range' => '10-15 years',
                'description' => 'Latog Law Office provides dedicated legal representation in labor disputes and civil matters. We fight for the rights of workers and individuals throughout Davao region.',
            ],
            [
                'firm_name' => 'Bajenting Law Office',
                'email' => 'contact@bajentinglaw.com',
                'password' => 'password123',
                'attorney_name' => 'Attorney Michael Bajenting',
                'license_number' => 'LIC-DVO008',
                'phone' => '+639241234508',
                'address' => '2nd Floor, Gmall of Davao, Tulip Drive, Lanang, Davao City',
                'latitude' => 7.0920,
                'longitude' => 125.6301,
                'specializations' => ['Corporate Law', 'Banking & Finance', 'Tax Law'],
                'experience_range' => '15-20 years',
                'description' => 'Bajenting Law Office offers expert legal services in corporate and commercial law. We assist businesses with legal compliance, transactions, and strategic planning throughout Mindanao.',
            ],

            // ADD MORE LAW FIRMS BELOW THIS LINE
            // Copy the template above and modify the values
            /*
            [
                'firm_name' => 'Your Firm Name',
                'email' => 'your@email.com',
                'password' => 'yourpassword',
                'attorney_name' => 'Attorney Your Name',
                'license_number' => 'LIC-XXXXXX',
                'phone' => '+639XXXXXXXXX',
                'address' => 'Your complete address',
                'latitude' => 14.5995, // Use Google Maps to get coordinates
                'longitude' => 120.9842,
                'specializations' => ['Specialization 1', 'Specialization 2'], // Must match existing names
                'experience_range' => '10-15 years', // Options: '<5 years', '5-10 years', '10-15 years', '15-20 years', '20+ years'
                'description' => 'Your firm description here...',
            ],
            */
        ];

        // Get all available specializations
        $availableSpecializations = Specialization::all();

        if ($availableSpecializations->isEmpty()) {
            $this->command->error('❌ No specializations found! Please run SpecializationSeeder first:');
            $this->command->info('   php artisan db:seed --class=SpecializationSeeder');
            return;
        }

        $this->command->info('📋 Available Specializations:');
        foreach ($availableSpecializations as $spec) {
            $this->command->line("   - {$spec->name}");
        }
        $this->command->newLine();

        // Process each law firm
        $created = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($lawFirms as $index => $firmData) {
            try {
                // Check if email already exists
                $existingUser = User::where('email', $firmData['email'])->first();
                
                if ($existingUser) {
                    $this->command->warn("⚠️  [{$firmData['firm_name']}] Email already exists: {$firmData['email']}");
                    $skipped++;
                    continue;
                }

                // Create user account for law firm
                $user = User::create([
                    'name' => $firmData['attorney_name'],
                    'email' => $firmData['email'],
                    'password' => Hash::make($firmData['password']),
                    'role' => 'law_firm',
                ]);

                // Create law firm profile
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
                    'verification_status' => 'approved', // Auto-approve seeded firms
                    'verified_at' => now(),
                ]);

                // Attach specializations
                $specializationIds = [];
                foreach ($firmData['specializations'] as $specName) {
                    $specialization = $availableSpecializations->firstWhere('name', $specName);
                    
                    if ($specialization) {
                        $specializationIds[] = $specialization->id;
                    } else {
                        $this->command->warn("   ⚠️  Specialization not found: {$specName}");
                    }
                }

                if (!empty($specializationIds)) {
                    $lawFirm->specializations()->attach($specializationIds);
                }

                $this->command->info("✅ Created: {$firmData['firm_name']}");
                $this->command->line("   📧 Email: {$firmData['email']}");
                $this->command->line("   🔑 Password: {$firmData['password']}");
                $this->command->line("   📍 Location: {$firmData['address']}");
                $this->command->line("   ⚖️  Specializations: " . implode(', ', $firmData['specializations']));
                $this->command->newLine();
                
                $created++;

            } catch (\Exception $e) {
                $this->command->error("❌ Error creating {$firmData['firm_name']}: {$e->getMessage()}");
                $errors++;
            }
        }

        // Summary
        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════');
        $this->command->info('           SEEDING SUMMARY');
        $this->command->info('═══════════════════════════════════════');
        $this->command->info("✅ Created:  {$created} law firm(s)");
        
        if ($skipped > 0) {
            $this->command->warn("⚠️  Skipped:  {$skipped} law firm(s) (already exist)");
        }
        
        if ($errors > 0) {
            $this->command->error("❌ Errors:   {$errors} law firm(s)");
        }
        
        $this->command->info('═══════════════════════════════════════');
    }
}
