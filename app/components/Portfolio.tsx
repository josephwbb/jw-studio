"client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Project = {
  number: string;
  title: string;
  category: string;
  year: string;
  description: string;
  image: string;
  accent: string;
};

const projects: Project[] = [
  {
    number: "01",
    title: "Katy Webb Photography",
    category: "Wedding / Photography",
    year: "2025",
    description: "A refined digital experience for a destination wedding photographer working across France and Europe.",
    image: "/projects/katy.jpg",
    accent: "Luxury destination wedding photography",
  },
  {
    number: "02",
    title: "Premier Pools & Gardens",
    category: "Property / Luxury",
    year: "2025",
    description: "A cinematic website designed around premium pool and garden maintenance across South West France.",
    image: "/projects/premier.jpg",
    accent: "Luxury property services",
  },
  {
    number: "03",
    title: "The Property Studio",
    category: "Property / Creative",
    year: "2024",
    description: "A visual-first identity and website for high-end property photography, video and drone work.",
    image: "/projects/property-studio.jpg",
    accent: "Property / Photography / Film",
  },
];

const dialPositions = [
  { x: -260, y: -120, rotation: -2, scale: 1 },
  { x: 260, y: -100, rotation: 2, scale: 0.95 },
  { x: 20, y: 210, rotation: -1, scale: 0.98 },
];

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Fragment refs for the physical print assembly intro
  const fragmentContainerRef = useRef<HTMLDivElement>(null);
  const stripTopRef = useRef<HTMLDivElement>(null);
  const stripBottomRef = useRef<HTMLDivElement>(null);
  const blockLeftRef = useRef<HTMLDivElement>(null);
  const blockRightRef = useRef<HTMLDivElement>(null);
  const statementTextRef = useRef<HTMLHeadingElement>(null);

  // Dial refs
  const markRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const projectRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  // Preview refs
  const previewRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLDivElement>(null);

  const [activeProject, setActiveProject] = useState<number | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const fragmentContainer = fragmentContainerRef.current;
    const stripTop = stripTopRef.current;
    const stripBottom = stripBottomRef.current;
    const blockLeft = blockLeftRef.current;
    const blockRight = blockRightRef.current;
    const statementText = statementTextRef.current;
    const mark = markRef.current;
    const dial = dialRef.current;
    const core = coreRef.current;

    if (
      !section ||
      !fragmentContainer ||
      !stripTop ||
      !stripBottom ||
      !blockLeft ||
      !blockRight ||
      !statementText ||
      !mark ||
      !dial ||
      !core
    )
      return;

    const ctx = gsap.context(() => {
      const projectEls = projectRefs.current.filter((el): el is HTMLButtonElement => Boolean(el));
      const ringEls = ringRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      const ruleEls = ruleRefs.current.filter((el): el is HTMLDivElement => Boolean(el));

      // Initial Setup: Fragments start off-screen or scaled out
      gsap.set(fragmentContainer, { opacity: 1, scale: 1 });
      gsap.set(stripTop, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(stripBottom, { scaleX: 0, transformOrigin: "right center" });
      gsap.set(blockLeft, { x: -100, opacity: 0 });
      gsap.set(blockRight, { x: 100, opacity: 0 });
      gsap.set(statementText, { opacity: 0, scale: 1, filter: "blur(0px)" });

      gsap.set(mark, { opacity: 0, scale: 0.2, rotation: -15 });
      gsap.set(dial, { opacity: 0, scale: 0.4 });
      gsap.set(core, { scale: 0, opacity: 0 });

      ringEls.forEach((ring, i) => {
        gsap.set(ring, { opacity: 0, scale: 0.6, rotation: i * 10 });
      });

      ruleEls.forEach((rule) => {
        gsap.set(rule, { opacity: 0, scaleX: 0, transformOrigin: "0% 50%" });
      });

      projectEls.forEach((proj) => {
        gsap.set(proj, { opacity: 0, x: 0, y: 0, scale: 0.3 });
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Phase 1: Physical Assembly of Editorial Layout (0% to 30%)
      // 1. Thin orange rectangular strips sweep in
      timeline.to(stripTop, { scaleX: 1, duration: 0.35, ease: "power2.out" }, 0);
      timeline.to(stripBottom, { scaleX: 1, duration: 0.35, ease: "power2.out" }, 0.05);

      // 2. Editorial blocks/crop marks slide into formation
      timeline.to(blockLeft, { x: 0, opacity: 0.15, duration: 0.4, ease: "power3.out" }, 0.2);
      timeline.to(blockRight, { x: 0, opacity: 0.15, duration: 0.4, ease: "power3.out" }, 0.25);

      // 3. The exact typography is revealed through the structured composition
      timeline.to(
        statementText,
        {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        0.4
      );

      // Phase 2: Collapse & Transformation into the Dial (35% to 65%)
      // 1. The editorial frame & text collapse inward together
      timeline.to(
        fragmentContainer,
        {
          scale: 0.08,
          opacity: 0,
          filter: "blur(6px)",
          duration: 0.8,
          ease: "power3.inOut",
        },
        1.0
      );

      // 2. Printer's registration seed mark forms from the collapse point
      timeline.to(
        mark,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        1.7
      );

      // 3. The archival architecture diagram / dial unfolds
      timeline.to(
        dial,
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
        },
        1.9
      );

      timeline.to(
        core,
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(1.5)",
        },
        2.1
      );

      ringEls.forEach((ring, index) => {
        timeline.to(
          ring,
          {
            opacity: index === 0 ? 0.35 : index === 1 ? 0.22 : 0.15,
            scale: 1,
            rotation: 0,
            duration: 1.0,
            ease: "power2.out",
          },
          2.0 + index * 0.12
        );
      });

      ruleEls.forEach((rule, index) => {
        timeline.to(
          rule,
          {
            opacity: 0.3,
            scaleX: 1,
            duration: 0.8,
            ease: "power2.out",
          },
          2.2 + index * 0.08
        );
      });

      // Phase 3: Project plates emerge into architectural layout (70% to 95%)
      projectEls.forEach((proj, index) => {
        const pos = dialPositions[index];
        timeline.to(
          proj,
          {
            opacity: 1,
            x: pos.x,
            y: pos.y,
            scale: pos.scale,
            rotation: pos.rotation,
            duration: 1.1,
            ease: "power3.out",
          },
          2.5 + index * 0.15
        );
      });

      // Phase 4: Final settled state
      timeline.to(
        dial,
        {
          rotation: 1,
          duration: 1.2,
          ease: "sine.inOut",
        },
        3.2
      );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const preview = previewRef.current;
    const previewImage = previewImageRef.current;

    if (!preview || !previewImage) return;

    if (activeProject === null) {
      gsap.to(preview, {
        opacity: 0,
        scale: 0.95,
        y: 12,
        duration: 0.3,
        ease: "power3.out",
        overwrite: true,
      });
      return;
    }

    const project = projects[activeProject];
    gsap.killTweensOf([preview, previewImage]);

    gsap.set(previewImage, { backgroundImage: `url(${project.image})` });

    gsap.fromTo(
      preview,
      { opacity: 0, scale: 0.95, y: 12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out", overwrite: true }
    );
  }, [activeProject]);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-[#080808] text-[#f2f0eb]"
    >
      {/* =====================================================
          PHYSICAL PRINT ASSEMBLY INTRO (RECTANGULAR FRAGMENTS)
      ===================================================== */}
      <div
        ref={fragmentContainerRef}
        className="absolute inset-0 z-10 flex items-center justify-center px-6 pointer-events-none"
      >
        {/* Geometric Layout Guide Blocks */}
        <div
          ref={blockLeftRef}
          className="absolute left-[10%] top-1/2 -translate-y-1/2 w-[18vw] h-[35vh] border border-[#B7653C]/30 bg-[#B7653C]/5 pointer-events-none hidden md:block"
        />
        <div
          ref={blockRightRef}
          className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[18vw] h-[35vh] border border-[#B7653C]/30 bg-[#B7653C]/5 pointer-events-none hidden md:block"
        />

        {/* Thin Aged Orange Editorial Registration Strips */}
        <div
          ref={stripTopRef}
          className="absolute top-[32%] left-[15%] right-[15%] h-[1px] bg-[#B7653C]/70"
        />
        <div
          ref={stripBottomRef}
          className="absolute bottom-[32%] left-[15%] right-[15%] h-[1px] bg-[#B7653C]/70"
        />

        {/* Typography revealed through structural assembly */}
        <h2
          ref={statementTextRef}
          className="max-w-[1300px] text-center text-[clamp(3.5rem,11vw,11.5rem)] font-bold leading-[0.82] tracking-[-0.085em]"
        >
          WORK THAT
          <br />
          SPEAKS FOR ITSELF.
        </h2>
      </div>

      {/* =====================================================
          ARCHIVAL REGISTRATION MARK (SEED)
      ===================================================== */}
      <div
        ref={markRef}
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-0"
      >
        <div className="relative w-8 h-8 border border-[#B7653C]/50 flex items-center justify-center bg-[#080808]">
          <div className="absolute w-2 h-2 bg-[#B7653C]/80" />
          <div className="absolute w-full h-[0.5px] bg-[#B7653C]/30" />
          <div className="absolute h-full w-[0.5px] bg-[#B7653C]/30" />
        </div>
      </div>

      {/* =====================================================
          OLD ARCHITECTURAL DIAL COMPOSITION
      ===================================================== */}
      <div
        ref={dialRef}
        className="absolute left-1/2 top-1/2 z-30 w-[min(90vw,680px)] h-[min(90vw,680px)] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        {/* Fine Architectural & Cartographic Circles */}
        <div
          ref={(el) => { ringRefs.current[0] = el; }}
          className="absolute inset-0 rounded-full border border-white/15"
        />
        <div
          ref={(el) => { ringRefs.current[1] = el; }}
          className="absolute inset-10 rounded-full border border-dashed border-[#B7653C]/35"
        />
        <div
          ref={(el) => { ringRefs.current[2] = el; }}
          className="absolute inset-24 rounded-full border border-white/10"
        />

        {/* Fine Construction Crosshairs & Tick Rules */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={(el) => { ruleRefs.current[0] = el; }}
            className="absolute w-1/2 h-[0.5px] bg-[#B7653C]/40 left-1/2"
          />
          <div
            ref={(el) => { ruleRefs.current[1] = el; }}
            className="absolute h-1/2 w-[0.5px] bg-[#B7653C]/40 top-1/2"
          />
          <div
            ref={(el) => { ruleRefs.current[2] = el; }}
            className="absolute w-[42%] h-[0.5px] bg-white/15 left-1/2 rotate-[30deg] origin-left"
          />
          <div
            ref={(el) => { ruleRefs.current[3] = el; }}
            className="absolute w-[42%] h-[0.5px] bg-white/15 left-1/2 -rotate-[30deg] origin-left"
          />
        </div>

        {/* Central Cartographic Point */}
        <div
          ref={coreRef}
          className="absolute left-1/2 top-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f2f0eb] border border-[#B7653C]/70"
        />

        {/* Vintage Sketchbook / Architecture Annotations */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[7.5px] font-mono uppercase tracking-[0.28em] text-white/35">
          FIG. 01 // PLATE ARCHIVE
        </div>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[7.5px] font-mono uppercase tracking-[0.28em] text-[#B7653C]/70">
          EDITION // MMXV
        </div>

        {/* =================================================
            THREE ARCHIVAL PROJECT PLATES
        ================================================= */}
        {projects.map((project, index) => {
          const pos = dialPositions[index];
          return (
            <div
              key={project.number}
              className="absolute left-1/2 top-1/2 pointer-events-auto"
              style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
            >
              <button
                ref={(el) => { projectRefs.current[index] = el; }}
                type="button"
                onMouseEnter={() => setActiveProject(index)}
                onMouseLeave={() => setActiveProject(null)}
                className="group relative w-[165px] p-2.5 bg-[#0e0e0e]/95 border border-white/15 hover:border-[#B7653C]/70 text-left transition-all duration-300 backdrop-blur-md will-change-transform"
                aria-label={`View ${project.title}`}
              >
                <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-[#B7653C]" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#B7653C]">
                    {project.number}
                  </span>
                  <span className="text-[8px] font-mono uppercase tracking-[0.16em] text-white/40">
                    {project.year}
                  </span>
                </div>

                <div className="aspect-[16/10] w-full mb-2 overflow-hidden bg-[#141414] border border-white/10">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105 filter sepia-[0.15]"
                    style={{ backgroundImage: `url(${project.image})` }}
                  />
                </div>

                <p className="text-[7px] font-mono uppercase tracking-[0.16em] text-white/45 truncate">
                  {project.category}
                </p>
                <p className="mt-0.5 text-[11px] font-medium leading-[1.1] tracking-[-0.02em] text-white truncate">
                  {project.title}
                </p>
              </button>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          EDITORIAL PROJECT PREVIEW CARD
      ===================================================== */}
      <div
        ref={previewRef}
        className="pointer-events-none absolute left-1/2 top-1/2 z-[100] w-[min(85vw,540px)] -translate-x-1/2 -translate-y-1/2 opacity-0"
      >
        {activeProject !== null && (
          <div className="grid overflow-hidden border border-[#B7653C]/30 bg-[#0c0c0c]/98 shadow-2xl backdrop-blur-xl md:grid-cols-[1.3fr_0.9fr]">
            <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
              <div
                ref={previewImageRef}
                className="absolute inset-0 bg-cover bg-center will-change-transform filter sepia-[0.1]"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute left-4 top-4 text-[8px] font-mono uppercase tracking-[0.2em] text-[#B7653C]">
                Plate // {projects[activeProject].number}
              </div>
            </div>

            <div className="flex flex-col justify-between p-5 sm:p-6">
              <div>
                <p className="mb-2 text-[8px] font-mono uppercase tracking-[0.2em] text-[#B7653C]">
                  {projects[activeProject].category}
                </p>
                <h3 className="text-lg font-light leading-tight tracking-[-0.04em] text-white">
                  {projects[activeProject].title}
                </h3>
                <p className="mt-3 text-[11px] leading-relaxed text-white/50">
                  {projects[activeProject].description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[8px] font-mono uppercase tracking-[0.16em] text-white/40">
                  {projects[activeProject].accent}
                </span>
                <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#B7653C]">
                  Index ↗
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          UI MARGIN LABELS
      ===================================================== */}
      <div className="absolute bottom-8 left-6 z-[110] text-[8px] font-mono uppercase tracking-[0.25em] text-white/30 sm:left-10">
        02 / SELECTED WORK
      </div>

      <div className="absolute bottom-8 right-6 z-[110] text-[8px] font-mono uppercase tracking-[0.25em] text-[#B7653C]/70 sm:right-10">
        SCROLL TO COMPOSE
      </div>
    </section>
  );
}