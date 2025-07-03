import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Clock, Target, Coffee, Zap, Volume2, VolumeX, SkipForward } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { createPomodoroSession } from '../services/firestore';

interface PomodoroStats {
  sessionsToday: number;
  totalFocusTime: number;
  completedSessions: number;
  streak: number;
}

const PomodoroAdvanced: React.FC = () => {
  const { user } = useAuth();
  const { success, info } = useToast();
  
  // Timer settings
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    soundEnabled: true,
    volume: 50
  });

  // Timer state
  const [currentSession, setCurrentSession] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [stats, setStats] = useState<PomodoroStats>({
    sessionsToday: 0,
    totalFocusTime: 0,
    completedSessions: 0,
    streak: 0
  });

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [customGoal, setCustomGoal] = useState('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize timer
  useEffect(() => {
    const duration = currentSession === 'work' ? settings.workDuration :
                    currentSession === 'shortBreak' ? settings.shortBreak :
                    settings.longBreak;
    setTimeLeft(duration * 60);
  }, [currentSession, settings]);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = useCallback(async () => {
    setIsActive(false);
    
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    // Save session to Firestore
    if (user && currentSession === 'work') {
      try {
        await createPomodoroSession({
          userId: user.uid,
          duration: settings.workDuration,
          type: 'work',
          startTime: new Date(Date.now() - (settings.workDuration * 60 * 1000)),
          endTime: new Date(),
          completed: true,
          taskId: selectedTask || undefined
        });
        
        setStats(prev => ({
          ...prev,
          sessionsToday: prev.sessionsToday + 1,
          totalFocusTime: prev.totalFocusTime + settings.workDuration,
          completedSessions: prev.completedSessions + 1,
          streak: prev.streak + 1
        }));
      } catch (error) {
        console.error('Error saving pomodoro session:', error);
      }
    }

    // Handle session transitions
    if (currentSession === 'work') {
      setSessionCount(prev => prev + 1);
      const nextBreakType = (sessionCount + 1) % settings.sessionsUntilLongBreak === 0 ? 'longBreak' : 'shortBreak';
      
      success(
        '🎉 Work Session Complete!',
        `Great job! Time for a ${nextBreakType === 'longBreak' ? 'long' : 'short'} break.`
      );
      
      setCurrentSession(nextBreakType);
      
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsActive(true), 1000);
      }
    } else {
      info(
        '☕ Break Complete!',
        'Ready to get back to work? Let\'s focus!'
      );
      
      setCurrentSession('work');
      
      if (settings.autoStartPomodoros) {
        setTimeout(() => setIsActive(true), 1000);
      }
    }
  }, [currentSession, sessionCount, settings, user, selectedTask, success, info]);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume / 100;
      audioRef.current.play().catch(console.error);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    const duration = currentSession === 'work' ? settings.workDuration :
                    currentSession === 'shortBreak' ? settings.shortBreak :
                    settings.longBreak;
    setTimeLeft(duration * 60);
  };

  const skipSession = () => {
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionIcon = () => {
    switch (currentSession) {
      case 'work':
        return <Target className="w-8 h-8" />;
      case 'shortBreak':
        return <Coffee className="w-8 h-8" />;
      case 'longBreak':
        return <Zap className="w-8 h-8" />;
    }
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work':
        return 'from-red-500 to-red-600';
      case 'shortBreak':
        return 'from-green-500 to-green-600';
      case 'longBreak':
        return 'from-blue-500 to-blue-600';
    }
  };

  const getProgressPercentage = () => {
    const totalDuration = currentSession === 'work' ? settings.workDuration :
                         currentSession === 'shortBreak' ? settings.shortBreak :
                         settings.longBreak;
    return ((totalDuration * 60 - timeLeft) / (totalDuration * 60)) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900 dark:via-orange-900 dark:to-yellow-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8" data-aos="fade-down">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">
            Pomodoro Focus Timer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Boost your productivity with the proven Pomodoro Technique! 🍅
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl p-8 border border-white/20 text-center" data-aos="zoom-in">
              {/* Session Type */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl bg-gradient-to-r ${getSessionColor()} text-white`}>
                  {getSessionIcon()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {currentSession === 'shortBreak' ? 'Short Break' :
                     currentSession === 'longBreak' ? 'Long Break' : 
                     'Focus Time'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Session {sessionCount + 1}
                  </p>
                </div>
              </div>

              {/* Timer Display */}
              <div className="relative mb-8">
                {/* Circular Progress */}
                <div className="relative w-80 h-80 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${getProgressPercentage() * 2.827} 282.7`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" className={`${currentSession === 'work' ? 'stop-red-500' : currentSession === 'shortBreak' ? 'stop-green-500' : 'stop-blue-500'}`} />
                        <stop offset="100%" className={`${currentSession === 'work' ? 'stop-red-600' : currentSession === 'shortBreak' ? 'stop-green-600' : 'stop-blue-600'}`} />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Time Display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2 font-mono">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-lg text-gray-600 dark:text-gray-400">
                        {Math.ceil(timeLeft / 60)} minutes left
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={toggleTimer}
                  className={`p-4 rounded-2xl text-white font-semibold hover:scale-110 transition-all duration-200 shadow-lg bg-gradient-to-r ${getSessionColor()}`}
                >
                  {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </button>
                
                <button
                  onClick={resetTimer}
                  className="p-4 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-110 transition-all duration-200"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
                
                <button
                  onClick={skipSession}
                  className="p-4 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-110 transition-all duration-200"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-4 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-110 transition-all duration-200"
                >
                  <Settings className="w-6 h-6" />
                </button>
              </div>

              {/* Current Goal */}
              {customGoal && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-700">
                  <p className="text-purple-800 dark:text-purple-200 font-medium">
                    🎯 Current Goal: {customGoal}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-500" />
                Today's Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Sessions</span>
                  <span className="font-bold text-orange-600">{stats.sessionsToday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Focus Time</span>
                  <span className="font-bold text-orange-600">{stats.totalFocusTime}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Streak</span>
                  <span className="font-bold text-orange-600">{stats.streak}</span>
                </div>
              </div>
            </div>

            {/* Goal Setting */}
            <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="100">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-500" />
                Session Goal
              </h3>
              <textarea
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="What do you want to accomplish this session?"
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="200">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-blue-500" />
                  Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Work Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.workDuration}
                      onChange={(e) => setSettings({...settings, workDuration: parseInt(e.target.value) || 25})}
                      className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50"
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
                      value={settings.shortBreak}
                      onChange={(e) => setSettings({...settings, shortBreak: parseInt(e.target.value) || 5})}
                      className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50"
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
                      value={settings.longBreak}
                      onChange={(e) => setSettings({...settings, longBreak: parseInt(e.target.value) || 15})}
                      className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50"
                      min="1"
                      max="60"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sound Notifications
                    </span>
                    <button
                      onClick={() => setSettings({...settings, soundEnabled: !settings.soundEnabled})}
                      className={`p-2 rounded-xl transition-colors duration-200 ${
                        settings.soundEnabled 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Motivational Tips */}
            <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="300">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Coffee className="w-6 h-6 text-yellow-500" />
                Pomodoro Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>🍅 <strong>Focus fully</strong> during work sessions - no distractions!</p>
                <p>☕ <strong>Take breaks seriously</strong> - they help you recharge.</p>
                <p>📱 <strong>Turn off notifications</strong> to maintain deep focus.</p>
                <p>🎯 <strong>Set a clear goal</strong> for each session.</p>
                <p>🏃 <strong>Move around</strong> during breaks to stay energized.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audio element for notifications */}
        <audio
          ref={audioRef}
          preload="auto"
          src="data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyAFRQRTEAAAARAAAAA1N3aXRjaCBQbHVzIDIuMC4yAFRTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
        />
      </div>
    </div>
  );
};

export default PomodoroAdvanced;
