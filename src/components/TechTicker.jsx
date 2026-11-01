import React from 'react';

const technologies = [
  'C#', 'ASP.NET CORE', 'FLUTTER', 'DART', 'SQL SERVER',
  'ENTITY FRAMEWORK CORE', 'REST APIS', 'REACT', 'NODE.JS',
  'EXPRESS.JS', 'MONGODB', 'FIREBASE', 'JAVASCRIPT ES6+',
  'ANGULAR', 'HTML5 & CSS3', 'GIT & GITHUB', 'POSTMAN', 'VISUAL STUDIO'
];

export default function TechTicker() {
  return (
    <div
      className="marquee-wrapper border-y border-neutral-900/10 bg-charcoal text-paper py-4 sm:py-5 overflow-hidden select-none marquee-mask"
      aria-label="Technologies Marquee"
    >
      <div className="flex">
        {/* Track 1 */}
        <div className="animate-marquee-track font-mono text-xs sm:text-sm font-bold tracking-widest uppercase flex items-center gap-6 sm:gap-8 pr-6 sm:pr-8">
          {technologies.map((tech, idx) => (
            <React.Fragment key={`track1-${idx}`}>
              <span>{tech}</span>
              <span className="text-neutral-500" aria-hidden="true">///</span>
            </React.Fragment>
          ))}
        </div>
        {/* Track 2 Clone */}
        <div
          className="animate-marquee-track font-mono text-xs sm:text-sm font-bold tracking-widest uppercase flex items-center gap-6 sm:gap-8 pr-6 sm:pr-8"
          aria-hidden="true"
        >
          {technologies.map((tech, idx) => (
            <React.Fragment key={`track2-${idx}`}>
              <span>{tech}</span>
              <span className="text-neutral-500">///</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}