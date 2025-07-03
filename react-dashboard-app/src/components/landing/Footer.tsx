import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Integrations', href: '/integrations' },
      { name: 'API Docs', href: '/api' },
      { name: 'Changelog', href: '/changelog' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
      { name: 'Contact', href: '/contact' }
    ],
    resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'Community', href: '/community' },
      { name: 'Tutorials', href: '/tutorials' },
      { name: 'Templates', href: '/templates' },
      { name: 'Status', href: '/status' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/tasktide', icon: '🐦' },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/tasktide', icon: '💼' },
    { name: 'YouTube', href: 'https://youtube.com/tasktide', icon: '📺' },
    { name: 'Discord', href: 'https://discord.gg/tasktide', icon: '💬' },
    { name: 'GitHub', href: 'https://github.com/tasktide', icon: '⚡' }
  ];

  return (
    <footer className="relative py-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <SparklesIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">TaskTide</span>
                  <div className="text-xs text-primary-400 font-medium">Premium Edition</div>
                </div>
              </Link>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                The ultimate productivity platform for ambitious students and professionals. 
                Transform your workflow with AI-powered insights, beautiful design, and powerful features.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">10K+</div>
                  <div className="text-xs text-gray-400">Active Users</div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">2.5M+</div>
                  <div className="text-xs text-gray-400">Tasks Done</div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:scale-110 hover:bg-white/10 transition-all duration-300 group"
                    aria-label={social.name}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold text-lg mb-6 capitalize">
                {category}
              </h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                    >
                      {link.name}
                      {link.href.startsWith('http') && (
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 mb-12"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Stay Updated with TaskTide
            </h3>
            <p className="text-gray-300 mb-6">
              Get the latest productivity tips, feature updates, and exclusive content delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-glass flex-1 text-center sm:text-left"
              />
              <button className="btn-primary px-6 py-3 whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-gray-400">
              <span>© 2024 TaskTide.</span>
              <span>Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
              <span>for productivity enthusiasts.</span>
            </div>

            {/* Additional Info */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="w-4 h-4" />
                <span>Global • 24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50"></div>
    </footer>
  );
};

export default Footer;
