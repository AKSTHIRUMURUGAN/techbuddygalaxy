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
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 ${isScrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'} transition-all duration-300 border-b border-purple-500/20`}>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex-shrink-0 min-w-0">
            <Image 
              src="/tbg.png" 
              alt="Tech Buddy Galaxy Logo" 
              width={80} 
              height={32} 
              className="h-7 sm:h-8 lg:h-10 w-auto" 
              style={{ width: 'auto', maxWidth: '100%' }}
              priority
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-6 flex-shrink-0">
            {['home', 'about', 'services', 'idea-to-reality', 'contact'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavigation(item)}
                className={`text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeSection === item ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                {item === 'idea-to-reality' ? 'Idea to Reality' : item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
            <button 
              onClick={() => handleNavigation('contact')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 xl:px-5 py-1.5 xl:py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 text-xs xl:text-sm whitespace-nowrap"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex-shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-black/95 backdrop-blur-sm border-t border-purple-500/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {['home', 'about', 'services', 'idea-to-reality', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavigation(item)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium w-full text-left ${
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
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-center text-sm mt-2"
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


