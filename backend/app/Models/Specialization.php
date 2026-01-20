<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Specialization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($specialization) {
            if (empty($specialization->slug)) {
                $specialization->slug = Str::slug($specialization->name);
            }
        });
    }

    public function clients(): BelongsToMany
    {
        return $this->belongsToMany(Client::class, 'client_specializations')
            ->withTimestamps();
    }

    public function lawFirms(): BelongsToMany
    {
        return $this->belongsToMany(LawFirm::class, 'law_firm_specializations')
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
