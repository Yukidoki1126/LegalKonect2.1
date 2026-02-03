<?php

namespace App\Casts;

use App\Services\EncryptionService;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * Custom Cast for Encrypted Attributes
 * 
 * Automatically encrypts data when setting and decrypts when getting.
 * Uses AES-256-CBC encryption via Laravel's Crypt facade.
 */
class Encrypted implements CastsAttributes
{
    /**
     * Cast the given value (decrypt when retrieving from database)
     *
     * @param  Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return mixed
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        return EncryptionService::decrypt($value);
    }

    /**
     * Prepare the given value for storage (encrypt when saving to database)
     *
     * @param  Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return mixed
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        return EncryptionService::encrypt($value);
    }
}
