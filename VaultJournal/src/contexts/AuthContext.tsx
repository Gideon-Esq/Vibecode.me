import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CryptoService } from '../services/CryptoService';
import { StorageService, db } from '../services/StorageService';

interface AuthContextType {
  key: CryptoKey | null;
  isAuthenticated: boolean;
  hasAccount: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  register: (password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [hasAccount, setHasAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccount = async () => {
      try {
        const exists = await StorageService.hasSalt();
        setHasAccount(exists);
      } catch (e) {
        console.error("Failed to check account status", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkAccount();
  }, []);

  const register = async (password: string) => {
    const salt = CryptoService.generateSalt();
    const derivedKey = await CryptoService.deriveKey(password, salt);

    // Create verifier
    const { iv, data } = await CryptoService.encrypt("VALID", derivedKey);

    // Store salt and verifier
    await StorageService.setSalt(salt);
    await db.meta.put({ key: 'verifier', value: { iv, data } });

    setKey(derivedKey);
    setHasAccount(true);
  };

  const login = async (password: string): Promise<boolean> => {
    try {
      const salt = await StorageService.getSalt();
      if (!salt) return false;

      const derivedKey = await CryptoService.deriveKey(password, salt);

      // Check verifier
      const verifierRecord = await db.meta.get('verifier');
      if (!verifierRecord || !verifierRecord.value) {
          // Fallback for disaster recovery if verifier is missing but salt exists?
          // No, if verifier is missing, we can't verify password.
          // Unless we try to decrypt an entry? But that's slow and maybe no entries exist.
          console.error("Verifier missing");
          return false;
      }

      const { iv, data } = verifierRecord.value;

      const check = await CryptoService.decrypt(data, iv, derivedKey);
      if (check === "VALID") {
          setKey(derivedKey);
          return true;
      }
    } catch (e) {
        console.error("Login failed", e);
    }
    return false;
  };

  const logout = () => {
    setKey(null);
    // Reload page to clear memory state completely
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ key, isAuthenticated: !!key, hasAccount, isLoading, login, register, logout }}>
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
