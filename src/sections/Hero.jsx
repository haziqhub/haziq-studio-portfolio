import React, { useState, useEffect } from 'react';
import { socialLinks, contactDetails } from '../data/socialLinks';

// 13 Authentic Software Craftsmanship & Engineering Quotes
const rotatingQuotes = [
  {
    quote: "Great software is never accidental. It is imagined with clarity, engineered with discipline, and refined through intent.",
    author: "Core Philosophy"
  },
  {
    quote: "Simplicity is prerequisite for reliability. Complex architectures break in complex ways.",
    author: "Edsger W. Dijkstra"
  },
  {
    quote: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler"
  },
  {
    quote: "First, solve the problem. Then, write the code. Never invert that order.",
    author: "John Johnson"
  },
  {
    quote: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds"
  },
  {
    quote: "Clean code always looks like it was written by someone who cares deeply about the craft.",
    author: "Michael Feathers"
  },
  {
    quote: "Premature optimization is the root of all evil in software engineering.",
    author: "Donald Knuth"
  },
  {
    quote: "Make it work, make it right, make it fast. In that exact sequence.",
    author: "Kent Beck"
  },
  {
    quote: "Software is a continuous discipline between artistic composition and rigorous mathematical engineering.",
    author: "Bill Gates"
  },
  {
    quote: "Truth in an application can only ever be found in one place: the executable code itself.",
    author: "Robert C. Martin"
  },
  {
    quote: "Before software can be reusable, it first has to be genuinely usable.",
    author: "Ralph Johnson"
  },
  {
    quote: "The best systems are designed with the foresight that requirements will inevitably change.",
    author: "Fred Brooks"
  },
  {
    quote: "Engineering resilience is not the absence of errors, but the architectural ability to withstand them.",
    author: "Enterprise Discipline"
  }
];

export default function Hero() {
  const [liveTime, setLiveTime] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // 1. Live Karachi Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Karachi',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Quotes Rotation Loop (Changes smoothly every 6.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % rotatingQuotes.length);
        setIsFading(false);
      }, 400); // 400ms fade transition
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  // Interactive Cursor Spotlight Tracker
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const currentQuote = rotatingQuotes[quoteIndex];

  return (
    <section id="about" className="relative z-10 scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 sm:pt-14 pb-20 sm:pb-32">
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-mono text-[10px] sm:text-xs font-bold text-zinc-400 mb-8 border-b border-white/10 pb-4">
        <span className="tracking-widest uppercase">
          OFFICIAL PORTFOLIO // 2026
        </span>

        {/* Live Karachi Real-Time Clock */}
        <span className="font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full tracking-wider text-[11px] shadow-sm">
          KARACHI, PK // {liveTime || 'LIVE'} PKT
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Signature Typography & Live Rotating Quotes */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            {/* Signature "Maaz Khan" */}
            <h1 className="font-['Caveat',cursive] text-7xl sm:text-8xl md:text-9xl text-[#fbfbf8] tracking-wide leading-none capitalize drop-shadow-2xl select-none -rotate-2 py-1 hover:rotate-0 transition-transform duration-300">
              Syed Haziq Ahmed
            </h1>

            {/* Software Developer in Clean Thin Font */}
            <p className="font-sans font-light tracking-[0.25em] text-lg sm:text-xl md:text-2xl text-zinc-300 uppercase pt-1">
              Software Developer
            </p>
          </div>

          {/* Low-Transparency High-Contrast Rotating Quote Card */}
          <div
            onMouseMove={handleMouseMove}
            className="spotlight-card font-mono text-xs sm:text-sm text-zinc-100 leading-relaxed max-w-xl bg-[#0c0d12]/96 backdrop-blur-2xl p-6 rounded-2xl border border-white/15 shadow-2xl transition-all duration-300 hover:border-amber-500/40"
          >
            <div className="flex items-center justify-between text-amber-500 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3 border-b border-white/10 pb-2">
              <span>// {currentQuote.author}</span>
              {/* [4 / 13] REMOVED */}
            </div>

            {/* Rotating Quote with Smooth Fade */}
            <p className={`min-h-[64px] sm:min-h-[56px] transition-all duration-400 text-zinc-100 font-medium ${isFading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>
              &ldquo;{currentQuote.quote}&rdquo;
            </p>

            {/* Quote Progress Timer Bar */}
            <div className="w-full bg-white/10 h-0.5 rounded-full mt-4 overflow-hidden">
              <div
                key={quoteIndex}
                className="bg-amber-500 h-full w-full origin-left animate-quoteProgress"
              ></div>
            </div>
          </div>

          {/* Core Specializations */}
          <div className="font-mono text-xs sm:text-sm font-semibold text-zinc-100 space-y-2.5 border-l-2 border-amber-500 pl-4 py-1">
            <p className="text-white font-bold uppercase tracking-wider text-[11px] text-amber-400 mb-1">
              / SPECIALIZED SKILLS
            </p>
            <p className="hover:text-amber-400 hover:translate-x-1.5 transition-all cursor-default text-amber-300">
              • MERN STACK DEVELOPMENT
            </p>
            <p className="hover:text-amber-400 hover:translate-x-1.5 transition-all cursor-default">
              • FLUTTER CROSS PLATFORM MOBILE PLATFORMS
            </p>
            <p className="hover:text-amber-400 hover:translate-x-1.5 transition-all cursor-default">
              • ASP.NET CORE &amp; C# ENTERPRISE SYSTEMS
            </p>
            <p className="hover:text-amber-400 hover:translate-x-1.5 transition-all cursor-default">
              • SQL SERVER &amp; MONGODB
            </p>
            <p className="hover:text-amber-400 hover:translate-x-1.5 transition-all cursor-default">
              • ENTERPRISE RESTFUL WEB APIS &amp; MICROSERVICES
            </p>
          </div>

          {/* Social Profiles */}
          <div className="pt-2">
            <span className="font-mono text-xs font-bold text-zinc-400 block uppercase tracking-wider mb-2.5">
              MY SOCIALS
            </span>
            <div className="flex flex-wrap gap-2.5 font-mono text-xs font-bold">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/[0.08] backdrop-blur-lg border border-white/15 text-white hover:bg-white hover:text-black hover:border-white active:scale-95 transition-all duration-200 shadow-md flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <span>{link.name}</span>
                  <span className="text-[11px] opacity-75">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>


        {/* Right Column: Interactive Portrait */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[320px] sm:max-w-sm aspect-[4/5] rounded-3xl p-3 bg-gradient-to-b from-white/[0.12] to-white/[0.02] backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden group hover:border-amber-500/50 transition-all duration-500">

            {/* Portrait Image */}
            <img
              src="\images\my-photo.png"
              alt="Portrait of Syed Haziq Ahmed"
              className="absolute inset-0 w-full h-full object-cover object-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-70 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"></div>

            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 group-hover:ring-amber-400/40 transition-all duration-500 pointer-events-none"></div>

            {/* Bottom Information Bar */}
            <div className="absolute bottom-4 left-4 right-4 bg-[#0a0b12]/85 backdrop-blur-md text-white py-3 px-4 rounded-xl flex justify-between items-center font-mono text-xs border border-white/15 shadow-xl transition-all duration-500 group-hover:border-amber-500/40">

              <span className="font-bold tracking-wider">
                Syed Haziq Ahmed
              </span>

              <span className="text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                AVAILABLE
              </span>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}