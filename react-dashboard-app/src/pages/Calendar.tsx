import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, MoreVertical, Edit3, Trash2, ExternalLink } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { googleCalendarService, CalendarEvent } from '../services/calendar';
import { subscribeToUserTasks } from '../services/firestore';
import { Task } from '../types';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    if (user) {
      initializeCalendar();
      loadTasks();
    }
  }, [user]);

  const initializeCalendar = async () => {
    try {
      setLoading(true);
      await googleCalendarService.initializeGapi();
      setIsSignedIn(googleCalendarService.isSignedIn());
      
      if (googleCalendarService.isSignedIn()) {
        await loadEvents();
      }
    } catch (error) {
      console.error('Failed to initialize calendar:', error);
      showError('Failed to initialize Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = () => {
    if (!user) return;
    
    const unsubscribe = subscribeToUserTasks(user.uid, (userTasks) => {
      setTasks(userTasks);
    });

    return () => unsubscribe();
  };

  const loadEvents = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const calendarEvents = await googleCalendarService.getEvents(
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      showError('Failed to load calendar events');
    }
  };

  const signInToGoogle = async () => {
    try {
      const signInSuccess = await googleCalendarService.signIn();
      if (signInSuccess) {
        setIsSignedIn(true);
        await loadEvents();
        success('Successfully connected to Google Calendar!');
      } else {
        showError('Failed to sign in to Google Calendar');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      showError('Failed to sign in to Google Calendar');
    }
  };

  const signOutFromGoogle = async () => {
    try {
      await googleCalendarService.signOut();
      setIsSignedIn(false);
      setEvents([]);
      success('Signed out from Google Calendar');
    } catch (error) {
      console.error('Sign-out error:', error);
      showError('Failed to sign out from Google Calendar');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    if (!date) return [];
    
    const dateStr = date.toDateString();
    const calendarEvents = events.filter(event => {
      const eventDate = event.start.dateTime 
        ? new Date(event.start.dateTime)
        : new Date(event.start.date!);
      return eventDate.toDateString() === dateStr;
    });
    
    const taskEvents = tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return taskDate.toDateString() === dateStr;
    });
    
    return [...calendarEvents, ...taskEvents];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Calendar</h2>
          <p className="text-blue-200">Please log in to view your calendar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Calendar</h1>
                <p className="text-blue-200">Manage your schedule and deadlines</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!isSignedIn ? (
                <button
                  onClick={signInToGoogle}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Connect Google Calendar</span>
                </button>
              ) : (
                <button
                  onClick={signOutFromGoogle}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-all duration-200"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-semibold text-white min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-all duration-200"
            >
              Today
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="xl" />
          </div>
        ) : (
          <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/10 overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-white/5">
              {dayNames.map((day) => (
                <div key={day} className="p-4 text-center font-semibold text-white border-r border-white/10 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const isToday = day && day.toDateString() === new Date().toDateString();
                const dayEvents = day ? getEventsForDate(day) : [];
                const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-r border-b border-white/10 last:border-r-0 transition-all duration-200 ${
                      day ? 'cursor-pointer hover:bg-white/5' : ''
                    } ${isToday ? 'bg-blue-500/20' : ''} ${!isCurrentMonth ? 'opacity-50' : ''}`}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day && (
                      <>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                          isToday 
                            ? 'bg-blue-500 text-white' 
                            : 'text-white hover:bg-white/10'
                        }`}>
                          {day.getDate()}
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event, eventIndex) => {
                            const isTask = 'priority' in event;
                            return (
                              <div
                                key={eventIndex}
                                className={`text-xs p-1 rounded text-white truncate ${
                                  isTask 
                                    ? event.priority === 'high'
                                      ? 'bg-red-500/80'
                                      : event.priority === 'medium'
                                      ? 'bg-yellow-500/80'
                                      : 'bg-green-500/80'
                                    : 'bg-blue-500/80'
                                }`}
                                title={isTask ? event.title : event.summary}
                              >
                                {isTask ? event.title : event.summary}
                              </div>
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-blue-200 text-center">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Google Calendar Status */}
        {!isSignedIn && (
          <div className="mt-6 backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <ExternalLink className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Connect Your Google Calendar</h3>
                <p className="text-blue-200 text-sm">
                  Connect your Google Calendar to sync events and create a unified schedule view
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/10">
          <h3 className="font-semibold text-white mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-blue-200 text-sm">Calendar Events</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-blue-200 text-sm">High Priority Tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-blue-200 text-sm">Medium Priority Tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-blue-200 text-sm">Low Priority Tasks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;