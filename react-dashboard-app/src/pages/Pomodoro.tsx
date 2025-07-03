import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  SquareIcon, 
  SkipForwardIcon, 
  SettingsIcon, 
  Volume2Icon, 
  VolumeXIcon,
  TargetIcon,
  ClockIcon,
  BarChart3Icon,
  Coffee,
  Brain,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types';
import { getUserTasks, createPomodoroSession, updatePomodoroSession } from '../services/firestore';

const Pomodoro: React.FC = () => {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Timer states
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [sessionType, setSessionType] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Settings
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartWork, setAutoStartWork] = useState(false);

  // UI states
  const [darkMode, setDarkMode] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState('Focus on one task at a time.');

  // Motivational quotes for different session types
  const quotes = {
    work: [
      "Focus on one task at a time.",
      "Great things never come from comfort zones.",
      "The way to get started is to quit talking and begin doing.",
      "Don't watch the clock; do what it does. Keep going.",
      "Success is the sum of small efforts repeated daily."
    ],
    'short-break': [
      "Take a deep breath and recharge.",
      "Rest when you're weary. Refresh and renew yourself.",
      "A break is not giving up, it's taking care of yourself.",
      "Short breaks help you stay focused longer.",
      "Even the busiest person needs moments of rest."
    ],
    'long-break': [
      "You've earned this longer break!",
      "Great job completing your work sessions!",
      "Rest is not idleness, it's essential for productivity.",
      "Take time to celebrate your progress.",
      "A well-rested mind is a productive mind."
    ]
  };

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  // Update motivational quote when session type changes
  useEffect(() => {
    setMotivationalQuote(quotes[sessionType][Math.floor(Math.random() * quotes[sessionType].length)]);
  }, [sessionType]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const loadTasks = async () => {
    try {
      const userTasks = await getUserTasks(user!.uid);
      const incompleteTasks = userTasks.filter(task => task.status !== 'completed');
      setTasks(incompleteTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleStart = async () => {
    if (!isActive) {
      // Starting a new session
      const duration = getDurationForSessionType(sessionType);
      const sessionId = await createPomodoroSession({
        userId: user!.uid,
        taskId: selectedTask?.id,
        type: sessionType === 'work' ? 'work' : 'break',
        duration: duration,
        startTime: new Date(),
        completed: false,
      });
      setCurrentSessionId(sessionId);
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const getDurationForSessionType = (type: 'work' | 'short-break' | 'long-break') => {
    switch (type) {
      case 'work':
        return workDuration;
      case 'short-break':
        return shortBreakDuration;
      case 'long-break':
        return longBreakDuration;
      default:
        return workDuration;
    }
  };

  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    setIsActive(false);
    setIsPaused(false);
    if (currentSessionId) {
      await updatePomodoroSession(currentSessionId, {
        endTime: new Date(),
        completed: false,
      });
    }
    resetTimer();
  };

  const handleSessionComplete = async () => {
    setIsActive(false);
    setIsPaused(false);
    
    if (currentSessionId) {
      await updatePomodoroSession(currentSessionId, {
        endTime: new Date(),
        completed: true,
      });
    }

    // Play sound notification
    playSound();

    if (sessionType === 'work') {
      setSessionCount(prev => prev + 1);
      // Switch to appropriate break type
      const isLongBreak = (sessionCount + 1) % sessionsUntilLongBreak === 0;
      const nextSessionType = isLongBreak ? 'long-break' : 'short-break';
      setSessionType(nextSessionType);
      setTime(getDurationForSessionType(nextSessionType) * 60);
      
      // Update motivational quote
      setMotivationalQuote(quotes[nextSessionType][Math.floor(Math.random() * quotes[nextSessionType].length)]);
      
      // Auto-start break if enabled
      if (autoStartBreaks) {
        setTimeout(() => setIsActive(true), 1000);
      }
    } else {
      // Switch to work
      setSessionType('work');
      setTime(workDuration * 60);
      
      // Update motivational quote
      setMotivationalQuote(quotes.work[Math.floor(Math.random() * quotes.work.length)]);
      
      // Auto-start work if enabled
      if (autoStartWork) {
        setTimeout(() => setIsActive(true), 1000);
      }
    }

    // Show notification
    showNotification();
  };

  const showNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification(`${sessionType === 'work' ? 'Work' : 'Break'} session completed!`, {
        body: `Time for a ${sessionType === 'work' ? 'break' : 'work session'}`,
        icon: '/favicon.ico',
      });
    }
  };

  const handleSkip = () => {
    handleSessionComplete();
  };

  const resetTimer = () => {
    setTime(getDurationForSessionType(sessionType) * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSessionDuration = () => {
    return getDurationForSessionType(sessionType);
  };

  const progress = ((getCurrentSessionDuration() * 60 - time) / (getCurrentSessionDuration() * 60)) * 100;

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
    }`}>
      {/* Audio element for sound notifications */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
        <source src="/notification-sound.wav" type="audio/wav" />
      </audio>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Pomodoro Focus Timer
            </h1>
            <p className={`text-lg mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {motivationalQuote}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full transition-colors ${
                darkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } shadow-lg`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-full transition-colors ${
                darkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } shadow-lg`}
            >
              {soundEnabled ? <Volume2Icon className="w-6 h-6" /> : <VolumeXIcon className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-full transition-colors ${
                darkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } shadow-lg`}
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className={`mb-8 p-6 rounded-2xl shadow-xl backdrop-blur-md ${
            darkMode 
              ? 'bg-gray-800/80 border border-gray-700' 
              : 'bg-white/80 border border-white/20'
          }`}>
            <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ⚙️ Timer Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Work Duration (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(parseInt(e.target.value))}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Short Break Duration (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={shortBreakDuration}
                  onChange={(e) => setShortBreakDuration(parseInt(e.target.value))}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Long Break Duration (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(parseInt(e.target.value))}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sessions Until Long Break
                </label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={sessionsUntilLongBreak}
                  onChange={(e) => setSessionsUntilLongBreak(parseInt(e.target.value))}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoStartBreaks}
                  onChange={(e) => setAutoStartBreaks(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Auto-start breaks
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoStartWork}
                  onChange={(e) => setAutoStartWork(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Auto-start work sessions
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <div className={`p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center ${
              darkMode 
                ? 'bg-gray-800/80 border border-gray-700' 
                : 'bg-white/80 border border-white/20'
            }`}>
              
              {/* Session Type Badge */}
              <div className="mb-8">
                <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full text-lg font-bold ${
                  sessionType === 'work' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                    : sessionType === 'short-break'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                }`}>
                  {sessionType === 'work' && <Brain className="w-6 h-6" />}
                  {sessionType === 'short-break' && <Coffee className="w-6 h-6" />}
                  {sessionType === 'long-break' && <Zap className="w-6 h-6" />}
                  <span>
                    {sessionType === 'work' ? 'Work Session' : 
                     sessionType === 'short-break' ? 'Short Break' : 'Long Break'}
                  </span>
                </div>
              </div>

              {/* Circular Timer */}
              <div className="relative mb-8">
                <div className="w-80 h-80 mx-auto relative">
                  {/* Background circle */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={darkMode ? '#374151' : '#e5e7eb'}
                      strokeWidth="2"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={
                        sessionType === 'work' 
                          ? '#ef4444' 
                          : sessionType === 'short-break'
                          ? '#10b981'
                          : '#3b82f6'
                      }
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  
                  {/* Timer text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-6xl font-mono font-bold mb-2 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatTime(time)}
                      </div>
                      <div className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {Math.round(progress)}% complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={isActive ? handlePause : handleStart}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isActive ? (
                    isPaused ? <PlayIcon className="w-6 h-6" /> : <PauseIcon className="w-6 h-6" />
                  ) : (
                    <PlayIcon className="w-6 h-6" />
                  )}
                  <span>{isActive ? (isPaused ? 'Resume' : 'Pause') : 'Start'}</span>
                </button>

                <button
                  onClick={handleStop}
                  disabled={!isActive}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-bold text-lg hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <SquareIcon className="w-6 h-6" />
                  <span>Stop</span>
                </button>

                <button
                  onClick={handleSkip}
                  disabled={!isActive}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <SkipForwardIcon className="w-6 h-6" />
                  <span>Skip</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Selection */}
            <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-md ${
              darkMode 
                ? 'bg-gray-800/80 border border-gray-700' 
                : 'bg-white/80 border border-white/20'
            }`}>
              <h3 className={`text-xl font-bold mb-4 flex items-center ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <TargetIcon className="w-6 h-6 mr-2" />
                Link to Task
              </h3>
              <select
                value={selectedTask?.id || ''}
                onChange={(e) => {
                  const task = tasks.find(t => t.id === e.target.value);
                  setSelectedTask(task || null);
                }}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none`}
              >
                <option value="">No task selected</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
              {selectedTask && (
                <div className={`mt-4 p-4 rounded-lg ${
                  darkMode 
                    ? 'bg-blue-900/50 border border-blue-700' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`font-semibold ${
                    darkMode ? 'text-blue-300' : 'text-blue-900'
                  }`}>
                    {selectedTask.title}
                  </p>
                  <p className={`text-sm mt-1 ${
                    darkMode ? 'text-blue-400' : 'text-blue-700'
                  }`}>
                    {selectedTask.subject}
                  </p>
                </div>
              )}
            </div>

            {/* Session Stats */}
            <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-md ${
              darkMode 
                ? 'bg-gray-800/80 border border-gray-700' 
                : 'bg-white/80 border border-white/20'
            }`}>
              <h3 className={`text-xl font-bold mb-4 flex items-center ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <BarChart3Icon className="w-6 h-6 mr-2" />
                Session Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sessions Today
                  </span>
                  <span className={`font-bold text-2xl ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {sessionCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Current Mode
                  </span>
                  <span className={`font-bold ${
                    sessionType === 'work' 
                      ? 'text-red-500' 
                      : sessionType === 'short-break'
                      ? 'text-green-500'
                      : 'text-blue-500'
                  }`}>
                    {sessionType === 'work' ? 'Work' : 
                     sessionType === 'short-break' ? 'Short Break' : 'Long Break'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Until Long Break
                  </span>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {sessionsUntilLongBreak - (sessionCount % sessionsUntilLongBreak)} sessions
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-md ${
              darkMode 
                ? 'bg-gray-800/80 border border-gray-700' 
                : 'bg-white/80 border border-white/20'
            }`}>
              <h3 className={`text-xl font-bold mb-4 flex items-center ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <ClockIcon className="w-6 h-6 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSessionType('work');
                    setTime(workDuration * 60);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    sessionType === 'work'
                      ? 'bg-red-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Switch to Work ({workDuration}m)
                </button>
                <button
                  onClick={() => {
                    setSessionType('short-break');
                    setTime(shortBreakDuration * 60);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    sessionType === 'short-break'
                      ? 'bg-green-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Switch to Short Break ({shortBreakDuration}m)
                </button>
                <button
                  onClick={() => {
                    setSessionType('long-break');
                    setTime(longBreakDuration * 60);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    sessionType === 'long-break'
                      ? 'bg-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Switch to Long Break ({longBreakDuration}m)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
