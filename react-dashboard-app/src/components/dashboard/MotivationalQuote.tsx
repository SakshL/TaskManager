import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Share, Heart, Copy } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface MotivationalQuoteProps {
  quote?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({ 
  quote, 
  loading = false, 
  onRefresh 
}) => {
  const { success } = useToast();
  const [liked, setLiked] = useState(false);
  const [displayQuote, setDisplayQuote] = useState('');
  
  const defaultQuotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Don't stop when you're tired. Stop when you're done."
  ];

  useEffect(() => {
    if (quote) {
      setDisplayQuote(quote);
    } else {
      const randomQuote = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
      setDisplayQuote(randomQuote);
    }
  }, [quote]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayQuote);
      success('Copied!', 'Quote copied to clipboard');
    } catch (error) {
      console.error('Failed to copy quote:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Motivational Quote',
          text: displayQuote,
          url: window.location.href
        });
      } catch (error) {
        console.error('Failed to share:', error);
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      success('Liked!', 'Quote added to your favorites');
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="500">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 border border-white/20 relative overflow-hidden group" data-aos="fade-up" data-aos-delay="500">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Daily Inspiration
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fuel your motivation
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
              liked 
                ? 'bg-red-500/20 text-red-600' 
                : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-red-500/20 hover:text-red-600'
            }`}
            title="Like this quote"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-blue-500/20 hover:text-blue-600 transition-all duration-300 hover:scale-110"
            title="Share quote"
          >
            <Share className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-green-500/20 hover:text-green-600 transition-all duration-300 hover:scale-110"
            title="Copy quote"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-purple-500/20 hover:text-purple-600 transition-all duration-300 hover:scale-110 hover:rotate-180"
              title="Get new quote"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quote */}
      <div className="relative z-10">
        <blockquote className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed mb-6 relative">
          <div className="absolute -top-2 -left-2 text-4xl text-purple-500/30 font-serif">"</div>
          <div className="absolute -bottom-4 -right-2 text-4xl text-purple-500/30 font-serif rotate-180">"</div>
          <span className="relative z-10 italic">
            {displayQuote}
          </span>
        </blockquote>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
      <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

      {/* Interactive particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-purple-500/30 rounded-full animate-pulse`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>

      {/* Bottom gradient bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default MotivationalQuote;
