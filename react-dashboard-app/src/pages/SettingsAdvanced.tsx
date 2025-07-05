import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, User, Bell, Palette, Shield, Database, Download, Upload, Moon, Sun, Monitor, Save, RefreshCw, Camera, Mail, Key, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { sendPasswordReset, getFriendlyErrorMessage } from '../services/auth';
import { updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import toast from 'react-hot-toast';
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

const SettingsAdvanced: React.FC = () => {
  const { user, logout } = useAuth();
  const { success, error: showError } = useToast();
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
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage (in a real app, this would be saved to the backend)
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Apply theme
      applyTheme(settings.theme);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('Saved!', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const exportData = () => {
    const data = {
      settings,
      user: {
        id: user?.uid,
        email: user?.email,
        displayName: user?.displayName
      },
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasktide-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    success('Exported!', 'Your data has been exported');
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings: UserSettings = {
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
      };
      setSettings(defaultSettings);
      success('Reset!', 'Settings reset to default');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'productivity', label: 'Productivity', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data', icon: Database }
  ];

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...((prev[section] as any) || {}),
        [key]: value
      }
    }));
  };

  const handleProfileImageUpload = async (file: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'tasktide');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dg8qj8j8j/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.secure_url) {
        setSettings(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            backgroundImage: data.secure_url
          }
        }));
        success('Uploaded!', 'Profile image uploaded successfully');
      } else {
        showError('Upload failed', 'Unable to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      showError('Error', 'Image upload failed. Please try again later.');
    }
  };

  const handleProfileSave = async () => {
    if (!user) {
      showError('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      // Update profile in Firebase
      await updateProfile(user, {
        displayName: `${settings.profile.firstName} ${settings.profile.lastName}`,
        photoURL: settings.profile.backgroundImage
      });

      // Update email if changed
      if (settings.profile.email !== user.email) {
        const userEmail = user.email;
        if (!userEmail) {
          showError('Error', 'Current email not available');
          return;
        }
        const credential = EmailAuthProvider.credential(userEmail, emailChangePassword);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, settings.profile.email);
      }

      success('Profile updated', 'Your profile has been successfully updated');
    } catch (error) {
      console.error('Profile update error:', error);
      showError('Update failed', getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={settings.profile.firstName}
                  onChange={(e) => updateSettings('profile', 'firstName', e.target.value)}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={settings.profile.lastName}
                  onChange={(e) => updateSettings('profile', 'lastName', e.target.value)}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={(e) => updateSettings('profile', 'email', e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={showEmailChangeForm}
              />
            </div>

            {showEmailChangeForm && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Email
                  </label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSettings('profile', 'email', e.target.value)}
                    className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={emailChangePassword}
                    onChange={(e) => setEmailChangePassword(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleProfileSave}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors duration-200"
                >
                  Update Email
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={settings.profile.phone}
                onChange={(e) => updateSettings('profile', 'phone', e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                  {settings.profile.backgroundImage ? (
                    <img
                      src={settings.profile.backgroundImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors duration-200"
                >
                  Upload Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleProfileImageUpload(file);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleProfileSave}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>

              <button
                onClick={() => setShowEmailChangeForm(prev => !prev)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                {showEmailChangeForm ? 'Cancel' : 'Change Email'}
              </button>
            </div>
          </div>
        );

      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={settings.general.language}
                onChange={(e) => updateSettings('general', 'language', e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Week starts on
              </label>
              <div className="flex gap-4">
                {['monday', 'sunday'].map((day) => (
                  <label key={day} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={day}
                      checked={settings.general.weekStart === day}
                      onChange={(e) => updateSettings('general', 'weekStart', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date format
              </label>
              <select
                value={settings.general.dateFormat}
                onChange={(e) => updateSettings('general', 'dateFormat', e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => updateSettings('theme', 'theme', value)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                      settings.theme === value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      settings.theme === value ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      settings.theme === value ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🎨 Personalization</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                More customization options like accent colors and layout preferences will be available in future updates!
              </p>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {key === 'email' && 'Receive updates via email'}
                    {key === 'desktop' && 'Browser notifications'}
                    {key === 'taskReminders' && 'Remind me about upcoming deadlines'}
                    {key === 'pomodoroBreaks' && 'Notify when break time starts'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateSettings('notifications', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        );

      case 'productivity':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.productivity.workDuration}
                  onChange={(e) => updateSettings('productivity', 'workDuration', parseInt(e.target.value) || 25)}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  value={settings.productivity.shortBreak}
                  onChange={(e) => updateSettings('productivity', 'shortBreak', parseInt(e.target.value) || 5)}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  value={settings.productivity.longBreak}
                  onChange={(e) => updateSettings('productivity', 'longBreak', parseInt(e.target.value) || 15)}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="60"
                />
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'autoStartBreaks', label: 'Auto-start breaks', desc: 'Automatically start break timers' },
                { key: 'autoStartPomodoros', label: 'Auto-start work sessions', desc: 'Automatically start work timers after breaks' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.productivity[key as keyof typeof settings.productivity] as boolean}
                      onChange={(e) => updateSettings('productivity', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            {Object.entries(settings.privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {key === 'profileVisible' && 'Make your profile visible to other users'}
                    {key === 'dataSharing' && 'Share anonymized usage data to improve the app'}
                    {key === 'analytics' && 'Enable analytics tracking for better insights'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateSettings('privacy', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}

            <div className="p-6 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200 dark:border-red-700">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">🔒 Data Security</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Your data is encrypted and stored securely. We never share your personal information with third parties.
              </p>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-4">📊 Data Management</h4>
              <div className="space-y-4">
                <button
                  onClick={exportData}
                  className="w-full p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export My Data
                </button>
                
                <div className="flex items-center gap-2 p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Import functionality coming soon
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-700">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Danger Zone</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                These actions cannot be undone. Please be careful.
              </p>
              <button
                onClick={resetSettings}
                className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors duration-200"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8" data-aos="fade-down">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-transparent mb-4">
            Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Customize your TaskTide experience to match your preferences ⚙️
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-6 border border-white/20 sticky top-8" data-aos="fade-up">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="glass rounded-3xl p-8 border border-white/20" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {activeTab} Settings
                </h2>
                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAdvanced;
