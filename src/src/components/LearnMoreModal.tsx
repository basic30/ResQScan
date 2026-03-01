// ============================================
// ResQScan Learn More Modal
// Comprehensive info about the app
// ============================================

import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LearnMoreModal({ isOpen, onClose }: Props) {
  const { t, theme } = useApp();
  const isDark = theme === 'dark';

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
    { q: t('faq6Q'), a: t('faq6A') },
  ];

  const features = [
    t('keyFeature1'),
    t('keyFeature2'),
    t('keyFeature3'),
    t('keyFeature4'),
    t('keyFeature5'),
    t('keyFeature6'),
    t('keyFeature7'),
    t('keyFeature8'),
  ];

  const steps = [
    t('howToUseStep1'),
    t('howToUseStep2'),
    t('howToUseStep3'),
    t('howToUseStep4'),
    t('howToUseStep5'),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-3xl mx-4 my-8 sm:my-16 rounded-3xl overflow-hidden shadow-2xl ${
              isDark ? 'bg-[#0f172a] border border-white/10' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-600 to-orange-500 px-6 sm:px-8 py-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">{t('learnMoreTitle')}</h2>
                  <p className="text-red-100 text-sm">Safety That Travels With You</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 sm:px-8 py-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* What is ResQScan */}
              <Section title={t('whatIsResQScan')} icon="💡" isDark={isDark}>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('whatIsResQScanDesc')}
                </p>
              </Section>

              {/* Who Should Use */}
              <Section title={t('whoShouldUse')} icon="👥" isDark={isDark}>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('whoShouldUseDesc')}
                </p>
              </Section>

              {/* How to Use */}
              <Section title={t('howToUseTitle')} icon="📖" isDark={isDark}>
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-black">{i + 1}</span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{step}</p>
                    </motion.div>
                  ))}
                </div>
              </Section>

              {/* Key Features */}
              <Section title={t('keyFeaturesTitle')} icon="⚡" isDark={isDark}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`p-3 rounded-xl text-sm ${
                        isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {feature}
                    </motion.div>
                  ))}
                </div>
              </Section>

              {/* FAQ */}
              <Section title={t('faqTitle')} icon="❓" isDark={isDark}>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-xl overflow-hidden ${
                        isDark ? 'bg-white/5' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        <span className="text-red-400">Q.</span>
                        {faq.q}
                      </div>
                      <div className={`px-4 pb-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className="text-green-400 font-semibold">A.</span>{' '}
                        {faq.a}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Section>

              {/* Privacy */}
              <Section title={t('privacyTitle')} icon="🔒" isDark={isDark}>
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'
                }`}>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-green-300/80' : 'text-green-700'}`}>
                    {t('privacyDesc')}
                  </p>
                </div>
              </Section>
            </div>

            {/* Footer */}
            <div className={`px-6 sm:px-8 py-5 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    ResQScan v1.0
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105 transition-all active:scale-95"
                >
                  {t('closeModal')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Section component for consistent styling
function Section({ title, icon, isDark, children }: { title: string; icon: string; isDark: boolean; children: React.ReactNode }) {
  return (
    <div>
      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <span className="text-xl">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}
