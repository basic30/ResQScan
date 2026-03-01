// Auth Page - Login and Signup with Firebase Authentication
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // We added isAuthenticated and isLoading here
  const { login, signup, t, theme, isAuthenticated, isLoading } = useApp();
  
  // Set initial state based on the URL route
  const [isSignup, setIsSignup] = useState(location.pathname === '/signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Update mode if URL changes (e.g. clicking "Signup" while on "Login" page)
  useEffect(() => {
    setIsSignup(location.pathname === '/signup');
    setError('');
  }, [location.pathname]);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignup) {
        if (!name.trim()) throw new Error('Please enter your name');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        if (password !== confirmPassword) throw new Error('Passwords do not match');
        
        await signup(name.trim(), email.trim(), password);
        navigate('/dashboard');
      } else {
        await login(email.trim(), password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    const newPath = isSignup ? '/login' : '/signup';
    navigate(newPath);
  };

  const isDark = theme === 'dark';

  // Show a loading spinner while Firebase is checking the session
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    // Replaced py-12 with pt-28 pb-12 to add top padding below the Navbar
    <div className={`min-h-screen flex items-center justify-center px-4 pt-28 pb-12 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${
          isDark ? 'bg-red-500/10' : 'bg-red-500/5'
        } rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${
          isDark ? 'bg-orange-500/10' : 'bg-orange-500/5'
        } rounded-full blur-3xl`}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative w-full max-w-md ${
          isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-gray-200 shadow-xl'
        } backdrop-blur-xl rounded-3xl border p-8`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-4 shadow-lg shadow-red-500/25"
          >
            <span className="text-white text-2xl font-bold">R</span>
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            ResQScan
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tagline')}
          </p>
        </div>

        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.h2
            key={isSignup ? 'signup' : 'login'}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`text-xl font-semibold text-center mb-6 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}
          >
            {isSignup ? t('createAccount') : t('welcomeBack')}
          </motion.h2>
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {isSignup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('enterFullName')}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-red-500/50' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
                  } focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all`}
                  required={isSignup}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('enterEmail')}
              className={`w-full px-4 py-3 rounded-xl border ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-red-500/50' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
              } focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enterPassword')}
                className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-red-500/50' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
                } focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isSignup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmYourPassword')}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-red-500/50' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
                  } focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all`}
                  required={isSignup}
                  minLength={6}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isSignup ? t('creatingAccount') : t('signingIn')}
              </>
            ) : (
              <>
                {isSignup ? t('signUp') : t('signIn')}
              </>
            )}
          </motion.button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {isSignup ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-red-400 hover:text-red-300 font-semibold transition-colors"
            >
              {isSignup ? t('signIn') : t('signUp')}
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`text-sm ${
              isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
            } transition-colors`}
          >
            ← {t('backToHome')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;