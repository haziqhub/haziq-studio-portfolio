import React from 'react';

export default function About() {
  return (
    <section className="relative z-10 scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-28">
      <div className="bg-[#111216]/94 backdrop-blur-2xl p-6 sm:p-10 lg:p-14 rounded-3xl border border-white/15 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          <div className="lg:col-span-5 space-y-2">
            <span className="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest block mb-2">
              [ SOMETHING ABOUT ME ]
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white uppercase tracking-tight leading-tight">
              DEVELOPING WITH DISCIPLINE
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-6 font-mono text-sm sm:text-base text-zinc-200 leading-relaxed font-medium">
            <p>
              I build and engineer complete software solutions with equal command over frontend development, backend architecture, and mobile technologies. My expertise spans the MERN stack, Flutter, and ASP.NET Core, with a strong foundation in application architecture, database engineering, API design, and high performance user experiences.

            </p>
            <p>
              Beyond development, I focus on solutions that balance technical depth with practical usability. From complex application logic and data management to refined interfaces and seamless functionality, I approach every layer with precision, independence, and a clear understanding of how software should perform in real world environments.

            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/15">
              <div>
                <span className="text-amber-500 block text-xs font-bold uppercase tracking-wider mb-1">
                  LOCATION
                </span>
                <span className="font-bold text-white text-base">
                  Karachi, Pakistan (PKT)
                </span>
              </div>
              <div>
                <span className="text-amber-500 block text-xs font-bold uppercase tracking-wider mb-1">
                  DISCIPLINE
                </span>
                <span className="font-bold text-white text-base">
                  Frontend, Backend, Mobile &amp; Web Systems
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}