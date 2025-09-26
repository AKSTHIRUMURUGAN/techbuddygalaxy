'use client';

import { motion } from 'framer-motion';
import { Users, Zap, Lightbulb, Rocket, Target, Award, TrendingUp, CheckCircle } from 'lucide-react';

const stats = [
  { id: 1, name: 'Projects Completed', value: '100+', icon: Rocket },
  { id: 2, name: 'Satisfied Clients', value: '50+', icon: Users },
  { id: 3, name: 'Team Members', value: '30+', icon: Users },
  { id: 4, name: 'Years Experience', value: '5+', icon: Zap },
];

const values = [
  {
    name: 'Innovation',
    description: 'We embrace cutting-edge technologies and creative problem-solving to deliver exceptional solutions.',
    icon: Lightbulb,
  },
  {
    name: 'Excellence',
    description: 'We are committed to delivering the highest quality work and exceeding client expectations.',
    icon: Zap,
  },
  {
    name: 'Collaboration',
    description: 'We believe in the power of teamwork and building strong relationships with our clients.',
    icon: Users,
  },
  {
    name: 'Growth',
    description: 'We continuously learn and evolve to stay ahead in the ever-changing tech landscape.',
    icon: Rocket,
  },
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

export default function About() {
  return (
    <section id="about" className="py-20 bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-xs tracking-widest uppercase text-purple-300/80 mb-2">About Us</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Student-Powered <span className="gradient-text">Innovation</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            We're Gen Z minds building the next Infosys, Zoho, or Microsoft. Every giant started small—we're creating the future of tech with passion, creativity, and cutting-edge solutions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: stat.id * 0.1 }}
              className="bg-slate-800/50 p-6 rounded-xl shadow-md text-center border border-purple-500/10 glow-ring"
            >
              <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-gray-300">{stat.name}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-white">Why Choose Student-Powered Innovation?</h3>
            <p className="text-gray-300 mb-6">
              "Give me 100 youngsters, I will change the world." — Swami Vivekananda. We embody this vision with fresh Gen Z perspectives, 
              out-of-the-box thinking, and the latest tech stack. Every giant started small—Google was once just a search bar, Amazon was just books.
            </p>
            <p className="text-gray-300 mb-8">
              We don't just build software—we build the future. With AI/ML, IoT, cloud computing, and cybersecurity expertise, we transform 
              your ideas into billion-dollar realities. Pay as you go, scale as you grow.
            </p>
            
            <div className="space-y-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-start"
                >
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <value.icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-white">{value.name}</h4>
                    <p className="text-gray-300 text-sm">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/20">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1484&auto=format&fit=crop"
                alt="Diverse team collaborating on technology solutions"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-purple-500/20 rounded-full filter blur-3xl -z-10"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full filter blur-3xl -z-10"></div>
            
            <div className="absolute -bottom-6 -right-6 bg-slate-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg z-20 max-w-xs border border-purple-500/20 glow-ring">
              <div className="flex items-center">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-white">Gen Z Innovation</p>
                  <p className="text-sm text-gray-300">Fresh minds, cutting-edge solutions</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mt-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block text-xs tracking-widest uppercase text-purple-300/80 mb-2">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              The <span className="gradient-text">Tech Buddy</span> Advantage
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
              "When you partner with us, you don't just hire a team—you hire the future."
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {whyUsReasons.map((reason, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-slate-800/50 p-6 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-colors"
                >
                  <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <reason.icon className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{reason.title}</h3>
                  <p className="text-gray-300 text-sm">{reason.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pay As You Go Model */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 max-w-5xl mx-auto border border-purple-500/20 glow-ring"
          >
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-1 rounded-full text-sm font-medium">
              Flexible Pricing
            </div>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Pay As You Go Model</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                No huge upfront costs—only flexible, transparent pricing based on what you use. 
                Our modular services scale perfectly with your business growth.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> No Hidden Costs
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> 24/7 Support
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> Flexible Contracts
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
