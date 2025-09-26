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
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TechBuddyGalaxy
              </span>
            </div>
            <p className="text-sm leading-6 text-gray-400">
              Empowering businesses with cutting-edge technology solutions and innovative digital experiences.
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

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold leading-6 text-white">Quick Links</h3>
            <ul className="mt-6 space-y-4">
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

          

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Contact Us</h3>
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

            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Newsletter</h3>
              <form onSubmit={handleSubscribe} className="mt-4">
                <div className="flex gap-x-4">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm sm:leading-6"
                    placeholder="Enter your email"
                  />
                  <button
                    type="submit"
                    className="flex-none rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-purple-500 hover:to-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 flex items-center"
                  >
                    <span className="sr-only">Subscribe</span>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                {isSubscribed && (
                  <p className="mt-2 text-sm text-green-400">
                    Thank you for subscribing!
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
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
