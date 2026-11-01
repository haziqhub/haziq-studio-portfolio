import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  
  // Smart Scroll State (Hide on scroll down, Show on scroll up)
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Agar bilkul top par hain to hamesha show karein
      if (currentScrollY < 40) {
        setIsVisible(true);
      } 
      // Neeche scroll karne par chup jaye
      else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
        setMobileMenuOpen(false); // Mobile menu open ho to close ho jaye
      } 
      // Upar scroll karne par wapis aa jaye
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-4 sm:top-6 left-0 w-full z-40 px-4 sm:px-8 pointer-events-none select-none transition-transform duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-28'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* ================= LEFT CAPSULE BUTTONS ================= */}
        <nav className="hidden md:flex items-center gap-2 pointer-events-auto" aria-label="Main Navigation">
          <a
            href="#about"
            className="h-[42px] px-5 rounded-full font-mono text-xs font-semibold tracking-wider text-zinc-300 bg-[#121318]/90 hover:bg-white hover:text-black backdrop-blur-xl border border-white/10 hover:border-white shadow-xl flex items-center justify-center hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            ABOUT
          </a>
          <a
            href="#projects"
            className="h-[42px] px-5 rounded-full font-mono text-xs font-semibold tracking-wider text-zinc-300 bg-[#121318]/90 hover:bg-white hover:text-black backdrop-blur-xl border border-white/10 hover:border-white shadow-xl flex items-center justify-center hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            WORKS
          </a>
          <a
            href="#skills"
            className="h-[42px] px-5 rounded-full font-mono text-xs font-semibold tracking-wider text-zinc-300 bg-[#121318]/90 hover:bg-white hover:text-black backdrop-blur-xl border border-white/10 hover:border-white shadow-xl flex items-center justify-center hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            SERVICES
          </a>
        </nav>

        {/* ================= CENTER BRAND: SLOW SMOOTH ANIMATED HOVER ================= */}
        <div className="pointer-events-auto">
          <a
            href="#about"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            className="h-[42px] px-6 rounded-full bg-[#0d0e12]/95 backdrop-blur-2xl border border-white/15 hover:border-amber-500/50 shadow-2xl inline-flex items-center justify-center transition-all duration-500 active:scale-95"
          >
            {/* Left Bracket < */}
            <span className="text-amber-500 font-mono text-xs sm:text-sm font-bold select-none mr-2">
              &lt;
            </span>

            {/* Smooth 700ms Expanding Crossfade Container */}
            <div
              className="relative inline-flex items-center justify-center h-full transition-all duration-700 ease-out"
              style={{ width: isLogoHovered ? '92px' : '36px' }}
            >
              {/* MK (Signature font, fades & floats up slowly on hover) */}
              <span
                className={`absolute font-['Caveat',cursive] text-2xl text-white select-none transition-all duration-700 ease-out pb-0.5 ${
                  isLogoHovered
                    ? 'opacity-0 scale-75 -translate-y-3 pointer-events-none'
                    : 'opacity-100 scale-100 translate-y-0'
                }`}
              >
                MK
              </span>

              {/* Maaz Khan (Signature font, floats down & fades in slowly on hover) */}
              <span
                className={`font-['Caveat',cursive] text-2xl text-amber-400 whitespace-nowrap select-none transition-all duration-700 ease-out pb-0.5 ${
                  isLogoHovered
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-75 translate-y-3 pointer-events-none'
                }`}
              >
                Maaz Khan
              </span>
            </div>

            {/* Right Bracket /> */}
            <span className="text-amber-500 font-mono text-xs sm:text-sm font-bold select-none ml-2">
              /&gt;
            </span>
          </a>
        </div>

        {/* ================= RIGHT BUTTONS ================= */}
        <div className="hidden md:flex items-center gap-2.5 pointer-events-auto">
          <a
            href="#contact"
            className="h-[42px] px-5 rounded-full font-mono text-xs font-semibold tracking-wider text-zinc-300 bg-[#121318]/90 hover:bg-white hover:text-black backdrop-blur-xl border border-white/10 hover:border-white shadow-xl flex items-center justify-center hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            CONNECT
          </a>
          <a
            href="#contact"
            className="h-[42px] px-6 rounded-full font-mono text-xs font-bold tracking-wider text-black bg-[#f59e0b] hover:bg-white hover:text-black border border-[#f59e0b] hover:border-white shadow-lg flex items-center justify-center active:scale-95 transition-all duration-300"
          >
            CONTACT ME ↗
          </a>
        </div>

        {/* ================= MOBILE TOGGLE ================= */}
        <div className="md:hidden pointer-events-auto">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-full bg-[#121318]/90 backdrop-blur-xl border border-white/15 text-white active:scale-90 transition-all shadow-xl"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* ================= MOBILE FLOATING DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden pointer-events-auto mt-3 max-w-xs mx-auto p-4 rounded-3xl bg-[#0c0d12]/96 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col items-center space-y-2">
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-2 rounded-full font-mono text-xs font-semibold text-zinc-300 hover:bg-white hover:text-black transition-all"
          >
            ABOUT
          </a>
          <a
            href="#projects"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-2 rounded-full font-mono text-xs font-semibold text-zinc-300 hover:bg-white hover:text-black transition-all"
          >
            WORKS
          </a>
          <a
            href="#skills"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-2 rounded-full font-mono text-xs font-semibold text-zinc-300 hover:bg-white hover:text-black transition-all"
          >
            SERVICES
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-2 rounded-full font-mono text-xs font-semibold text-zinc-300 hover:bg-white hover:text-black transition-all"
          >
            CONNECT
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-2.5 rounded-full font-mono text-xs font-bold text-black bg-[#f59e0b] hover:bg-white mt-2 transition-all shadow-md"
          >
            CONTACT ME ↗
          </a>
        </div>
      )}
    </header>
  );
}