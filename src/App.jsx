import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BackgroundExperience from './three/BackgroundExperience';
import Hero from './sections/Hero';
import TechTicker from './components/TechTicker';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import About from './sections/About';
import Contact from './sections/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);

  const handleBypass = () => {
    if (!hasEntered) {
      setHasEntered(true);
    }
  };

  return (
    <div
      onClick={handleBypass}
      className="relative min-h-screen bg-[#07080a] text-[#f4f4ee] font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden"
    >
      {/* 1. CINEMATIC 3D DOOR WALKTHROUGH */}
      <BackgroundExperience
        isIntroSkipped={hasEntered}
        onIntroComplete={() => setHasEntered(true)}
      />

      {/* 2. PORTFOLIO UI CONTENT */}
      <div
        className={`relative z-10 transition-opacity duration-1000 ease-out ${
          hasEntered
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <Navbar />
        <main className="pt-20 sm:pt-24 md:pt-28">
          <Hero />
          <TechTicker />
          <Projects />
          <Skills />
          <About />
          <Contact />
        </main>
        <Footer />
      </div>

      {/* 3. WHATSAPP BUTTON: HIDDEN DURING INTRO, REVEALED ONLY AFTER ENTRANCE */}
      <WhatsAppButton visible={hasEntered} />

      {/* 4. VERCEL ANALYTICS + SPEED INSIGHTS (screen pe kuch nahi dikhate) */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}