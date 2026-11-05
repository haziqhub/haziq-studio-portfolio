
import React from 'react';

export default function About() {
  return (
    <section className="relative z-10 scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-28">
      <div className="bg-[#111216]/94 backdrop-blur-2xl p-6 sm:p-10 lg:p-14 rounded-3xl border border-white/15 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-5 space-y-2">
            <span className="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest block mb-2">
              [ SOMETHING ABOUT ME ]
            </span>

            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white uppercase tracking-tight leading-tight">
              DEVELOPING WITH DISCIPLINE
            </h2>

            {/* INTERACTIVE PORTRAIT */}
            <div className="relative group w-full max-w-[340px] pt-8 sm:pt-10">

              {/* Background glow */}
              <div className="absolute inset-10 bg-amber-500/20 blur-[65px] rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-700" />

              {/* Portrait frame */}
              <div className="relative rounded-2xl p-[2px] overflow-hidden bg-gradient-to-br from-amber-500/80 via-white/10 to-amber-700/60 shadow-xl transition-all duration-700 ease-out motion-safe:group-hover:-rotate-2 motion-safe:group-hover:scale-[1.03] group-hover:shadow-[0_20px_70px_rgba(245,158,11,0.18)]">

                <div className="relative overflow-hidden rounded-2xl bg-[#111216] aspect-[4/5]">

                  <img
                    src="/images/My%20pp.jpeg.jpg"
                    alt="Portrait of the developer"
                    loading="lazy"
                    className="w-full h-full object-cover object-center grayscale-[35%] scale-100 transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-110"
                  />

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-50 transition-opacity duration-500" />

                  {/* Moving light effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg]" />

                  {/* Bottom label */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 flex items-end justify-between">
                    <div>
                      <span className="block font-mono text-[10px] tracking-[0.25em] text-amber-400 uppercase mb-1">
                        THE PERSON BEHIND THE CODE
                      </span>
                      <span className="block text-white font-bold text-lg tracking-wide">
                        HAZIQ AHMED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating corner detail */}
              <div className="absolute -top-1 -right-2 sm:-right-4 z-10">
                <div className="bg-[#17181d] border border-amber-500/40 rounded-xl px-4 py-2 shadow-lg shadow-black/30 motion-safe:animate-[float_4s_ease-in-out_infinite]">
                  <span className="font-mono text-[10px] text-amber-400 tracking-widest uppercase">
                    ABOUT ME
                  </span>
                </div>
              </div>
              {/* Decorative corner line */}
              <div className="absolute -bottom-3 -left-3 w-16 h-16 border-l border-b border-amber-500/50 rounded-bl-2xl pointer-events-none" />
            </div>
          </div>
          {/* RIGHT COLUMN */}
          <div className="lg:col-span-7 space-y-6 font-mono text-sm sm:text-base text-zinc-200 leading-relaxed font-medium">
            <p>
              I specialize in designing and developing end-to-end software solutions across web, backend, and mobile platforms. My technical experience spans the MERN stack, Flutter, and ASP.NET Core, allowing me to work across different layers of the development process. I focus on building scalable applications supported by well-structured architecture, efficient database systems, robust API integrations, and intuitive user experiences.
            </p>
            <p>
              My development approach combines technical precision with practical problem-solving. I believe that great software is not defined solely by its functionality, but also by how efficiently, reliably, and intuitively it performs. From designing application architecture and implementing complex business logic to managing data workflows and integrating backend services, I pay close attention to the details that contribute to a dependable final product.
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
