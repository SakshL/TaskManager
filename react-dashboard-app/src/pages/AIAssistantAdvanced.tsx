import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Calculator, Lightbulb, History, Trash2, Copy, Download, Mic, MicOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { fetchAIResponse } from '../services/openai';
import { createChatMessage, subscribeToUserChatMessages } from '../services/firestore';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'study-plan' | 'quiz' | 'explanation';
}

const AIAssistantAdvanced: React.FC = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat history from Firestore
  useEffect(() => {
    if (user) {
      console.log('🔥 Loading chat messages for user:', user.uid);
      const unsubscribe = subscribeToUserChatMessages(user.uid, (chatMessages) => {
        console.log('✅ Received chat messages:', chatMessages.length, chatMessages);
        // Convert ChatMessage[] to Message[]
        const formattedMessages = chatMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp
        }));
        setMessages(formattedMessages);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        showError('Error', 'Speech recognition failed');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [showError]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message if no chat history
  useEffect(() => {
    if (user && messages.length === 0) {
      // Only show welcome message if no existing chat history
      setTimeout(() => {
        if (messages.length === 0) {
          const welcomeMessage: Message = {
            id: 'welcome',
            content: `Hello ${user?.displayName?.split(' ')[0] || 'there'}! 👋 I'm your AI study assistant. I can help you with:

• 📚 **Study Planning** - Create personalized study schedules
• 🧠 **Concept Explanations** - Break down complex topics
• ❓ **Practice Questions** - Generate quizzes and exercises
• 💡 **Study Tips** - Improve your learning techniques
• 📝 **Essay Help** - Structure and improve your writing
• 🔢 **Math & Science** - Solve problems step-by-step

What would you like to work on today?`,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        }
      }, 1000);
    }
  }, [user, messages.length]);

  const quickActions = [
    {
      icon: BookOpen,
      label: 'Create Study Plan',
      prompt: 'Create a detailed study plan for my upcoming exams. I need help organizing my study schedule.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Calculator,
      label: 'Solve Math Problem',
      prompt: 'Help me solve a math problem step-by-step. Please explain each step clearly.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Lightbulb,
      label: 'Explain Concept',
      prompt: 'Explain a complex concept in simple terms. Break it down so I can understand it better.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Sparkles,
      label: 'Generate Quiz',
      prompt: 'Create a practice quiz for me on a specific topic. Include multiple choice and short answer questions.',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    // Save user message to Firestore
    try {
      await createChatMessage({
        userId: user.uid,
        content: inputValue,
        role: 'user'
      });
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    setInputValue('');
    setIsLoading(true);

    try {
      const enhancedPrompt = `You are an intelligent study assistant for students. The user said: "${inputValue}"

Please provide a helpful, educational response that:
- Is clear and easy to understand
- Uses examples when appropriate
- Includes actionable advice
- Is encouraging and supportive
- Uses emojis sparingly but effectively

Respond in a friendly, professional tone.`;

      const response = await fetchAIResponse(enhancedPrompt);
      
      // Save AI response to Firestore
      try {
        await createChatMessage({
          userId: user.uid,
          content: response,
          role: 'assistant'
        });
      } catch (error) {
        console.error('Error saving AI message:', error);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      showError('Error', 'Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearChat = () => {
    if (messages.length > 1) {
      setChatHistory(prev => [...prev, messages]);
      setMessages([messages[0]]); // Keep welcome message
      success('Cleared!', 'Chat cleared and saved to history');
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    success('Copied!', 'Message copied to clipboard');
  };

  const exportChat = () => {
    const chatText = messages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}\n`
    ).join('\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    success('Exported!', 'Chat saved to file');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="text-center mb-6" data-aos="fade-down">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI Study Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your intelligent study companion powered by advanced AI 🤖
          </p>
        </div>

        {/* Main Chat Container */}
        <div className="flex-1 glass rounded-3xl border border-white/20 overflow-hidden flex flex-col" data-aos="fade-up">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Always here to help you learn</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportChat}
                className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:scale-110 transition-transform duration-200"
                title="Export chat"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={clearChat}
                className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 hover:scale-110 transition-transform duration-200"
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  className={`p-3 rounded-2xl bg-gradient-to-r ${action.color} text-white hover:scale-105 transition-all duration-200 text-left`}
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <action.icon className="w-5 h-5 mb-2" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                data-aos="fade-up"
              >
                {/* Avatar */}
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white ml-8'
                      : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 mr-8'
                  }`}>
                    <div className={`prose prose-sm max-w-none ${
                      message.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {message.content.split('\n').map((line, index) => (
                        <p key={index} className="mb-2 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                        title="Copy message"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-4" data-aos="fade-up">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1 max-w-3xl">
                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 mr-8">
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-gray-600 dark:text-gray-400">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your studies..."
                  rows={1}
                  className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
                  style={{ minHeight: '60px', maxHeight: '120px' }}
                />
              </div>
              
              {/* Voice Input */}
              {recognitionRef.current && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-4 rounded-2xl transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:scale-105'
                  }`}
                  title={isListening ? 'Stop recording' : 'Start voice input'}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantAdvanced;
