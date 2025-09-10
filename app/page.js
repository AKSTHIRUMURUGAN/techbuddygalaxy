"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  Users, 
  Zap, 
  Target, 
  Code, 
  Smartphone, 
  Cloud, 
  Shield, 
  BarChart3, 
  Palette, 
  Globe, 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Rocket,
  Award,
  TrendingUp,
  Heart,
  Coffee
} from 'lucide-react';

const TechBuddyWebsite = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'why-us', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const services = [
    {
      icon: Code,
      title: "Web & App Development",
      description: "Custom websites, mobile apps, and enterprise solutions built with cutting-edge technologies.",
      features: ["React, Next.js, Flutter", "Scalable Architecture", "Responsive Design"]
    },
    {
      icon: Lightbulb,
      title: "AI/ML Solutions",
      description: "Intelligent automation, predictive analytics, and machine learning integrations.",
      features: ["Computer Vision", "Natural Language Processing", "Predictive Analytics"]
    },
    {
      icon: Cloud,
      title: "Cloud & DevOps",
      description: "Scalable cloud infrastructure, migration services, and automated deployment pipelines.",
      features: ["AWS, Azure, GCP", "CI/CD Pipelines", "Infrastructure as Code"]
    },
    {
      icon: Shield,
      title: "Cybersecurity",
      description: "Comprehensive security solutions to protect your digital assets and data.",
      features: ["Security Audits", "Penetration Testing", "Compliance Management"]
    },
    {
      icon: Palette,
      title: "Creative & Branding",
      description: "Brand identity, digital marketing, and viral content creation that converts.",
      features: ["Logo & Brand Design", "Social Media Management", "Video Production"]
    },
    {
      icon: BarChart3,
      title: "Data Science",
      description: "Transform your data into actionable insights and predictive models.",
      features: ["Business Intelligence", "Data Engineering", "Market Analysis"]
    }
  ];

  const whyUsReasons = [
    {
      icon: Users,
      title: "Gen-Z Innovation",
      description: "Fresh perspectives and cutting-edge solutions from young, passionate minds."
    },
    {
      icon: Zap,
      title: "Rapid Execution",
      description: "From idea to deployment in record time without compromising quality."
    },
    {
      icon: Target,
      title: "One-Stop Solution",
      description: "Everything you need under one roof - tech, design, marketing, and strategy."
    },
    {
      icon: Award,
      title: "Future-Ready Skills",
      description: "We master the top skills identified by World Economic Forum for 2025."
    }
  ];

  const stats = [
    { number: "100+", label: "Projects Delivered" },
    { number: "50+", label: "Happy Clients" },
    { number: "24/7", label: "Support Available" },
    { number: "99%", label: "Client Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Image src="/tbg.png" alt="Tech Buddy Galaxy Logo" width={40} height={40} className="h-10 w-auto" />

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'services', label: 'Services' },
                { id: 'why-us', label: 'Why Us' },
                { id: 'contact', label: 'Contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === item.id 
                      ? 'text-purple-400' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'services', label: 'Services' },
                { id: 'why-us', label: 'Why Us' },
                { id: 'contact', label: 'Contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-purple-600/20 rounded-md"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase">
                Your One-Stop Innovation Partner
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Tech Buddy
              </span>
              <br />
              <span className="text-white">Galaxy</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              &ldquo;Give me 100 energetic youth and I shall transform India.&rdquo; - Swami Vivekananda
              <br />
              <span className="text-purple-300 font-medium">
                We turn ideas into billion-dollar realities with Gen-Z creativity and cutting-edge technology.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={() => scrollToSection('contact')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                Start Your Project
                <ChevronRight className="inline w-5 h-5 ml-2" />
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="border-2 border-purple-500 text-purple-400 px-8 py-4 rounded-full font-semibold hover:bg-purple-500/10 transition-all duration-300"
              >
                Explore Services
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              About <span className="text-purple-400">Tech Buddy Galaxy</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A student-founded IT powerhouse built on Gen-Z creativity, dedication, and out-of-the-box thinking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
                <Quote className="w-8 h-8 text-purple-400 mb-4" />
                <blockquote className="text-lg text-gray-300 mb-4">
                  &ldquo;Small aim is a crime; have great aim.&rdquo;
                </blockquote>
                <cite className="text-purple-400 font-medium">- A.P.J. Abdul Kalam</cite>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  At Tech Buddy Galaxy, we believe in transforming ideas into impact. Our young, creative, and dynamic minds combine technology, design, strategy, and innovation to empower businesses and startups.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We embody the top skills identified by the World Economic Forum: Analytical Thinking, Creativity, Problem-Solving, Leadership, Resilience, and Technology Mastery.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Lightbulb, title: "Innovation First", desc: "Cutting-edge solutions" },
                { icon: Users, title: "Student Power", desc: "Fresh Gen-Z perspectives" },
                { icon: Zap, title: "Rapid Delivery", desc: "Fast, efficient execution" },
                { icon: Heart, title: "Passion Driven", desc: "Dedicated to your success" }
              ].map((item, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300">
                  <item.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Our <span className="text-purple-400">Services</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From idea to execution, we provide comprehensive solutions for all your technology and business needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">{service.description}</p>
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => scrollToSection('contact')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
            >
              Get Custom Quote
              <ArrowRight className="inline w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose <span className="text-purple-400">Us?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              &ldquo;When you partner with us, you don&rsquo;t just hire a team&mdash;you hire the future.&rdquo;
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUsReasons.map((reason, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <reason.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{reason.title}</h3>
                <p className="text-gray-300 leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-8 text-center">
            <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Pay As You Go Model</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              No huge upfront costs—only flexible, transparent pricing based on what you use. 
              Modular services that scale with your business growth.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full text-sm">Flexible Pricing</span>
              <span className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full text-sm">No Hidden Costs</span>
              <span className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Let&apos;s Build Something <span className="text-purple-400">Amazing</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ready to transform your idea into reality? Get in touch with us today!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Get In Touch</h3>
                
                <div className="space-y-6">
                  <a href="tel:+919600338406" className="flex items-center group cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Call Us</div>
                      <div className="text-gray-400">+91 96003 38406</div>
                    </div>
                  </a>

                  <a href="mailto:techbuddygalaxy@gmail.com" className="flex items-center group cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Email Us</div>
                      <div className="text-gray-400">techbuddygalaxy@gmail.com</div>
                    </div>
                  </a>

                  <a href="https://wa.me/919600338406" className="flex items-center group cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">WhatsApp</div>
                      <div className="text-gray-400">Message us instantly</div>
                    </div>
                  </a>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Visit Us</div>
                      <div className="text-gray-400">Chennai, Tamil Nadu, India</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                <Coffee className="w-8 h-8 text-purple-400 mb-3" />
                <h4 className="text-lg font-semibold text-white mb-2">Quick Response Guarantee</h4>
                <p className="text-gray-300 text-sm">
                  We respond to all inquiries within 2 hours during business hours. 
                  Your success is our priority!
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Service Needed
                  </label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors">
                    <option value="">Select a service</option>
                    <option value="web-development">Web Development</option>
                    <option value="app-development">App Development</option>
                    <option value="ai-ml">AI/ML Solutions</option>
                    <option value="branding">Branding & Design</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Details
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    placeholder="Tell us about your project idea..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                >
                  Send Message
                  <ArrowRight className="inline w-5 h-5 ml-2" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm border-t border-purple-500/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Tech Buddy Galaxy
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Transforming ideas into billion-dollar realities with Gen-Z creativity and cutting-edge technology.
              </p>
              <div className="text-sm text-purple-300">
                &ldquo;The best way to predict the future is to create it.&rdquo; - Peter Drucker
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                {['About Us', 'Services', 'Why Choose Us', 'Contact'].map((link) => (
                  <button key={link} className="block text-gray-400 hover:text-purple-400 transition-colors text-sm">
                    {link}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <div className="space-y-2">
                {['Web Development', 'AI/ML Solutions', 'Mobile Apps', 'Branding'].map((service) => (
                  <div key={service} className="text-gray-400 text-sm">{service}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Tech Buddy Galaxy. All rights reserved. Built with 💜 by passionate Gen-Z minds.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <a
          href="https://wa.me/919600338406"
          className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-110"
          title="WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </a>
        <a
          href="tel:+919600338406"
          className="w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110"
          title="Call Us"
        >
          <Phone className="w-6 h-6 text-white" />
        </a>
        <a
          href="mailto:techbuddygalaxy@gmail.com"
          className="w-14 h-14 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-110"
          title="Email Us"
        >
          <Mail className="w-6 h-6 text-white" />
        </a>
      </div>
    </div>
  );
};

// Missing Quote component - adding it
const Quote = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

export default TechBuddyWebsite;