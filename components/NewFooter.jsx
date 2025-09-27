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
      icon: <MapPin className="w-5 h-5 text-purple-400" />, 
      text: 'Chennai, India',
      href: 'https://maps.google.com'
    },
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
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-10 lg:px-8">
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
                    className={`p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all ${item.className}`}
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Navigate</h3>
              <ul className="mt-6 space-y-3">
                {quickLinks.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
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

        <div className="mt-8 border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs leading-5 text-gray-400">
            &copy; {currentYear} Tech Buddy Galaxy. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="text-xs leading-5 text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs leading-5 text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-xs leading-5 text-gray-400 hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
