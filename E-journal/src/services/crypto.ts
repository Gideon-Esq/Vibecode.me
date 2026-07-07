// src/services/crypto.ts

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100000;

export interface EncryptedData {
  ciphertext: string; // Base64
  iv: string;         // Base64
}

// Convert Helpers
const bufferToBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes));
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export class CryptoService {
  // Generate a random salt
  static generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  }

  // Generate a random IV
  static generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  }

  // Generate a new Data Encryption Key (DEK)
  static async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );
  }

  // Derive a Key Encryption Key (KEK) from password and salt
  static async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt as any,
        iterations: ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false, // KEK is not extractable (we only use it to unwrap DEK)
      ["encrypt", "decrypt"]
    );
  }

  // Encrypt data (string) with a key
  static async encrypt(text: string, key: CryptoKey): Promise<EncryptedData> {
    const iv = this.generateIV();
    const enc = new TextEncoder();
    const encodedData = enc.encode(text);

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as any,
      },
      key,
      encodedData
    );

    return {
      ciphertext: bufferToBase64(ciphertext),
      iv: bufferToBase64(iv),
    };
  }

  // Decrypt data with a key
  static async decrypt(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
    const iv = base64ToBuffer(encryptedData.iv);
    const ciphertext = base64ToBuffer(encryptedData.ciphertext);

    try {
      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        ciphertext
      );
      const dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (e) {
      console.error("Decryption failed", e);
      throw new Error("Failed to decrypt data. Invalid key or corrupted data.");
    }
  }

  // Export a key (DEK) to raw format (for wrapping)
  static async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
    return crypto.subtle.exportKey("raw", key);
  }

  // Import a raw key (for unwrapping)
  static async importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
    return crypto.subtle.importKey(
      "raw",
      keyData,
      "AES-GCM",
      true,
      ["encrypt", "decrypt"]
    );
  }

  // Helper to wrap the DEK using the KEK
  // Instead of using 'wrapKey' which has format specifics, we'll just encrypt the exported key data.
  // This is often simpler for portability across simplified flows.
  static async encryptKey(keyToEncrypt: CryptoKey, wrappingKey: CryptoKey): Promise<EncryptedData> {
    const rawKey = await this.exportKey(keyToEncrypt);
    const iv = this.generateIV();

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as any,
      },
      wrappingKey,
      rawKey
    );

    return {
      ciphertext: bufferToBase64(ciphertext),
      iv: bufferToBase64(iv),
    };
  }

  // Helper to unwrap (decrypt) the DEK using the KEK
  static async decryptKey(encryptedKey: EncryptedData, wrappingKey: CryptoKey): Promise<CryptoKey> {
    const iv = base64ToBuffer(encryptedKey.iv);
    const ciphertext = base64ToBuffer(encryptedKey.ciphertext);

    const decryptedRawKey = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      wrappingKey,
      ciphertext
    );

    return this.importKey(decryptedRawKey);
  }

  // Helper: Strings for Salt to store easily
  static bufferToHex(buffer: Uint8Array): string {
      return Array.from(buffer)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
  }

  static hexToBuffer(hex: string): Uint8Array {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
          bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }
      return bytes;
  }
}
