import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const FAQ: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Is TaskTide really free to start?',
      answer: 'Yes! TaskTide offers a generous free tier with all core features including task management, Pomodoro timer, and basic analytics. You can upgrade to Premium for advanced AI features, unlimited projects, and team collaboration.'
    },
    {
      question: 'How does the AI assistant work?',
      answer: 'Our AI assistant is powered by advanced language models that analyze your tasks, deadlines, and productivity patterns to provide intelligent suggestions, task breakdowns, and personalized productivity tips. It learns from your behavior to become more helpful over time.'
    },
    {
      question: 'Can I use TaskTide on all my devices?',
      answer: 'Absolutely! TaskTide works seamlessly across web, mobile, and desktop platforms. All your data syncs in real-time, so you can start work on your laptop and continue on your phone without missing a beat.'
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Security is our top priority. We use enterprise-grade encryption, secure cloud storage, and follow strict privacy standards. Your data is never shared with third parties, and you have full control over your information.'
    },
    {
      question: 'Can I integrate TaskTide with other apps?',
      answer: 'Yes! TaskTide integrates with 50+ popular apps including Google Calendar, Slack, Notion, GitHub, and more. We also offer API access for custom integrations to fit your specific workflow needs.'
    },
    {
      question: 'What makes TaskTide different from other apps?',
      answer: 'TaskTide combines beautiful design with powerful functionality. Unlike other productivity apps, we focus on the student and professional experience with AI-powered insights, premium UI/UX, and features specifically designed for academic and career success.'
    },
    {
      question: 'Do you offer team and educational discounts?',
      answer: 'Yes! We offer special pricing for students, educational institutions, and teams. Students get 50% off Premium plans, and educational institutions can access our Campus plan with additional features and bulk pricing.'
    },
    {
      question: 'How do I get started?',
      answer: 'Getting started is super easy! Just sign up with your email or Google account, and you\'ll be guided through our intuitive onboarding process. You can start being productive within minutes of signing up.'
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl">
              <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked
            <span className="text-gradient ml-3">Questions</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Got questions? We've got answers! Here are the most common questions 
            about TaskTide and how it can transform your productivity.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-6 text-left focus:outline-none focus:ring-4 focus:ring-white/20 rounded-2xl transition-all duration-300 hover:bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white pr-8">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openItem === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {openItem === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Our support team is here to help! Reach out and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-6 py-3">
                Contact Support
              </button>
              <button className="btn-secondary px-6 py-3">
                Join Community
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
