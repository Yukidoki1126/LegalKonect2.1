<?php

namespace Database\Seeders;

use App\Models\Specialization;
use Illuminate\Database\Seeder;

class SpecializationSeeder extends Seeder
{
    public function run(): void
    {
        $specializations = [
            [
                'name' => 'Family Law',
                'description' => 'Handles divorce, child custody, adoption, and domestic relations matters.',
            ],
            [
                'name' => 'Real Estate Law',
                'description' => 'Deals with property transactions, landlord-tenant disputes, and real estate contracts.',
            ],
            [
                'name' => 'Labor Law',
                'description' => 'Covers employment disputes, workplace rights, and labor regulations.',
            ],
            [
                'name' => 'Corporate Law',
                'description' => 'Handles business formation, mergers, acquisitions, and corporate governance.',
            ],
            [
                'name' => 'Criminal Law',
                'description' => 'Defends or prosecutes individuals charged with criminal offenses.',
            ],
            [
                'name' => 'Immigration Law',
                'description' => 'Assists with visas, citizenship, deportation defense, and immigration matters.',
            ],
            [
                'name' => 'Intellectual Property Law',
                'description' => 'Protects patents, trademarks, copyrights, and trade secrets.',
            ],
            [
                'name' => 'Tax Law',
                'description' => 'Handles tax planning, disputes, and compliance matters.',
            ],
            [
                'name' => 'Personal Injury Law',
                'description' => 'Represents clients in accident, negligence, and injury claims.',
            ],
            [
                'name' => 'Estate Planning Law',
                'description' => 'Assists with wills, trusts, and estate administration.',
            ],
        ];

        foreach ($specializations as $spec) {
            Specialization::firstOrCreate(
                ['name' => $spec['name']],
                ['description' => $spec['description']]
            );
        }
    }
}
