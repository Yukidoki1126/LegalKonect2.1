<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Exception;

/**
 * AES-256 Encryption Service for Sensitive Personal Information
 * 
 * This service provides encryption/decryption for sensitive data using Laravel's
 * built-in encryption which uses AES-256-CBC cipher with OpenSSL.
 */
class EncryptionService
{
    /**
     * Encrypt a value using AES-256
     * 
     * @param mixed $value The value to encrypt
     * @return string|null The encrypted value or null if input is null
     */
    public static function encrypt($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            return Crypt::encryptString((string) $value);
        } catch (Exception $e) {
            \Log::error('Encryption failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Decrypt a value
     * 
     * @param string|null $value The encrypted value
     * @return string|null The decrypted value or null if input is null
     */
    public static function decrypt(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        // Check if value is already encrypted before attempting decryption
        if (!self::isEncrypted($value)) {
            // Value is not encrypted (plain text), return as-is
            // This handles backward compatibility with existing unencrypted data
            return $value;
        }

        try {
            return Crypt::decryptString($value);
        } catch (Exception $e) {
            \Log::error('Decryption failed: ' . $e->getMessage());
            // If decryption fails, return the original value as fallback
            // This prevents data loss for malformed encrypted values
            return $value;
        }
    }

    /**
     * Check if a value appears to be encrypted
     * 
     * @param string|null $value
     * @return bool
     */
    public static function isEncrypted(?string $value): bool
    {
        if ($value === null || $value === '') {
            return false;
        }

        // Laravel's encrypted strings are base64 encoded JSON
        $decoded = base64_decode($value, true);
        if ($decoded === false) {
            return false;
        }

        $json = json_decode($decoded, true);
        return isset($json['iv']) && isset($json['value']) && isset($json['mac']);
    }

    /**
     * Encrypt an array of values
     * 
     * @param array $values
     * @return array
     */
    public static function encryptArray(array $values): array
    {
        return array_map(function($value) {
            return self::encrypt($value);
        }, $values);
    }

    /**
     * Decrypt an array of values
     * 
     * @param array $values
     * @return array
     */
    public static function decryptArray(array $values): array
    {
        return array_map(function($value) {
            return self::decrypt($value);
        }, $values);
    }
}
