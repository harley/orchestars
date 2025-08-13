import { ENCRYPTION_KEY, HMAC_SECRET } from '@/config/hashing';
import crypto from 'crypto';

/**
 * Hashing utility functions using Node.js crypto package
 */

// Configuration
const ALGORITHM = 'aes-256-cbc';
const ENCODING = 'hex';
const IV_LENGTH = 16; // For AES, this is always 16
const KEY_LENGTH = 32; // For AES-256, this is 32 bytes


/**
 * Get the encryption key from environment variables
 * @returns The encryption key from env or throws an error if not found
 */
export function getEncryptionKey(): string {
  const key = ENCRYPTION_KEY;
  if (!key) {
    throw new Error(`Encryption key not found`);
  }
  
  // Validate key length (should be 64 hex characters for 32 bytes)
  if (key.length !== 64) {
    throw new Error(`Invalid encryption key length. Expected 64 hex characters, got ${key.length}.`);
  }
  
  // Validate hex format
  if (!/^[0-9a-fA-F]+$/.test(key)) {
    throw new Error('Invalid encryption key format. Must be hexadecimal.');
  }
  
  return key;
}

/**
 * Get the HMAC secret from environment variables
 * @returns The HMAC secret from env or throws an error if not found
 */
export function getHMACSecret(): string {
  const secret = HMAC_SECRET;
  if (!secret) {
    throw new Error(`HMAC secret not found`);
  }
  return secret;
}

/**
 * Generate a secure random key for encryption
 * @returns A hex-encoded 32-byte key
 */
export function generateKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString(ENCODING);
}

/**
 * Generate a secure random IV (Initialization Vector)
 * @returns A hex-encoded 16-byte IV
 */
export function generateIV(): string {
  return crypto.randomBytes(IV_LENGTH).toString(ENCODING);
}

/**
 * Hash a value using SHA-256 (one-way hashing)
 * @param value - The value to hash
 * @param salt - Optional salt to add to the value before hashing
 * @returns The hashed value as a hex string
 */
export function hash(value: string, salt?: string): string {
  const data = salt ? `${value}${salt}` : value;
  return crypto.createHash('sha256').update(data).digest(ENCODING);
}

/**
 * Hash a value using SHA-256 with a random salt
 * @param value - The value to hash
 * @returns Object containing the hash and salt
 */
export function hashWithSalt(value: string): { hash: string; salt: string } {
  const salt = generateIV(); // Using IV length for salt
  const hashedValue = hash(value, salt);
  return { hash: hashedValue, salt };
}

/**
 * Verify a value against a hash with salt
 * @param value - The value to verify
 * @param hashValue - The hash to verify against
 * @param salt - The salt used in the original hashing
 * @returns True if the value matches the hash
 */
export function verifyHash(value: string, hashValue: string, salt: string): boolean {
  const computedHash = hash(value, salt);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, ENCODING),
    Buffer.from(hashValue, ENCODING)
  );
}

/**
 * Encrypt a value using AES-256-CBC with environment key
 * @param value - The value to encrypt
 * @param key - Optional encryption key (uses env key if not provided)
 * @param iv - Optional initialization vector
 * @returns The encrypted value as a hex string
 */
export function encode(value: string, key?: string, iv?: string): string {
  try {
    const encryptionKey = key || getEncryptionKey();
    const keyBuffer = Buffer.from(encryptionKey, ENCODING);
    const ivBuffer = iv ? Buffer.from(iv, ENCODING) : crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, ivBuffer);
    let encrypted = cipher.update(value, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);
    
    // Return IV + encrypted data
    return ivBuffer.toString(ENCODING) + ':' + encrypted;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt a value using AES-256-CBC with environment key
 * @param encryptedValue - The encrypted value (format: iv:encryptedData)
 * @param key - Optional decryption key (uses env key if not provided)
 * @returns The decrypted value
 */
export function decode(encryptedValue: string, key?: string): string {
  try {
    const decryptionKey = key || getEncryptionKey();
    const keyBuffer = Buffer.from(decryptionKey, ENCODING);
    const parts = encryptedValue.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted value format');
    }
    
    const [ivHex, encryptedData] = parts;
    if (!ivHex || !encryptedData) {
      throw new Error('Invalid encrypted value format: missing IV or encrypted data');
    }
    
    const ivBuffer = Buffer.from(ivHex, ENCODING);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, ivBuffer);
    let decrypted = decipher.update(encryptedData, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt a value with a generated key and IV
 * @param value - The value to encrypt
 * @returns Object containing the encrypted value, key, and IV
 */
export function encodeWithGeneratedKey(value: string): { encrypted: string; key: string; iv: string } {
  const key = generateKey();
  const iv = generateIV();
  const encrypted = encode(value, key, iv);
  return { encrypted, key, iv };
}

/**
 * Simple hash function for non-sensitive data (e.g., cache keys)
 * @param value - The value to hash
 * @returns A simple hash string
 */
export function simpleHash(value: string): string {
  return crypto.createHash('md5').update(value).digest(ENCODING);
}

/**
 * Create a HMAC (Hash-based Message Authentication Code) using environment secret
 * @param value - The value to hash
 * @param secret - Optional secret key (uses env secret if not provided)
 * @returns The HMAC as a hex string
 */
export function createHMAC(value: string, secret?: string): string {
  const hmacSecret = secret || getHMACSecret();
  return crypto.createHmac('sha256', hmacSecret).update(value).digest(ENCODING);
}

/**
 * Verify a HMAC using environment secret
 * @param value - The original value
 * @param secret - Optional secret key (uses env secret if not provided)
 * @param hmac - The HMAC to verify against
 * @returns True if the HMAC is valid
 */
export function verifyHMAC(value: string, hmac: string, secret?: string): boolean {
  const hmacSecret = secret || getHMACSecret();
  const computedHMAC = createHMAC(value, hmacSecret);
  return crypto.timingSafeEqual(
    Buffer.from(computedHMAC, ENCODING),
    Buffer.from(hmac, ENCODING)
  );
}

/**
 * Convenience function to encrypt using environment key
 * @param value - The value to encrypt
 * @returns The encrypted value
 */
export function encrypt(value: string): string {
  return encode(value);
}

/**
 * Convenience function to decrypt using environment key
 * @param encryptedValue - The encrypted value
 * @returns The decrypted value
 */
export function decrypt(encryptedValue: string): string {
  return decode(encryptedValue);
}
