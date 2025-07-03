import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database, 
  Save, 
  Camera, 
  Mail, 
  Key, 
  Phone,
  Upload,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendPasswordReset, getFriendlyErrorMessage } from '../services/auth';
import { updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import toast, { Toaster } from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    desktop: boolean;
    taskReminders: boolean;
    pomodoroBreaks: boolean;
  };
  productivity: {
    workDuration: number;
    shortBreak: number;
    longBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
  };
  privacy: {
    profileVisible: boolean;
    dataSharing: boolean;
    analytics: boolean;
  };
  general: {
    language: string;
    timezone: string;
    weekStart: 'monday' | 'sunday';
    dateFormat: 'mm/dd/yyyy' | 'dd/mm/yyyy' | 'yyyy-mm-dd';
  };
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    backgroundImage: string;
  };
}

const SettingsEnhanced: React.FC = () => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    notifications: {
      email: true,
      desktop: true,
      taskReminders: true,
      pomodoroBreaks: true
    },
    productivity: {
      workDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      autoStartBreaks: true,
      autoStartPomodoros: false
    },
    privacy: {
      profileVisible: true,
      dataSharing: false,
      analytics: true
    },
    general: {
      language: 'en',
      timezone: 'UTC',
      weekStart: 'monday',
      dateFormat: 'mm/dd/yyyy'
    },
    profile: {
      firstName: user?.displayName?.split(' ')[0] || '',
      lastName: user?.displayName?.split(' ')[1] || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      backgroundImage: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileChanges, setProfileChanges] = useState(false);
  const [emailChangePassword, setEmailChangePassword] = useState('');
  const [showEmailChangeForm, setShowEmailChangeForm] = useState(false);

  useEffect(() => {
    // Load user settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleProfileSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update display name in Firebase Auth
      await updateProfile(user, {
        displayName: `${settings.profile.firstName} ${settings.profile.lastName}`.trim()
      });

      // Handle email change if needed
      if (settings.profile.email !== user.email) {
        if (!emailChangePassword) {
          setShowEmailChangeForm(true);
          setLoading(false);
          return;
        }
        
        const credential = EmailAuthProvider.credential(user.email!, emailChangePassword);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, settings.profile.email);
        toast.success('Email updated! Please verify your new email address.');
      }

      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      toast.success('Profile updated successfully!');
      setProfileChanges(false);
      setShowEmailChangeForm(false);
      setEmailChangePassword('');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      await sendPasswordReset(user.email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      toast.error(getFriendlyErrorMessage(error));
    }
  };

  const handleBackgroundUpload = async (file: File) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create a reference to the file in Firebase Storage
      const storageRef = ref(storage, `backgrounds/${user.uid}/${Date.now()}_${file.name}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      setSettings(prev => ({
        ...prev,
        profile: { ...prev.profile, backgroundImage: downloadURL }
      }));
      
      toast.success('Background image uploaded successfully!');
      setProfileChanges(true);
    } catch (error: any) {
      console.error('Error uploading background:', error);
      toast.error('Failed to upload background image');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      handleBackgroundUpload(file);
    }
  };

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...((prev[section] as any) || {}),
        [key]: value
      }
    }));
    
    if (section === 'profile') {
      setProfileChanges(true);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'productivity', label: 'Productivity', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data', icon: Database }
  ];

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Profile Picture and Cover */}
      <div className="relative">
        <div 
          className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl relative overflow-hidden"
          style={settings.profile.backgroundImage ? {
            backgroundImage: `url(${settings.profile.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-xl hover:bg-black/70 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-4 border-white dark:border-gray-800">
            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={settings.profile.firstName}
            onChange={(e) => updateSettings('profile', 'firstName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={settings.profile.lastName}
            onChange={(e) => updateSettings('profile', 'lastName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="space-y-2">
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => updateSettings('profile', 'email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
            />
            {showEmailChangeForm && (
              <input
                type="password"
                value={emailChangePassword}
                onChange={(e) => setEmailChangePassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter current password to change email"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={settings.profile.phone}
            onChange={(e) => updateSettings('profile', 'phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      {/* Password Reset */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Password & Security
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Reset your password or update security settings
        </p>
        <button
          onClick={handlePasswordReset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Key className="w-4 h-4" />
          Send Password Reset Email
        </button>
      </div>

      {/* Save Button */}
      {profileChanges && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setSettings(prev => ({
                ...prev,
                profile: {
                  firstName: user?.displayName?.split(' ')[0] || '',
                  lastName: user?.displayName?.split(' ')[1] || '',
                  email: user?.email || '',
                  phone: user?.phoneNumber || '',
                  backgroundImage: prev.profile.backgroundImage
                }
              }));
              setProfileChanges(false);
              setShowEmailChangeForm(false);
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProfileSave}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor }
          ].map((theme) => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.value}
                onClick={() => updateSettings('general', 'theme', theme.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  settings.theme === theme.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {theme.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Language & Region</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={settings.general.language}
              onChange={(e) => updateSettings('general', 'language', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Week starts on
            </label>
            <select
              value={settings.general.weekStart}
              onChange={(e) => updateSettings('general', 'weekStart', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Customize your TaskTide experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass rounded-3xl p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-3xl p-8">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'general' && renderGeneralTab()}
              {/* Add other tabs as needed */}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsEnhanced;
