import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Target, Clock, Brain, Calendar, CheckCircle, Sparkles, BookOpen, Coffee, Star } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

interface WelcomeFlowProps {
  onComplete: () => void;
}

const WelcomeFlow: React.FC<WelcomeFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userPreferences, setUserPreferences] = useState({
    goals: [] as string[],
    workStyle: '',
    subjects: [] as string[],
    pomodoroLength: 25
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to TaskTide! 🌊',
      description: 'Your premium productivity companion for academic success',
      icon: Sparkles,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Let's get you set up for success! 🚀
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              TaskTide combines task management, focus techniques, and AI assistance to help you excel academically.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Smart Goals</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Focus Timer</p>
              </div>
              <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20">
                <Brain className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-900 dark:text-green-300">AI Assistant</p>
              </div>
              <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20">
                <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-orange-900 dark:text-orange-300">Smart Calendar</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'goals',
      title: 'What are your main goals?',
      description: 'Help us personalize your experience',
      icon: Target,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              What do you want to achieve?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Select all that apply (we'll customize your dashboard accordingly)
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'better-grades', label: 'Improve my grades', icon: Star },
              { id: 'time-management', label: 'Better time management', icon: Clock },
              { id: 'study-habits', label: 'Build better study habits', icon: BookOpen },
              { id: 'focus', label: 'Increase focus and concentration', icon: Target },
              { id: 'stress-management', label: 'Manage academic stress', icon: Coffee },
              { id: 'exam-prep', label: 'Ace my exams', icon: CheckCircle }
            ].map((goal) => {
              const Icon = goal.icon;
              const isSelected = userPreferences.goals.includes(goal.id);
              
              return (
                <button
                  key={goal.id}
                  onClick={() => {
                    setUserPreferences(prev => ({
                      ...prev,
                      goals: isSelected 
                        ? prev.goals.filter(g => g !== goal.id)
                        : [...prev.goals, goal.id]
                    }));
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-medium ${
                    isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                  }`}>
                    {goal.label}
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )
    },
    {
      id: 'work-style',
      title: 'How do you prefer to work?',
      description: 'We\'ll optimize your Pomodoro settings',
      icon: Clock,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <Clock className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              What's your ideal work style?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              This helps us set up the perfect focus sessions for you
            </p>
          </div>
          
          <div className="space-y-3">
            {[
              { id: 'short-bursts', label: 'Short, intense bursts (15-20 min)', time: 15 },
              { id: 'standard', label: 'Standard Pomodoro (25 min)', time: 25 },
              { id: 'longer-focus', label: 'Longer focus sessions (45-60 min)', time: 45 },
              { id: 'flexible', label: 'I prefer flexible timing', time: 25 }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => {
                  setUserPreferences(prev => ({
                    ...prev,
                    workStyle: style.id,
                    pomodoroLength: style.time
                  }));
                }}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left w-full ${
                  userPreferences.workStyle === style.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    userPreferences.workStyle === style.id 
                      ? 'text-purple-900 dark:text-purple-300' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {style.label}
                  </span>
                  {userPreferences.workStyle === style.id && (
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You\'re all set! 🎉',
      description: 'Welcome to your productivity journey',
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome aboard! 🚀
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Your TaskTide dashboard is ready! Here's what you can do next:
            </p>
            <div className="grid grid-cols-1 gap-3 mt-8">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-left">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Create your first task</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Start organizing your academic goals</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-left">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Try a focus session</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Start your {userPreferences.pomodoroLength}-minute Pomodoro timer</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 text-left">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Ask the AI assistant</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Get help with studying, planning, and more</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      // Save preferences and complete onboarding
      localStorage.setItem('tasktide_onboarding_completed', 'true');
      localStorage.setItem('tasktide_user_preferences', JSON.stringify(userPreferences));
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                <currentStepData.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {currentStepData.description}
                </p>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {currentStep + 1} of {steps.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              isFirstStep
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:scale-105 transition-transform duration-200"
          >
            {isLastStep ? 'Get Started' : 'Continue'}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeFlow;
