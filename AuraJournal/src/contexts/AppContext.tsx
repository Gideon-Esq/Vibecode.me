import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppState, UserSettings, DecryptedEntry } from '../types';
import * as CryptoService from '../services/CryptoService';
import * as StorageService from '../services/StorageService';
import type { StoredEntry } from '../services/StorageService';

interface AppContextType {
  // Auth State
  appState: AppState;
  setAppState: (state: AppState) => void;
  masterPassword: string;
  
  // Actions
  setupVault: (password: string) => Promise<void>;
  unlockVault: (password: string) => Promise<boolean>;
  lockVault: () => void;
  
  // Entries
  entries: DecryptedEntry[];
  loadEntries: () => Promise<void>;
  saveEntry: (content: string, id?: number) => Promise<number>;
  deleteEntry: (id: number) => Promise<void>;
  
  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  
  // Backup
  exportBackup: () => Promise<string>;
  importBackup: (data: string) => Promise<boolean>;
}

const defaultSettings: UserSettings = {
  fontTheme: 'serif',
  darkMode: false,
  autoSaveInterval: 3000
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState<AppState>('locked');
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [entries, setEntries] = useState<DecryptedEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Initialize app state
  useEffect(() => {
    async function initializeApp() {
      const hasExistingVault = await StorageService.hasVault();
      const savedSettings = await StorageService.getSettings();
      
      if (savedSettings) {
        setSettings(savedSettings);
        // Apply dark mode
        if (savedSettings.darkMode) {
          document.documentElement.classList.add('dark');
        }
      }
      
      setAppState(hasExistingVault ? 'locked' : 'setup');
    }
    initializeApp();
  }, []);

  // Setup new vault with master password
  const setupVault = async (password: string) => {
    const passwordHash = await CryptoService.createPasswordHash(password);
    const validator = await CryptoService.createPasswordValidator(password);
    
    await StorageService.saveVault({
      passwordHash,
      validatorCiphertext: validator.ciphertext,
      validatorIv: validator.iv,
      validatorSalt: validator.salt,
      createdAt: new Date()
    });
    
    await StorageService.saveSettings(defaultSettings);
    setMasterPassword(password);
    setAppState('unlocked');
  };

  // Unlock existing vault
  const unlockVault = async (password: string): Promise<boolean> => {
    const vault = await StorageService.getVault();
    if (!vault) return false;
    
    const isValid = await CryptoService.validatePassword(
      vault.validatorCiphertext,
      vault.validatorIv,
      vault.validatorSalt,
      password
    );
    
    if (isValid) {
      setMasterPassword(password);
      setAppState('unlocked');
      await loadEntries(password);
      return true;
    }
    return false;
  };

  // Lock vault
  const lockVault = () => {
    setMasterPassword('');
    setEntries([]);
    setAppState('locked');
  };

  // Load and decrypt all entries
  const loadEntries = useCallback(async (password?: string) => {
    const pwd = password || masterPassword;
    if (!pwd) return;
    
    const storedEntries = await StorageService.getAllEntries();
    const decrypted: DecryptedEntry[] = [];
    
    for (const entry of storedEntries) {
      try {
        const content = await CryptoService.decrypt(
          entry.encryptedContent,
          entry.iv,
          entry.salt,
          pwd
        );
        decrypted.push({
          id: entry.id!,
          content,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
          title: content.split('\n')[0]?.slice(0, 50) || 'Untitled'
        });
      } catch {
        console.error('Failed to decrypt entry:', entry.id);
      }
    }
    
    setEntries(decrypted);
  }, [masterPassword]);

  // Save (create or update) an entry
  const saveEntry = async (content: string, id?: number): Promise<number> => {
    if (!masterPassword) throw new Error('Vault is locked');
    
    const encrypted = await CryptoService.encrypt(content, masterPassword);
    
    const storedEntry: StoredEntry = {
      id,
      encryptedContent: encrypted.ciphertext,
      iv: encrypted.iv,
      salt: encrypted.salt,
      createdAt: id ? entries.find(e => e.id === id)?.createdAt || new Date() : new Date(),
      updatedAt: new Date()
    };
    
    const savedId = await StorageService.saveEntry(storedEntry);
    await loadEntries();
    return savedId;
  };

  // Delete an entry
  const deleteEntry = async (id: number) => {
    await StorageService.deleteEntry(id);
    await loadEntries();
  };

  // Update settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await StorageService.saveSettings(updated);
    
    // Apply dark mode immediately
    if (typeof newSettings.darkMode !== 'undefined') {
      if (newSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Export encrypted backup
  const exportBackup = async (): Promise<string> => {
    const data = await StorageService.exportAllData();
    const vault = await StorageService.getVault();
    
    const backup = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      entries: data.entries,
      settings: data.settings,
      vault: vault ? {
        validatorCiphertext: vault.validatorCiphertext,
        validatorIv: vault.validatorIv,
        validatorSalt: vault.validatorSalt
      } : null
    };
    
    // Use stable JSON serialization (sorted keys) for checksum
    const stableJson = JSON.stringify(backup, Object.keys(backup).sort());
    const checksum = await CryptoService.generateChecksum(stableJson);
    
    return JSON.stringify({
      ...backup,
      checksum
    }, null, 2);
  };

  // Import backup
  const importBackup = async (data: string): Promise<boolean> => {
    try {
      const backup = JSON.parse(data);
      
      // Verify checksum using same stable serialization as export
      const { checksum, ...restBackup } = backup;
      const stableJson = JSON.stringify(restBackup, Object.keys(restBackup).sort());
      const expectedChecksum = await CryptoService.generateChecksum(stableJson);
      
      if (checksum !== expectedChecksum) {
        console.error('Backup checksum mismatch');
        return false;
      }
      
      // Import entries
      if (backup.entries) {
        await StorageService.importEntries(backup.entries);
      }
      
      // Import settings
      if (backup.settings) {
        await StorageService.saveSettings(backup.settings);
        setSettings(backup.settings);
      }
      
      await loadEntries();
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        setAppState,
        masterPassword,
        setupVault,
        unlockVault,
        lockVault,
        entries,
        loadEntries,
        saveEntry,
        deleteEntry,
        settings,
        updateSettings,
        exportBackup,
        importBackup
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
