import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon,
  CheckBadgeIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Stats: React.FC = () => {
  const stats = [
    {
      icon: UserGroupIcon,
      value: '10,000+',
      label: 'Active Users',
      subtext: 'Growing daily',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CheckBadgeIcon,
      value: '2.5M+',
      label: 'Tasks Completed',
      subtext: 'This month',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: ClockIcon,
      value: '50,000+',
      label: 'Hours Saved',
      subtext: 'By our users',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: StarIcon,
      value: '4.9/5',
      label: 'User Rating',
      subtext: 'From 2,500 reviews',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: 'easeOut'
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                <div className="glass rounded-2xl p-8 text-center hover:shadow-glow transition-all duration-500 border border-white/10 hover:border-white/20">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Value */}
                  <motion.div
                    initial={{ scale: 1 }}
                    whileInView={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors duration-300"
                  >
                    {stat.value}
                  </motion.div>

                  {/* Label */}
                  <h3 className="text-lg font-semibold text-gray-300 mb-1 group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </h3>

                  {/* Subtext */}
                  <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                    {stat.subtext}
                  </p>

                  {/* Background Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
                </div>

                {/* Outer Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-opacity duration-500 -z-10`}></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
