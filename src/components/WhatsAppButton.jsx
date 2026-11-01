import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { contactDetails } from '../data/socialLinks';

export default function WhatsAppButton({ visible = false }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  const buttonElement = (
    <aside
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '24px',
        zIndex: 999999,
      }}
      className={`select-none transition-all duration-1000 ease-out ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      aria-label="Direct WhatsApp Contact"
    >
      <a
        href={contactDetails.whatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 max-w-[48px] max-h-[48px] sm:max-w-[56px] sm:max-h-[56px] bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.85)] hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 border-2 border-[#090a0d]"
        title="Direct WhatsApp: 03306175872"
        aria-label="Chat directly on WhatsApp (03306175872)"
      >
        {/* Active Pulse Ring */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#090a0d]"></span>
        </span>

        {/* WhatsApp Vector Icon */}
        <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.35.06-.53.27-.18.21-.7.69-.7 1.68s.72 1.95.82 2.08c.1.14 1.38 2.18 3.39 3.01.48.2.85.32 1.14.41.48.15.92.13 1.27.08.39-.06 1.2-.49 1.37-.96.17-.48.17-.89.12-.97-.05-.08-.18-.13-.37-.23s-1.2-.59-1.39-.66-.32-.1-.46.1-.53.66-.65.8-.24.15-.43.05c-.19-.1-.8-.29-1.53-.94-.57-.5-0.95-1.13-1.06-1.32-.11-.19-.01-.3.08-.39.09-.09.19-.23.29-.35.1-.11.13-.19.2-.32.06-.13.03-.25-.02-.35-.05-.1-.46-1.11-.63-1.52-.17-.4-.34-.35-.47-.35z" />
        </svg>

        {/* Hover Tooltip */}
        <span className="hidden sm:group-hover:block absolute left-full ml-3 px-3 py-1.5 bg-[#121318] text-white border border-white/15 font-mono text-[11px] font-bold rounded-lg shadow-2xl whitespace-nowrap">
          WHATSAPP: 03306175872 ↗
        </span>
      </a>
    </aside>
  );

  return ReactDOM.createPortal(buttonElement, document.body);
}