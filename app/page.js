"use client";
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Contact from '@/components/ContactForm';
import dynamic from 'next/dynamic';

const IdeaToReality = dynamic(() => import('@/components/IdeaToReality'), { ssr: false });
import Footer from '@/components/Footer';
import { MessageCircle, Phone, Mail } from 'lucide-react';

const TechBuddyWebsite = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Navigation scrollToSection={scrollToSection} />
      
      <main>
        <Hero scrollToSection={scrollToSection} />
        <About />
        <Services />
        <IdeaToReality />
        <Contact />
      </main>

      <Footer />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <a
          href="https://wa.me/919600338406"
          className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-110"
          title="WhatsApp"
          target="_blank"
          rel="noopener noreferrer"
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

export default TechBuddyWebsite;
