# AES-256 Encryption Implementation Guide

## Overview

This document describes the implementation of AES-256 encryption for sensitive personal information in the LegalKonect application. The encryption protects data both at rest (database) and in transit (localStorage).

## 🔐 Encryption Standards

### Backend (Laravel)
- **Algorithm**: AES-256-CBC (via Laravel's Crypt facade with OpenSSL)
- **Key Source**: `APP_KEY` in `.env` file (automatically generated)
- **Implementation**: Custom Eloquent casts for automatic encryption/decryption

### Frontend (React/TypeScript)
- **Algorithm**: AES-256-GCM (via Web Crypto API)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Use Case**: Encrypting authentication tokens in localStorage

---

## 🛡️ Protected Fields

### Client Model (`app/Models/Client.php`)
- ✅ `phone` - Client contact number
- ✅ `address` - Client physical address

### LawFirm Model (`app/Models/LawFirm.php`)
- ✅ `license_number` - DTI/License registration number
- ✅ `phone` - Law firm contact number
- ✅ `address` - Law firm physical address
- ✅ `contact_person_phone` - Contact person's phone
- ✅ `contact_person_email` - Contact person's email

### Appointment Model (`app/Models/Appointment.php`)
- ✅ `notes` - Consultation notes (may contain sensitive legal information)
- ✅ `cancellation_reason` - Reason for cancellation

---

## 📁 Implementation Files

### Backend Files

#### 1. **EncryptionService.php** (`app/Services/EncryptionService.php`)
Core encryption/decryption service using Laravel's Crypt facade.

```php
use App\Services\EncryptionService;

// Encrypt a value
$encrypted = EncryptionService::encrypt('sensitive data');

// Decrypt a value
$decrypted = EncryptionService::decrypt($encrypted);

// Check if value is encrypted
$isEncrypted = EncryptionService::isEncrypted($value);
```

#### 2. **Encrypted Cast** (`app/Casts/Encrypted.php`)
Custom Eloquent cast for automatic encryption/decryption.

#### 3. **Migration** (`database/migrations/2026_02_04_000001_encrypt_sensitive_data.php`)
One-time migration to encrypt existing unencrypted data.

### Frontend Files

#### 1. **Crypto Utility** (`frontend/src/utils/crypto.ts`)
Frontend encryption for localStorage tokens.

```typescript
import { secureStorage } from '@/utils/crypto';

// Store encrypted token
await secureStorage.setItem('token', authToken);

// Retrieve and decrypt token
const token = await secureStorage.getItem('token');

// Remove encrypted item
secureStorage.removeItem('token');
```

---

## 🚀 Setup Instructions

### Step 1: Ensure APP_KEY is Set

Laravel requires a strong application key for encryption:

```bash
# If APP_KEY is not set in .env
php artisan key:generate
```

⚠️ **CRITICAL**: Never change `APP_KEY` after encrypting data, as it will make existing encrypted data unrecoverable!

### Step 2: Run the Encryption Migration

Apply the migration to encrypt existing data:

```bash
cd backend
php artisan migrate
```

This will:
- Encrypt all existing unencrypted sensitive fields
- Skip already encrypted values
- Display progress for each record

### Step 3: Update Frontend Token Storage (Optional)

To use encrypted localStorage for tokens, update `AuthContext.tsx`:

```typescript
import { secureStorage } from '../utils/crypto';

// Replace localStorage.setItem with:
await secureStorage.setItem('token', response.token);

// Replace localStorage.getItem with:
const token = await secureStorage.getItem('token');

// Replace localStorage.removeItem with:
secureStorage.removeItem('token');
```

---

## 💡 Usage Examples

### Backend: Automatic Encryption

The Eloquent models handle encryption automatically:

```php
// Creating a new client
$client = Client::create([
    'user_id' => $userId,
    'phone' => '+639123456789',  // Automatically encrypted
    'address' => 'Manila, Philippines',  // Automatically encrypted
]);

// Reading client data
echo $client->phone;  // Automatically decrypted: "+639123456789"

// Updating client data
$client->update([
    'phone' => '+639987654321',  // Automatically encrypted
]);
```

### Frontend: Manual Encryption for Tokens

```typescript
import { secureStorage, isCryptoAvailable } from '@/utils/crypto';

// Check if encryption is available
if (!isCryptoAvailable()) {
    console.warn('Web Crypto API not available, using fallback');
}

// Store authentication token securely
const storeToken = async (token: string) => {
    try {
        await secureStorage.setItem('token', token);
    } catch (error) {
        console.error('Failed to store token:', error);
        // Fallback to localStorage if needed
        localStorage.setItem('token', token);
    }
};

// Retrieve authentication token
const getToken = async (): Promise<string | null> => {
    try {
        return await secureStorage.getItem('token');
    } catch (error) {
        console.error('Failed to retrieve token:', error);
        return localStorage.getItem('token');
    }
};
```

---

## 🔄 How It Works

### Backend Flow

1. **Storage**: When you set a model attribute marked with `Encrypted::class` cast:
   ```php
   $client->phone = '+639123456789';
   ```
   - Laravel calls `Encrypted::set()`
   - `EncryptionService::encrypt()` encrypts the value
   - Encrypted string is stored in database

2. **Retrieval**: When you access the attribute:
   ```php
   $phone = $client->phone;
   ```
   - Laravel calls `Encrypted::get()`
   - `EncryptionService::decrypt()` decrypts the value
   - Plain text is returned to your code

### Frontend Flow

1. **Encryption**: When storing in localStorage:
   ```typescript
   await secureStorage.setItem('token', 'abc123...');
   ```
   - Derives encryption key using PBKDF2
   - Generates random IV (12 bytes for GCM)
   - Encrypts data with AES-256-GCM
   - Encodes as base64 and stores

2. **Decryption**: When reading from localStorage:
   ```typescript
   const token = await secureStorage.getItem('token');
   ```
   - Retrieves base64 encoded data
   - Derives same encryption key
   - Extracts IV and encrypted data
   - Decrypts and returns plain text

---

## 🔒 Security Best Practices

### 1. **Protect Your APP_KEY**
- Never commit `.env` file to version control
- Store `APP_KEY` securely in production (environment variables)
- Rotate keys periodically in non-production environments

### 2. **HTTPS Only**
- Always use HTTPS in production to protect data in transit
- Frontend encryption is a defense-in-depth measure, not a replacement for HTTPS

### 3. **Backup Strategy**
- Backup your `APP_KEY` securely
- Without the key, encrypted data cannot be recovered
- Consider using a key management service (AWS KMS, Azure Key Vault)

### 4. **Database Backups**
- Encrypted data in backups is only useful with the correct `APP_KEY`
- Store encryption keys separately from database backups

### 5. **Frontend Considerations**
- Frontend encryption protects against physical device access
- Cannot protect against XSS attacks (sanitize all inputs)
- Use Content Security Policy (CSP) headers

---

## 🧪 Testing Encryption

### Backend Test

```php
// Test encryption roundtrip
$original = '+639123456789';
$encrypted = EncryptionService::encrypt($original);
$decrypted = EncryptionService::decrypt($encrypted);

assert($original === $decrypted);
assert(EncryptionService::isEncrypted($encrypted));
```

### Frontend Test

```typescript
import { encrypt, decrypt } from '@/utils/crypto';

const testEncryption = async () => {
    const original = 'test-token-12345';
    const encrypted = await encrypt(original);
    const decrypted = await decrypt(encrypted);
    
    console.assert(original === decrypted, 'Encryption roundtrip failed');
};
```

---

## 🚨 Troubleshooting

### Issue: "No application encryption key has been specified"
**Solution**: Run `php artisan key:generate`

### Issue: "The payload is invalid"
**Cause**: APP_KEY was changed after data was encrypted
**Solution**: Restore the original APP_KEY or re-encrypt data with new key

### Issue: Frontend decryption fails
**Cause**: Data may be corrupted or encrypted with different parameters
**Solution**: Clear localStorage and re-authenticate

### Issue: Migration fails with "Encryption failed"
**Cause**: APP_KEY not set or invalid
**Solution**: Verify `.env` has valid `APP_KEY`

---

## 📊 Performance Considerations

### Backend
- **Impact**: Minimal overhead (~1-2ms per field)
- **Optimization**: Fields are encrypted/decrypted only when accessed
- **Storage**: Encrypted values are ~1.5x larger than plain text

### Frontend
- **Impact**: ~10-50ms for encrypt/decrypt operations
- **Optimization**: Use async operations, cache decrypted values when safe
- **Browser Compatibility**: Web Crypto API supported in all modern browsers

---

## 🔄 Migration Rollback

If you need to rollback encryption:

```bash
# WARNING: This decrypts all data back to plain text!
php artisan migrate:rollback
```

After rollback:
1. Remove `Encrypted::class` casts from models
2. Data will be stored as plain text again

---

## 📝 Compliance Notes

This implementation helps with:
- ✅ **GDPR** - Data protection for EU citizens
- ✅ **HIPAA** - If handling health-related legal cases
- ✅ **PCI DSS** - If storing any payment-related information
- ✅ **Philippine Data Privacy Act of 2012**

**Note**: Encryption alone doesn't guarantee compliance. Consult with legal experts for full compliance requirements.

---

## 📞 Support

For questions or issues:
1. Check Laravel encryption docs: https://laravel.com/docs/encryption
2. Review Web Crypto API docs: https://developer.mozilla.org/en-US/Web/API/Web_Crypto_API
3. File an issue in the project repository

---

## 🔮 Future Enhancements

Potential improvements:
- [ ] Field-level encryption key rotation
- [ ] Client-side encryption for file uploads
- [ ] Hardware security module (HSM) integration
- [ ] Transparent data encryption (TDE) at database level
- [ ] Audit logging for encryption/decryption operations

---

**Last Updated**: February 4, 2026  
**Version**: 1.0
