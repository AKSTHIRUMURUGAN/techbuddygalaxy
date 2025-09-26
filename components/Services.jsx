'use client';

import { motion } from 'framer-motion';
import { Code2, Smartphone, Brain, Database, Cloud, Shield, Palette, BarChart3, MessageSquare, Users, Cpu, Server, Layers, Zap, Lightbulb, Target, Briefcase, PenTool, Mail, Search, BarChart2, FileText, ShieldCheck, ArrowRight, CheckCircle2, Rocket, Cpu as CpuIcon, FileCode, Smartphone as Mobile, Globe, Shield as ShieldIcon, FileText as FileTextIcon, PieChart, ClipboardList, Users as Team, Code, Monitor, Smartphone as Phone, Server as ServerIcon, FileCheck, TrendingUp, Clock, Award, Heart, Coffee } from 'lucide-react';

const serviceCategories = [
  {
    title: 'Idea to Launch',
    description: 'Turn your idea into a successful business with our end-to-end support.',
    icon: <Lightbulb className="w-8 h-8 text-purple-400" />,
    services: [
      'Idea Validation & Market Research',
      'Business Plan Development',
      'MVP Development',
      'Go-to-Market Strategy'
    ]
  },
  {
    title: 'Web & Mobile Development',
    description: 'Build scalable, high-performance digital experiences for any device.',
    icon: <Code2 className="w-8 h-8 text-blue-400" />,
    services: [
      'Custom Web Applications',
      'Progressive Web Apps (PWAs)',
      'iOS & Android Apps',
      'E-commerce Solutions'
    ]
  },
  {
    title: 'AI/ML & Data Science',
    description: 'Leverage the power of artificial intelligence and data-driven insights.',
    icon: <Brain className="w-8 h-8 text-green-400" />,
    services: [
      'Predictive Analytics',
      'Computer Vision',
      'Natural Language Processing',
      'AI Chatbots & Automation'
    ]
  },
  {
    title: 'Cloud & DevOps',
    description: 'Scalable cloud infrastructure and seamless deployment pipelines.',
    icon: <Cloud className="w-8 h-8 text-yellow-400" />,
    services: [
      'Cloud Migration',
      'Containerization & Orchestration',
      'CI/CD Pipelines',
      'Serverless Architecture'
    ]
  },
  {
    title: 'Cybersecurity',
    description: 'Protect your digital assets with enterprise-grade security solutions.',
    icon: <ShieldIcon className="w-8 h-8 text-red-400" />,
    services: [
      'Security Audits',
      'Penetration Testing',
      'Data Encryption',
      'Compliance Management'
    ]
  },
  {
    title: 'Digital Marketing',
    description: 'Data-driven strategies to grow your online presence and customer base.',
    icon: <BarChart2 className="w-8 h-8 text-pink-400" />,
    services: [
      'SEO & Content Strategy',
      'Social Media Marketing',
      'PPC & Paid Advertising',
      'Email Marketing'
    ]
  },
  {
    title: 'Design & Branding',
    description: 'Create a memorable brand identity that stands out in the market.',
    icon: <PenTool className="w-8 h-8 text-indigo-400" />,
    services: [
      'Logo & Visual Identity',
      'UI/UX Design',
      'Marketing Collaterals',
      'Video Production'
    ]
  },
  {
    title: 'Business Solutions',
    description: 'Comprehensive support for your business growth and operations.',
    icon: <Briefcase className="w-8 h-8 text-orange-400" />,
    services: [
      'ERP Solutions',
      'CRM Implementation',
      'Process Automation',
      'Market Analysis'
    ]
  }
];

