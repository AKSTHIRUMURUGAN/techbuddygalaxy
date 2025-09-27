'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Users, Building2, Lightbulb, Zap } from 'lucide-react';
import Link from 'next/link';
import Typewriter from './Typewriter';

const Hero = ({ scrollToSection }) => {
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 lg:pt-48 lg:pb-36">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="mb-6">
              <span className="inline-block text-sm font-semibold tracking-wider text-purple-400 mb-4">
                Your One-Stop Innovation Partner
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
                <span className="gradient-text">Tech Buddy</span>
                <br />
                <span className="text-white">Galaxy</span>
              </h1>
              <div className="relative max-w-2xl mx-auto lg:mx-0">
                <blockquote className="text-lg md:text-xl text-gray-300 italic mb-4 border-l-4 border-purple-500 pl-4 py-2">
                  "Give me 100 energetic youth and I shall transform India."
                  <footer className="mt-2 text-purple-400 not-italic">- Swami Vivekananda</footer>
                </blockquote>
                <p className="text-lg md:text-xl text-gray-300">
                  We turn ideas into billion-dollar realities with Gen-Z creativity and cutting-edge technology.
                </p>
              </div>
            </div>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              A student-founded IT powerhouse built on Gen-Z creativity, dedication, and out-of-the-box thinking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <button 
                onClick={() => scrollToSection('contact')}
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 glow-ring"
              >
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="inline-flex items-center justify-center px-8 py-4 border border-purple-500/30 text-purple-300 font-semibold rounded-full hover:bg-purple-500/10 transition-all duration-300"
              >
                Explore Services
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-65 text-gray-300">
              <div className="flex items-start p-4 h-full w-fit rounded-xl bg-slate-800/50 border border-purple-500/10 glow-ring">
                <div className="bg-purple-500/10 p-3 rounded-lg mr-4 flex-shrink-0">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-white whitespace-nowrap">50+</div>
                  <div className="text-sm whitespace-nowrap">Startups & Enterprises</div>
                </div>
              </div>
              <div className="flex items-start p-4 h-full w-fit rounded-xl bg-slate-800/50 border border-purple-500/10 glow-ring">
                <div className="bg-green-500/10 p-3 rounded-lg mr-4 flex-shrink-0">
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-white whitespace-nowrap">100+</div>
                  <div className="text-sm whitespace-nowrap">Projects Delivered</div>
                </div>
              </div>
              <div className="flex items-start p-4 h-full w-fit rounded-xl bg-slate-800/50 border border-purple-500/10 glow-ring">
                <div className="bg-blue-500/10 p-3 rounded-lg mr-4 flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-white whitespace-nowrap">24/7</div>
                  <div className="text-sm whitespace-nowrap">Support Available</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/20">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop&fm=webp"
                  alt="Business professionals collaborating on digital transformation"
                  className="w-full h-auto object-cover"
                  fetchPriority="high"
                  loading="eager"
                  width="800"
                  height="533"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                  <p className="text-white text-sm md:text-base italic">
                    <span className="text-purple-300 font-medium">"The best way to predict the future is to create it."</span>
                    <br />
                    <span className="text-gray-300 text-xs md:text-sm">- Peter Drucker</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500/20 rounded-full filter blur-3xl -z-10"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full filter blur-3xl -z-10"></div>
            
            {/* Floating elements */}
            <motion.div 
              className="absolute -bottom-8 -left-8 bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-lg z-20 border border-purple-500/20 glow-ring"
              initial={{ y: 0 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-400">Performance</p>
                  <p className="font-semibold text-white">+42% Faster</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute -top-8 right-8 bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-lg z-20 border border-green-500/20 glow-ring"
              initial={{ y: 0 }}
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="flex items-center">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-400">Uptime</p>
                  <p className="font-semibold text-white">99.99%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <a href="#about" className="text-purple-400 hover:text-purple-300 transition-colors">
          <ChevronDown className="h-8 w-8" />
        </a>
      </div>
    </section>
  );
}
export default Hero;
