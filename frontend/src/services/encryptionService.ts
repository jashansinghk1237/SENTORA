/**
 * Web Crypto API PIN hashing service.
 * Provides client-side PIN hashing using SHA-256 with a salt.
 * Protects local journal sessions on shared devices.
 */

const PIN_STORAGE_KEY = "sentora_pin_hash";
const SALT_STORAGE_KEY = "sentora_pin_salt";
const LOCK_STATE_KEY = "sentora_is_locked";

export const encryptionService = {
  /**
   * Hashes a PIN using Web Crypto SHA-256 with a salt.
   */
  async hashPin(pin: string, saltHex?: string): Promise<{ hashHex: string; saltHex: string }> {
    const encoder = new TextEncoder();
    
    // Generate or parse salt
    let saltBytes: Uint8Array;
    if (saltHex) {
      saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    } else {
      saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
    }

    const pinBytes = encoder.encode(pin);
    const combined = new Uint8Array(saltBytes.length + pinBytes.length);
    combined.set(saltBytes);
    combined.set(pinBytes, saltBytes.length);

    const hashBuffer = await window.crypto.subtle.digest("SHA-256", combined);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const generatedHashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const generatedSaltHex = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, "0")).join("");

    return {
      hashHex: generatedHashHex,
      saltHex: generatedSaltHex,
    };
  },

  async setPin(pin: string): Promise<void> {
    if (!pin || pin.length < 4) {
      throw new Error("PIN must be at least 4 digits");
    }
    const { hashHex, saltHex } = await this.hashPin(pin);
    localStorage.setItem(PIN_STORAGE_KEY, hashHex);
    localStorage.setItem(SALT_STORAGE_KEY, saltHex);
    localStorage.setItem(LOCK_STATE_KEY, "false");
  },

  async verifyPin(pin: string): Promise<boolean> {
    const savedHash = localStorage.getItem(PIN_STORAGE_KEY);
    const savedSalt = localStorage.getItem(SALT_STORAGE_KEY);

    if (!savedHash || !savedSalt) return false;

    const { hashHex } = await this.hashPin(pin, savedSalt);
    return hashHex === savedHash;
  },

  isPinEnabled(): boolean {
    return Boolean(localStorage.getItem(PIN_STORAGE_KEY) && localStorage.getItem(SALT_STORAGE_KEY));
  },

  removePin(): void {
    localStorage.removeItem(PIN_STORAGE_KEY);
    localStorage.removeItem(SALT_STORAGE_KEY);
    localStorage.removeItem(LOCK_STATE_KEY);
  },

  setLocked(locked: boolean): void {
    localStorage.setItem(LOCK_STATE_KEY, locked ? "true" : "false");
  },

  isLocked(): boolean {
    if (!this.isPinEnabled()) return false;
    return localStorage.getItem(LOCK_STATE_KEY) === "true";
  },
};
