/**
 * CryptoService - Military-Grade Encryption using Web Crypto API
 * 
 * Zero-Knowledge Implementation:
 * - Master password is never stored
 * - Password creates a hash that derives an encryption key
 * - AES-GCM-256 for all encryption operations
 */

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100000; // PBKDF2 iterations for key derivation

/**
 * Derives an AES-GCM encryption key from a password using PBKDF2
 */
export async function deriveKey(
  password: string,
  salt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Generate or use provided salt
  const useSalt = salt || crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive the actual encryption key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: useSalt as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );

  return { key, salt: useSalt };
}

/**
 * Creates a password hash for verification without storing the password
 */
export async function createPasswordHash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypts plaintext using AES-GCM-256
 */
export async function encrypt(
  plaintext: string,
  password: string
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Derive key from password
  const { key, salt } = await deriveKey(password);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    data
  );

  // Convert to base64 for storage
  const ciphertext = bufferToBase64(new Uint8Array(encryptedBuffer));
  const ivBase64 = bufferToBase64(iv);
  const saltBase64 = bufferToBase64(salt);

  return {
    ciphertext,
    iv: ivBase64,
    salt: saltBase64
  };
}

/**
 * Decrypts ciphertext using AES-GCM-256
 */
export async function decrypt(
  ciphertext: string,
  iv: string,
  salt: string,
  password: string
): Promise<string> {
  // Convert from base64
  const ciphertextBuffer = base64ToBuffer(ciphertext);
  const ivBuffer = base64ToBuffer(iv);
  const saltBuffer = base64ToBuffer(salt);

  // Derive the same key using the stored salt
  const { key } = await deriveKey(password, saltBuffer);

  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer as BufferSource
    },
    key,
    ciphertextBuffer as BufferSource
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Validates if a password can decrypt test data
 * Used to verify the master password on unlock
 */
export async function validatePassword(
  testCiphertext: string,
  testIv: string,
  testSalt: string,
  password: string
): Promise<boolean> {
  try {
    await decrypt(testCiphertext, testIv, testSalt, password);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates encrypted test data for password validation
 */
export async function createPasswordValidator(password: string): Promise<{
  ciphertext: string;
  iv: string;
  salt: string;
}> {
  const testPhrase = 'AURAJOURNAL_VALID';
  return encrypt(testPhrase, password);
}

/**
 * Generates a secure checksum for backup integrity
 */
export async function generateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Utility functions
function bufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
