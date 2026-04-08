"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const Navigation = ({ scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      
      const sections = ['home', 'about', 'services', 'idea-to-reality', 'contact'];
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

  const handleNavigation = (sectionId) => {
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 ${isScrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'} transition-all duration-300 border-b border-purple-500/20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Image 
              src="/tbg.png" 
              alt="Tech Buddy Galaxy Logo" 
              width={100} 
              height={40} 
              className="h-8 sm:h-10 w-auto" 
              style={{ width: 'auto' }}
              priority
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            {['home', 'about', 'services', 'idea-to-reality', 'contact'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavigation(item)}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  activeSection === item ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                {item === 'idea-to-reality' ? 'Idea to Reality' : item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
            <button 
              onClick={() => handleNavigation('contact')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 xl:px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 text-sm whitespace-nowrap"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-black/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['home', 'about', 'services', 'idea-to-reality', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavigation(item)}
                  className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                    activeSection === item
                      ? 'bg-purple-900/50 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {item === 'idea-to-reality' ? 'Idea to Reality' : item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
              <button 
                onClick={() => handleNavigation('contact')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-center mt-2"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;