const process = [
  {
    step: '01',
    title: 'Discovery & Strategy',
    description: 'We dive deep into your business goals, target audience, and market landscape to craft a winning strategy.',
    icon: <Search className="w-6 h-6" />
  },
  {
    step: '02',
    title: 'Planning & Architecture',
    description: 'Our experts create a detailed roadmap with clear milestones, timelines, and technical architecture.',
    icon: <Layers className="w-6 h-6" />
  },
  {
    step: '03',
    title: 'Design & Prototyping',
    description: 'We design beautiful, intuitive interfaces and create interactive prototypes for validation.',
    icon: <PenTool className="w-6 h-6" />
  },
  {
    step: '04',
    title: 'Development',
    description: 'Our developers build robust, scalable solutions using the latest technologies and best practices.',
    icon: <Code2 className="w-6 h-6" />
  },
  {
    step: '05',
    title: 'Testing & Quality Assurance',
    description: 'We conduct thorough testing across devices and platforms to ensure flawless performance.',
    icon: <ShieldCheck className="w-6 h-6" />
  },
  {
    step: '06',
    title: 'Launch & Growth',
    description: 'We deploy your solution and provide ongoing support, optimization, and growth strategies.',
    icon: <Rocket className="w-6 h-6" />
  }
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-slate-900/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-wider text-purple-400 mb-3">Your One-Stop Innovation Partner</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
            From <span className="gradient-text">Idea</span> to
            <br />
            <span className="text-white">Billion-Dollar Reality</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Whether you're a startup with an idea or an enterprise looking to innovate, we provide end-to-end solutions that transform your vision into reality. Our Gen-Z talent brings fresh perspectives and cutting-edge technology to every project.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-20">
          {serviceCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40"
            >
              <div className="p-8">
                <div className="flex items-start mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm mr-5">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
                    <p className="text-gray-300">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {category.services.map((service, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{service}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-white/5">
                  <a
                    href="#contact"
                    className="inline-flex items-center text-purple-400 font-medium hover:text-white group transition-colors"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 md:p-12 border border-purple-500/20 mb-16">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <span className="inline-block text-sm font-semibold tracking-wider text-purple-400 mb-3">Why Choose Tech Buddy Galaxy?</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              We're More Than Just a <span className="gradient-text">Service Provider</span>
            </h2>
            <p className="text-xl text-gray-300">
              We're your strategic partner in growth, combining technical expertise with business acumen to deliver real results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: <Rocket className="w-8 h-8 text-purple-400" />,
                title: "Rapid Execution",
                description: "From concept to launch in record time without compromising quality."
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-blue-400" />,
                title: "Proven Results",
                description: "We measure our success by your growth and satisfaction metrics."
              },
              {
                icon: <Award className="w-8 h-8 text-yellow-400" />,
                title: "Expert Team",
                description: "Hand-picked talent with expertise across all major technologies."
              },
              {
                icon: <Clock className="w-8 h-8 text-green-400" />,
                title: "24/7 Support",
                description: "Round-the-clock assistance whenever you need it."
              },
              {
                icon: <Heart className="w-8 h-8 text-pink-400" />,
                title: "Passion-Driven",
                description: "We care deeply about your success as if it were our own."
              },
              {
                icon: <Coffee className="w-8 h-8 text-orange-400" />,
                title: "Hassle-Free",
                description: "We handle the technical details so you can focus on your business."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800/30 p-6 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Our Process */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 md:p-12 border border-purple-500/20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-sm font-semibold tracking-wider text-purple-400 mb-3">Our Process</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">From Idea to Reality</h2>
            <p className="text-xl text-gray-300">
              A proven framework that transforms your vision into a successful digital product.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 h-full w-0.5 bg-gradient-to-b from-purple-500/20 to-transparent -translate-x-1/2"></div>
            
            <div className="space-y-12 md:space-y-24">
              {process.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold z-10 -translate-x-1/2">
                    {step.step}
                  </div>
                  
                  {/* Content card */}
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                    <div className="p-6 bg-slate-800/50 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all duration-300">
                      <div className={`flex items-center mb-3 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-2 rounded-lg mr-3">
                          {step.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      </div>
                      <p className="text-gray-300">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Icon components are imported from lucide-react
