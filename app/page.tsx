"use client";

import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { useEffect, useRef, useState } from "react";

import HeroWebGL from "./components/HeroWebGL";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const projects = [
  {
    number: "01",
    title: "Katy Webb Photography",
    category: "Luxury Photography",
    description:
      "A refined digital experience for a destination wedding photographer working across France and Europe.",
    image: "/projects/katy.jpg",
    href: "#",
  },
  {
    number: "02",
    title: "Premier Pools & Gardens",
    category: "Luxury Property",
    description:
      "A cinematic website designed around premium pool and garden maintenance across South West France.",
    image: "/projects/premier.jpg",
    href: "#",
  },
  {
    number: "03",
    title: "The Property Studio",
    category: "Property / Creative",
    description:
      "A visual-first identity and website for high-end property photography, video and drone work.",
    image: "/projects/property-studio.jpg",
    href: "#",
  },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let animationFrame = 0;

    const handleMouseMove = (event: MouseEvent) => {
      cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;

        setMouse({ x, y });
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const heroRotateX = mouse.y * -10;
  const heroRotateY = mouse.x * 14;

  const lightX = mouse.x * 80;
  const lightY = mouse.y * 80;

  return (
    <main
      className={`${sans.className} min-h-screen overflow-x-hidden bg-[#080808] text-[#f2f0eb]`}
    >
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #080808;
        }

        ::selection {
          background: #f2f0eb;
          color: #080808;
        }

        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
        }

        .outline-text {
          -webkit-text-stroke: 1px rgba(242, 240, 235, 0.8);
          color: transparent;
        }

        .project-image {
          transition:
            transform 900ms cubic-bezier(0.16, 1, 0.3, 1),
            filter 700ms ease;
        }

        .project-card:hover .project-image {
          transform: scale(1.055);
          filter: saturate(1.08);
        }

        .magnetic {
          transition:
            transform 500ms cubic-bezier(0.16, 1, 0.3, 1),
            background-color 300ms ease;
        }

        .magnetic:hover {
          transform: translateY(-3px);
        }

              /* ---------------------------------------------------------
         ABSTRACT MENU CONTROL
      --------------------------------------------------------- */

      .menu-control {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 72px;
        border: 1px solid rgba(242, 240, 235, 0.18);
        border-radius: 999px;
        background: rgba(242, 240, 235, 0.025);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        transition:
          transform 700ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 500ms ease,
          background-color 500ms ease;
      }

      .menu-control::before {
        content: "";
        position: absolute;
        inset: 6px;
        border: 1px solid rgba(242, 240, 235, 0.08);
        border-radius: 999px;
        transition:
          transform 800ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 500ms ease;
      }

      .menu-control::after {
        content: "";
        position: absolute;
        width: 3px;
        height: 3px;
        top: 13px;
        right: 16px;
        border-radius: 999px;
        background: rgba(242, 240, 235, 0.8);
        transition:
          transform 700ms cubic-bezier(0.16, 1, 0.3, 1),
          opacity 400ms ease;
      }

      .menu-control:hover {
        transform: rotate(8deg) scale(1.04);
        border-color: rgba(242, 240, 235, 0.38);
        background: rgba(242, 240, 235, 0.06);
      }

      .menu-control:hover::before {
        transform: rotate(-16deg) scale(0.92);
        border-color: rgba(242, 240, 235, 0.16);
      }

      .menu-control.open {
        transform: rotate(45deg);
        border-color: rgba(242, 240, 235, 0.35);
        background: rgba(242, 240, 235, 0.07);
      }

      .menu-control.open::before {
        transform: rotate(-70deg) scale(0.92);
        border-color: rgba(242, 240, 235, 0.2);
      }

      .menu-control.open::after {
        transform: scale(0);
        opacity: 0;
      }

      .menu-control-inner {
        position: relative;
        z-index: 2;
        display: flex;
        width: 20px;
        height: 20px;
        align-items: center;
        justify-content: center;
      }

      .menu-line {
        position: absolute;
        width: 18px;
        height: 1px;
        background: currentColor;
        transition:
          transform 600ms cubic-bezier(0.16, 1, 0.3, 1),
          opacity 400ms ease;
      }

      .menu-line:first-child {
        transform: translateY(-3px);
      }

      .menu-line:last-child {
        transform: translateY(3px);
      }

      .menu-control.open .menu-line:first-child {
        transform: rotate(45deg);
      }

      .menu-control.open .menu-line:last-child {
        transform: rotate(-45deg);
      }

      .menu-label {
        position: absolute;
        right: 82px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 8px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: rgba(242, 240, 235, 0.38);
        white-space: nowrap;
        transition:
          opacity 400ms ease,
          transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .menu-control-wrap:hover .menu-label {
        opacity: 0.75;
        transform: translate(-4px, -50%);
      }

      @media (max-width: 640px) {
        .menu-control {
          width: 60px;
          height: 60px;
        }

        .menu-label {
          display: none;
        }
      }
        /* ---------------------------------------------------------
           HERO MOTION
        --------------------------------------------------------- */

        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbitReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes floatObject {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes breathe {
          0%,
          100% {
            transform: scale(0.96);
            opacity: 0.35;
          }

          50% {
            transform: scale(1.04);
            opacity: 0.65;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-120%) rotate(20deg);
          }

          100% {
            transform: translateX(120%) rotate(20deg);
          }
        }

        @keyframes pulseDot {
          0%,
          100% {
            transform: scale(0.8);
            opacity: 0.35;
          }

          50% {
            transform: scale(1.4);
            opacity: 1;
          }
        }

        .orbit {
          animation: orbit 24s linear infinite;
        }

        .orbit-reverse {
          animation: orbitReverse 18s linear infinite;
        }

        .float-object {
          animation: floatObject 7s ease-in-out infinite;
        }

        .breathe {
          animation: breathe 5s ease-in-out infinite;
        }

        .pulse-dot {
          animation: pulseDot 3s ease-in-out infinite;
        }

        .shimmer {
          animation: shimmer 7s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* GLOBAL NOISE */}

      <div className="noise pointer-events-none fixed inset-0 z-[100] opacity-[0.025]" />

      {/* =========================================================
          NAVIGATION
      ========================================================= */}

      <header className="fixed left-0 right-0 top-0 z-[80] flex items-center justify-between px-6 py-6 mix-blend-difference md:px-10 md:py-8">
        <a
          href="#"
          className="relative z-10 text-sm font-semibold tracking-[-0.04em]"
        >
          JW<span className="opacity-40">/</span>STUDIO
        </a>

             <div className="menu-control-wrap relative z-10">
        <span className="menu-label">
          {menuOpen ? "Close" : "Navigate"}
        </span>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className={`menu-control ${
            menuOpen ? "open" : ""
          }`}
        >
          <span className="menu-control-inner">
            <span className="menu-line" />
            <span className="menu-line" />
          </span>
        </button>
      </div>

      </header>

      {/* =========================================================
          MENU
      ========================================================= */}

      <div
        className={`fixed inset-0 z-[70] flex items-center justify-center bg-[#0b0b0b] transition-all duration-700 ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-2">
          {["Work", "Studio", "Services", "Contact"].map((item, index) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className={`text-[clamp(3rem,9vw,8rem)] font-light tracking-[-0.07em] transition-all duration-500 hover:italic ${
                menuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{
                transitionDelay: `${index * 70}ms`,
              }}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-8 left-6 text-[9px] uppercase tracking-[0.2em] text-white/30 md:left-10">
          Independent digital studio
        </div>
      </div>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section
        ref={heroRef}
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 pb-8 pt-32 md:px-10 md:pb-10"
      >
        {/* ---------------------------------------------------------
            ATMOSPHERIC LIGHT
        --------------------------------------------------------- */}

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[60vw] w-[60vw] max-h-[900px] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[110px]"
          style={{
            background: `radial-gradient(
              circle at ${50 + mouse.x * 20}% ${50 + mouse.y * 20}%,
              rgba(150,180,160,0.20),
              rgba(100,120,110,0.06) 35%,
              transparent 70%
            )`,
          }}
        />

        {/* Cursor light */}

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[400px] w-[400px] rounded-full opacity-30 blur-[100px] transition-transform duration-700 ease-out"
          style={{
            transform: `translate(
              calc(-50% + ${lightX}px),
              calc(-50% + ${lightY}px)
            )`,
            background:
              "radial-gradient(circle, rgba(220,235,225,0.12), transparent 65%)",
          }}
        />

      {/* <HeroWebGL /> */}

        {/* ---------------------------------------------------------
            HERO CONTENT
        --------------------------------------------------------- */}

        <div className="relative z-20 mt-auto">
          <div className="mb-5 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-white/40">
            <span>Digital studio / 2026</span>

            <span className="hidden md:block">
              Design · Development · Motion
            </span>
          </div>

          <h1 className="select-none text-[19vw] font-light leading-[0.72] tracking-[-0.09em] md:text-[17vw]">
            <span className="block">JW</span>

            <span className="outline-text ml-[12vw] block">STUDIO</span>
          </h1>

          <div className="mt-8 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <p className="max-w-md text-sm font-light leading-relaxed text-white/55 md:text-base">
              Independent digital studio creating distinctive websites,
              identities and interactive experiences for ambitious brands.
            </p>

            <a
              href="#work"
              className="magnetic group flex w-fit items-center gap-4 border-b border-white/30 pb-2 text-[10px] uppercase tracking-[0.2em]"
            >
              Explore selected work

              <span className="transition-transform duration-500 group-hover:translate-x-2">
                ↗
              </span>
            </a>
          </div>
        </div>

        {/* bottom coordinates */}

        <div className="absolute bottom-10 left-6 hidden text-[8px] uppercase tracking-[0.2em] text-white/20 md:block md:left-10">
          53.4084° N
          <br />
          2.9916° W
        </div>

        {/* Scroll marker */}

        <div className="absolute bottom-10 right-6 hidden items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-white/30 md:flex">
          <span>Scroll</span>
          <span className="h-12 w-px bg-white/20" />
        </div>
      </section>

      {/* =========================================================
          INTRO
      ========================================================= */}

      <section
        id="studio"
        className="relative border-t border-white/10 px-6 py-32 md:px-10 md:py-48"
      >
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
              01 / Studio
            </p>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <p className="text-[clamp(2.2rem,5vw,5rem)] font-light leading-[1.02] tracking-[-0.06em]">
              Websites should do more than{" "}
              <span className={`${serif.className} italic text-white/50`}>
                exist.
              </span>
            </p>

            <p className="mt-12 max-w-lg text-sm leading-7 text-white/45">
              JW Studio combines visual design, modern development and motion
              to create digital experiences that feel considered from the
              first interaction to the last.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          WORK
      ========================================================= */}

      <section id="work" className="relative px-6 pb-32 md:px-10 md:pb-48">
        <div className="mb-16 flex items-end justify-between border-b border-white/10 pb-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
            02 / Selected work
          </p>

          <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
            03 projects
          </p>
        </div>

        <div className="space-y-24 md:space-y-40">
          {projects.map((project) => (
            <article
              key={project.title}
              className="project-card group relative"
            >
              <div className="mb-5 flex items-end justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-white/30">
                    {project.number}
                  </span>

                  <span className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                    {project.category}
                  </span>
                </div>

                <span className="hidden text-[9px] uppercase tracking-[0.2em] text-white/30 md:block">
                  View project ↗
                </span>
              </div>

              <a
                href={project.href}
                className="relative block aspect-[16/9] overflow-hidden bg-[#111]"
              >
                <div
                  className="project-image absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${project.image})`,
                  }}
                />

                <div className="absolute inset-0 bg-black/10 transition-colors duration-700 group-hover:bg-black/0" />

                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                  <h2 className="text-[clamp(2rem,5vw,5rem)] font-light leading-none tracking-[-0.06em]">
                    {project.title}
                  </h2>
                </div>

                <div className="absolute bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/10 text-lg backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-black md:bottom-10 md:right-10">
                  ↗
                </div>
              </a>

              <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row">
                <p className="max-w-md text-xs leading-6 text-white/40">
                  {project.description}
                </p>

                <div className="flex gap-2 text-[9px] uppercase tracking-[0.15em] text-white/30">
                  <span>Design</span>
                  <span>·</span>
                  <span>Development</span>
                  <span>·</span>
                  <span>Motion</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =========================================================
          SERVICES
      ========================================================= */}

      <section
        id="services"
        className="relative overflow-hidden border-y border-white/10 px-6 py-32 md:px-10 md:py-48"
      >
        <div className="absolute right-[-10vw] top-1/2 h-[35vw] w-[35vw] -translate-y-1/2 rounded-full border border-white/[0.06]" />

        <div className="grid gap-20 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
              03 / Capabilities
            </p>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            {[
              ["01", "Web Design"],
              ["02", "Development"],
              ["03", "Motion & Interaction"],
              ["04", "Digital Identity"],
            ].map(([number, title]) => (
              <div
                key={number}
                className="group flex items-center justify-between border-b border-white/10 py-7 transition-colors duration-500 hover:border-white/40"
              >
                <div className="flex items-center gap-8">
                  <span className="text-[9px] text-white/25">{number}</span>

                  <span className="text-[clamp(1.8rem,4vw,4rem)] font-light tracking-[-0.05em] transition-transform duration-500 group-hover:translate-x-3">
                    {title}
                  </span>
                </div>

                <span className="text-white/30 transition-transform duration-500 group-hover:translate-x-2 group-hover:text-white">
                  ↗
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          STATEMENT
      ========================================================= */}

      <section className="relative px-6 py-40 md:px-10 md:py-64">
        <div className="mx-auto max-w-[1400px] text-center">
          <p className="mb-10 text-[9px] uppercase tracking-[0.25em] text-white/30">
            Built for the screen
          </p>

          <h2 className="text-[clamp(3.5rem,10vw,10rem)] font-light leading-[0.82] tracking-[-0.08em]">
            <span className="block">MAKE IT</span>

            <span className={`${serif.className} italic text-white/50`}>
              memorable.
            </span>
          </h2>
        </div>
      </section>

      {/* =========================================================
          CONTACT
      ========================================================= */}

      <section
        id="contact"
        className="relative min-h-[80vh] overflow-hidden border-t border-white/10 px-6 py-16 md:px-10"
      >
        <div className="flex min-h-[70vh] flex-col justify-between">
          <div className="flex justify-between">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
              04 / Contact
            </p>

            <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
              Available for selected projects
            </p>
          </div>

          <div>
            <p className="mb-8 text-sm text-white/40">
              Have something worth building?
            </p>

            <a
              href="mailto:hello@jwstudio.design"
              className="group block text-[clamp(3rem,10vw,11rem)] font-light leading-[0.8] tracking-[-0.08em]"
            >
              <span className="transition-all duration-700 group-hover:italic">
                LET&apos;S
              </span>

              <br />

              <span className="outline-text transition-all duration-700 group-hover:text-white">
                CREATE.
              </span>
            </a>
          </div>

          <div className="flex flex-col justify-between gap-6 border-t border-white/10 pt-6 text-[9px] uppercase tracking-[0.18em] text-white/30 md:flex-row">
            <span>JW Studio © 2026</span>

            <span>Designed & developed by JW Studio</span>

            <span>United Kingdom / France</span>
          </div>
        </div>
      </section>
    </main>
  );
}