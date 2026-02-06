import React, { createContext, useContext, useState, useEffect } from 'react';
import { CryptoService, EncryptedData } from '../services/crypto';
import { db } from '../services/db';

interface AuthContextType {
  isUnlocked: boolean;
  hasAccount: boolean;
  isLoading: boolean;
  dek: CryptoKey | null;
  unlock: (password: string) => Promise<boolean>;
  setup: (password: string) => Promise<void>;
  lock: () => void;
  reset: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [dek, setDek] = useState<CryptoKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccount();
  }, []);

  const checkAccount = async () => {
    try {
      const meta = await db.meta.get('master');
      setHasAccount(!!meta);
    } catch (e) {
      console.error("Failed to check account:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const setup = async (password: string) => {
    setIsLoading(true);
    try {
      // 1. Generate new DEK
      const newDek = await CryptoService.generateKey();

      // 2. Generate Salt and Derive KEK
      const salt = CryptoService.generateSalt();
      const kek = await CryptoService.deriveKeyFromPassword(password, salt);

      // 3. Encrypt DEK with KEK
      const encryptedDek = await CryptoService.encryptKey(newDek, kek);

      // 4. Save to DB
      await db.meta.put({
        id: 'master',
        salt: CryptoService.bufferToHex(salt),
        encryptedDEK: encryptedDek.ciphertext,
        dekIv: encryptedDek.iv
      });

      // 5. Set State
      setDek(newDek);
      setHasAccount(true);
      setIsUnlocked(true);
    } catch (e) {
      console.error("Setup failed:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const unlock = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const meta = await db.meta.get('master');
      if (!meta) throw new Error("No account found");

      // 1. Re-derive KEK using stored salt
      const salt = CryptoService.hexToBuffer(meta.salt);
      const kek = await CryptoService.deriveKeyFromPassword(password, salt);

      // 2. Decrypt DEK
      const encryptedDek: EncryptedData = {
        ciphertext: meta.encryptedDEK,
        iv: meta.dekIv
      };

      try {
        const unlockedDek = await CryptoService.decryptKey(encryptedDek, kek);
        setDek(unlockedDek);
        setIsUnlocked(true);
        return true;
      } catch (e) {
        // Decryption failed (wrong password)
        return false;
      }
    } catch (e) {
      console.error("Unlock error:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const lock = () => {
    setDek(null);
    setIsUnlocked(false);
  };

  const reset = async () => {
    await db.delete();
    await db.open();
    setHasAccount(false);
    lock();
  };

  return (
    <AuthContext.Provider value={{ isUnlocked, hasAccount, isLoading, dek, unlock, setup, lock, reset }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
