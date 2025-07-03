import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Layout from './components/layout/Layout';
import { ToastProvider } from './components/ui/Toast';
import { FullScreenLoader } from './components/ui/LoadingSpinner';
import PerformanceMonitor from './components/ui/PerformanceMonitor';

// Pages - Lazy loaded for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/LoginEnhanced'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/TasksAdvanced'));
const Calendar = lazy(() => import('./pages/Calendar'));
const AIAssistant = lazy(() => import('./pages/AIAssistantAdvanced'));
const Settings = lazy(() => import('./pages/SettingsAdvanced'));
const Pomodoro = lazy(() => import('./pages/PomodoroAdvanced'));
const Analytics = lazy(() => import('./pages/AnalyticsAdvanced'));
const FlashcardSet = lazy(() => import('./components/study/FlashcardSet'));

// Hooks
import { useAuth } from './context/AuthContext';

// Styles
import './styles/globals.css';

// Page transition component
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader text="Loading TaskTide..." />;
  }

  // Check if user exists and email is verified
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-md mx-auto text-center p-8 glass rounded-3xl">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Verification Required</h2>
          <p className="text-gray-300 mb-6">
            Please verify your email address to access TaskTide. Check your inbox for a verification link.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full"
          >
            I've Verified My Email
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="glass rounded-3xl p-8 text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading TaskTide</h2>
          <p className="text-gray-300">Preparing your premium productivity experience...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          user ? <Navigate to="/dashboard" /> : (
            <PageTransition>
              <Suspense fallback={<FullScreenLoader text="Loading..." />}>
                <LandingPage />
              </Suspense>
            </PageTransition>
          )
        } 
      />
      <Route 
        path="/login" 
        element={
          !user ? (
            <PageTransition>
              <Suspense fallback={<FullScreenLoader text="Loading..." />}>
                <Login />
              </Suspense>
            </PageTransition>
          ) : (
            <Navigate to="/dashboard" />
          )
        } 
      />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <Suspense fallback={<FullScreenLoader text="Loading Dashboard..." />}>
                  <Dashboard />
                </Suspense>
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <Suspense fallback={<FullScreenLoader text="Loading Tasks..." />}>
                  <Tasks />
                </Suspense>
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pomodoro"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <Suspense fallback={<FullScreenLoader text="Loading Pomodoro..." />}>
                  <Pomodoro />
                </Suspense>
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-assistant"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <Suspense fallback={<FullScreenLoader text="Loading AI Assistant..." />}>
                  <AIAssistant />
                </Suspense>
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <Suspense fallback={<FullScreenLoader text="Loading Calendar..." />}>
                  <Calendar />
                </Suspense>
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <Suspense fallback={<FullScreenLoader text="Loading Analytics..." />}>
                  <Analytics />
                </Suspense>
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <Suspense fallback={<FullScreenLoader text="Loading Settings..." />}>
                  <Settings />
                </Suspense>
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/flashcards"
        element={
          <ProtectedRoute>
            <Layout>
              <PageTransition>
                <Suspense fallback={<FullScreenLoader text="Loading Flashcards..." />}>
                  <FlashcardSet />
                </Suspense>
              </PageTransition>
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
    </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100,
    });

    // Refresh AOS on route changes
    AOS.refresh();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen transition-colors duration-300">
              <AppContent />
              <PerformanceMonitor showFloating={true} />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
