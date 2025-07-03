import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { UserGroupIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Computer Science Student',
      university: 'MIT',
      avatar: '👩‍💻',
      rating: 5,
      text: 'TaskTide completely transformed my study routine! The AI assistant helps me break down complex projects into manageable tasks. I\'ve increased my productivity by 60% this semester.',
      highlight: 'Increased productivity by 60%'
    },
    {
      name: 'Marcus Johnson',
      role: 'MBA Candidate',
      university: 'Stanford',
      avatar: '👨‍🎓',
      rating: 5,
      text: 'The Pomodoro timer with ambient sounds is a game-changer. I can focus for hours now. The analytics feature shows me exactly when I\'m most productive. Love the premium design!',
      highlight: 'Perfect focus tool'
    },
    {
      name: 'Elena Rodriguez',
      role: 'PhD Student',
      university: 'Oxford',
      avatar: '👩‍🔬',
      rating: 5,
      text: 'As someone juggling research, teaching, and coursework, TaskTide keeps me organized. The calendar integration and team collaboration features are absolutely essential for my work.',
      highlight: 'Essential for research'
    },
    {
      name: 'David Kim',
      role: 'Software Engineer',
      university: 'Google',
      avatar: '👨‍💼',
      rating: 5,
      text: 'I\'ve tried every productivity app out there. TaskTide is the first one that actually feels premium and polished. The AI suggestions are surprisingly accurate and helpful.',
      highlight: 'Most polished app'
    },
    {
      name: 'Priya Patel',
      role: 'Medical Student',
      university: 'Harvard Medical',
      avatar: '👩‍⚕️',
      rating: 5,
      text: 'Studying medicine requires intense focus and organization. TaskTide\'s smart task prioritization and deadline reminders have been crucial for managing my heavy course load.',
      highlight: 'Crucial for medical school'
    },
    {
      name: 'Alex Thompson',
      role: 'Startup Founder',
      university: 'Y Combinator',
      avatar: '👨‍🚀',
      rating: 5,
      text: 'Running a startup means wearing many hats. TaskTide helps me prioritize what matters most. The team features let my co-founders and I stay aligned on our goals and deadlines.',
      highlight: 'Perfect for startups'
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
    <section id="testimonials" className="py-24 relative">
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
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl">
              <UserGroupIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Loved by Students &
            <span className="text-gradient ml-3">Professionals</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Join thousands of ambitious individuals who've transformed their productivity 
            with TaskTide. Here's what they have to say about their experience.
          </p>

          {/* Overall Rating */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} className="w-6 h-6 text-yellow-400" />
              ))}
            </div>
            <span className="text-2xl font-bold text-white">4.9/5</span>
          </div>
          <p className="text-gray-400">Based on 2,500+ authentic reviews</p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03,
                rotateY: 2,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              <div className="glass rounded-2xl p-6 h-full border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-glow">
                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-400 opacity-50" />
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon 
                        key={i} 
                        className={`w-4 h-4 ${
                          i <= testimonial.rating ? 'text-yellow-400' : 'text-gray-600'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-gray-300 leading-relaxed mb-6 group-hover:text-white transition-colors duration-300">
                  "{testimonial.text}"
                </blockquote>

                {/* Highlight Badge */}
                <div className="mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-primary-300 border border-primary-500/30">
                    ✨ {testimonial.highlight}
                  </span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors duration-300">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-gray-500">
                      {testimonial.university}
                    </p>
                  </div>
                </div>

                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500"></div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-opacity duration-500 -z-10"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Join the Productivity Revolution
            </h3>
            <p className="text-gray-300 mb-6">
              Be part of a community that's redefining what it means to be productive. 
              Your success story could be next!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                '🎓 Students',
                '💼 Professionals', 
                '🚀 Entrepreneurs',
                '👥 Teams',
                '🔬 Researchers',
                '🎯 Goal Achievers'
              ].map((tag) => (
                <span 
                  key={tag}
                  className="px-4 py-2 bg-white/10 rounded-full text-gray-300 hover:bg-white/20 transition-colors duration-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
