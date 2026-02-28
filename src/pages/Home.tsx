// ============================================
// ResQScan Home / Landing Page
// Premium hero section with features
// ============================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const { t, isAuthenticated } = useApp();

  const features = [
    { icon: '🛡️', title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: '📱', title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: '🚨', title: t('feature3Title'), desc: t('feature3Desc') },
    { icon: '🩸', title: t('feature4Title'), desc: t('feature4Desc') },
    { icon: '🌐', title: t('feature5Title'), desc: t('feature5Desc') },
    { icon: '📄', title: t('feature6Title'), desc: t('feature6Desc') },
  ];

  const steps = [
    { num: '01', title: t('step1Title'), desc: t('step1Desc'), icon: '👤' },
    { num: '02', title: t('step2Title'), desc: t('step2Desc'), icon: '📲' },
    { num: '03', title: t('step3Title'), desc: t('step3Desc'), icon: '✅' },
  ];

  const stats = [
    { value: '10,000+', label: t('statsProtected') },
    { value: '50,000+', label: t('statsQR') },
    { value: '2', label: t('statsLanguages') },
    { value: '5,000+', label: t('statsDonors') },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[128px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[200px]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-gray-300">Decentralized Emergency Medical System</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-6">
              <span className="text-white">{t('heroTitle')}</span>
              <br />
              <span className="gradient-text">{t('heroTitleHighlight')}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} custom={2} className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('heroSubtitle')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to={isAuthenticated ? '/dashboard' : '/signup'}
                className="group relative px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-2xl shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('ctaButton')}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-2xl text-base font-semibold glass text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                {t('learnMore')}
              </a>
            </motion.div>

            {/* Animated QR Preview */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-16 relative"
            >
              <div className="relative inline-block">
                <div className="w-48 h-48 sm:w-56 sm:h-56 glass rounded-3xl p-4 animate-float mx-auto">
                  <div className="w-full h-full rounded-2xl bg-white p-3 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Simplified QR pattern */}
                      <rect width="100" height="100" fill="white"/>
                      {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => (
                        (r<3&&c<3)||(r<3&&c>3)||(r>3&&c<3)||((r+c)%3===0) ?
                        <rect key={`${r}-${c}`} x={8+c*12} y={8+r*12} width="10" height="10" rx="1" fill="#0f172a"/> : null
                      )))}
                      <rect x="35" y="35" width="30" height="30" rx="4" fill="white" stroke="#ef4444" strokeWidth="2"/>
                      <text x="50" y="54" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">RQ</text>
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-red-400"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-black gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Everything You Need for{' '}
              <span className="gradient-text">Emergency Safety</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Comprehensive features designed to save lives in critical moments.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="glass rounded-2xl p-6 md:p-8 group hover:bg-white/10 transition-all duration-300 cursor-default"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[128px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              {t('howItWorks')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-red-500/50 via-orange-500/50 to-red-500/50" />
            
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass mb-6 text-3xl relative z-10 bg-[#0f172a]">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-red-400 mb-2">{step.num}</div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20" />
            <div className="absolute inset-0 glass" />
            <div className="relative p-8 sm:p-12 md:p-16 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
                Ready to Protect Yourself?
              </h2>
              <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                Create your emergency medical QR card in minutes. It could save your life.
              </p>
              <Link
                to={isAuthenticated ? '/dashboard' : '/signup'}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-2xl shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 hover:scale-105"
              >
                {t('ctaButton')}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-bold gradient-text">ResQScan</span>
            </div>
            <p className="text-sm text-gray-500">{t('madeWith')}</p>
            <p className="text-sm text-gray-500">© 2024 ResQScan. {t('footerRights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
