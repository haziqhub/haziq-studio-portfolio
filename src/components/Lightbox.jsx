import React, { useEffect, useCallback, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

export default function Lightbox({ isOpen, images = [], currentIndex = 0, onClose, onNavigate }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight' && onNavigate && images.length > 1) {
      onNavigate((currentIndex + 1) % images.length);
    } else if (e.key === 'ArrowLeft' && onNavigate && images.length > 1) {
      onNavigate((currentIndex - 1 + images.length) % images.length);
    }
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // ---- BACK BUTTON FIX ----
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closedByBackRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    closedByBackRef.current = false;
    // lightbox ke liye ek history entry banao
    window.history.pushState({ ...window.history.state, lightbox: true }, '');

    const handlePopState = () => {
      // user ne browser/mobile back dabaya -> sirf lightbox band karo
      closedByBackRef.current = true;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // agar X / Escape / backdrop se band hua, to extra entry hata do
      if (!closedByBackRef.current && window.history.state?.lightbox) {
        window.history.back();
      }
    };
  }, [isOpen]);
  // ---- END FIX ----

  if (!mounted || !isOpen || images.length === 0 || typeof document === 'undefined') {
    return null;
  }

  const currentImage = images[currentIndex] || images[0];

  const lightboxElement = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(5, 6, 8, 0.98)',
        backdropFilter: 'blur(20px)',
      }}
      className="flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none overflow-hidden animate-modalIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 pb-4 border-b border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* SIRF [1 / 4] NUMBER REHEGA */}
        <div className="flex items-center">
          <span className="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest">
            [{currentIndex + 1} / {images.length}]
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="font-mono text-xs font-bold px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl transition-all active:scale-95 shadow-xl flex items-center gap-2 cursor-pointer"
        >
          <span>✕</span>
          <span>BACK / CLOSE</span>
        </button>
      </div>

      {/* Main Image Viewport */}
      <div
        className="relative flex-1 w-full max-w-7xl mx-auto my-auto flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
            className="absolute left-2 sm:left-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/80 hover:bg-white text-white hover:text-black border border-white/20 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-2xl cursor-pointer"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="relative max-w-full max-h-[76vh] rounded-2xl overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-black/40 flex items-center justify-center">
          <img
            src={encodeURI(currentImage.src)}
            alt={`Image ${currentIndex + 1}`}
            className="w-auto h-auto max-w-full max-h-[76vh] object-contain rounded-xl"
            onError={(e) => {
              if (!e.currentTarget.dataset.retried) {
                e.currentTarget.dataset.retried = 'true';
                e.currentTarget.src = currentImage.src.replace(/^\//, './');
              }
            }}
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onNavigate((currentIndex + 1) % images.length)}
            className="absolute right-2 sm:right-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/80 hover:bg-white text-white hover:text-black border border-white/20 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-2xl cursor-pointer"
            aria-label="Next image"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="w-full max-w-3xl mx-auto flex items-center justify-center gap-2 pt-3 border-t border-white/10 overflow-x-auto py-1"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(idx)}
              className={`relative w-12 h-9 sm:w-16 sm:h-11 rounded-lg overflow-hidden border transition-all duration-200 shrink-0 cursor-pointer ${
                idx === currentIndex ? 'border-amber-500 scale-105 shadow-md' : 'border-white/20 opacity-40 hover:opacity-100'
              }`}
            >
              <img src={encodeURI(img.src)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return ReactDOM.createPortal(lightboxElement, document.body);
}