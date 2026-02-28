// ============================================
// ResQScan Application Context
// Manages auth state and language preferences
// ============================================

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations, Language, TranslationKey } from '../utils/translations';
import {
  User, getSession, clearSession, setSession, generateToken,
  authenticateUser, createUser, getUserById, getSavedLanguage, saveLanguage,
  initializeMockData,
} from '../utils/storage';

interface AppContextType {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (email: string, password: string, name: string) => { success: boolean; error?: string };
  logout: () => void;
  refreshUser: () => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLang] = useState<Language>(getSavedLanguage());

  // Initialize on mount
  useEffect(() => {
    initializeMockData();
    const session = getSession();
    if (session) {
      const u = getUserById(session.userId);
      if (u) setUser(u);
      else clearSession();
    }
  }, []);

  const login = useCallback((email: string, password: string) => {
    const u = authenticateUser(email, password);
    if (u) {
      const token = generateToken(u.id);
      setSession(u.id, token);
      setUser(u);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const signup = useCallback((email: string, password: string, name: string) => {
    const u = createUser(email, password, name);
    if (u) {
      const token = generateToken(u.id);
      setSession(u.id, token);
      setUser(u);
      return { success: true };
    }
    return { success: false, error: 'An account with this email already exists' };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    if (user) {
      const u = getUserById(user.id);
      if (u) setUser(u);
    }
  }, [user]);

  const handleSetLanguage = useCallback((lang: Language) => {
    setLang(lang);
    saveLanguage(lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user, login, signup, logout, refreshUser,
      language, setLanguage: handleSetLanguage, t,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
