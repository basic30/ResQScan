// ============================================
// ResQScan Emergency Public Page
// High contrast, fast loading, mobile optimized
// No login required - accessible via QR scan
// ============================================

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { decodeQRData, QRData, recordScan, getSavedLanguage } from '../utils/storage';
import { translations } from '../utils/translations';

export default function Emergency() {
  const { data: encodedData } = useParams<{ data: string }>();
  const [medData, setMedData] = useState<QRData | null>(null);
  const [error, setError] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPrivate, setShowPrivate] = useState(false);
  const [loading, setLoading] = useState(true);

  const lang = getSavedLanguage();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  useEffect(() => {
    if (encodedData) {
      try {
        const decoded = decodeQRData(encodedData);
        if (decoded) {
          setMedData(decoded);
          // Record this scan
          if (decoded.id) {
            recordScan(decoded.id);
          }
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    } else {
      setError(true);
    }
    setLoading(false);
  }, [encodedData]);

  const openMaps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          window.open(
            `https://www.google.com/maps/search/hospital/@${pos.coords.latitude},${pos.coords.longitude},14z`,
            '_blank'
          );
        },
        () => {
          window.open('https://www.google.com/maps/search/hospital+near+me', '_blank');
        }
      );
    } else {
      window.open('https://www.google.com/maps/search/hospital+near+me', '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Loading Emergency Data...</p>
        </div>
      </div>
    );
  }

  if (error || !medData) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid QR Code</h1>
          <p className="text-gray-400">{t('noData')}</p>
          <a
            href="#/"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold transition-all hover:scale-105"
          >
            Go to ResQScan
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Emergency Header */}
      <motion.header
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-red-600 text-white py-4 px-4 shadow-xl shadow-red-600/30"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl animate-pulse">🚨</span>
            <h1 className="text-lg sm:text-xl font-black tracking-wide">
              {t('emergencyTitle')}
            </h1>
            <span className="text-2xl animate-pulse">🚨</span>
          </div>
          <p className="text-red-100 text-xs sm:text-sm">{t('emergencySubtitle')}</p>
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Blood Group - Prominent Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-red-600/20 border-2 border-red-500/40 rounded-2xl p-6 text-center"
        >
          <p className="text-red-300 text-sm font-medium mb-1">{t('bloodGroup')}</p>
          <p className="text-6xl sm:text-7xl font-black text-red-400">{medData.bg || '—'}</p>
        </motion.div>

        {/* Patient Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            👤 {t('patientInfo')}
          </h2>
          <div className="space-y-3">
            <InfoRow label={t('fullName')} value={medData.n} large />
            <InfoRow label={t('age')} value={medData.a ? `${medData.a} years` : ''} />
          </div>
        </motion.div>

        {/* Medical Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            🏥 {t('medicalInfo')}
          </h2>
          <div className="space-y-3">
            <InfoRow label={t('allergies')} value={medData.al} warning />
            <InfoRow label={t('chronicConditions')} value={medData.cc} />
            <InfoRow label={t('currentMedications')} value={medData.m} />
          </div>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            📞 {t('emergencyContact')}
          </h2>
          <div className="space-y-3 mb-4">
            <InfoRow label={t('emergencyContactName')} value={medData.ecn} />
            <InfoRow label={t('relationship')} value={medData.ecr} />
            <InfoRow label={t('emergencyContactPhone')} value={medData.ecp} />
          </div>

          {medData.ecp && (
            <a
              href={`tel:${medData.ecp}`}
              className="block w-full py-4 rounded-xl bg-green-600 text-white text-center font-bold text-lg shadow-lg shadow-green-600/30 hover:bg-green-700 transition-all active:scale-95"
            >
              {t('callEmergencyContact')}
            </a>
          )}
        </motion.div>

        {/* Private Data Section (if PIN protected) */}
        {medData.pin && !showPrivate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5"
          >
            <h2 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
              🔒 {t('additionalInfo')}
            </h2>
            <p className="text-sm text-gray-400 mb-3">{t('enterPin')}</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="PIN"
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-lg tracking-widest focus:outline-none focus:border-yellow-500/50"
              />
              <button
                onClick={() => setShowPrivate(true)}
                className="px-6 py-3 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-all"
              >
                {t('unlock')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Additional Info (shown after PIN or if no PIN) */}
        {(showPrivate || !medData.pin) && (medData.ip || medData.dn) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5"
          >
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              📋 {t('additionalInfo')}
            </h2>
            <div className="space-y-3">
              {medData.ip && <InfoRow label={t('insuranceProvider')} value={medData.ip} />}
              {medData.dn && <InfoRow label={t('doctorName')} value={medData.dn} />}
            </div>
          </motion.div>
        )}

        {/* Find Hospitals Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={openMaps}
            className="block w-full py-4 rounded-xl bg-blue-600 text-white text-center font-bold text-lg shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
          >
            {t('findHospitals')}
          </button>
        </motion.div>

        {/* Emergency Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: '🚑', num: '102', name: t('ambulance') },
            { label: '🚔', num: '100', name: t('police') },
            { label: '🆘', num: '112', name: 'Emergency' },
          ].map((item, i) => (
            <a
              key={i}
              href={`tel:${item.num}`}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-red-500/10 transition-all active:scale-95"
            >
              <div className="text-2xl mb-1">{item.label}</div>
              <div className="text-lg font-black text-red-400">{item.num}</div>
              <div className="text-[10px] text-gray-400">{item.name}</div>
            </a>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 text-center"
        >
          <p className="text-xs text-yellow-400/80 leading-relaxed">
            {t('disclaimer')}
          </p>
        </motion.div>

        {/* Branding */}
        <div className="text-center py-4">
          <a href="#/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xs font-semibold">Powered by ResQScan</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Info Row Component
// ============================================
function InfoRow({ label, value, large, warning }: { label: string; value?: string; large?: boolean; warning?: boolean }) {
  if (!value) return null;

  return (
    <div className={`${warning && value ? 'bg-red-500/10 border border-red-500/20 rounded-xl p-3 -mx-1' : ''}`}>
      <p className={`text-xs font-medium uppercase tracking-wider mb-0.5 ${warning && value ? 'text-red-400' : 'text-gray-500'}`}>
        {label}
      </p>
      <p className={`font-semibold text-white ${large ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} ${warning && value ? 'text-red-300' : ''}`}>
        {value}
      </p>
    </div>
  );
}
