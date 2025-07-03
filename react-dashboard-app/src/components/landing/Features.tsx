import React from 'react';
import { motion } from 'framer-motion';
import { 
  RocketLaunchIcon,
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  CpuChipIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Features: React.FC = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Task Management',
      description: 'Smart task suggestions, automatic prioritization, and intelligent deadline recommendations powered by advanced AI.',
      color: 'from-purple-500 to-pink-500',
      stats: '95% accuracy'
    },
    {
      icon: ClockIcon,
      title: 'Premium Pomodoro Timer',
      description: 'Customizable focus sessions with ambient sounds, break reminders, and productivity analytics.',
      color: 'from-blue-500 to-cyan-500',
      stats: '25 min focused'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Beautiful charts and insights to track your productivity patterns, goals, and achievements over time.',
      color: 'from-green-500 to-emerald-500',
      stats: '10+ metrics'
    },
    {
      icon: CpuChipIcon,
      title: 'Smart AI Assistant',
      description: 'Get personalized productivity tips, task breakdowns, and motivational content tailored to your workflow.',
      color: 'from-orange-500 to-red-500',
      stats: 'GPT-4 powered'
    },
    {
      icon: CalendarDaysIcon,
      title: 'Intelligent Calendar',
      description: 'Seamless integration with Google Calendar, smart scheduling, and automatic time blocking for deep work.',
      color: 'from-indigo-500 to-purple-500',
      stats: 'Real-time sync'
    },
    {
      icon: UserGroupIcon,
      title: 'Team Collaboration',
      description: 'Share projects, assign tasks, track team progress, and collaborate in real-time with your study groups or colleagues.',
      color: 'from-teal-500 to-blue-500',
      stats: 'Unlimited teams'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Cross-Platform Sync',
      description: 'Access your tasks, projects, and data seamlessly across all your devices with real-time synchronization.',
      color: 'from-pink-500 to-rose-500',
      stats: 'Instant sync'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, secure cloud storage, and privacy-first design to keep your data safe and protected.',
      color: 'from-emerald-500 to-teal-500',
      stats: '256-bit SSL'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl">
              <RocketLaunchIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Features That Make You
            <span className="text-gradient ml-3">Unstoppable</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Every feature in TaskTide is carefully crafted to boost your productivity and help you achieve more. 
            From AI-powered insights to seamless collaboration, we've got you covered.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                <div className="glass rounded-2xl p-6 h-full border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-glow">
                  {/* Feature Icon */}
                  <div className="relative mb-6">
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 backdrop-blur-sm">
                        {feature.stats}
                      </span>
                    </div>
                  </div>

                  {/* Feature Content */}
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Hover Effect Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
                </div>

                {/* Background Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-opacity duration-500 -z-10`}></div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ArrowPathIcon className="w-6 h-6 text-primary-400" />
              <BoltIcon className="w-6 h-6 text-accent-400" />
              <SparklesIcon className="w-6 h-6 text-success-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              And Many More Powerful Features
            </h3>
            
            <p className="text-gray-300 mb-6">
              Custom themes, offline mode, keyboard shortcuts, integrations with 50+ apps, 
              advanced filtering, bulk actions, and much more waiting to be discovered.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {[
                '🎨 Custom Themes',
                '📱 Offline Mode', 
                '⌨️ Keyboard Shortcuts',
                '🔗 50+ Integrations',
                '🔍 Advanced Search',
                '📊 Data Export'
              ].map((feature) => (
                <span 
                  key={feature}
                  className="px-3 py-1 bg-white/10 rounded-full text-gray-300"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
