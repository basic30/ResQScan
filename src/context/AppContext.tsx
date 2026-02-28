// App Context - Authentication, Language, Theme, and Profile Management with Firebase
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  getUserProfile, 
  saveUserProfile,
  saveTranslatedProfile,
  getTranslatedProfile,
  UserProfile
} from '../services/firebaseService';
import { translations, Language, TranslationKey } from '../utils/translations';
import { translateText } from '../utils/translator';

// ==================== TYPES ====================

interface AppContextType {
  // Auth
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Translations
  translatedProfile: Record<string, Record<string, string>> | null;
  isAutoTranslating: boolean;
  autoTranslateProfile: () => Promise<void>;
  getTranslatedField: (field: string, originalValue: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Language state
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('resqscan_language');
    return (saved as Language) || 'en';
  });
  
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('resqscan_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  
  // Translation state
  const [translatedProfile, setTranslatedProfile] = useState<Record<string, Record<string, string>> | null>(null);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);

  // Translation helper function
  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('resqscan_theme', theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Set language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('resqscan_language', lang);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Load user profile from Firestore
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setProfile(userProfile);
          } else {
            // Create initial profile
            const newProfile: Partial<UserProfile> = {
              odid: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || '',
              age: '',
              bloodGroup: '',
              allergies: '',
              chronicConditions: '',
              currentMedications: '',
              emergencyContactName: '',
              emergencyContactPhone: '',
              emergencyContactRelation: '',
              insuranceProvider: '',
              doctorName: '',
              emergencyPin: '',
              isBloodDonor: false
            };
            await saveUserProfile(firebaseUser.uid, newProfile);
            setProfile(newProfile as UserProfile);
          }
          
          // Load translations
          const savedTranslations = await getTranslatedProfile(firebaseUser.uid);
          if (savedTranslations) {
            setTranslatedProfile(savedTranslations);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      } else {
        setProfile(null);
        setTranslatedProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (firebaseError.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (firebaseError.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Signup
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create profile in Firestore
      const newProfile: Partial<UserProfile> = {
        odid: userCredential.user.uid,
        email: email,
        fullName: name,
        age: '',
        bloodGroup: '',
        allergies: '',
        chronicConditions: '',
        currentMedications: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        insuranceProvider: '',
        doctorName: '',
        emergencyPin: '',
        isBloodDonor: false
      };
      
      await saveUserProfile(userCredential.user.uid, newProfile);
      setProfile(newProfile as UserProfile);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        throw new Error('An account already exists with this email');
      } else if (firebaseError.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters');
      } else if (firebaseError.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else {
        throw new Error('Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setProfile(null);
      setTranslatedProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      await saveUserProfile(user.uid, data);
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
      // Auto-translate after profile update
      autoTranslateProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Refresh profile from database
  const refreshProfile = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  // Auto-translate profile to all languages
  const autoTranslateProfile = async (): Promise<void> => {
    if (!profile || !user) return;
    
    setIsAutoTranslating(true);
    
    try {
      const fieldsToTranslate = [
        'fullName', 'allergies', 'chronicConditions', 'currentMedications',
        'emergencyContactName', 'emergencyContactRelation', 'insuranceProvider', 'doctorName'
      ];
      
      const newTranslations: Record<string, Record<string, string>> = {
        en: {},
        hi: {},
        bn: {}
      };
      
      // Detect source language (assume English if contains mostly ASCII)
      const sampleText = profile.fullName || '';
      let sourceLang: 'en' | 'hi' | 'bn' = 'en';
      if (/[\u0900-\u097F]/.test(sampleText)) sourceLang = 'hi';
      else if (/[\u0980-\u09FF]/.test(sampleText)) sourceLang = 'bn';
      
      for (const field of fieldsToTranslate) {
        const value = (profile as unknown as Record<string, string>)[field] || '';
        if (!value) continue;
        
        // Store original in source language
        newTranslations[sourceLang][field] = value;
        
        // Translate to other languages
        const targetLangs = ['en', 'hi', 'bn'].filter(l => l !== sourceLang) as ('en' | 'hi' | 'bn')[];
        
        for (const targetLang of targetLangs) {
          try {
            const translated = await translateText(value, sourceLang, targetLang);
            newTranslations[targetLang][field] = translated;
          } catch {
            newTranslations[targetLang][field] = value; // Fallback to original
          }
        }
      }
      
      setTranslatedProfile(newTranslations);
      
      // Save to Firebase
      await saveTranslatedProfile(user.uid, newTranslations);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsAutoTranslating(false);
    }
  };

  // Get translated field value
  const getTranslatedField = (field: string, originalValue: string): string => {
    if (!translatedProfile || !translatedProfile[language]) {
      return originalValue;
    }
    return translatedProfile[language][field] || originalValue;
  };

  const value: AppContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUserProfile,
    refreshProfile,
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    translatedProfile,
    isAutoTranslating,
    autoTranslateProfile,
    getTranslatedField
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// ==================== HOOK ====================

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
