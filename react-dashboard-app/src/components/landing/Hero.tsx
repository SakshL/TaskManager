import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  PlayIcon,
  ArrowRightIcon,
  StarIcon,
  CheckBadgeIcon,
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

const Hero: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  };

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: '👥' },
    { label: 'Tasks Completed', value: '2.5M+', icon: '✅' },
    { label: 'Time Saved', value: '50,000h', icon: '⏰' },
    { label: 'Satisfaction', value: '98%', icon: '⭐' }
  ];

  return (
    <section className="pt-32 pb-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 glass rounded-full px-6 py-3 mb-8">
              <SparklesIcon className="w-5 h-5 text-accent-400" />
              <span className="text-white font-medium">🎉 New AI Features Released!</span>
              <BoltIcon className="w-4 h-4 text-primary-400" />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            variants={itemVariants}
            className="heading-gradient mb-8 max-w-5xl mx-auto"
          >
            The Ultimate
            <br />
            <span className="relative">
              Productivity Platform
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <HeartIcon className="w-8 h-8 text-red-500" />
              </motion.div>
            </span>
            <br />
            for Gen Z
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="subheading mb-12 max-w-3xl mx-auto"
          >
            TaskTide combines AI-powered task management, Pomodoro timers, smart analytics, 
            and seamless collaboration in one beautiful, intuitive platform. Perfect for students, 
            professionals, and anyone ready to unlock their productivity potential.
          </motion.p>

          {/* Social Proof */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 border-2 border-white/20 flex items-center justify-center text-white font-bold"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-gray-300 ml-4">Join 10,000+ productive people</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
              <span className="text-gray-300 ml-2">4.9/5 from 2,500+ reviews</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Link
              to="/login"
              className="group btn-primary text-lg px-8 py-4 flex items-center gap-3 text-white shadow-glow"
            >
              <BoltIcon className="w-6 h-6" />
              Start Your Free Trial
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="group btn-glass text-lg px-8 py-4 flex items-center gap-3">
              <PlayIcon className="w-6 h-6" />
              Watch Demo
              <span className="text-sm opacity-75">(2 min)</span>
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="w-5 h-5 text-success-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <BoltIcon className="w-5 h-5 text-primary-400" />
                <span>Instant setup</span>
              </div>
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-accent-400" />
                <span>Premium features included</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Stats */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="glass rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Floating Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
            className="mt-20 relative"
          >
            <div className="glass rounded-3xl p-8 max-w-5xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl relative overflow-hidden">
                {/* Mock Dashboard Preview */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 opacity-50"></div>
                <div className="absolute inset-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-8 bg-white/20 rounded-lg w-32"></div>
                    <div className="h-8 bg-white/20 rounded-lg w-24"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 h-32">
                    <div className="bg-white/10 rounded-xl"></div>
                    <div className="bg-white/10 rounded-xl"></div>
                    <div className="bg-white/10 rounded-xl"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/15 rounded w-1/2"></div>
                    <div className="h-4 bg-white/15 rounded w-2/3"></div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-success-400 rounded-full animate-pulse opacity-80"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 bg-accent-400 rounded-full animate-bounce opacity-80"></div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-300 text-sm">
                  🔥 Live preview of TaskTide's premium dashboard
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
