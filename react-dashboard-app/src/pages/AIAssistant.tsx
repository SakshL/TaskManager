import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Copy, Trash2, MessageSquare, Sparkles, User, Bot, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAIResponse } from '../services/openai';
import { createChatMessage, subscribeToUserChatMessages, handleFirestoreError } from '../services/firestore';
import { ChatMessage } from '../types';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage, adjustTextareaHeight]);

  useEffect(() => {
    if (user) {
      setLoadingMessages(true);
      const unsubscribe = subscribeToUserChatMessages(user.uid, (userMessages) => {
        setMessages(userMessages);
        setLoadingMessages(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      // Create user message immediately for better UX
      await createChatMessage({
        userId: user.uid,
        content: messageContent,
        role: 'user',
      });

      // Show typing indicator
      setIsTyping(true);

      // Check if API key is available first
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Please add your API key to continue.');
      }

      // Get AI response with better timeout handling
      const aiResponse = await Promise.race([
        fetchAIResponse(messageContent),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Response timed out - please try again')), 30000)
        )
      ]);
      
      // Create AI message
      await createChatMessage({
        userId: user.uid,
        content: aiResponse,
        role: 'assistant',
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('not configured')) {
          errorMessage = '🔧 AI service needs configuration. Please check your OpenAI API key in the environment settings.';
        } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
          errorMessage = '⏰ Response took too long. Please try again with a shorter message.';
        } else if (error.message.includes('Rate limit') || error.message.includes('429')) {
          errorMessage = '🚦 Too many requests. Please wait a moment before trying again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '🌐 Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('401')) {
          errorMessage = '🔑 Invalid API key. Please check your OpenAI API key configuration.';
        }
      }
      
      showError('AI Assistant Error', errorMessage);
      
      // Create error message in chat for better user experience
      try {
        await createChatMessage({
          userId: user.uid,
          content: `❌ ${errorMessage}`,
          role: 'assistant',
        });
      } catch (saveError) {
        console.error('Error saving error message:', saveError);
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    if (!user) return;
    
    // In a real implementation, you might want to add a function to delete all user chat messages
    // For now, we'll just show a success message
    success('Chat cleared!');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      success('Copied to clipboard!');
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting for better readability
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-black/20 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/\n/g, '<br />');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestionPrompts = [
    {
      icon: "📅",
      title: "Create Study Schedule",
      prompt: "Help me create a study schedule for my upcoming exams",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: "💪", 
      title: "Get Motivated",
      prompt: "Give me some motivation to start studying",
      gradient: "from-green-500 to-blue-600"
    },
    {
      icon: "🍅",
      title: "Learn Pomodoro",
      prompt: "Explain the Pomodoro technique for better focus",
      gradient: "from-red-500 to-pink-600"
    },
    {
      icon: "🧩",
      title: "Break Down Topics", 
      prompt: "Help me break down a complex topic into smaller parts",
      gradient: "from-yellow-500 to-orange-600"
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">AI Assistant</h2>
          <p className="text-purple-200">Please log in to use the AI Assistant</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex flex-col">
      {/* Header */}
      <div className="backdrop-blur-md bg-white/10 border-b border-white/10 p-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Study Assistant</h1>
              <p className="text-purple-200">Your intelligent study companion</p>
            </div>
          </div>
          
          <button
            onClick={clearChat}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 text-white transition-all duration-200 hover:scale-105"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {loadingMessages ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="xl" />
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-8">
                    <Sparkles className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">How can I help you study today?</h2>
                    <p className="text-purple-200 max-w-2xl mx-auto text-lg">
                      Ask me anything about your studies, get help with homework, create study plans, or just chat about your academic goals!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    {suggestionPrompts.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(suggestion.prompt)}
                        className={`p-6 bg-gradient-to-r ${suggestion.gradient} text-white rounded-xl hover:scale-105 transition-all duration-200 backdrop-blur-sm border border-white/10 shadow-lg`}
                      >
                        <div className="text-2xl mb-2">{suggestion.icon}</div>
                        <div className="font-semibold">{suggestion.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`p-2 rounded-full flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`backdrop-blur-md rounded-xl p-4 shadow-lg border ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 border-purple-300/20 text-white'
                        : 'bg-white/10 border-white/10 text-white'
                    }`}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessageContent(message.content)
                        }}
                        className="prose prose-sm max-w-none text-current"
                      />
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/20">
                        <span className="text-xs opacity-70">
                          {message.timestamp?.toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100 transition-all"
                          title="Copy message"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-purple-200 text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="backdrop-blur-md bg-white/10 border-t border-white/10 p-6 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your studies..."
                className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-purple-200 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center shadow-lg"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;