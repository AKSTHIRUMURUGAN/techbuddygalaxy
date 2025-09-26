
"use client";

import { motion } from 'framer-motion';
import { Twitter, Linkedin, Github, Mail, Globe } from 'lucide-react';

const team = [
  {
    name: 'Alex Johnson',
    role: 'CEO & Founder',
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=600&auto=format&fit=crop',
    bio: 'Visionary leader with a passion for technology and innovation. Alex has over 10 years of experience in the tech industry.',
    social: {
      twitter: '#',
      linkedin: '#',
      github: '#',
      email: 'alex@techbuddygalaxy.com',
      website: '#'
    }
  },
  {
    name: 'Sarah Williams',
    role: 'CTO',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=600&auto=format&fit=crop',
    bio: 'Tech enthusiast with expertise in AI/ML and cloud computing. Sarah leads our technical strategy and innovation.',
    social: {
      twitter: '#',
      linkedin: '#',
      github: '#',
      email: 'sarah@techbuddygalaxy.com',
      website: '#'
    }
  },
  {
    name: 'Michael Chen',
    role: 'Lead Developer',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    bio: 'Full-stack developer with a focus on creating scalable and efficient web applications.',
    social: {
      twitter: '#',
      linkedin: '#',
      github: '#',
      email: 'michael@techbuddygalaxy.com',
      website: '#'
    }
  },
  {
    name: 'Emily Rodriguez',
    role: 'UI/UX Designer',
    image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=600&auto=format&fit=crop',
    bio: 'Creative designer passionate about creating beautiful and intuitive user experiences.',
    social: {
      twitter: '#',
      linkedin: '#',
      dribbble: '#',
      email: 'emily@techbuddygalaxy.com',
      website: '#'
    }
  },
  {
    name: 'David Kim',
    role: 'Data Scientist',
    image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=600&auto=format&fit=crop',
    bio: 'Data wizard with expertise in machine learning and predictive analytics.',
    social: {
      twitter: '#',
      linkedin: '#',
      github: '#',
      email: 'david@techbuddygalaxy.com',
      website: '#'
    }
  },
  {
    name: 'Join Our Team',
    role: 'We\'re Hiring!',
    image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=600&auto=format&fit=crop',
    bio: 'Passionate about technology? Join our team of talented individuals and work on exciting projects.',
    isHiring: true
  }
];

const SocialIcon = ({ platform, url }) => {
  const icons = {
    twitter: <Twitter className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    github: <Github className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    website: <Globe className="w-4 h-4" />,
    dribbble: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-3.5-9.5c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm3.5 0c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm3.5 0c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1z" />
      </svg>
    )
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-purple-400 transition-colors"
      aria-label={platform}
    >
      {icons[platform] || <Globe className="w-4 h-4" />}
    </a>
  );
};

export default function Team() {
  return (
    <section id="team" className="py-20 bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-xs tracking-widest uppercase text-purple-300/80 mb-2">Our Team</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Meet the <span className="gradient-text">Gen Z Innovators</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Young minds with big dreams. We're building the next Microsoft, Google, or Infosys—one innovative solution at a time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-slate-800/50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-purple-500/10 glow-ring ${
                member.isHiring ? 'border-2 border-dashed border-purple-500/50' : ''
              }`}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {member.isHiring && (
                  <div className="absolute inset-0 bg-purple-600/90 flex items-center justify-center">
                    <div className="text-center p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                      <p className="text-purple-100 mb-4">{member.role}</p>
                      <p className="text-white mb-6">{member.bio}</p>
                      <a
                        href="#contact"
                        className="inline-block bg-white text-purple-600 font-semibold px-6 py-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {!member.isHiring && (
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{member.name}</h3>
                      <p className="text-purple-400 font-medium">{member.role}</p>
                    </div>
                    <div className="flex space-x-3">
                      {Object.entries(member.social || {}).map(([platform, url]) => (
                        <SocialIcon key={platform} platform={platform} url={url} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-gray-300">{member.bio}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-slate-800/50 rounded-2xl p-8 md:p-12 shadow-md border border-purple-500/10 glow-ring">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">Join Our Growing Team</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals to join our team. If you're passionate about technology and want to work on exciting projects, we'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="#contact"
                className="group inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
              >
                View Open Positions
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="mailto:careers@techbuddygalaxy.com"
                className="group inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all duration-300"
              >
                Send Your CV
                <Mail className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Add missing icon component
function ArrowRight(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

