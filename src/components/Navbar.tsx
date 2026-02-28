// ============================================
// ResQScan Navbar Component
// Premium glassmorphism navigation with theme toggle
// ============================================

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { isAuthenticated, logout, language, setLanguage, t, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;
  const isDark = theme === 'dark';

  const langBtnClass = (lang: string) =>
    `px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
      language === lang
        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold gradient-text">ResQScan</span>
              <p className={`text-[10px] -mt-1 hidden sm:block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tagline')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${isDark ? 'text-yellow-400 hover:bg-white/5' : 'text-gray-600 hover:bg-black/5'}`}
              title={isDark ? t('lightMode') : t('darkMode')}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Language Toggle */}
            <div className={`flex items-center rounded-xl p-1 mr-1 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
              <button onClick={() => setLanguage('en')} className={langBtnClass('en')}>
                🇬🇧 EN
              </button>
              <button onClick={() => setLanguage('hi')} className={langBtnClass('hi')}>
                🇮🇳 हि
              </button>
              <button onClick={() => setLanguage('bn')} className={langBtnClass('bn')}>
                🇧🇩 বা
              </button>
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive('/dashboard')
                      ? isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-gray-900'
                      : isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                  }`}
                >
                  {t('dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                  }`}
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                  }`}
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                >
                  {t('signup')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${isDark ? 'text-yellow-400 hover:bg-white/5' : 'text-gray-600 hover:bg-black/5'}`}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 rounded-xl transition-all ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden overflow-hidden glass-strong ${isDark ? 'border-t border-white/5' : 'border-t border-black/5'}`}
          >
            <div className="px-4 py-4 space-y-2">
              {/* Language Toggle */}
              <div className={`flex items-center rounded-xl p-1 mb-3 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    language === 'en' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    language === 'hi' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  🇮🇳 हिंदी
                </button>
                <button
                  onClick={() => setLanguage('bn')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    language === 'bn' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  🇧🇩 বাংলা
                </button>
              </div>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    }`}
                  >
                    {t('dashboard')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    }`}
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    }`}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-orange-500 text-white text-center transition-all"
                  >
                    {t('signup')}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
