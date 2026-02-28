// Dashboard Page - Full Featured with Firebase Integration
// Tabs: Profile | QR Code | Donors | Scan History | Hospitals | Doctors
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import {
  saveQRCode,
  getQRCode,
  expireQRCode,
  getScanHistory,
  getBloodDonors,
  getNearbyDoctors,
  getDoctorSpecialties,
  UserProfile,
  ScanRecord,
  Doctor
} from '../services/firebaseService';

type TabType = 'profile' | 'qrcode' | 'donors' | 'scans' | 'hospitals' | 'doctors';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    profile,
    isAuthenticated,
    logout,
    updateUserProfile,
    t,
    language,
    theme,
    getTranslatedField,
    isAutoTranslating
  } = useApp();

  const isDark = theme === 'dark';

  // ─── Tab State ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // ─── Profile Form ──────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: '', age: '', bloodGroup: '',
    allergies: '', chronicConditions: '', currentMedications: '',
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
    insuranceProvider: '', doctorName: '', emergencyPin: '', isBloodDonor: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ─── QR Code State ─────────────────────────────────────────────────────────
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrLink, setQrLink] = useState<string>('');
  const [qrVersion, setQrVersion] = useState(1);
  const [qrGeneratedAt, setQrGeneratedAt] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [qrMessage, setQrMessage] = useState('');

  // ─── Donors State ──────────────────────────────────────────────────────────
  const [donors, setDonors] = useState<UserProfile[]>([]);
  const [donorSearchGroup, setDonorSearchGroup] = useState('all');
  const [isLoadingDonors, setIsLoadingDonors] = useState(false);

  // ─── Scan History State ────────────────────────────────────────────────────
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [isLoadingScans, setIsLoadingScans] = useState(false);

  // ─── Doctors State ─────────────────────────────────────────────────────────
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('all');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const qrRef = useRef<HTMLImageElement>(null);

  // ─── Redirect if not authed ────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  // ─── Sync profile → form ───────────────────────────────────────────────────
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        age: profile.age || '',
        bloodGroup: profile.bloodGroup || '',
        allergies: profile.allergies || '',
        chronicConditions: profile.chronicConditions || '',
        currentMedications: profile.currentMedications || '',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
        emergencyContactRelation: profile.emergencyContactRelation || '',
        insuranceProvider: profile.insuranceProvider || '',
        doctorName: profile.doctorName || '',
        emergencyPin: profile.emergencyPin || '',
        isBloodDonor: profile.isBloodDonor || false,
      });
    }
  }, [profile]);

  // ─── Load saved QR ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadQR = async () => {
      if (!user) return;
      try {
        const saved = await getQRCode(user.uid);
        if (saved && saved.isActive) {
          setQrLink(saved.qrLink);
          setQrVersion(saved.version);
          setQrGeneratedAt(saved.generatedAt);
          const url = await QRCode.toDataURL(saved.qrLink, {
            width: 300, margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          });
          setQrCodeUrl(url);
        }
      } catch (err) {
        console.error('Error loading QR:', err);
      }
    };
    loadQR();
  }, [user]);

  // ─── Load donors ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'donors') loadDonors();
  }, [activeTab, donorSearchGroup]);

  // ─── Load scan history ─────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'scans' && user) loadScanHistory();
  }, [activeTab, user]);

  // ─── Filter doctors ────────────────────────────────────────────────────────
  useEffect(() => {
    const all = getNearbyDoctors(doctorSpecialty === 'all' ? undefined : doctorSpecialty);
    const q = doctorSearch.toLowerCase();
    setDoctors(
      q
        ? all.filter(
            d =>
              d.name.toLowerCase().includes(q) ||
              d.specialty.toLowerCase().includes(q) ||
              d.address.toLowerCase().includes(q)
          )
        : all
    );
  }, [doctorSearch, doctorSpecialty]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const loadDonors = async () => {
    setIsLoadingDonors(true);
    try {
      const list = await getBloodDonors(donorSearchGroup === 'all' ? undefined : donorSearchGroup);
      setDonors(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDonors(false);
    }
  };

  const loadScanHistory = async () => {
    if (!user) return;
    setIsLoadingScans(true);
    try {
      const hist = await getScanHistory(user.uid);
      setScanHistory(
        [...hist].sort(
          (a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingScans(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      await updateUserProfile(formData);
      setSaveMessage(t('profileSaved'));
      setTimeout(() => setSaveMessage(''), 4000);
    } catch {
      setSaveMessage('Error saving profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await logout();
      navigate('/');
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // ─── QR Generation ─────────────────────────────────────────────────────────
  const buildAndSaveQR = async (version: number) => {
    if (!user) return;
    setIsGeneratingQR(true);
    try {
      const data = {
        id: user.uid,
        v: version,
        n: formData.fullName,
        a: formData.age,
        bg: formData.bloodGroup,
        al: formData.allergies,
        cc: formData.chronicConditions,
        cm: formData.currentMedications,
        ecn: formData.emergencyContactName,
        ecp: formData.emergencyContactPhone,
        ecr: formData.emergencyContactRelation,
        ip: formData.insuranceProvider,
        dn: formData.doctorName,
        pin: formData.emergencyPin,
        bd: formData.isBloodDonor,
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      const link = `${window.location.origin}/#/scan/${encoded}`;
      const url = await QRCode.toDataURL(link, {
        width: 300, margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      await saveQRCode(user.uid, {
        encodedData: url,
        qrLink: link,
        version,
        generatedAt: new Date().toISOString(),
        isActive: true,
        expiredVersions: [],
      });
      setQrCodeUrl(url);
      setQrLink(link);
      setQrVersion(version);
      setQrGeneratedAt(new Date().toISOString());
    } catch (e) {
      console.error('QR generation error:', e);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleGenerateQR = () => buildAndSaveQR(1);

  const handleRegenerateQR = async () => {
    if (!user) return;
    setShowRegenerateConfirm(false);
    try {
      const newVersion = await expireQRCode(user.uid);
      await buildAndSaveQR(newVersion);
      setQrMessage(t('qrExpiredOld'));
      setTimeout(() => setQrMessage(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Download PNG ──────────────────────────────────────────────────────────
  const downloadQRPng = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.download = `resqscan-qr-v${qrVersion}.png`;
    a.href = qrCodeUrl;
    a.click();
  };

  // ─── Download PDF (canvas-based emergency card) ────────────────────────────
  const downloadQRPdf = () => {
    if (!qrCodeUrl) return;
    const canvas = document.createElement('canvas');
    canvas.width = 794;   // A4-ish at 96dpi
    canvas.height = 1123;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCard = (qrImg: HTMLImageElement) => {
      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Red header bar
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, '#dc2626');
      grad.addColorStop(1, '#ea580c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, 90);

      // Header text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚕ EMERGENCY MEDICAL CARD', canvas.width / 2, 38);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#fecaca';
      ctx.fillText('ResQScan — Safety That Travels With You', canvas.width / 2, 68);

      // QR code
      const qrSize = 220;
      const qrX = (canvas.width - qrSize) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX - 12, 105, qrSize + 24, qrSize + 24, 12);
      ctx.fill();
      ctx.drawImage(qrImg, qrX, 117, qrSize, qrSize);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px Arial';
      ctx.fillText('Scan this QR code for live emergency data', canvas.width / 2, 358);

      // Divider
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 378); ctx.lineTo(canvas.width - 60, 378);
      ctx.stroke();

      // Patient info
      const col1 = 60, col2 = 420;
      let y = 410;
      const lineH = 36;

      const drawField = (label: string, value: string, x: number, curY: number, highlight = false) => {
        ctx.fillStyle = '#64748b';
        ctx.font = '13px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(label.toUpperCase(), x, curY);
        ctx.fillStyle = highlight ? '#ef4444' : '#f1f5f9';
        ctx.font = highlight ? 'bold 22px Arial' : 'bold 16px Arial';
        ctx.fillText(value || '—', x, curY + 20);
      };

      drawField('Name', formData.fullName || '', col1, y);
      drawField('Blood Group', formData.bloodGroup || '', col2, y, true);
      y += lineH + 14;
      drawField('Age', formData.age ? `${formData.age} years` : '', col1, y);
      drawField('Blood Donor', formData.isBloodDonor ? 'Yes ✓' : 'No', col2, y);
      y += lineH + 14;

      // Divider
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath(); ctx.moveTo(60, y + 8); ctx.lineTo(canvas.width - 60, y + 8); ctx.stroke();
      y += 28;

      drawField('Allergies', formData.allergies || 'None', col1, y);
      drawField('Insurance', formData.insuranceProvider || 'None', col2, y);
      y += lineH + 14;
      drawField('Chronic Conditions', formData.chronicConditions || 'None', col1, y);
      drawField('Doctor', formData.doctorName || 'None', col2, y);
      y += lineH + 14;
      drawField('Current Medications', formData.currentMedications || 'None', col1, y);
      y += lineH + 20;

      // Emergency contact box
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(60, y, canvas.width - 120, 110, 10);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('🆘 EMERGENCY CONTACT', 80, y + 24);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(formData.emergencyContactName || '—', 80, y + 50);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Arial';
      ctx.fillText(
        `${formData.emergencyContactRelation || ''} · ${formData.emergencyContactPhone || ''}`,
        80, y + 74
      );
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 15px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`📞 ${formData.emergencyContactPhone || ''}`, canvas.width - 80, y + 60);

      y += 130;

      // Disclaimer
      ctx.fillStyle = '#fbbf24';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      const disc = '⚠ This information is user-provided and intended for emergency reference only.';
      ctx.fillText(disc, canvas.width / 2, y);

      // Footer
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `ResQScan Emergency Card · v${qrVersion} · Generated ${new Date().toLocaleDateString()}`,
        canvas.width / 2,
        canvas.height - 20
      );

      // Download
      const a = document.createElement('a');
      a.download = `resqscan-card-${formData.fullName || 'emergency'}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };

    const img = new Image();
    img.onload = () => drawCard(img);
    img.src = qrCodeUrl;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // ─── Glass card helper ─────────────────────────────────────────────────────
  const card = isDark
    ? 'bg-white/5 border-white/10 backdrop-blur-xl'
    : 'bg-white border-gray-200 shadow-sm';

  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-red-500/50'
    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-red-400/50';

  const labelCls = isDark ? 'text-gray-300' : 'text-gray-700';
  const headingCls = isDark ? 'text-white' : 'text-gray-800';
  const subCls = isDark ? 'text-gray-400' : 'text-gray-500';

  // ─── Tabs config ───────────────────────────────────────────────────────────
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'profile',   label: t('profileTab'),      icon: '👤' },
    { id: 'qrcode',   label: t('qrCodeTab'),        icon: '📱' },
    { id: 'donors',   label: t('donorSearchTab'),   icon: '🩸' },
    { id: 'scans',    label: t('scanHistoryTab'),   icon: '📊' },
    { id: 'hospitals',label: t('hospitalsTab'),     icon: '🏥' },
    { id: 'doctors',  label: t('doctorsTab'),       icon: '👨‍⚕️' },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-screen pt-16 md:pt-20 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-16 md:top-20 z-40 ${
          isDark ? 'bg-slate-800/70 border-white/10' : 'bg-white border-gray-200'
        } backdrop-blur-xl border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              ResQScan
            </h1>
            <p className={`text-xs ${subCls} flex items-center gap-1`}>
              {t('welcomeBack')},{' '}
              <span className="font-medium">
                {getTranslatedField('fullName', profile?.fullName || user?.displayName || '')}
              </span>
              {isAutoTranslating && (
                <span className="inline-block animate-spin">🌐</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* SOS */}
            {formData.emergencyContactPhone && (
              <a
                href={`tel:${formData.emergencyContactPhone}`}
                className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-red-500/30"
              >
                🆘 SOS
              </a>
            )}
            <button
              onClick={handleLogout}
              className={`px-3 py-2 text-sm rounded-xl transition-colors ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20'
                  : isDark
                  ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Global save message ───────────────────────────────────────────── */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-500/20 border border-green-500/40 rounded-xl text-green-400 text-sm text-center"
            >
              ✅ {saveMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ════════════════════════════════════════════════════════════════
              PROFILE TAB
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl border p-6 ${card}`}
            >
              <h2 className={`text-xl font-bold mb-1 ${headingCls}`}>
                👤 {t('profileTab')}
              </h2>
              <p className={`text-sm mb-6 ${subCls}`}>
                {t('translationNote')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Full Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('fullName')}</label>
                  <input
                    type="text" name="fullName" value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                  {language !== 'en' && getTranslatedField('fullName', formData.fullName || '') !== formData.fullName && (
                    <p className="text-xs text-blue-400 mt-1">
                      🌐 {getTranslatedField('fullName', formData.fullName || '')}
                    </p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('age')}</label>
                  <input
                    type="number" name="age" value={formData.age}
                    onChange={handleInputChange} min="0" max="150"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                </div>

                {/* Blood Group */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('bloodGroup')}</label>
                  <select
                  name="bloodGroup" value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                >
                  <option value="" className={isDark ? 'bg-slate-800 text-white' : ''}>{t('selectBloodGroup')}</option>
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg} className={isDark ? 'bg-slate-800 text-white' : ''}>{bg}</option>
                  ))}
                </select>
                </div>

                {/* Allergies */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('allergies')}</label>
                  <input
                    type="text" name="allergies" value={formData.allergies}
                    onChange={handleInputChange} placeholder={t('allergiesPlaceholder')}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                  {language !== 'en' && getTranslatedField('allergies', formData.allergies || '') !== formData.allergies && (
                    <p className="text-xs text-blue-400 mt-1">
                      🌐 {getTranslatedField('allergies', formData.allergies || '')}
                    </p>
                  )}
                </div>

                {/* Chronic Conditions */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('chronicConditions')}</label>
                  <input
                    type="text" name="chronicConditions" value={formData.chronicConditions}
                    onChange={handleInputChange} placeholder={t('chronicConditionsPlaceholder')}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                  {language !== 'en' && getTranslatedField('chronicConditions', formData.chronicConditions || '') !== formData.chronicConditions && (
                    <p className="text-xs text-blue-400 mt-1">
                      🌐 {getTranslatedField('chronicConditions', formData.chronicConditions || '')}
                    </p>
                  )}
                </div>

                {/* Current Medications */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('currentMedications')}</label>
                  <input
                    type="text" name="currentMedications" value={formData.currentMedications}
                    onChange={handleInputChange} placeholder={t('currentMedicationsPlaceholder')}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                  {language !== 'en' && getTranslatedField('currentMedications', formData.currentMedications || '') !== formData.currentMedications && (
                    <p className="text-xs text-blue-400 mt-1">
                      🌐 {getTranslatedField('currentMedications', formData.currentMedications || '')}
                    </p>
                  )}
                </div>

                {/* Emergency Contact Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('emergencyContactName')}</label>
                  <input
                    type="text" name="emergencyContactName" value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                  {language !== 'en' && getTranslatedField('emergencyContactName', formData.emergencyContactName || '') !== formData.emergencyContactName && (
                    <p className="text-xs text-blue-400 mt-1">
                      🌐 {getTranslatedField('emergencyContactName', formData.emergencyContactName || '')}
                    </p>
                  )}
                </div>

                {/* Emergency Contact Phone */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('emergencyContactPhone')}</label>
                  <input
                    type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                </div>

                {/* Emergency Contact Relation */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('emergencyContactRelation')}</label>
                  <input
                    type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                  {language !== 'en' && getTranslatedField('emergencyContactRelation', formData.emergencyContactRelation || '') !== formData.emergencyContactRelation && (
                    <p className="text-xs text-blue-400 mt-1">
                      🌐 {getTranslatedField('emergencyContactRelation', formData.emergencyContactRelation || '')}
                    </p>
                  )}
                </div>

                {/* Insurance Provider */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                    {t('insuranceProvider')} <span className="text-gray-500 text-xs">({t('optional')})</span>
                  </label>
                  <input
                    type="text" name="insuranceProvider" value={formData.insuranceProvider}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                  {language !== 'en' && getTranslatedField('insuranceProvider', formData.insuranceProvider || '') !== formData.insuranceProvider && (
                    <p className="text-xs text-blue-400 mt-1">
                      🌐 {getTranslatedField('insuranceProvider', formData.insuranceProvider || '')}
                    </p>
                  )}
                </div>

                {/* Doctor Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                    {t('doctorName')} <span className="text-gray-500 text-xs">({t('optional')})</span>
                  </label>
                  <input
                    type="text" name="doctorName" value={formData.doctorName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                  {language !== 'en' && getTranslatedField('doctorName', formData.doctorName || '') !== formData.doctorName && (
                    <p className="text-xs text-blue-400 mt-1">
                      🌐 {getTranslatedField('doctorName', formData.doctorName || '')}
                    </p>
                  )}
                </div>

                {/* Emergency PIN */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                    {t('emergencyPin')} <span className="text-gray-500 text-xs">({t('optional')})</span>
                  </label>
                  <input
                    type="password" name="emergencyPin" value={formData.emergencyPin}
                    onChange={handleInputChange} placeholder={t('emergencyPinPlaceholder')} maxLength={6}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                </div>
              </div>

              {/* Blood Donor toggle */}
              <div className="mt-5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setFormData(p => ({ ...p, isBloodDonor: !p.isBloodDonor }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      formData.isBloodDonor ? 'bg-red-500' : isDark ? 'bg-white/20' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        formData.isBloodDonor ? 'translate-x-5' : ''
                      }`}
                    />
                  </div>
                  <span className={`${labelCls} font-medium`}>
                    🩸 {t('bloodDonorYes')}
                  </span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="mt-7 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all disabled:opacity-60"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : `💾 ${t('saveProfile')}`}
                </motion.button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`px-6 py-3 rounded-xl font-semibold border transition-colors ${
                    isDark
                      ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                      : 'border-red-300 text-red-600 hover:bg-red-50'
                  }`}
                >
                  🗑️ {t('deleteAccount')}
                </button>
              </div>

              {/* Delete confirm */}
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={`mt-4 p-4 rounded-xl border ${
                      isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <p className="text-red-400 font-medium mb-3">⚠️ {t('deleteConfirm')}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                          isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              QR CODE TAB
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'qrcode' && (
            <motion.div
              key="qrcode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl border p-6 ${card}`}
            >
              <h2 className={`text-xl font-bold mb-6 ${headingCls}`}>
                📱 {t('qrCodeTab')}
              </h2>

              {/* QR message */}
              <AnimatePresence>
                {qrMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-3 bg-green-500/20 border border-green-500/40 rounded-xl text-green-400 text-sm text-center"
                  >
                    ✅ {qrMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {!formData.bloodGroup ? (
                <div className={`text-center py-16 ${subCls}`}>
                  <p className="text-5xl mb-4">📋</p>
                  <p className="text-lg font-medium">{t('noProfileQR')}</p>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="mt-4 px-5 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl text-sm font-semibold"
                  >
                    Go to Profile →
                  </button>
                </div>
              ) : qrCodeUrl ? (
                <div className="text-center">
                  {/* Status row */}
                  <div className="flex flex-wrap justify-center gap-3 mb-6">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      {t('qrActive')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {t('qrVersion')}: v{qrVersion}
                    </span>
                    {qrGeneratedAt && (
                      <span className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        {t('qrGeneratedOn')}: {new Date(qrGeneratedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* QR image */}
                  <div className="inline-block p-5 bg-white rounded-2xl shadow-2xl shadow-black/30 mb-6">
                    <img
                      ref={qrRef}
                      src={qrCodeUrl}
                      alt="Emergency QR Code"
                      className="w-56 h-56 md:w-72 md:h-72"
                    />
                  </div>

                  {/* Scan link */}
                  <div className={`max-w-lg mx-auto mb-6 p-3 rounded-xl text-xs break-all ${
                    isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {qrLink}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={downloadQRPng}
                      className="px-5 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg"
                    >
                      📥 {t('downloadPNG')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={downloadQRPdf}
                      className={`px-5 py-3 rounded-xl font-semibold ${
                        isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      📄 {t('downloadPDF')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowRegenerateConfirm(true)}
                      className={`px-5 py-3 rounded-xl font-semibold border ${
                        isDark
                          ? 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10'
                          : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      🔄 {t('regenerateQR')}
                    </motion.button>
                  </div>

                  {/* Regenerate confirm */}
                  <AnimatePresence>
                    {showRegenerateConfirm && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`mt-6 max-w-md mx-auto p-5 rounded-2xl border ${
                          isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <p className="text-red-400 font-medium mb-4 text-sm leading-relaxed">
                          {t('qrRegenerateWarning')}
                        </p>
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={handleRegenerateQR}
                            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold"
                          >
                            {t('qrConfirmRegenerate')}
                          </button>
                          <button
                            onClick={() => setShowRegenerateConfirm(false)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                              isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {t('qrCancelRegenerate')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* No QR yet */
                <div className="text-center py-16">
                  {isGeneratingQR ? (
                    <div>
                      <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
                      <p className={`text-lg font-medium ${subCls}`}>{t('generatingQR')}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-7xl mb-5">📱</div>
                      <p className={`mb-2 text-lg font-medium ${headingCls}`}>{t('qrReady')}</p>
                      <p className={`mb-8 text-sm ${subCls} max-w-sm mx-auto`}>{t('qrDescription')}</p>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleGenerateQR}
                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-2xl shadow-xl shadow-red-500/30"
                      >
                        ✨ {t('generateQR')}
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              DONORS TAB
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'donors' && (
            <motion.div
              key="donors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl border p-6 ${card}`}
            >
              <h2 className={`text-xl font-bold mb-6 ${headingCls}`}>
                🩸 {t('donorSearchTab')}
              </h2>

              {/* Filter */}
              <div className="flex flex-wrap gap-3 mb-4">
                <select
                  value={donorSearchGroup}
                  onChange={e => setDonorSearchGroup(e.target.value)}
                  className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                >
                  <option value="all" className={isDark ? 'bg-slate-800 text-white' : ''}>{t('searchByBloodGroup')}</option>
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg} className={isDark ? 'bg-slate-800 text-white' : ''}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Disclaimer */}
              <div className={`mb-5 p-3 rounded-xl border ${
                isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className="text-yellow-500 text-sm">{t('donorDisclaimer')}</p>
              </div>

              {isLoadingDonors ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : donors.length === 0 ? (
                <div className={`text-center py-12 ${subCls}`}>
                  <p className="text-4xl mb-3">🩸</p>
                  <p>{t('noDonorsFound')}</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {donors.map((donor, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-4 rounded-xl flex items-center justify-between gap-4 ${
                        isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {(donor.bloodGroup || '?')}
                        </div>
                        <div>
                          <p className={`font-semibold ${headingCls}`}>
                            {getTranslatedField('fullName', donor.fullName || 'Anonymous')}
                          </p>
                          <p className={`text-sm ${subCls}`}>
                            {donor.bloodGroup} • {donor.emergencyContactPhone || 'Contact via platform'}
                          </p>
                        </div>
                      </div>
                      {donor.emergencyContactPhone && (
                        <a
                          href={`tel:${donor.emergencyContactPhone}`}
                          className="flex-shrink-0 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                          📞 {t('contactDonor')}
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              SCAN HISTORY TAB
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'scans' && (
            <motion.div
              key="scans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl border p-6 ${card}`}
            >
              <h2 className={`text-xl font-bold mb-6 ${headingCls}`}>
                📊 {t('scanHistoryTab')}
              </h2>

              {/* Stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-3xl font-bold ${headingCls}`}>{scanHistory.length}</p>
                  <p className={`text-sm ${subCls}`}>{t('totalScans')}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-3xl font-bold text-green-400`}>
                    {scanHistory.filter(s => s.location).length}
                  </p>
                  <p className={`text-sm ${subCls}`}>With Location</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-lg font-bold ${headingCls} leading-tight`}>
                    {scanHistory.length > 0
                      ? new Date(scanHistory[0]?.scannedAt).toLocaleDateString()
                      : '—'}
                  </p>
                  <p className={`text-sm ${subCls}`}>{t('lastScanned')}</p>
                </div>
              </div>

              {isLoadingScans ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : scanHistory.length === 0 ? (
                <div className={`text-center py-12 ${subCls}`}>
                  <p className="text-4xl mb-3">📊</p>
                  <p>{t('noScans')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scanHistory.map((scan, i) => {
                    const dt = new Date(scan.scannedAt);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`p-4 rounded-xl ${
                          isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Date & Time */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">🔍</span>
                              <div>
                                <p className={`font-semibold text-sm ${headingCls}`}>
                                  {dt.toLocaleDateString(undefined, {
                                    weekday: 'short', year: 'numeric',
                                    month: 'short', day: 'numeric',
                                  })}
                                </p>
                                <p className={`text-xs ${subCls}`}>
                                  🕐 {dt.toLocaleTimeString(undefined, {
                                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Location */}
                            {scan.location ? (
                              <div className="flex items-start gap-1.5 mt-2">
                                <span className="text-green-400 text-sm flex-shrink-0">📍</span>
                                <div>
                                  <p className={`text-sm ${subCls} leading-snug`}>
                                    {scan.location.address ||
                                      `${scan.location.latitude.toFixed(5)}, ${scan.location.longitude.toFixed(5)}`}
                                  </p>
                                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {scan.location.latitude.toFixed(6)}°N,{' '}
                                    {scan.location.longitude.toFixed(6)}°E
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className={`text-xs mt-2 flex items-center gap-1.5 ${subCls}`}>
                                <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />
                                {t('locationNotAvailable')}
                              </p>
                            )}
                          </div>

                          {/* Map link */}
                          {scan.location && (
                            <a
                              href={`https://www.google.com/maps?q=${scan.location.latitude},${scan.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              🗺️ Map
                            </a>
                          )}
                        </div>

                        {/* Scan number badge */}
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-500'
                          }`}>
                            Scan #{scanHistory.length - i}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              {scanHistory.length > 0 && (
                <div className={`mt-4 p-3 rounded-xl flex flex-wrap gap-4 text-xs ${subCls} ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full" /> Location detected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full" /> Location unavailable
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              HOSPITALS TAB
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'hospitals' && (
            <motion.div
              key="hospitals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl border p-6 ${card}`}
            >
              <h2 className={`text-xl font-bold mb-2 ${headingCls}`}>
                🏥 {t('hospitalsTab')}
              </h2>
              <p className={`text-sm mb-6 ${subCls}`}>{t('hospitalsDesc')}</p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigator.geolocation?.getCurrentPosition(
                    pos => {
                      window.open(
                        `https://www.google.com/maps/search/hospitals/@${pos.coords.latitude},${pos.coords.longitude},14z`,
                        '_blank'
                      );
                    },
                    () => {
                      window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank');
                    }
                  );
                }}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 text-lg mb-8"
              >
                🗺️ {t('openMaps')}
              </motion.button>

              {/* Emergency Numbers */}
              <h3 className={`font-bold text-lg mb-4 ${headingCls}`}>{t('emergencyNumbers')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { number: '102', emoji: '🚑', label: t('ambulance'), color: 'red' },
                  { number: '100', emoji: '👮', label: t('police'), color: 'blue' },
                  { number: '101', emoji: '🚒', label: t('fire'), color: 'orange' },
                  { number: '112', emoji: '🆘', label: 'Emergency', color: 'purple' },
                ].map(({ number, emoji, label, color }) => (
                  <a
                    key={number}
                    href={`tel:${number}`}
                    className={`p-4 rounded-2xl text-center transition-transform hover:scale-105 ${
                      isDark
                        ? `bg-${color === 'red' ? 'red' : color === 'blue' ? 'blue' : color === 'orange' ? 'orange' : 'purple'}-500/20 border border-${color === 'red' ? 'red' : color === 'blue' ? 'blue' : color === 'orange' ? 'orange' : 'purple'}-500/30`
                        : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <p className="text-3xl mb-1">{emoji}</p>
                    <p className={`text-2xl font-bold ${headingCls}`}>{number}</p>
                    <p className={`text-xs ${subCls} mt-0.5`}>{label}</p>
                  </a>
                ))}
              </div>

              {/* Info cards */}
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                {[
                  { icon: '🏥', title: 'Apollo Hospitals', info: 'Largest private hospital chain in Asia. Available in 50+ cities.' },
                  { icon: '🏥', title: 'AIIMS Network', info: 'Government hospitals with world-class trauma care.' },
                  { icon: '🚑', title: 'CATS Ambulance', info: 'Centralised Accident & Trauma Services — Delhi NCR.' },
                  { icon: '💊', title: 'Medanta', info: 'Multi-super specialty hospitals across India.' },
                ].map((h, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'}`}
                  >
                    <p className="text-xl mb-1">{h.icon}</p>
                    <p className={`font-semibold text-sm ${headingCls}`}>{h.title}</p>
                    <p className={`text-xs mt-1 ${subCls}`}>{h.info}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              DOCTORS TAB
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'doctors' && (
            <motion.div
              key="doctors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl border p-6 ${card}`}
            >
              <h2 className={`text-xl font-bold mb-2 ${headingCls}`}>
                👨‍⚕️ {t('doctorsTab')}
              </h2>
              <p className={`text-sm mb-6 ${subCls}`}>{t('doctorsDesc')}</p>

              {/* Search + filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                <input
                  type="text"
                  value={doctorSearch}
                  onChange={e => setDoctorSearch(e.target.value)}
                  placeholder={t('searchDoctors')}
                  className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                />
               <select
                  value={doctorSpecialty}
                  onChange={e => setDoctorSpecialty(e.target.value)}
                  className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}
                >
                  <option value="all" className={isDark ? 'bg-slate-800 text-white' : ''}>{t('allSpecialties')}</option>
                  {getDoctorSpecialties().map(s => (
                    <option key={s} value={s} className={isDark ? 'bg-slate-800 text-white' : ''}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Find on maps */}
              <button
                onClick={() => window.open('https://www.google.com/maps/search/doctors+near+me', '_blank')}
                className={`w-full py-3 mb-6 rounded-xl font-semibold border transition-colors ${
                  isDark
                    ? 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10'
                    : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                🗺️ {t('openDoctorMaps')}
              </button>

              {doctors.length === 0 ? (
                <div className={`text-center py-12 ${subCls}`}>
                  <p className="text-4xl mb-3">👨‍⚕️</p>
                  <p>{t('noDoctorsFound')}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {doctors.map((doctor, i) => (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`p-5 rounded-2xl ${
                        isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className={`font-bold text-base ${headingCls}`}>{doctor.name}</p>
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                doctor.available
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {doctor.available ? `🟢 ${t('doctorAvailable')}` : `🔴 ${t('doctorBusy')}`}
                            </span>
                          </div>

                          <p className="text-sm text-blue-400 font-medium mb-1">
                            🩺 {doctor.specialty}
                          </p>

                          <p className={`text-sm ${subCls} mb-1 flex items-start gap-1`}>
                            <span>📍</span>
                            <span>{doctor.address}</span>
                          </p>

                          <p className={`text-sm ${subCls} mb-2 flex items-center gap-1`}>
                            <span>📞</span>
                            <span>{doctor.phone}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`text-xs ${subCls} flex items-center gap-1`}>
                              ⭐ <strong>{doctor.rating}</strong> rating
                            </span>
                            <span className={`text-xs ${subCls}`}>
                              🏥 {doctor.experience} yrs exp
                            </span>
                          </div>
                        </div>

                        {/* Right: action buttons */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <a
                            href={`tel:${doctor.phone}`}
                            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-xl font-semibold transition-colors text-center"
                          >
                            📞 {t('callDoctor')}
                          </a>
                          <a
                            href={`https://www.google.com/maps?q=${doctor.lat},${doctor.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl font-semibold transition-colors text-center"
                          >
                            🗺️ {t('directions')}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className={`mt-6 p-4 rounded-xl border ${
                isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className="text-yellow-500 text-sm">{t('doctorDisclaimer')}</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
