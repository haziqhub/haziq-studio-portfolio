import React, { useState } from 'react';
import ContactForm from '../components/ContactForm';
import { contactDetails } from '../data/socialLinks';

export default function Contact() {
  const [copyText, setCopyText] = useState('COPY EMAIL ADDRESS');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactDetails.email).then(() => {
      setCopyText('COPIED TO CLIPBOARD!');
      setTimeout(() => setCopyText('COPY EMAIL ADDRESS'), 3000);
    }).catch(() => {
      setCopyText('COPIED!');
      setTimeout(() => setCopyText('COPY EMAIL ADDRESS'), 3000);
    });
  };

  return (
    <section id="contact" className="relative z-10 scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-28">
      <div className="bg-[#121317]/94 backdrop-blur-2xl p-6 sm:p-10 lg:p-16 rounded-3xl border border-white/15 shadow-2xl space-y-8">
        <div>
          <span className="font-mono text-xs font-bold text-amber-500 uppercase block mb-2 tracking-widest">
            [ CONTACT ME ]
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-6xl lg:text-7xl text-white uppercase tracking-tight">
            LET&apos;S BUILD SOMETHING GREAT
          </h2>
        </div>

        {/* Contact Info Cards (WhatsApp Removed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="font-mono text-[10px] sm:text-xs font-bold text-zinc-400 block mb-1">
              MY EMAIL 
            </span>
            <span className="font-mono font-bold text-sm sm:text-base text-white block truncate" title={contactDetails.email}>
              {contactDetails.email}
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="font-mono text-[10px] sm:text-xs font-bold text-zinc-400 block mb-1">
              PRIMARY LOCATION
            </span>
            <span className="font-mono font-bold text-sm sm:text-base text-white block">
              {contactDetails.location}
            </span>
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-8 py-4 bg-white text-black font-mono text-xs font-bold rounded-xl hover:bg-zinc-200 active:scale-95 transition-all text-center"
          >
            {copyText}
          </button>
        </div>

        {/* Integrated Direct Contact Form */}
        <div className="pt-6 border-t border-white/10">
          <span className="font-mono text-xs font-bold text-zinc-300 uppercase block mb-3">
            Send your inquiry directly using this form
          </span>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}