import React from 'react';

const skillPillars = [
  {
    code: '01',
    title: 'BACKEND DEVELOPMENT',
    skills: [
      'NODE.JS & EXPRESS',
      'C# PROGRAMMING',
      'ASP.NET CORE & WEB APIS',
      'ENTITY FRAMEWORK CORE',
      'MVC ARCHITECTURE'
    ]
  },
  {
    code: '02',
    title: 'APP DEVELOPMENT',
    skills: [
      'FLUTTER FRAMEWORK',
      'DART LANGUAGE',
      'FIREBASE AUTH & FIRESTORE',
      'PROVIDER STATE MANAGEMENT',
      'PERFORMANCE CLIENT APPS'
    ]
  },
  {
    code: '03',
    title: 'FRONTEND ENGINEERING',
    skills: [
      'HTML5 & CSS3',
      'JAVASCRIPT',
      'REACT.JS',
      'ANGULAR PLATFORM',
      'TAILWIND CSS & MODERN UI',
      'RESPONSIVE ARCHITECTURE'
    ]
  },
  {
    code: '04',
    title: 'DATABASES & TOOLING',
    skills: [
      'SQL SERVER / MICROSOFT SQL',
      'MONGODB',
      'FIREBASE DB',
      'GIT & GITHUB ',
      'VISUAL STUDIO & POSTMAN'
    ]
  }
];

export default function Skills() {
  return (
    <section id="skills" className="relative z-10 scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-28">
      <div className="mb-12 border-b border-white/10 pb-6">
        <span className="font-mono text-xs font-bold text-amber-500 uppercase block tracking-widest">[ CAPABILITIES ]</span>
        <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-white uppercase tracking-tight mt-1">
          SERVICES &amp; STACK
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {skillPillars.map((pillar) => (
          <div
            key={pillar.code}
            className="bg-[#0c0d12]/96 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl space-y-4 hover:border-amber-500/50 transition-all duration-300"
          >
            <span className="font-mono text-xs text-amber-500 font-bold block">[ {pillar.code} ]</span>
            <h3 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
              {pillar.title}
            </h3>
            <ul className="font-mono text-xs font-semibold space-y-3.5 uppercase pt-2">
              {pillar.skills.map((item, i) => (
                <li
                  key={i}
                  className="text-zinc-100 hover:text-white hover:translate-x-1.5 transition-transform cursor-default flex items-center gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="tracking-wide text-[12px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}