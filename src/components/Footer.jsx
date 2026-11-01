import React from 'react';
import { contactDetails } from '../data/socialLinks';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07080a] py-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pl-20 sm:pl-24 md:pl-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-xs font-semibold text-zinc-500">
        
        {/* EK HI BOX KE ANDAR: Maaz Khan aur uske theek neeche Other Portfolio */}
        <div className="flex flex-col items-start text-left">
          <span>© 2025 - Maaz Khan</span>
          
          <a
            href="https://maazportfolio77.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-amber-400 transition-colors duration-200 no-underline cursor-pointer block mt-0.5"
          >
            Other Portfolio
          </a>
        </div>

        {/* Right Side: Location */}
        <div>
          <p>{contactDetails.location.toUpperCase()}</p>
        </div>

      </div>
    </footer>
  );
}