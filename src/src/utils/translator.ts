// ============================================
// ResQScan Auto-Translation Engine
// Translates user-entered profile data to EN/HI/BN
// Uses MyMemory free translation API with caching
// ============================================

import type { Language } from './translations';

// Cache translated text to avoid redundant API calls
const translationCache: Record<string, string> = {};

function getCacheKey(text: string, from: string, to: string): string {
  return `${from}:${to}:${text}`;
}

// Language codes for MyMemory API
const langCodes: Record<Language, string> = {
  en: 'en',
  hi: 'hi',
  bn: 'bn',
};

/**
 * Translate a single text string using MyMemory API
 * Falls back to original text if translation fails
 */
export async function translateText(
  text: string,
  fromLang: Language,
  toLang: Language
): Promise<string> {
  if (!text || !text.trim()) return text;
  if (fromLang === toLang) return text;

  const cacheKey = getCacheKey(text, fromLang, toLang);
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const from = langCodes[fromLang];
    const to = langCodes[toLang];
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation API failed');

    const data = await response.json();
    const translated = data?.responseData?.translatedText;

    if (translated && translated !== text) {
      // MyMemory sometimes returns all-caps for failed translations
      const result = translated === translated.toUpperCase() && text !== text.toUpperCase()
        ? text
        : translated;
      translationCache[cacheKey] = result;
      return result;
    }

    return text;
  } catch {
    // Silently fail and return original
    return text;
  }
}

/**
 * Profile fields that contain user-entered translatable text
 */
export const TRANSLATABLE_FIELDS = [
  'fullName',
  'allergies',
  'chronicConditions',
  'currentMedications',
  'emergencyContactName',
  'emergencyContactRelation',
  'insuranceProvider',
  'doctorName',
] as const;

export type TranslatableField = typeof TRANSLATABLE_FIELDS[number];

/**
 * QR data fields that map to translatable profile fields
 */
export const QR_TRANSLATABLE_FIELDS: Record<string, TranslatableField> = {
  n: 'fullName',
  al: 'allergies',
  cc: 'chronicConditions',
  m: 'currentMedications',
  ecn: 'emergencyContactName',
  ecr: 'emergencyContactRelation',
  ip: 'insuranceProvider',
  dn: 'doctorName',
};

export interface TranslatedProfile {
  en: Record<string, string>;
  hi: Record<string, string>;
  bn: Record<string, string>;
}

/**
 * Translate all translatable fields of a profile to a target language
 */
export async function translateProfileFields(
  fields: Record<string, string>,
  fromLang: Language,
  toLang: Language
): Promise<Record<string, string>> {
  if (fromLang === toLang) return { ...fields };

  const entries = Object.entries(fields);
  const results: Record<string, string> = {};

  // Translate in parallel with small batches to avoid rate limiting
  const BATCH_SIZE = 3;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async ([key, value]) => {
      const translated = await translateText(value, fromLang, toLang);
      return [key, translated] as [string, string];
    });
    const batchResults = await Promise.all(promises);
    for (const [key, value] of batchResults) {
      results[key] = value;
    }
    // Small delay between batches to be nice to the API
    if (i + BATCH_SIZE < entries.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  return results;
}

/**
 * Translate all profile fields to all 3 languages
 * Assumes input is in English (or auto-detects)
 */
export async function translateAllLanguages(
  fields: Record<string, string>,
  sourceLang: Language = 'en'
): Promise<TranslatedProfile> {
  const allLangs: Language[] = ['en', 'hi', 'bn'];
  const result: TranslatedProfile = { en: {}, hi: {}, bn: {} };

  // Source language just copies
  result[sourceLang] = { ...fields };

  // Translate to other languages in parallel
  const otherLangs = allLangs.filter(l => l !== sourceLang);
  const translations = await Promise.all(
    otherLangs.map(lang => translateProfileFields(fields, sourceLang, lang))
  );

  otherLangs.forEach((lang, i) => {
    result[lang] = translations[i];
  });

  return result;
}

/**
 * Translate QR data fields for the emergency page
 */
export async function translateQRData(
  data: Record<string, string | undefined>,
  toLang: Language,
  fromLang: Language = 'en'
): Promise<Record<string, string>> {
  if (fromLang === toLang) {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v) result[k] = v;
    }
    return result;
  }

  const toTranslate: Record<string, string> = {};
  const nonTranslatable: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (!value) continue;
    if (key in QR_TRANSLATABLE_FIELDS) {
      toTranslate[key] = value;
    } else {
      nonTranslatable[key] = value;
    }
  }

  const translated = await translateProfileFields(toTranslate, fromLang, toLang);

  return { ...nonTranslatable, ...translated };
}

/**
 * Load cached translations for a user profile from localStorage
 */
export function loadCachedTranslations(userId: string): TranslatedProfile | null {
  try {
    const key = `resqscan_translations_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Save translated profile to localStorage cache
 */
export function saveCachedTranslations(userId: string, translations: TranslatedProfile): void {
  try {
    const key = `resqscan_translations_${userId}`;
    localStorage.setItem(key, JSON.stringify(translations));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Clear cached translations for a user
 */
export function clearCachedTranslations(userId: string): void {
  localStorage.removeItem(`resqscan_translations_${userId}`);
}
