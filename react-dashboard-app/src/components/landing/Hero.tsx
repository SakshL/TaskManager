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

          {/* Interactive Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
            className="mt-20 relative"
          >
            <div className="glass rounded-3xl p-8 max-w-5xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl relative overflow-hidden">
                {/* Interactive Dashboard Preview */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 opacity-50"></div>
                <div className="absolute inset-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-8 h-8 bg-gradient-to-r from-primary-400 to-accent-400 rounded-lg flex items-center justify-center"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <SparklesIcon className="w-5 h-5 text-white" />
                      </motion.div>
                      <span className="text-white font-semibold">TaskTide Dashboard</span>
                    </div>
                    <motion.div 
                      className="flex items-center gap-2 bg-success-500/20 px-3 py-1 rounded-full"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
                      <span className="text-success-400 text-sm font-medium">Live</span>
                    </motion.div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4 h-20">
                    <motion.div 
                      className="bg-gradient-to-r from-primary-500/30 to-primary-600/30 rounded-xl p-3 border border-primary-400/20"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                    >
                      <div className="text-primary-300 text-xs">Tasks Today</div>
                      <div className="text-white font-bold text-lg">12/18</div>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-r from-accent-500/30 to-accent-600/30 rounded-xl p-3 border border-accent-400/20"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    >
                      <div className="text-accent-300 text-xs">Focus Time</div>
                      <div className="text-white font-bold text-lg">4.2h</div>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-r from-success-500/30 to-success-600/30 rounded-xl p-3 border border-success-400/20"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                    >
                      <div className="text-success-300 text-xs">Streak</div>
                      <div className="text-white font-bold text-lg">7 days</div>
                    </motion.div>
                  </div>
                  
                  {/* Task List */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-2">
                      <motion.div 
                        className="w-4 h-4 border-2 border-success-400 rounded"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, delay: 3 }}
                      >
                        <motion.div
                          className="w-full h-full bg-success-400 rounded-sm"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 3.5 }}
                        />
                      </motion.div>
                      <span className="text-white/80 text-sm">Complete React dashboard</span>
                      <div className="ml-auto bg-primary-500/20 px-2 py-1 rounded text-xs text-primary-300">High</div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                      <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                      <span className="text-white/60 text-sm">Review AI integration</span>
                      <div className="ml-auto bg-accent-500/20 px-2 py-1 rounded text-xs text-accent-300">Med</div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                      <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                      <span className="text-white/60 text-sm">Update documentation</span>
                      <div className="ml-auto bg-yellow-500/20 px-2 py-1 rounded text-xs text-yellow-300">Low</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Action Indicators */}
                <motion.div 
                  className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-success-400 to-success-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 10px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckBadgeIcon className="w-6 h-6 text-white" />
                </motion.div>
                
                <motion.div 
                  className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full flex items-center justify-center"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <SparklesIcon className="w-4 h-4 text-white" />
                </motion.div>

                <motion.div 
                  className="absolute top-1/2 right-8 w-6 h-6 bg-primary-400 rounded-full"
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                />
              </div>
              
              <div className="mt-6 text-center">
                <motion.p 
                  className="text-gray-300 text-sm"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🔥 Live preview of TaskTide's premium dashboard
                </motion.p>
                <p className="text-gray-400 text-xs mt-1">
                  Real-time task management • AI-powered insights • Beautiful analytics
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
