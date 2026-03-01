// Scan Card Page - Public emergency card view when QR is scanned
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { translations, Language } from '../utils/translations';
import { translateText } from '../utils/translator';
import { recordScan, isQRVersionExpired } from '../services/firebaseService';

interface QRData {
  id: string;
  v: number;
  n: string;
  a: string;
  bg: string;
  al: string;
  cc: string;
  cm: string;
  ecn: string;
  ecp: string;
  ecr: string;
  ip: string;
  dn: string;
  pin: string;
  bd: boolean;
}

const ScanCard: React.FC = () => {
  const { data } = useParams<{ data: string }>();
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [translatedData, setTranslatedData] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const t = (key: keyof typeof translations.en) => translations[language][key] || key;

  useEffect(() => {
    const loadData = async () => {
      if (!data) {
        setIsLoading(false);
        return;
      }

      try {
        const decoded = JSON.parse(atob(data)) as QRData;
        setQrData(decoded);

        // Check if expired
        const expired = await isQRVersionExpired(decoded.id, decoded.v);
        setIsExpired(expired);

        // Record the scan with location
        if (!expired) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            
            // Try to get address
            let address: string | undefined;
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
              );
              const locationData = await response.json();
              address = locationData.display_name;
            } catch {
              // Address lookup failed, continue without it
            }

            await recordScan(decoded.id, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address
            });
          } catch {
            // Record without location
            await recordScan(decoded.id);
          }
        }
      } catch (error) {
        console.error('Error parsing QR data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [data]);

  // Translate data when language changes
  useEffect(() => {
    const translateData = async () => {
      if (!qrData || language === 'en') {
        setTranslatedData({});
        return;
      }

      setIsTranslating(true);
      const fieldsToTranslate = ['n', 'al', 'cc', 'cm', 'ecn', 'ecr', 'ip', 'dn'];
      const newTranslations: Record<string, string> = {};

      for (const field of fieldsToTranslate) {
        const value = qrData[field as keyof QRData] as string;
        if (value) {
          try {
            newTranslations[field] = await translateText(value, 'en', language);
          } catch {
            newTranslations[field] = value;
          }
        }
      }

      setTranslatedData(newTranslations);
      setIsTranslating(false);
    };

    translateData();
  }, [language, qrData]);

  const getField = (field: keyof QRData) => {
    const value = qrData?.[field] as string;
    if (!value) return '';
    if (language === 'en') return value;
    return translatedData[field] || value;
  };

  const handleUnlock = () => {
    if (pinInput === qrData?.pin) {
      setIsUnlocked(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">{t('scanCardLoading')}</p>
        </div>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl mb-4">❌</p>
          <h1 className="text-2xl font-bold text-white mb-2">{t('scanCardNotFound')}</h1>
          <p className="text-gray-400">{t('scanCardNotFoundDesc')}</p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl mb-4">⏳</p>
          <h1 className="text-2xl font-bold text-yellow-400 mb-2">{t('scanCardExpired')}</h1>
          <p className="text-gray-400">{t('scanCardExpiredDesc')}</p>
        </div>
      </div>
    );
  }

  const hasPin = !!qrData.pin;
  const showPrivateInfo = !hasPin || isUnlocked;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Emergency Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-4 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
            <span className="font-bold text-lg">🚨 {t('scanCardTitle')}</span>
          </div>
          {isTranslating && (
            <span className="text-sm animate-pulse">🌐 Translating...</span>
          )}
        </div>
      </div>

      {/* Language Toggle */}
      <div className="bg-slate-800 py-2 px-4">
        <div className="max-w-lg mx-auto flex justify-center gap-2">
          {(['en', 'hi', 'bn'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                language === lang
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {lang === 'en' ? '🇬🇧 EN' : lang === 'hi' ? '🇮🇳 हि' : '🇧🇩 বা'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Patient Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <div className="text-center">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {(getField('n') || 'U')[0].toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-white">{getField('n') || 'Unknown'}</h2>
            <p className="text-gray-400">
              {qrData.a} {language === 'en' ? 'years' : language === 'hi' ? 'वर्ष' : 'বছর'}
            </p>
          </div>
        </motion.div>

        {/* Blood Group - Large */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-center"
        >
          <p className="text-white/80 text-sm mb-1">{t('scanCardBloodGroup')}</p>
          <p className="text-5xl font-bold text-white">🩸 {qrData.bg}</p>
        </motion.div>

        {/* Medical Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            💊 {t('scanCardMedical')}
          </h3>
          
          {qrData.al && (
            <div className="mb-3">
              <p className="text-red-400 text-sm font-medium">{t('allergies')}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {getField('al').split(',').map((item, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                    ⚠️ {item.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {qrData.cc && (
            <div className="mb-3">
              <p className="text-amber-400 text-sm font-medium">{t('chronicConditions')}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {getField('cc').split(',').map((item, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm">
                    {item.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {qrData.cm && (
            <div>
              <p className="text-blue-400 text-sm font-medium">{t('currentMedications')}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {getField('cm').split(',').map((item, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                    💊 {item.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            📞 {t('scanCardEmergency')}
          </h3>
          
          <p className="text-white font-medium">{getField('ecn')}</p>
          <p className="text-gray-400 text-sm">{getField('ecr')}</p>
          <p className="text-gray-400">{qrData.ecp}</p>

          <a
            href={`tel:${qrData.ecp}`}
            className="mt-4 block w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center font-bold text-lg rounded-xl shadow-lg"
          >
            {t('scanCardCallNow')}
          </a>
        </motion.div>

        {/* Additional Info (PIN Protected) */}
        {hasPin && !isUnlocked ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="font-semibold text-white mb-4">🔒 {t('scanCardAdditional')}</h3>
            <p className="text-gray-400 text-sm mb-4">{t('enterPin')}</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={6}
                placeholder="PIN"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <button
                onClick={handleUnlock}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold"
              >
                {t('unlock')}
              </button>
            </div>
          </motion.div>
        ) : showPrivateInfo && (qrData.ip || qrData.dn) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="font-semibold text-white mb-4">📋 {t('scanCardAdditional')}</h3>
            
            {qrData.ip && (
              <div className="mb-3">
                <p className="text-gray-400 text-sm">{t('scanCardInsurance')}</p>
                <p className="text-white">{getField('ip')}</p>
              </div>
            )}

            {qrData.dn && (
              <div className="mb-3">
                <p className="text-gray-400 text-sm">{t('scanCardDoctor')}</p>
                <p className="text-white">{getField('dn')}</p>
              </div>
            )}

            <div>
              <p className="text-gray-400 text-sm">{t('scanCardBloodDonor')}</p>
              <p className={qrData.bd ? 'text-green-400' : 'text-red-400'}>
                {qrData.bd ? `✅ ${t('scanCardYes')}` : `❌ ${t('scanCardNo')}`}
              </p>
            </div>
          </motion.div>
        ) : null}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  window.open(`https://www.google.com/maps/search/hospitals/@${pos.coords.latitude},${pos.coords.longitude},14z`, '_blank');
                },
                () => {
                  window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank');
                }
              );
            }}
            className="py-4 bg-blue-500 text-white rounded-xl font-semibold"
          >
            {t('scanCardFindHospital')}
          </button>
          <a
            href="tel:112"
            className="py-4 bg-red-500 text-white rounded-xl font-semibold text-center"
          >
            {t('scanCardCallEmergency')}
          </a>
        </motion.div>

        {/* Disclaimer */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-500 text-sm text-center">{t('scanCardDisclaimer')}</p>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-gray-500 text-sm">{t('scanCardPoweredBy')}</p>
        </div>
      </div>
    </div>
  );
};

export default ScanCard;
