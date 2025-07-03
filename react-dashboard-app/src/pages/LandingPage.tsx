import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  RocketLaunchIcon, 
  BoltIcon, 
  SparklesIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Navigation from '../components/landing/Navigation';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Testimonials from '../components/landing/Testimonials';
import Stats from '../components/landing/Stats';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"></div>
      </div>
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-success-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <Hero />
        
        {/* Stats Section */}
        <Stats />
        
        {/* Features Section */}
        <Features />
        
        {/* Testimonials Section */}
        <Testimonials />
        
        {/* FAQ Section */}
        <FAQ />
        
        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-12 max-w-4xl mx-auto"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl">
                  <RocketLaunchIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your 
                <span className="text-gradient ml-3">Productivity?</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of students and professionals who've already discovered the power of TaskTide. 
                Start your journey to peak productivity today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/login"
                  className="group btn-primary text-lg px-8 py-4 flex items-center gap-2"
                >
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <button className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                  <BoltIcon className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckBadgeIcon className="w-5 h-5 text-success-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-accent-400" />
                  <span>Premium features included</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-primary-400" />
                  <span>10,000+ happy users</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
