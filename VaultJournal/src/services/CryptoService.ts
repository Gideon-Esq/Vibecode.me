export class CryptoService {
  private static ITERATIONS = 100000;
  private static ALGO_NAME = 'AES-GCM';
  private static HASH = 'SHA-256';

  // Generate a random salt
  static generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(16));
  }

  // Derive a key from password and salt
  static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: this.ITERATIONS,
        hash: this.HASH
      },
      keyMaterial,
      { "name": this.ALGO_NAME, "length": 256 },
      false, // Key is non-extractable, so it can't be exported
      ["encrypt", "decrypt"]
    );
  }

  static async encrypt(text: string, key: CryptoKey): Promise<{ iv: Uint8Array; data: ArrayBuffer }> {
    const enc = new TextEncoder();
    const encoded = enc.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

    const cipherText = await window.crypto.subtle.encrypt(
      {
        name: this.ALGO_NAME,
        iv: iv
      },
      key,
      encoded
    );

    return { iv, data: cipherText };
  }

  static async decrypt(cipherText: ArrayBuffer, iv: Uint8Array, key: CryptoKey): Promise<string> {
    try {
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: this.ALGO_NAME,
          iv: iv
        },
        key,
        cipherText
      );

      const dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (e) {
      console.error("Decryption failed", e);
      throw new Error("Decryption failed");
    }
  }
}
