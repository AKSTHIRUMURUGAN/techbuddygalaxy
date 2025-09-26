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

      <div className="relative mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TechBuddyGalaxy
              </span>
            </div>
            <p className="text-sm leading-6 text-gray-400">
              We craft fast, beautiful and scalable apps that help brands grow. From strategy to shipping, our team turns complexity into customer joy.
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

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold leading-6 text-white">Quick Links</h3>
            <ul className="mt-6 space-y-4">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-sm leading-6 text-gray-400 hover:text-white hover:translate-x-0.5 inline-flex items-center gap-2 transition-all"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500/60"></span>
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
                    className="min-w-0 flex-auto rounded-md border border-white/10 bg-white/5 px-3.5 py-2 text-white shadow-sm focus:border-purple-500/40 focus:ring-2 focus:ring-inset focus:ring-purple-500/40 sm:text-sm sm:leading-6 placeholder:text-gray-400"
                    placeholder="Your email for smart insights"
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
                    You’re in! Look out for our best content, no spam.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs leading-5 text-gray-400">
            &copy; {currentYear} Tech Buddy Galaxy — Crafted with passion in Chennai.
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6 mt-4 md:mt-0">
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
