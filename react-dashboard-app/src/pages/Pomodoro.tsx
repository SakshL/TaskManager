import React, { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon, SquareIcon, SkipForwardIcon, SettingsIcon } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { Task } from '../types';
import { getUserTasks, createPomodoroSession, updatePomodoroSession } from '../services/firestore';

const Pomodoro: React.FC = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Settings
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

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
      const sessionId = await createPomodoroSession({
        userId: user!.uid,
        taskId: selectedTask?.id,
        type: sessionType,
        duration: sessionType === 'work' ? workDuration : 
                 (sessionCount % sessionsUntilLongBreak === 0 && sessionCount > 0) ? longBreakDuration : breakDuration,
        startTime: new Date(),
        completed: false,
      });
      setCurrentSessionId(sessionId);
    }
    setIsActive(true);
    setIsPaused(false);
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

    if (sessionType === 'work') {
      setSessionCount(prev => prev + 1);
      // Switch to break
      const isLongBreak = (sessionCount + 1) % sessionsUntilLongBreak === 0;
      setSessionType('break');
      setTime(isLongBreak ? longBreakDuration * 60 : breakDuration * 60);
    } else {
      // Switch to work
      setSessionType('work');
      setTime(workDuration * 60);
    }

    // Play notification sound (you can add audio here)
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
    setTime(sessionType === 'work' ? workDuration * 60 : breakDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = sessionType === 'work' 
    ? ((workDuration * 60 - time) / (workDuration * 60)) * 100
    : ((breakDuration * 60 - time) / (breakDuration * 60)) * 100;

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pomodoro Timer</h1>
          <p className="text-gray-600 mt-1">Stay focused and productive</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Timer Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Duration (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={workDuration}
                onChange={(e) => setWorkDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break Duration (min)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={breakDuration}
                onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Long Break (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sessions Until Long Break
              </label>
              <input
                type="number"
                min="2"
                max="8"
                value={sessionsUntilLongBreak}
                onChange={(e) => setSessionsUntilLongBreak(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            {/* Session Type */}
            <div className="mb-6">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                sessionType === 'work' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {sessionType === 'work' ? 'Work Session' : 'Break Time'}
              </span>
            </div>

            {/* Timer Display */}
            <div className="mb-8">
              <div className="text-6xl font-bold text-gray-900 mb-4">
                {formatTime(time)}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    sessionType === 'work' ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={isActive ? handlePause : handleStart}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isActive ? (
                  isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
                <span>{isActive ? (isPaused ? 'Resume' : 'Pause') : 'Start'}</span>
              </button>

              <button
                onClick={handleStop}
                disabled={!isActive}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SquareIcon className="w-5 h-5" />
                <span>Stop</span>
              </button>

              <button
                onClick={handleSkip}
                disabled={!isActive}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SkipForwardIcon className="w-5 h-5" />
                <span>Skip</span>
              </button>
            </div>
          </div>
        </div>

        {/* Task Selection & Stats */}
        <div className="space-y-6">
          {/* Task Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Link to Task</h3>
            <select
              value={selectedTask?.id || ''}
              onChange={(e) => {
                const task = tasks.find(t => t.id === e.target.value);
                setSelectedTask(task || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No task selected</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
            {selectedTask && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">{selectedTask.title}</p>
                <p className="text-xs text-blue-700 mt-1">{selectedTask.subject}</p>
              </div>
            )}
          </div>

          {/* Session Stats */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Session Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sessions Today</span>
                <span className="font-medium">{sessionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Session</span>
                <span className="font-medium">{sessionType === 'work' ? 'Work' : 'Break'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Next Break</span>
                <span className="font-medium">
                  {sessionType === 'work' ? 'After this session' : 'In progress'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
