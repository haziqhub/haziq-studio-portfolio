import React, { useEffect, useCallback, useState } from 'react';
import ReactDOM from 'react-dom';

export default function ProjectModal({ project, isOpen, onClose, onOpenLightboxWithIndex }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!mounted || !isOpen || !project || typeof document === 'undefined') {
    return null;
  }

  const modalElement = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999990,
        backgroundColor: 'rgba(5, 6, 8, 0.95)',
        backdropFilter: 'blur(16px)',
      }}
      className="flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto animate-modalIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-[#111216] border border-white/15 rounded-3xl max-w-5xl w-full p-6 sm:p-10 max-h-[90vh] overflow-y-auto shadow-2xl relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 mb-6">
          <div>
            <span className="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest block mb-1">
              0{project.order} // {(project.category || 'PROJECT').toUpperCase()}
            </span>
            <h3 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
              {project.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs font-bold px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            ✕ BACK / CLOSE
          </button>
        </div>

        <p className="font-mono text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed mb-6">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {(project.technologies || []).map((t) => (
            <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg font-mono text-xs text-zinc-300">
              {t}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          <span className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            GALLERY SCREENSHOTS (CLICK TO EXPAND FULLSCREEN) ↘
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {(project.galleryImages || []).map((img, idx) => (
              <div
                key={idx}
                onClick={() => onOpenLightboxWithIndex(idx)}
                className="group relative aspect-[4/3] bg-black/40 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/80 transition-all duration-200 shadow-md"
              >
                <img
                  src={encodeURI(img.src)}
                  alt={img.title || `Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.retried) {
                      e.currentTarget.dataset.retried = 'true';
                      e.currentTarget.src = img.src.replace(/^\//, './');
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                  <span className="font-mono text-[10px] font-bold text-white bg-black/80 px-2 py-1 rounded">
                    EXPAND ↗
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalElement, document.body);
}