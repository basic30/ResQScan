// ============================================
// ResQScan Dashboard
// Profile, QR Code, Donors, Scan History, Hospitals
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { useApp } from '../context/AppContext';
import {
  UserProfile, defaultProfile, updateUserProfile, deleteUser,
  encodeQRData, searchDonors, getScanHistory, recordScan,
} from '../utils/storage';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const tabs = [
  { id: 'profile', icon: '👤' },
  { id: 'qr', icon: '📱' },
  { id: 'donors', icon: '🩸' },
  { id: 'scans', icon: '📊' },
  { id: 'hospitals', icon: '🏥' },
] as const;

type TabId = typeof tabs[number]['id'];

export default function Dashboard() {
  const { user, isAuthenticated, logout, refreshUser, t } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const tabLabels: Record<TabId, string> = {
    profile: t('profileTab'),
    qr: t('qrCodeTab'),
    donors: t('donorSearchTab'),
    scans: t('scanHistoryTab'),
    hospitals: t('hospitalsTab'),
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pt-20 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {t('welcomeBack')}, <span className="gradient-text">{user.name || 'User'}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">{user.email}</p>
        </motion.div>

        {/* SOS Button */}
        {user.profile?.emergencyContactPhone && (
          <motion.a
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            href={`tel:${user.profile.emergencyContactPhone}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/30 transition-all mb-6 animate-pulse-glow"
          >
            {t('sosButton')}
          </motion.a>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tabLabels[tab.id]}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'profile' && <ProfileTab user={user} refreshUser={refreshUser} logout={logout} navigate={navigate} t={t} />}
            {activeTab === 'qr' && <QRTab user={user} t={t} />}
            {activeTab === 'donors' && <DonorTab t={t} />}
            {activeTab === 'scans' && <ScanTab userId={user.id} t={t} />}
            {activeTab === 'hospitals' && <HospitalTab t={t} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// Profile Tab
// ============================================
function ProfileTab({ user, refreshUser, logout, navigate, t }: any) {
  const [profile, setProfile] = useState<UserProfile>(user.profile || { ...defaultProfile, fullName: user.name });
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleChange = (field: keyof UserProfile, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    updateUserProfile(user.id, profile);
    refreshUser();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteUser(user.id);
      logout();
      navigate('/');
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 5000);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        👤 {t('profileTab')}
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className={labelClass}>{t('fullName')} *</label>
          <input type="text" value={profile.fullName} onChange={e => handleChange('fullName', e.target.value)} className={inputClass} placeholder="John Doe" />
        </div>

        {/* Age */}
        <div>
          <label className={labelClass}>{t('age')} *</label>
          <input type="number" value={profile.age} onChange={e => handleChange('age', e.target.value)} className={inputClass} placeholder="25" min="1" max="150" />
        </div>

        {/* Blood Group */}
        <div>
          <label className={labelClass}>{t('bloodGroup')} *</label>
          <select
            value={profile.bloodGroup}
            onChange={e => handleChange('bloodGroup', e.target.value)}
            className={inputClass + ' appearance-none cursor-pointer'}
          >
            <option value="" className="bg-slate-800">{t('selectBloodGroup')}</option>
            {BLOOD_GROUPS.map(bg => (
              <option key={bg} value={bg} className="bg-slate-800">{bg}</option>
            ))}
          </select>
        </div>

        {/* Allergies */}
        <div>
          <label className={labelClass}>{t('allergies')}</label>
          <input type="text" value={profile.allergies} onChange={e => handleChange('allergies', e.target.value)} className={inputClass} placeholder={t('allergiesPlaceholder')} />
        </div>

        {/* Chronic Conditions */}
        <div>
          <label className={labelClass}>{t('chronicConditions')}</label>
          <input type="text" value={profile.chronicConditions} onChange={e => handleChange('chronicConditions', e.target.value)} className={inputClass} placeholder={t('chronicConditionsPlaceholder')} />
        </div>

        {/* Current Medications */}
        <div>
          <label className={labelClass}>{t('currentMedications')}</label>
          <input type="text" value={profile.currentMedications} onChange={e => handleChange('currentMedications', e.target.value)} className={inputClass} placeholder={t('currentMedicationsPlaceholder')} />
        </div>

        {/* Emergency Contact Name */}
        <div>
          <label className={labelClass}>{t('emergencyContactName')} *</label>
          <input type="text" value={profile.emergencyContactName} onChange={e => handleChange('emergencyContactName', e.target.value)} className={inputClass} placeholder="Jane Doe" />
        </div>

        {/* Emergency Contact Phone */}
        <div>
          <label className={labelClass}>{t('emergencyContactPhone')} *</label>
          <input type="tel" value={profile.emergencyContactPhone} onChange={e => handleChange('emergencyContactPhone', e.target.value)} className={inputClass} placeholder="+91 98765 43210" />
        </div>

        {/* Emergency Contact Relation */}
        <div>
          <label className={labelClass}>{t('emergencyContactRelation')}</label>
          <input type="text" value={profile.emergencyContactRelation} onChange={e => handleChange('emergencyContactRelation', e.target.value)} className={inputClass} placeholder="Spouse / Parent / Friend" />
        </div>

        {/* Insurance Provider */}
        <div>
          <label className={labelClass}>{t('insuranceProvider')} <span className="text-gray-500 text-xs">({t('optional')})</span></label>
          <input type="text" value={profile.insuranceProvider} onChange={e => handleChange('insuranceProvider', e.target.value)} className={inputClass} placeholder="United Health" />
        </div>

        {/* Doctor Name */}
        <div>
          <label className={labelClass}>{t('doctorName')} <span className="text-gray-500 text-xs">({t('optional')})</span></label>
          <input type="text" value={profile.doctorName} onChange={e => handleChange('doctorName', e.target.value)} className={inputClass} placeholder="Dr. Smith" />
        </div>

        {/* Emergency PIN */}
        <div>
          <label className={labelClass}>{t('emergencyPin')} <span className="text-gray-500 text-xs">({t('optional')})</span></label>
          <input type="password" value={profile.emergencyPin} onChange={e => handleChange('emergencyPin', e.target.value)} className={inputClass} placeholder={t('emergencyPinPlaceholder')} maxLength={6} />
        </div>

        {/* Blood Donor Toggle */}
        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={profile.isBloodDonor}
                onChange={e => handleChange('isBloodDonor', e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-7 rounded-full transition-all ${profile.isBloodDonor ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-white/10'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform mt-1 ${profile.isBloodDonor ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              🩸 {t('bloodDonorYes')}
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-8">
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all hover:scale-105 active:scale-95"
        >
          {saved ? '✅ ' + t('profileSaved') : t('saveProfile')}
        </button>

        <button
          onClick={handleDelete}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            confirmDelete
              ? 'bg-red-600 text-white animate-pulse'
              : 'glass text-red-400 hover:bg-red-500/10'
          }`}
        >
          {confirmDelete ? t('deleteConfirm') : t('deleteAccount')}
        </button>
      </div>
    </div>
  );
}

// ============================================
// QR Code Tab
// ============================================
function QRTab({ user, t }: any) {
  const [qrUrl, setQrUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [qrLink, setQrLink] = useState('');

  const hasProfile = user.profile && user.profile.fullName && user.profile.bloodGroup;

  const generateQR = useCallback(async () => {
    if (!user.profile) return;
    setGenerating(true);

    // Simulate loading for UX
    await new Promise(r => setTimeout(r, 1500));

    const encoded = encodeQRData(user.id, user.profile);
    const link = `${window.location.origin}${window.location.pathname}#/emergency/${encoded}`;
    setQrLink(link);

    try {
      const url = await QRCode.toDataURL(link, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setQrUrl(url);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
    setGenerating(false);
  }, [user]);

  const downloadPNG = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.download = 'resqscan-qr-code.png';
    link.href = qrUrl;
    link.click();
  };

  const downloadPDF = () => {
    if (!qrUrl || !user.profile) return;
    const p = user.profile as UserProfile;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Dark background
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 297, 'F');

    // Red header bar
    doc.setFillColor(239, 68, 68);
    doc.rect(0, 0, 210, 45, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text('RESQSCAN', 105, 22, { align: 'center' });
    doc.setFontSize(11);
    doc.text('Emergency Medical Card', 105, 33, { align: 'center' });

    // QR Code
    doc.addImage(qrUrl, 'PNG', 65, 55, 80, 80);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Scan this QR code in case of emergency', 105, 142, { align: 'center' });

    // Divider
    doc.setDrawColor(239, 68, 68);
    doc.setLineWidth(0.5);
    doc.line(30, 150, 180, 150);

    // Patient info
    let y = 162;
    const addField = (label: string, value: string, highlight = false) => {
      if (!value) return;
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(label, 30, y);
      doc.setFontSize(13);
      if (highlight) {
        doc.setTextColor(239, 68, 68);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
      }
      doc.text(value, 30, y + 6);
      y += 16;
    };

    addField('FULL NAME', p.fullName);
    addField('AGE', p.age ? `${p.age} years` : '');
    addField('BLOOD GROUP', p.bloodGroup, true);
    addField('ALLERGIES', p.allergies);
    addField('CHRONIC CONDITIONS', p.chronicConditions);
    addField('CURRENT MEDICATIONS', p.currentMedications);

    // Divider
    doc.setDrawColor(239, 68, 68);
    doc.line(30, y, 180, y);
    y += 10;

    addField('EMERGENCY CONTACT', `${p.emergencyContactName} (${p.emergencyContactRelation})`);
    addField('CONTACT PHONE', p.emergencyContactPhone);

    if (p.insuranceProvider) addField('INSURANCE', p.insuranceProvider);
    if (p.doctorName) addField('DOCTOR', p.doctorName);

    // Footer disclaimer
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('This information is user-provided and intended for emergency reference only.', 105, 280, { align: 'center' });
    doc.text('Always verify with the patient or their physician when possible.', 105, 285, { align: 'center' });
    doc.text('Generated by ResQScan - resqscan.app', 105, 290, { align: 'center' });

    doc.save('resqscan-emergency-card.pdf');
  };

  const simulateScan = () => {
    recordScan(user.id);
  };

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        📱 {t('qrCodeTab')}
      </h2>

      {!hasProfile ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-400">{t('noProfileQR')}</p>
        </div>
      ) : (
        <div className="text-center">
          {/* Generate Button */}
          {!qrUrl && !generating && (
            <button
              onClick={generateQR}
              className="px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-2xl shadow-red-500/25 hover:shadow-red-500/40 transition-all hover:scale-105"
            >
              {t('generateQR')}
            </button>
          )}

          {/* Loading State */}
          {generating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12"
            >
              <div className="inline-block w-16 h-16 relative mb-4">
                <div className="absolute inset-0 rounded-2xl border-2 border-red-500/30 animate-ping" />
                <div className="absolute inset-0 rounded-2xl border-2 border-t-red-500 border-r-orange-500 border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 animate-pulse flex items-center justify-center">
                  <span className="text-white text-lg">🔒</span>
                </div>
              </div>
              <p className="text-gray-300 font-medium animate-pulse">{t('generatingQR')}</p>
            </motion.div>
          )}

          {/* QR Display */}
          {qrUrl && !generating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <p className="text-lg font-bold text-white mb-2">✅ {t('qrReady')}</p>
              <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">{t('qrDescription')}</p>

              {/* QR Image */}
              <div className="inline-block p-4 rounded-3xl glass-strong animate-pulse-glow mb-6">
                <img src={qrUrl} alt="QR Code" className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={downloadPNG}
                  className="px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                  🖼️ {t('downloadPNG')}
                </button>
                <button
                  onClick={downloadPDF}
                  className="px-5 py-3 rounded-xl text-sm font-bold glass text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  📄 {t('downloadPDF')}
                </button>
                <button
                  onClick={generateQR}
                  className="px-5 py-3 rounded-xl text-sm font-bold glass text-gray-300 hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  🔄 {t('regenerateQR')}
                </button>
                <button
                  onClick={simulateScan}
                  className="px-5 py-3 rounded-xl text-sm font-bold glass text-green-400 hover:bg-green-500/10 transition-all flex items-center gap-2"
                >
                  📡 Simulate Scan
                </button>
              </div>

              {/* QR Link Preview */}
              {qrLink && (
                <div className="mt-6 p-3 rounded-xl bg-white/5 text-xs text-gray-500 break-all max-w-lg mx-auto">
                  <p className="text-gray-400 mb-1 font-medium">QR Link:</p>
                  {qrLink.substring(0, 80)}...
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Blood Donor Search Tab
// ============================================
function DonorTab({ t }: any) {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [donors, setDonors] = useState<{ name: string; phone: string; bloodGroup: string }[]>([]);

  const handleSearch = (bg: string) => {
    setSelectedGroup(bg);
    setDonors(searchDonors(bg));
  };

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        🩸 {t('searchByBloodGroup')}
      </h2>
      <p className="text-sm text-yellow-400/80 mb-6">{t('donorDisclaimer')}</p>

      {/* Blood Group Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {BLOOD_GROUPS.map(bg => (
          <button
            key={bg}
            onClick={() => handleSearch(bg)}
            className={`py-3 rounded-xl text-sm font-bold transition-all ${
              selectedGroup === bg
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 scale-105'
                : 'glass text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {bg}
          </button>
        ))}
      </div>

      {/* Results */}
      {selectedGroup && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-gray-400 mb-4">
            <span className="text-red-400 font-bold">{donors.length}</span> {t('donorAvailable')} ({selectedGroup})
          </p>

          {donors.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('noDonorsFound')}</p>
          ) : (
            <div className="space-y-3">
              {donors.map((donor, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-sm font-bold text-red-400">
                      {donor.bloodGroup}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{donor.name}</p>
                      <p className="text-xs text-gray-400">{donor.phone}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${donor.phone}`}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                  >
                    📞 {t('contactDonor')}
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// Scan History Tab
// ============================================
function ScanTab({ userId, t }: { userId: string; t: any }) {
  const [scans, setScans] = useState(getScanHistory(userId));

  useEffect(() => {
    setScans(getScanHistory(userId));
  }, [userId]);

  const refreshScans = () => setScans(getScanHistory(userId));

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          📊 {t('scanActivity')}
        </h2>
        <button onClick={refreshScans} className="px-3 py-1.5 rounded-lg text-xs font-medium glass text-gray-400 hover:text-white transition-all">
          🔄 Refresh
        </button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white/5 text-center">
          <p className="text-3xl font-black gradient-text">{scans.length}</p>
          <p className="text-xs text-gray-400 mt-1">{t('totalScans')}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 text-center">
          <p className="text-sm font-bold text-white">
            {scans.length > 0 ? new Date(scans[scans.length - 1].timestamp).toLocaleDateString() : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t('lastScanned')}</p>
        </div>
      </div>

      {/* Scan List */}
      {scans.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📡</div>
          <p className="text-gray-400 text-sm">{t('noScans')}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {[...scans].reverse().map((scan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-sm">
                  📱
                </div>
                <div>
                  <p className="text-sm font-medium text-white">QR Scanned</p>
                  <p className="text-xs text-gray-400">
                    {new Date(scan.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-400" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Nearby Hospitals Tab
// ============================================
function HospitalTab({ t }: any) {
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

  const emergencyNumbers = [
    { label: t('ambulance'), number: '102', icon: '🚑' },
    { label: t('police'), number: '100', icon: '🚔' },
    { label: t('fire'), number: '101', icon: '🚒' },
    { label: 'Emergency (India)', number: '112', icon: '🆘' },
    { label: 'Emergency (US)', number: '911', icon: '🆘' },
  ];

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        🏥 {t('findNearby')}
      </h2>
      <p className="text-sm text-gray-400 mb-6">{t('hospitalsDesc')}</p>

      <button
        onClick={openMaps}
        className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-2xl shadow-red-500/25 hover:shadow-red-500/40 transition-all hover:scale-105 flex items-center justify-center gap-2 mb-8"
      >
        🗺️ {t('openMaps')}
      </button>

      {/* Emergency Numbers */}
      <h3 className="text-lg font-bold text-white mb-4">{t('emergencyNumbers')}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {emergencyNumbers.map((item, i) => (
          <a
            key={i}
            href={`tel:${item.number}`}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-red-500/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-gray-400">Tap to call</p>
              </div>
            </div>
            <span className="text-lg font-black text-red-400 group-hover:scale-110 transition-transform">
              {item.number}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
