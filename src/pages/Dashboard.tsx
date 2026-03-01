// Dashboard Page - Full Featured with Firebase Integration
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
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
    isLoading, // <-- ADD THIS
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
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/auth');
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (profile) {
      setIsEditing(!profile.fullName);
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

  useEffect(() => {
    if (activeTab === 'donors') loadDonors();
  }, [activeTab, donorSearchGroup]);

  useEffect(() => {
    if (activeTab === 'scans' && user) loadScanHistory();
  }, [activeTab, user]);

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

  const loadDonors = async () => {
    setIsLoadingDonors(true);
    try {
      const list = await getBloodDonors(donorSearchGroup === 'all' ? undefined : donorSearchGroup);
      
      // Filter out the current logged-in user so they don't see themselves in the results
      const filteredList = list.filter(donor => donor.odid !== user?.uid);
      setDonors(filteredList);
      
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
    
    // Mandatory field check
    if (!formData.fullName || !formData.age || !formData.bloodGroup || !formData.emergencyContactName || !formData.emergencyContactPhone) {
      setSaveMessage('⚠️ Please fill all mandatory fields (marked with *)');
      setTimeout(() => setSaveMessage(''), 4000);
      return;
    }

    setIsSaving(true);
    setSaveMessage('');
    try {
      await updateUserProfile(formData);
      setSaveMessage('✅ ' + t('profileSaved'));
      setIsEditing(false);
      setTimeout(() => setSaveMessage(''), 4000);
    } catch {
      setSaveMessage('❌ Error saving profile. Please try again.');
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

  const buildAndSaveQR = async (version: number) => {
    if (!user) return;
    setIsGeneratingQR(true);
    try {
      // Keep track of previously expired versions
      const saved = await getQRCode(user.uid);
      const existingExpired = saved?.expiredVersions || [];

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
        expiredVersions: existingExpired, // Preserving expired versions
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
      setQrMessage('✅ ' + t('qrExpiredOld'));
      setTimeout(() => setQrMessage(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyQRLink = () => {
    navigator.clipboard.writeText(qrLink);
    setQrMessage('✅ Link copied to clipboard!');
    setTimeout(() => setQrMessage(''), 3000);
  };

  const downloadQRPng = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.download = `resqscan-qr-v${qrVersion}.png`;
    a.href = qrCodeUrl;
    a.click();
  };

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

      // Generate PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`resqscan-card-${formData.fullName || 'emergency'}.pdf`);
    };

    const img = new Image();
    img.onload = () => drawCard(img);
    img.src = qrCodeUrl;
  };

  const card = isDark
    ? 'bg-white/5 border-white/10 backdrop-blur-xl'
    : 'bg-white border-gray-200 shadow-sm';

  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-red-500/50'
    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-red-400/50';

  const labelCls = isDark ? 'text-gray-300' : 'text-gray-700';
  const headingCls = isDark ? 'text-white' : 'text-gray-800';
  const subCls = isDark ? 'text-gray-400' : 'text-gray-500';

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'profile',   label: t('profileTab'),      icon: '👤' },
    { id: 'qrcode',   label: t('qrCodeTab'),        icon: '📱' },
    { id: 'donors',   label: t('donorSearchTab'),   icon: '🩸' },
    { id: 'scans',    label: t('scanHistoryTab'),   icon: '📊' },
    { id: 'hospitals',label: t('hospitalsTab'),     icon: '🏥' },
    { id: 'doctors',  label: t('doctorsTab'),       icon: '👨‍⚕️' },
  ];

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-screen pt-16 md:pt-20 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Welcome & SOS Header ────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className={`text-2xl md:text-3xl font-bold mb-3 ${headingCls}`}>
            {t('welcomeBack')}, <span className="text-red-500">{getTranslatedField('fullName', profile?.fullName || user?.displayName || '')}</span>! 👋
          </h1>
          {formData.emergencyContactPhone && (
            <a
              href={`tel:${formData.emergencyContactPhone}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/30 hover:-translate-y-1"
            >
              🆘 SOS - {formData.emergencyContactName || 'Emergency Contact'}
            </a>
          )}
        </div>

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
              className={`mb-4 p-3 rounded-xl text-sm text-center font-semibold ${
                saveMessage.includes('⚠️') || saveMessage.includes('❌') ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-green-500/20 text-green-400 border border-green-500/40'
              }`}
            >
              {saveMessage}
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
              className={`rounded-2xl border p-6 md:p-8 ${card}`}
            >
              {/* Header with Edit Button */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b pb-4 border-gray-200 dark:border-white/10">
                <div>
                  <h2 className={`text-2xl font-bold ${headingCls}`}>
                    👤 {t('profileTab')}
                  </h2>
                  <p className={`text-sm mt-1 ${subCls}`}>
                    {t('translationNote')}
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold transition-colors border border-blue-500/30"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {/* ─── SECTION: Personal Details ─── */}
              <div className="mb-8">
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${headingCls}`}>
                  <span className="text-xl">🧑</span> Personal Details
                </h3>
                {/* Removed the background color classes here so it inherits the main card color */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-transparent">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                      {t('fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" name="fullName" value={formData.fullName}
                      onChange={handleInputChange} required disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${inputCls}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                      {t('age')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number" name="age" value={formData.age}
                      onChange={handleInputChange} min="0" max="150" required disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${inputCls}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                      {t('bloodGroup')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bloodGroup" value={formData.bloodGroup}
                      onChange={handleInputChange} required disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${inputCls}`}
                    >
                      <option value="" className={isDark ? 'bg-slate-800 text-white' : ''}>{t('selectBloodGroup')}</option>
                      {bloodGroups.map(bg => (
                        <option key={bg} value={bg} className={isDark ? 'bg-slate-800 text-white' : ''}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center mt-6">
                    <label className={`flex items-center gap-3 cursor-pointer group w-max ${!isEditing && 'opacity-60 pointer-events-none'}`}>
                      <div
                        onClick={() => isEditing && setFormData(p => ({ ...p, isBloodDonor: !p.isBloodDonor }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          formData.isBloodDonor ? 'bg-red-500' : isDark ? 'bg-white/20' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isBloodDonor ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className={`${labelCls} font-medium`}>🩸 {t('bloodDonorYes')}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ─── SECTION: Medical Information ─── */}
              <div className="mb-8">
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${headingCls}`}>
                  <span className="text-xl">🩺</span> Medical Information
                </h3>
                {/* Removed the background color classes here so it inherits the main card color */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-transparent">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('allergies')}</label>
                    <input
                      type="text" name="allergies" value={formData.allergies}
                      onChange={handleInputChange} placeholder={t('allergiesPlaceholder')} disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${inputCls}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('chronicConditions')}</label>
                    <input
                      type="text" name="chronicConditions" value={formData.chronicConditions}
                      onChange={handleInputChange} placeholder={t('chronicConditionsPlaceholder')} disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${inputCls}`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('currentMedications')}</label>
                    <textarea
                      name="currentMedications" value={formData.currentMedications}
                      onChange={handleInputChange} placeholder={t('currentMedicationsPlaceholder')} disabled={!isEditing}
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${inputCls} resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* ─── SECTION: Emergency Contacts & Providers ─── */}
              <div className="mb-8">
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${headingCls}`}>
                  <span className="text-xl">🚨</span> Emergency Contacts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                      {t('emergencyContactName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" name="emergencyContactName" value={formData.emergencyContactName}
                      onChange={handleInputChange} required disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-60 disabled:cursor-not-allowed ${inputCls}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                      {t('emergencyContactPhone')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone}
                      onChange={handleInputChange} required disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-60 disabled:cursor-not-allowed ${inputCls}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{t('emergencyContactRelation')}</label>
                    <input
                      type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation}
                      onChange={handleInputChange} disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-60 disabled:cursor-not-allowed ${inputCls}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                      {t('insuranceProvider')} <span className="text-gray-500 text-xs">({t('optional')})</span>
                    </label>
                    <input
                      type="text" name="insuranceProvider" value={formData.insuranceProvider}
                      onChange={handleInputChange} disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-60 disabled:cursor-not-allowed ${inputCls}`}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {isEditing && (
                <div className="flex flex-wrap gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all disabled:opacity-60 w-full sm:w-auto"
                  >
                    {isSaving ? 'Saving...' : `💾 Save Profile`}
                  </motion.button>

                  <button
                    onClick={() => {
                      setIsEditing(false);
                      // Reset to original data to discard changes
                      setFormData({
                        fullName: profile?.fullName || '',
                        age: profile?.age || '',
                        bloodGroup: profile?.bloodGroup || '',
                        allergies: profile?.allergies || '',
                        chronicConditions: profile?.chronicConditions || '',
                        currentMedications: profile?.currentMedications || '',
                        emergencyContactName: profile?.emergencyContactName || '',
                        emergencyContactPhone: profile?.emergencyContactPhone || '',
                        emergencyContactRelation: profile?.emergencyContactRelation || '',
                        insuranceProvider: profile?.insuranceProvider || '',
                        doctorName: profile?.doctorName || '',
                        emergencyPin: profile?.emergencyPin || '',
                        isBloodDonor: profile?.isBloodDonor || false,
                      });
                    }}
                    className={`px-8 py-3.5 rounded-xl font-bold border transition-colors w-full sm:w-auto ${
                      isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  
                  {/* Delete button pushed to the right */}
                  <div className="sm:ml-auto w-full sm:w-auto mt-4 sm:mt-0">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className={`px-6 py-3.5 rounded-xl font-bold border transition-colors w-full ${
                        isDark ? 'border-red-500/40 text-red-400 hover:bg-red-500/10' : 'border-red-300 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      🗑️ {t('deleteAccount')}
                    </button>
                  </div>
                </div>
              )}

              {/* Delete confirm */}
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={`mt-6 p-5 rounded-xl border ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}
                  >
                    <p className="text-red-500 font-bold mb-3 text-lg">⚠️ {t('deleteConfirm')}</p>
                    <p className="text-sm mb-4 opacity-80">This action cannot be undone. All your emergency data will be permanently erased.</p>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={handleDeleteAccount} disabled={isDeleting} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 transition-all">
                        {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                      </button>
                      <button onClick={() => setShowDeleteConfirm(false)} className={`px-6 py-2.5 rounded-xl text-sm font-bold ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} transition-all`}>
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attractive Profile Card Preview (Centered) */}
              <div className="mt-16 pt-10 border-t border-gray-200 dark:border-white/10">
                <div className="text-center mb-8">
                  <h3 className={`text-xl font-black ${headingCls}`}>💳 Your Emergency Card Preview</h3>
                  <p className={`text-sm mt-1 ${subCls}`}>This is how responders will see your basic information.</p>
                </div>
                
                {/* Center wrapper */}
                <div className="flex justify-center w-full">
                  <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 hover:scale-105 transition-transform duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-orange-600 p-4 flex justify-between items-center text-white">
                      <span className="font-bold text-lg tracking-wider flex items-center gap-2"><span className="text-2xl">⚕</span> EMERGENCY CARD</span>
                      <span className="text-sm font-bold bg-black/20 px-3 py-1 rounded-full">ResQScan</span>
                    </div>
                    
                    {/* Body */}
                    <div className="p-6 relative">
                       <div className="absolute top-4 right-4 text-7xl opacity-5 pointer-events-none">🩸</div>
                       
                       <div className="flex items-center gap-5 mb-6 relative z-10">
                         <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center text-red-500 font-black text-3xl shadow-inner flex-shrink-0">
                           {formData.bloodGroup || '?'}
                         </div>
                         <div className="min-w-0">
                           <h4 className="text-2xl font-black text-white truncate">{formData.fullName || 'Your Name'}</h4>
                           <div className="flex flex-wrap items-center gap-2 mt-1">
                             <span className="bg-white/10 text-gray-300 text-xs px-2 py-1 rounded-md">{formData.age ? `${formData.age} Years` : 'Age'}</span>
                             {formData.isBloodDonor && <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-md font-bold">✓ Blood Donor</span>}
                           </div>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                         <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                           <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Allergies</p>
                           <p className="text-sm font-bold text-white break-words">{formData.allergies || 'None'}</p>
                         </div>
                         <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                           <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Conditions</p>
                           <p className="text-sm font-bold text-white break-words">{formData.chronicConditions || 'None'}</p>
                         </div>
                       </div>

                       <div className="bg-red-500/10 p-5 rounded-xl border border-red-500/20 relative z-10">
                         <div className="flex items-center gap-2 mb-2">
                           <span className="animate-pulse text-red-500">🔴</span>
                           <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Emergency Contact</p>
                         </div>
                         <p className="text-xl font-black text-white truncate">{formData.emergencyContactName || 'Not Set'}</p>
                         <div className="flex items-center justify-between mt-1">
                           <p className="text-sm text-gray-300 font-medium">{formData.emergencyContactRelation || 'Relation'}</p>
                           <p className="text-sm text-white font-bold bg-white/10 px-2 py-0.5 rounded-md">{formData.emergencyContactPhone || 'No Phone'}</p>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

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

              <AnimatePresence>
                {qrMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-3 bg-green-500/20 border border-green-500/40 rounded-xl text-green-400 font-semibold text-sm text-center"
                  >
                    {qrMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {!formData.bloodGroup ? (
                <div className={`text-center py-16 ${subCls}`}>
                  <p className="text-5xl mb-4">📋</p>
                  <p className="text-lg font-medium">{t('noProfileQR')}</p>
                  <button onClick={() => setActiveTab('profile')} className="mt-4 px-5 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl text-sm font-semibold">
                    Go to Profile →
                  </button>
                </div>
              ) : qrCodeUrl ? (
                <div className="text-center">
                  <div className="flex flex-wrap justify-center gap-3 mb-6">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> {t('qrActive')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {t('qrVersion')}: v{qrVersion}
                    </span>
                  </div>

                  <div className="inline-block p-5 bg-white rounded-2xl shadow-2xl shadow-black/30 mb-6">
                    <img ref={qrRef} src={qrCodeUrl} alt="Emergency QR" className="w-56 h-56 md:w-72 md:h-72" />
                  </div>

                  {/* Shorter Clickable QR Link */}
                  <div 
                    onClick={handleCopyQRLink}
                    className={`max-w-xs sm:max-w-md mx-auto mb-6 p-3 rounded-xl text-sm font-medium cursor-pointer transition-colors flex items-center justify-center gap-2 border ${
                      isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Click to copy link"
                  >
                    <span className="truncate">🔗 {qrLink.substring(0, 42)}...</span>
                    <span className="text-gray-400 text-lg">📋</span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={downloadQRPng} className="px-5 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg">
                      📥 {t('downloadPNG')}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={downloadQRPdf} className={`px-5 py-3 rounded-xl font-semibold border ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}`}>
                      📄 {t('downloadPDF')}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => setShowRegenerateConfirm(true)} className={`px-5 py-3 rounded-xl font-semibold border ${isDark ? 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10' : 'border-orange-300 text-orange-600 hover:bg-orange-50'}`}>
                      🔄 {t('regenerateQR')}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showRegenerateConfirm && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`mt-6 max-w-md mx-auto p-5 rounded-2xl border ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                        <p className="text-red-400 font-medium mb-4 text-sm leading-relaxed">{t('qrRegenerateWarning')}</p>
                        <div className="flex justify-center gap-3">
                          <button onClick={handleRegenerateQR} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold">{t('qrConfirmRegenerate')}</button>
                          <button onClick={() => setShowRegenerateConfirm(false)} className={`px-4 py-2 rounded-xl text-sm font-semibold ${isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-800'}`}>{t('qrCancelRegenerate')}</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-16">
                  {isGeneratingQR ? (
                    <div><div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" /><p className={`text-lg font-medium ${subCls}`}>{t('generatingQR')}</p></div>
                  ) : (
                    <div>
                      <div className="text-7xl mb-5">📱</div>
                      <p className={`mb-2 text-lg font-medium ${headingCls}`}>{t('qrReady')}</p>
                      <p className={`mb-8 text-sm ${subCls} max-w-sm mx-auto`}>{t('qrDescription')}</p>
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleGenerateQR} className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-2xl shadow-xl shadow-red-500/30">✨ {t('generateQR')}</motion.button>
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
            <motion.div key="donors" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`rounded-2xl border p-6 ${card}`}>
              <h2 className={`text-xl font-bold mb-6 ${headingCls}`}>🩸 {t('donorSearchTab')}</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                <select value={donorSearchGroup} onChange={e => setDonorSearchGroup(e.target.value)} className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${inputCls}`}>
                  <option value="all" className={isDark ? 'bg-slate-800 text-white' : ''}>{t('searchByBloodGroup')}</option>
                  {bloodGroups.map(bg => <option key={bg} value={bg} className={isDark ? 'bg-slate-800 text-white' : ''}>{bg}</option>)}
                </select>
              </div>
              <div className={`mb-5 p-3 rounded-xl border ${isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                <p className="text-yellow-500 text-sm">{t('donorDisclaimer')}</p>
              </div>
              {isLoadingDonors ? (
                <div className="text-center py-10"><div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto" /></div>
              ) : donors.length === 0 ? (
                <div className={`text-center py-12 ${subCls}`}><p className="text-4xl mb-3">🩸</p><p>{t('noDonorsFound')}</p></div>
              ) : (
                <div className="grid gap-3">
                  {donors.map((donor, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`p-4 rounded-xl flex items-center justify-between gap-4 ${isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{(donor.bloodGroup || '?')}</div>
                        <div>
                          <p className={`font-semibold ${headingCls}`}>{getTranslatedField('fullName', donor.fullName || 'Anonymous')}</p>
                          <p className={`text-sm ${subCls}`}>{donor.bloodGroup} • {donor.emergencyContactPhone || 'Contact via platform'}</p>
                        </div>
                      </div>
                      {donor.emergencyContactPhone && (
                        <a href={`tel:${donor.emergencyContactPhone}`} className="flex-shrink-0 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors">📞 {t('contactDonor')}</a>
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
            <motion.div key="scans" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`rounded-2xl border p-6 ${card}`}>
              <h2 className={`text-xl font-bold mb-6 ${headingCls}`}>📊 {t('scanHistoryTab')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-3xl font-bold ${headingCls}`}>{scanHistory.length}</p><p className={`text-sm ${subCls}`}>{t('totalScans')}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-3xl font-bold text-green-400`}>{scanHistory.filter(s => s.location).length}</p><p className={`text-sm ${subCls}`}>With Location</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-lg font-bold ${headingCls} leading-tight`}>{scanHistory.length > 0 ? new Date(scanHistory[0]?.scannedAt).toLocaleDateString() : '—'}</p><p className={`text-sm ${subCls}`}>{t('lastScanned')}</p>
                </div>
              </div>
              {isLoadingScans ? (
                <div className="text-center py-10"><div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto" /></div>
              ) : scanHistory.length === 0 ? (
                <div className={`text-center py-12 ${subCls}`}><p className="text-4xl mb-3">📊</p><p>{t('noScans')}</p></div>
              ) : (
                <div className="space-y-3">
                  {scanHistory.map((scan, i) => {
                    const dt = new Date(scan.scannedAt);
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1"><span className="text-xl">🔍</span><div><p className={`font-semibold text-sm ${headingCls}`}>{dt.toLocaleDateString()}</p><p className={`text-xs ${subCls}`}>🕐 {dt.toLocaleTimeString()}</p></div></div>
                            {scan.location ? (
                              <div className="flex items-start gap-1.5 mt-2"><span className="text-green-400 text-sm flex-shrink-0">📍</span><div><p className={`text-sm ${subCls} leading-snug`}>{scan.location.address || `${scan.location.latitude.toFixed(5)}, ${scan.location.longitude.toFixed(5)}`}</p></div></div>
                            ) : (
                              <p className={`text-xs mt-2 flex items-center gap-1.5 ${subCls}`}><span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />{t('locationNotAvailable')}</p>
                            )}
                          </div>
                          {scan.location && (
                            <a href={`https://www.google.com/maps?q=${scan.location.latitude},${scan.location.longitude}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1">🗺️ Map</a>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
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