# Law Firm Seeder Guide

## Quick Start

### Run the Seeder
```bash
php artisan db:seed --class=LawFirmSeeder
```

### Prerequisites
Make sure specializations exist first:
```bash
php artisan db:seed --class=SpecializationSeeder
```

## How to Add New Law Firms

1. Open `backend/database/seeders/LawFirmSeeder.php`
2. Find the `$lawFirms` array (around line 18)
3. Copy the template at the bottom of the array
4. Fill in your law firm's details
5. Save and run the seeder

## Law Firm Template

```php
[
    'firm_name' => 'Your Firm Name Here',
    'email' => 'contact@yourfirm.com',
    'password' => 'your_password_here',
    'attorney_name' => 'Attorney Juan Dela Cruz',
    'license_number' => 'LIC-123456',
    'phone' => '+639171234567',
    'address' => 'Complete address with building, street, city',
    'latitude' => 14.5995,  // Get from Google Maps
    'longitude' => 120.9842,
    'specializations' => ['Corporate Law', 'Tax Law'],
    'experience_range' => '10-15 years',
    'number_of_lawyers' => 8,
    'description' => 'Brief description of your law firm...',
    'profile_image_url' => null,  // Optional
    'gallery_images_urls' => [],  // Optional
],
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firm_name` | String | Yes | Official name of the law firm |
| `email` | String | Yes | Login email (must be unique) |
| `password` | String | Yes | Login password (will be hashed) |
| `attorney_name` | String | Yes | Name of the primary attorney |
| `license_number` | String | Yes | Law firm license number |
| `phone` | String | Yes | Contact phone number |
| `address` | String | Yes | Complete physical address |
| `latitude` | Float | Yes | GPS latitude coordinate |
| `longitude` | Float | Yes | GPS longitude coordinate |
| `specializations` | Array | Yes | List of legal specializations |
| `experience_range` | String | Yes | Years of experience |
| `number_of_lawyers` | Integer | Yes | Number of lawyers in the firm |
| `description` | Text | Yes | Brief description of the firm |
| `profile_image_url` | String | No | URL to profile/cover image |
| `gallery_images_urls` | Array | No | URLs to gallery images |

## Experience Range Options

- `<5 years`
- `5-10 years`
- `10-15 years`
- `15-20 years`
- `20+ years`

## Available Specializations

Run the seeder to see current specializations, or check:
```bash
php artisan tinker
>>> App\Models\Specialization::pluck('name');
```

Common specializations include:
- Corporate Law
- Family Law
- Criminal Law
- Labor Law
- Immigration Law
- Tax Law
- Intellectual Property
- Real Estate Law
- Banking & Finance
- Human Rights
- Environmental Law
- Technology Law

## How to Get Coordinates

### Method 1: Google Maps
1. Open Google Maps
2. Right-click on the location
3. Click the coordinates to copy them
4. First number is **latitude**, second is **longitude**

### Method 2: Google Maps URL
1. Search for the address on Google Maps
2. Copy the URL
3. Look for `@14.5547,121.0244` in the URL
4. First number is **latitude**, second is **longitude**

## Example Locations (Metro Manila)

| Area | Latitude | Longitude |
|------|----------|-----------|
| Makati CBD | 14.5547 | 121.0244 |
| BGC, Taguig | 14.5510 | 121.0512 |
| Ortigas Center | 14.5860 | 121.0595 |
| Quezon City | 14.6318 | 121.0328 |
| Manila | 14.5995 | 120.9842 |
| Pasig | 14.5764 | 121.0851 |

## Tips

1. **Unique Emails**: Each law firm must have a unique email address
2. **Real Coordinates**: Use actual GPS coordinates for accurate distance calculations
3. **Matching Specializations**: Specialization names must exactly match existing ones
4. **Professional Descriptions**: Write clear, professional descriptions
5. **Test Credentials**: Save passwords somewhere safe for testing

## Troubleshooting

### "No specializations found!"
Run the specialization seeder first:
```bash
php artisan db:seed --class=SpecializationSeeder
```

### "Email already exists"
The email is already in use. Change to a unique email address.

### "Specialization not found"
Check that the specialization name exactly matches an existing one (case-sensitive).

## Resetting Data

To start fresh:
```bash
php artisan migrate:fresh
php artisan db:seed --class=SpecializationSeeder
php artisan db:seed --class=LawFirmSeeder
```

## Running All Seeders

```bash
php artisan db:seed
```

Or run specific seeders in order:
```bash
php artisan db:seed --class=SpecializationSeeder
php artisan db:seed --class=LawFirmSeeder
php artisan db:seed --class=DemoDataSeeder
```
