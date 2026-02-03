<?php

namespace App\Models;

use App\Casts\Encrypted;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class LawFirm extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'firm_name',
        'license_number',
        'description',
        'experience_range',
        'lawyers',
        'contact_person_name',
        'contact_person_role',
        'contact_person_phone',
        'contact_person_email',
        'phone',
        'email',
        'address',
        'latitude',
        'longitude',
        'verification_status',
        'rejection_reason',
        'verified_at',
        'profile_image',
        'gallery_images',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'verified_at' => 'datetime',
        'gallery_images' => 'array',
        'lawyers' => 'array',
        // AES-256 encrypted sensitive fields
        'license_number' => Encrypted::class,
        'phone' => Encrypted::class,
        'address' => Encrypted::class,
        'contact_person_phone' => Encrypted::class,
        'contact_person_email' => Encrypted::class,
    ];

    protected $appends = ['profile_image_url', 'gallery_images_urls'];

    public function getProfileImageUrlAttribute(): ?string
    {
        if (!$this->profile_image) {
            return null;
        }

        // Check if R2 public URL is configured and valid
        $r2Url = config('filesystems.disks.r2.url');
        
        // Try to validate if R2 URL is actually accessible
        // If not configured or empty, fall back to backend proxy
        if (!empty($r2Url) && str_starts_with($r2Url, 'http')) {
            return $r2Url . '/' . $this->profile_image;
        }

        // Fallback to backend proxy URL
        $apiUrl = rtrim(config('app.url'), '/');
        return $apiUrl . '/api/storage/' . $this->profile_image;
    }

    public function getGalleryImagesUrlsAttribute(): array
    {
        if (!$this->gallery_images || !is_array($this->gallery_images)) {
            return [];
        }

        // Check if R2 public URL is configured and valid
        $r2Url = config('filesystems.disks.r2.url');
        $apiUrl = rtrim(config('app.url'), '/');
        
        // Try to use R2 public URL if available
        if (!empty($r2Url) && str_starts_with($r2Url, 'http')) {
            return array_map(
                fn($path) => $r2Url . '/' . $path,
                $this->gallery_images
            );
        }

        // Fallback to backend proxy URLs
        return array_map(
            fn($path) => $apiUrl . '/api/storage/' . $path,
            $this->gallery_images
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function specializations(): BelongsToMany
    {
        return $this->belongsToMany(Specialization::class, 'law_firm_specializations')
            ->withTimestamps();
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function averageRating(): float
    {
        return $this->ratings()->avg('rating') ?? 0;
    }

    public function isApproved(): bool
    {
        return $this->verification_status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }

    public function scopeApproved($query)
    {
        return $query->where('verification_status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('verification_status', 'pending');
    }
}
