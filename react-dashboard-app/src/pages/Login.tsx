import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail,
  initializeRecaptcha,
  sendPhoneVerification,
  verifyPhoneCode,
  getFriendlyErrorMessage
} from '../services/auth';
import { countryCodes, CountryCode } from '../utils/countryCodes';
import { toast } from 'react-hot-toast';

const Login: React.FC = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneVerificationStep, setPhoneVerificationStep] = useState<'phone' | 'code' | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  const navigate = useNavigate();
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts and phone auth is selected
    if (authMethod === 'phone' && recaptchaRef.current) {
      try {
        initializeRecaptcha('recaptcha-container');
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
      }
    }
  }, [authMethod]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await signInWithGoogle();
      if (user) {
        toast.success(`Welcome ${user.displayName || 'back'}! 🎉`);
        navigate('/dashboard');
      }
    } catch (error: any) {
      const friendlyMessage = getFriendlyErrorMessage(error);
      setError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (authMode === 'signup' && password !== confirmPassword) {
      setError('Please enter the same password in both fields');
      toast.error('Please enter the same password in both fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      
      if (authMode === 'signup') {
        const user = await signUpWithEmail(email, password, fullName);
        if (user) {
          setSuccess('Account created! Please check your email for verification.');
          toast.success('Account created! Check your email for verification.');
        }
      } else {
        const user = await signInWithEmail(email, password);
        if (user) {
          toast.success('Welcome back! 🚀');
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      const friendlyMessage = getFriendlyErrorMessage(error);
      setError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (phoneVerificationStep === 'phone') {
      try {
        setLoading(true);
        const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;
        const recaptcha = initializeRecaptcha('recaptcha-container');
        const confirmation = await sendPhoneVerification(fullPhoneNumber, recaptcha);
        setConfirmationResult(confirmation);
        setPhoneVerificationStep('code');
        setSuccess('Verification code sent to your phone!');
        toast.success('Verification code sent!');
      } catch (error: any) {
        const friendlyMessage = getFriendlyErrorMessage(error);
        setError(friendlyMessage);
        toast.error(friendlyMessage);
      } finally {
        setLoading(false);
      }
    } else if (phoneVerificationStep === 'code' && confirmationResult) {
      try {
        setLoading(true);
        const user = await verifyPhoneCode(confirmationResult, verificationCode);
        if (user) {
          toast.success('Phone verified! Welcome! 🎉');
          navigate('/dashboard');
        }
      } catch (error: any) {
        const friendlyMessage = getFriendlyErrorMessage(error);
        setError(friendlyMessage);
        toast.error(friendlyMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  const resetPhoneAuth = () => {
    setPhoneVerificationStep('phone');
    setConfirmationResult(null);
    setVerificationCode('');
    setError(null);
    setSuccess(null);
  };

  const features = [
    { icon: '🚀', title: 'AI-Powered Productivity', desc: 'Smart task suggestions and automated insights' },
    { icon: '⏰', title: 'Advanced Pomodoro', desc: 'Focus sessions with ambient sounds and analytics' },
    { icon: '📊', title: 'Beautiful Analytics', desc: 'Track your progress with stunning visualizations' },
    { icon: '🎯', title: 'Goal Tracking', desc: 'Set and achieve your academic and career goals' },
  ];

  useEffect(() => {
    if (authMethod === 'phone') {
      setPhoneVerificationStep('phone');
    } else {
      setPhoneVerificationStep(null);
    }
  }, [authMethod]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Left Side - Welcome & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="flex flex-col justify-center px-12 py-16 relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12 group">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-3xl font-bold text-white">TaskTide</span>
              <div className="text-sm text-primary-400 font-medium">Premium Edition</div>
            </div>
          </Link>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Transform Your
              <span className="text-gradient ml-3">Productivity</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Join thousands of ambitious students and professionals who've discovered 
              the power of AI-enhanced productivity with TaskTide.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 border-2 border-white/20"
                ></div>
              ))}
            </div>
            <div>
              <p className="text-white font-medium">Join 10,000+ users</p>
              <p className="text-gray-400 text-sm">★★★★★ 4.9/5 rating</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Back to Home (Mobile) */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Form Container */}
          <div className="glass rounded-3xl p-8 border border-white/10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-400">
                {authMode === 'signup' ? 'Join the productivity revolution' : 'Ready to be productive?'}
              </p>
            </div>

            {/* Auth Method Toggle */}
            <div className="flex mb-6 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setAuthMethod('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                  authMethod === 'email'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <EnvelopeIcon className="w-5 h-5" />
                Email
              </button>
              <button
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                  authMethod === 'phone'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <PhoneIcon className="w-5 h-5" />
                Phone
              </button>
            </div>

            {/* Success/Error Messages */}
            <AnimatePresence>
              {(success || error) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
                    success
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
                >
                  {success ? (
                    <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm">{success || error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Authentication Form */}
            {authMethod === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                      required={authMode === 'signup'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {authMode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                    </div>
                  ) : (
                    authMode === 'signup' ? 'Create Account' : 'Sign In'
                  )}
                </button>
              </form>
            )}

            {/* Phone Authentication Form */}
            {authMethod === 'phone' && (
              <form onSubmit={handlePhoneAuth} className="space-y-4">
                {phoneVerificationStep === 'phone' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white flex items-center justify-between focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{selectedCountry.flag}</span>
                            <span>{selectedCountry.name}</span>
                            <span className="text-gray-400">{selectedCountry.dialCode}</span>
                          </div>
                          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        </button>

                        {showCountryDropdown && (
                          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-gray-800 border border-white/10 rounded-xl shadow-lg">
                            {countryCodes.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                                className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-white transition-colors"
                              >
                                <span className="text-xl">{country.flag}</span>
                                <span className="flex-1">{country.name}</span>
                                <span className="text-gray-400">{country.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <div className="flex">
                        <div className="flex items-center px-3 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-gray-400">
                          <span className="text-xl mr-2">{selectedCountry.flag}</span>
                          <span>{selectedCountry.dialCode}</span>
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-r-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {phoneVerificationStep === 'code' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Enter the 6-digit code sent to {selectedCountry.dialCode}{phoneNumber}
                    </p>
                    <button
                      type="button"
                      onClick={resetPhoneAuth}
                      className="text-primary-400 hover:text-primary-300 text-sm mt-2 underline"
                    >
                      Change phone number
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (phoneVerificationStep === 'phone' && !phoneNumber) || (phoneVerificationStep === 'code' && verificationCode.length !== 6)}
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {phoneVerificationStep === 'phone' ? 'Sending Code...' : 'Verifying...'}
                    </div>
                  ) : (
                    phoneVerificationStep === 'phone' ? 'Send Verification Code' : 'Verify Code'
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Auth Mode Toggle */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
                    setError(null);
                    setSuccess(null);
                    resetPhoneAuth();
                  }}
                  className="ml-2 text-primary-400 hover:text-primary-300 font-semibold transition-colors underline"
                >
                  {authMode === 'signup' ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>

          {/* reCAPTCHA Container */}
          <div ref={recaptchaRef} id="recaptcha-container"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
