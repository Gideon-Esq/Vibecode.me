import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Moon, Sun, Lock, LogOut } from 'lucide-react';
import { Button } from './Button';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="fixed top-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Lock className="w-6 h-6" />
            <h1 className="font-serif text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">VaultJournal</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            {isAuthenticated && (
              <Button variant="ghost" onClick={logout} className="p-2" aria-label="Logout">
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  );
};
