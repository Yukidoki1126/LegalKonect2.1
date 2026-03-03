/**
 * AES-256-GCM Encryption Utility for Frontend
 * 
 * This utility provides client-side encryption for sensitive data like tokens
 * stored in localStorage. Uses Web Crypto API with AES-256-GCM.
 */

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

/**
 * Generate a cryptographic key from a password/passphrase
 * For production, consider using a more secure key derivation method
 */
async function getDerivedKey(): Promise<CryptoKey> {
    // Use a combination of app-specific data as key material
    // In production, you might want to derive this from user session or other secure source
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(
            `${window.location.hostname}-legalkonect-v1-${import.meta.env.VITE_APP_NAME || 'LegalKonect'}`
        ),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: new TextEncoder().encode('legalkonect-salt-2026'),
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt a string value using AES-256-GCM
 */
export async function encrypt(value: string): Promise<string> {
    try {
        const key = await getDerivedKey();
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
        const encodedValue = new TextEncoder().encode(value);

        const encrypted = await crypto.subtle.encrypt(
            {
                name: ENCRYPTION_ALGORITHM,
                iv: iv,
            },
            key,
            encodedValue
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);

        // Convert to base64 for storage
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt an encrypted string value
 */
export async function decrypt(encryptedValue: string): Promise<string> {
    try {
        const key = await getDerivedKey();
        
        // Decode from base64
        const combined = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
        
        // Extract IV and encrypted data
        const iv = combined.slice(0, IV_LENGTH);
        const encryptedData = combined.slice(IV_LENGTH);

        const decrypted = await crypto.subtle.decrypt(
            {
                name: ENCRYPTION_ALGORITHM,
                iv: iv,
            },
            key,
            encryptedData
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Secure storage wrapper for localStorage with automatic encryption
 */
export const secureStorage = {
    /**
     * Store encrypted value in localStorage
     */
    async setItem(key: string, value: string): Promise<void> {
        try {
            const encrypted = await encrypt(value);
            localStorage.setItem(key, encrypted);
        } catch (error) {
            console.error('Secure storage set error:', error);
            throw error;
        }
    },

    /**
     * Get and decrypt value from localStorage
     */
    async getItem(key: string): Promise<string | null> {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) {
                return null;
            }
            return await decrypt(encrypted);
        } catch (error) {
            console.error('Secure storage get error:', error);
            // If decryption fails, remove the corrupted item
            localStorage.removeItem(key);
            return null;
        }
    },

    /**
     * Remove item from localStorage
     */
    removeItem(key: string): void {
        localStorage.removeItem(key);
    },

    /**
     * Clear all items from localStorage
     */
    clear(): void {
        localStorage.clear();
    },
};

/**
 * Check if crypto API is available
 */
export function isCryptoAvailable(): boolean {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined' &&
           typeof crypto.subtle.encrypt === 'function';
}
