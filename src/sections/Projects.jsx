import React, { useState, useRef, useEffect } from 'react';
import * as projectSource from '../data/projects';
import ProjectModal from '../components/ProjectModal';
import Lightbox from '../components/Lightbox';

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [lightboxState, setLightboxState] = useState({ isOpen: false, images: [], currentIndex: 0 });
  const [bmwMuted, setBmwMuted] = useState(true);
  const bmwVideoRef = useRef(null);

  // Centralized scroll lock: Jab koi modal khula ho to lock, warna unlock
  useEffect(() => {
    const isAnyOpen = Boolean(selectedProject || lightboxState.isOpen);
    document.body.style.overflow = isAnyOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProject, lightboxState.isOpen]);

  const rawProjects = projectSource.projectsData || projectSource.default || projectSource.projects || [];
  const sortedProjects = Array.isArray(rawProjects)
    ? [...rawProjects].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const laptopHarbor = sortedProjects.find((p) => p.id === 'laptop-harbor') || sortedProjects[0] || null;
  const insuranceSystem = sortedProjects.find((p) => p.id === 'insurance-system') || sortedProjects[1] || null;
  const bmwConcept = sortedProjects.find((p) => p.id === 'bmw-concept') || sortedProjects[2] || null;

  const featuredIds = ['laptop-harbor', 'insurance-system', 'bmw-concept'];
  const secondaryProjects = sortedProjects.filter((p) => !featuredIds.includes(p.id));

  const toggleBmwSound = () => {
    if (!bmwVideoRef.current) return;
    bmwVideoRef.current.muted = !bmwVideoRef.current.muted;
    setBmwMuted(bmwVideoRef.current.muted);
  };

  const openLightboxForProject = (project, startIndex = 0) => {
    if (!project) return;
    const imgs = project.galleryImages && project.galleryImages.length > 0
      ? project.galleryImages
      : [{ src: project.primaryImage || '/images/LH/1.png', title: project.title }];

    setLightboxState({
      isOpen: true,
      images: imgs,
      currentIndex: startIndex
    });
  };

  const closeLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  const navigateLightbox = (newIndex) => {
    setLightboxState((prev) => ({ ...prev, currentIndex: newIndex }));
  };

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="projects" className="relative z-10 scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-28">
      <div className="flex justify-between items-end mb-12 sm:mb-16 border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs font-bold text-amber-500 uppercase block tracking-widest">[ PORTFOLIO SHOWCASE ]</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-6xl text-white uppercase tracking-tight mt-1">
            PROJECTS
          </h2>
        </div>
      </div>

      <div className="space-y-12 sm:space-y-16">
        {/* ================= 1. LAPTOP HARBOR ================= */}
        {laptopHarbor && (
          <article
            onMouseMove={handleCardMouseMove}
            className="spotlight-card bg-[#0c0d12]/96 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 md:p-12 rounded-3xl shadow-2xl transition-all duration-300 hover:border-amber-500/40"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-amber-500 block mb-1">01 // {(laptopHarbor.category || 'MOBILE APP').toUpperCase()}</span>
                <h3 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
                  {laptopHarbor.title || 'LAPTOP HARBOR'}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedProject(laptopHarbor)}
                  className="flex-1 sm:flex-none font-mono text-xs font-bold px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  MORE IMAGES ↗
                </button>
                <a
                  href={laptopHarbor.githubUrl || 'https://github.com/netox44'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none text-center font-mono text-xs font-bold px-5 py-2.5 bg-white text-black rounded-xl hover:bg-zinc-200 active:scale-95 transition-all"
                >
                  GITHUB REPO ↗
                </a>
              </div>
            </div>

            <p className="font-mono text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed mb-6 max-w-4xl">
              {laptopHarbor.description}
            </p>

            <div className="flex flex-wrap gap-2 font-mono text-[11px] sm:text-xs font-semibold mb-8">
              {(laptopHarbor.technologies || ['Flutter', 'Dart', 'Firebase']).map((tech) => (
                <span key={tech} className="px-3 py-1 bg-white/[0.08] border border-white/15 rounded-lg text-zinc-100">
                  {tech}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div
                onClick={() => openLightboxForProject(laptopHarbor, 0)}
                className="md:col-span-8 aspect-video bg-black/50 border border-white/15 rounded-2xl p-2.5 shadow-md overflow-hidden relative group cursor-pointer hover:border-amber-500/50 transition-colors flex items-center justify-center"
              >
                <span className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-black/80 text-white font-mono text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  EXPAND FULLSCREEN ↗
                </span>
                <img
                  src={laptopHarbor.primaryImage || '../dist/images/LH/1.png'}
                  alt="Laptop Harbor Main Screen"
                  decoding="async"
                  className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '../dist/images/LH/1.png';
                  }}
                />
              </div>

              <div className="md:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
                {(laptopHarbor.secondaryImages || ['/images/LH/2.png', '/images/LH/3.png']).map((imgSrc, i) => (
                  <div
                    key={i}
                    onClick={() => openLightboxForProject(laptopHarbor, i + 1)}
                    className="aspect-[9/16] bg-black/50 border border-white/15 rounded-2xl p-2 shadow-md overflow-hidden relative group cursor-pointer hover:border-amber-500/50 transition-colors flex items-center justify-center"
                  >
                    <img
                      src={imgSrc || `/images/LH/${i + 2}.png`}
                      alt={`Laptop Harbor Screen ${i + 1}`}
                      decoding="async"
                      className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `../dist/images/LH/${i + 2}.png`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </article>
        )}

        {/* ================= 2. INSURANCE SYSTEM ================= */}
        {insuranceSystem && (
          <article
            onMouseMove={handleCardMouseMove}
            className="spotlight-card bg-[#0c0d12]/96 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 md:p-12 rounded-3xl shadow-2xl transition-all duration-300 hover:border-amber-500/40"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-amber-500 block mb-1">02 // {(insuranceSystem.category || 'WEB PLATFORM').toUpperCase()}</span>
                <h3 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
                  {insuranceSystem.title || 'INSURANCE SYSTEM'}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedProject(insuranceSystem)}
                  className="flex-1 sm:flex-none font-mono text-xs font-bold px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  MORE IMAGES ↗
                </button>
                <a
                  href={insuranceSystem.githubUrl || 'https://github.com/netox44'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none text-center font-mono text-xs font-bold px-5 py-2.5 bg-white text-black rounded-xl hover:bg-zinc-200 active:scale-95 transition-all"
                >
                  GITHUB REPO ↗
                </a>
              </div>
            </div>

            <p className="font-mono text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed mb-6 max-w-4xl">
              {insuranceSystem.description}
            </p>

            <div className="flex flex-wrap gap-2 font-mono text-[11px] sm:text-xs font-semibold mb-8">
              {(insuranceSystem.technologies || ['ASP.NET Core', 'C#', 'SQL Server']).map((tech) => (
                <span key={tech} className="px-3 py-1 bg-white/[0.08] border border-white/15 rounded-lg text-zinc-100">
                  {tech}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => openLightboxForProject(insuranceSystem, 0)}
                className="md:col-span-2 aspect-video bg-black/50 border border-white/15 rounded-2xl p-2.5 shadow-md overflow-hidden relative group cursor-pointer hover:border-amber-500/50 transition-colors flex items-center justify-center"
              >
                <img
                  src={insuranceSystem.primaryImage || '../dist/images/Insurance/1.png'}
                  alt="Insurance System Main Screen"
                  decoding="async"
                  className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '../dist/images/Insurance/1.png';
                  }}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4">
                {(insuranceSystem.secondaryImages || ['/images/Insurance/2.png', '/images/Insurance/3.png']).map((imgSrc, i) => (
                  <div
                    key={i}
                    onClick={() => openLightboxForProject(insuranceSystem, i + 1)}
                    className="aspect-video bg-black/50 border border-white/15 rounded-2xl p-2 shadow-md overflow-hidden relative group cursor-pointer hover:border-amber-500/50 transition-colors flex items-center justify-center"
                  >
                    <img
                      src={imgSrc || `/images/Insurance/${i + 2}.png`}
                      alt={`Insurance Screen ${i + 1}`}
                      decoding="async"
                      className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `../dist/images/Insurance/${i + 2}.png`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </article>
        )}

        {/* ================= 3. CONCEPT DESIGN — BMW ================= */}
        {bmwConcept && (
          <article
            onMouseMove={handleCardMouseMove}
            className="spotlight-card bg-[#0c0d12]/96 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 md:p-12 rounded-3xl shadow-2xl transition-all duration-300 hover:border-amber-500/40"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-amber-500 block mb-1">03 // {(bmwConcept.category || 'WEB EXPERIENCE').toUpperCase()}</span>
                <h3 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
                  {bmwConcept.title || 'CONCEPT DESIGN — BMW'}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5 sm:gap-3 w-full sm:w-auto">
                <a
                  href={bmwConcept.liveUrl || 'https://maazbmwproj.netlify.app/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none text-center font-mono text-xs font-bold px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl active:scale-95 transition-all"
                >
                  LIVE PREVIEW ↗
                </a>
                <a
                  href={bmwConcept.githubUrl || 'https://github.com/netox44'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none text-center font-mono text-xs font-bold px-5 py-2.5 bg-white text-black rounded-xl hover:bg-zinc-200 active:scale-95 transition-all"
                >
                  GITHUB REPO ↗
                </a>
              </div>
            </div>

            <p className="font-mono text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed mb-6 max-w-4xl">
              {bmwConcept.description}
            </p>

            <div className="aspect-video bg-black/70 border border-white/15 rounded-2xl p-2 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleBmwSound}
                  className="p-2.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white hover:text-black active:scale-95 transition-all font-mono text-xs font-bold cursor-pointer"
                >
                  {bmwMuted ? '🔇 SOUND OFF' : '🔊 SOUND ON'}
                </button>
              </div>

              <video
                ref={bmwVideoRef}
                src={bmwConcept.videoUrl || '../dist/videos/BM.mp4'}
                className="w-full h-full object-cover rounded-xl"
                autoPlay
                loop
                muted={bmwMuted}
                playsInline
                preload="auto"
              />
            </div>
          </article>
        )}

        {/* ================= 4, 5, 6, 7. SECONDARY PROJECTS (2-COLUMN GRID) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {secondaryProjects.map((proj) => {
            const fallbackImg = proj.primaryImage || '../dist/images/GS/1.png';

            return (
              <article
                key={proj.id}
                onMouseMove={handleCardMouseMove}
                className="spotlight-card bg-[#0c0d12]/96 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold text-amber-500">
                      0{proj.order} // {(proj.category || 'PROJECT').toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProject(proj)}
                      className="font-mono text-xs font-bold text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      SHOW MORE ↗
                    </button>
                  </div>
                  <h4 className="font-display font-extrabold text-xl sm:text-2xl text-white uppercase tracking-tight mb-2">
                    {proj.title}
                  </h4>
                  <p className="font-mono text-xs text-zinc-200 font-medium leading-relaxed mb-6">
                    {proj.description}
                  </p>
                </div>

                <div
                  onClick={() => openLightboxForProject(proj, 0)}
                  className="aspect-video bg-black/50 border border-white/15 rounded-2xl p-2 shadow-md overflow-hidden relative group cursor-pointer hover:border-amber-500/50 transition-colors flex items-center justify-center"
                >
                  <img
                    src={proj.primaryImage || fallbackImg}
                    alt={`${proj.title} Interface`}
                    decoding="async"
                    className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImg;
                    }}
                  />
                </div>

                <div className="flex gap-3 sm:gap-4 mt-6">
                  <a
                    href={proj.liveUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 font-mono text-xs font-bold rounded-xl active:scale-95 transition text-white"
                  >
                    LIVE PREVIEW ↗
                  </a>
                  <a
                    href={proj.githubUrl || 'https://github.com/netox44'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 bg-white text-black font-mono text-xs font-bold rounded-xl hover:bg-zinc-200 active:scale-95 transition"
                  >
                    GITHUB REPO ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ================= MODAL & LIGHTBOX STACK ================= */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onOpenLightboxWithIndex={(idx) => {
          if (selectedProject) {
            openLightboxForProject(selectedProject, idx);
          }
        }}
      />

      <Lightbox
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        currentIndex={lightboxState.currentIndex}
        onClose={closeLightbox}
        onNavigate={navigateLightbox}
      />
    </section>
  );
}