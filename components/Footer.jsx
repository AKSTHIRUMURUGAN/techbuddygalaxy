'use client';

import { Facebook, Twitter, Linkedin, Github, Mail, MapPin, Phone, Send } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const NewFooter = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  const services = [
    { name: 'Web Development', href: '#web-development' },
    { name: 'Mobile Apps', href: '#mobile-apps' },
    { name: 'AI/ML Solutions', href: '#ai-ml' },
    { name: 'UI/UX Design', href: '#ui-ux' },
    { name: 'Cloud Services', href: '#cloud' },
  ];

  const contactInfo = [
    { 
      icon: <Mail className="w-5 h-5 text-purple-400" />, 
      text: 'techbuddygalaxy@gmail.com',
      href: 'mailto:techbuddygalaxy@gmail.com'
    },
    { 
      icon: <Phone className="w-5 h-5 text-purple-400" />, 
      text: '+91 96003 38406',
      href: 'tel:+919600338406'
    },
  ];

  const socialLinks = [
    { 
      name: 'GitHub', 
      icon: Github, 
      href: 'https://github.com/techbuddygalaxy',
      className: 'hover:bg-gray-700 hover:text-white'
    },
    { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      href: 'https://linkedin.com/company/techbuddygalaxy',
      className: 'hover:bg-blue-600 hover:text-white'
    },
    { 
      name: 'Twitter', 
      icon: Twitter, 
      href: 'https://twitter.com/techbuddygalaxy',
      className: 'hover:bg-sky-500 hover:text-white'
    },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribed with:', email);
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  return (
    <footer className="relative bg-gray-950 text-gray-300 border-t border-gray-800">
      {/* Glow gradient */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(50%_50%_at_50%_100%,black,transparent)]">
        <div className="h-40 w-full bg-gradient-to-t from-purple-600/20 to-transparent"></div>
      </div>

      {/* CTA strip */}
      <div className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="-translate-y-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-6 md:p-8 backdrop-blur supports-backdrop-blur:backdrop-blur-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-purple-300/80">Let’s build something amazing</p>
                <h3 className="mt-1 text-xl md:text-2xl font-semibold text-white">Turn your ideas into delightful digital products</h3>
              </div>
              <a href="#contact" className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-900/30 transition-all hover:from-purple-500 hover:to-pink-500">
                Start a project
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8 md:py-10 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Info & Quick Links */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  TechBuddyGalaxy
                </span>
              </div>
              <p className="text-sm leading-6 text-gray-400">
                🚀 Turning ideas into digital magic! We build apps that users love and businesses need. Ready to create something amazing together?
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full bg-gray-800/60 text-gray-400 ring-1 ring-white/5 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all ${item.className}`}
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          

          {/* Contact */}
          <div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Let's Connect! 💬</h3>
              <p className="text-xs text-gray-500 mt-2 mb-4">Drop us a line, we're always excited to chat about cool projects!</p>
              <ul className="mt-6 space-y-4">
                {contactInfo.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <a 
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-center items-center">
          <p className="text-xs leading-5 text-gray-400">
            &copy; {currentYear} Tech Buddy Galaxy — Crafted with passionate Gen-Z minds.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
