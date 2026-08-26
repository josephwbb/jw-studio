
"use client";

import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const HeroWebGL = dynamic(() => import("./components/HeroWebGL"), {
  ssr: false,
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

type MousePosition = {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
};

type InkPoint = {
  x: number;
  y: number;
  life: number;
  size: number;
};

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement>(null);

  const [mouse, setMouse] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [showWebGL, setShowWebGL] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const startWebGL = () => {
      setShowWebGL(true);
    };

    let idleId: number | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(startWebGL, {
        timeout: 2500,
      });
    } else {
      fallbackTimer = setTimeout(startWebGL, 1800);
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const updateDevice = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateDevice();
    mediaQuery.addEventListener("change", updateDevice);

    const handleMouseMove = (event: MouseEvent) => {
      mouseTarget.current.x = event.clientX;
      mouseTarget.current.y = event.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    let renderFrame: number;

    const animateMouse = () => {
      const target = mouseTarget.current;
      const current = mouseCurrent.current;

      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;

      const normalizedX = current.x / window.innerWidth - 0.5;
      const normalizedY = current.y / window.innerHeight - 0.5;

      setMouse({
        x: current.x,
        y: current.y,
        normalizedX,
        normalizedY,
      });

      renderFrame = requestAnimationFrame(animateMouse);
    };

    renderFrame = requestAnimationFrame(animateMouse);

    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }

      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }

      cancelAnimationFrame(renderFrame);

      window.removeEventListener("mousemove", handleMouseMove);
      mediaQuery.removeEventListener("change", updateDevice);
    };
  }, []);

  /*
   * INKY CURSOR
   *
   * The canvas is desktop-only and completely pointer-events-none.
   * It creates a soft trail which stretches and fades rather than
   * looking like a standard cursor particle effect.
   */
  useEffect(() => {
    if (!isDesktop) return;

    const canvas = inkCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const points: InkPoint[] = [];

    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    resize();

    const handlePointerMove = (event: PointerEvent) => {
      const last = points[points.length - 1];

      if (!last) {
        points.push({
          x: event.clientX,
          y: event.clientY,
          life: 1,
          size: 1,
        });

        return;
      }

      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 3) return;

      const steps = Math.min(Math.ceil(distance / 10), 6);

      for (let i = 1; i <= steps; i++) {
        const progress = i / steps;

        points.push({
          x: last.x + dx * progress,
          y: last.y + dy * progress,
          life: 1,
          size: 0.7 + Math.random() * 0.7,
        });
      }

      if (points.length > 90) {
        points.splice(0, points.length - 90);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (let i = points.length - 1; i >= 0; i--) {
        points[i].life -= 0.018;

        if (points[i].life <= 0) {
          points.splice(i, 1);
        }
      }

      if (points.length > 1) {
        context.save();

        context.globalCompositeOperation = "screen";
        context.lineCap = "round";
        context.lineJoin = "round";

        for (let i = 1; i < points.length; i++) {
          const previous = points[i - 1];
          const point = points[i];

          const progress = i / points.length;
          const opacity = point.life * progress * 0.12;

          const gradient = context.createLinearGradient(
            previous.x,
            previous.y,
            point.x,
            point.y
          );

          gradient.addColorStop(
            0,
            `rgba(220, 235, 225, ${opacity * 0.15})`
          );

          gradient.addColorStop(
            1,
            `rgba(220, 235, 225, ${opacity})`
          );

          context.strokeStyle = gradient;
          context.lineWidth = Math.max(
            0.5,
            point.size * point.life * 4
          );

          context.beginPath();
          context.moveTo(previous.x, previous.y);
          context.lineTo(point.x, point.y);
          context.stroke();
        }

        context.restore();
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);

    const handleResize = () => {
      resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      context.clearRect(0, 0, width, height);
    };
  }, [isDesktop]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const heroRotateX = mouse.normalizedY * -6;
  const heroRotateY = mouse.normalizedX * 9;

  const lightX = mouse.normalizedX * 70;
  const lightY = mouse.normalizedY * 70;

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

        @media (hover: hover) and (pointer: fine) {
          body {
            cursor: none;
          }

          a,
          button {
            cursor: none;
          }
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
           CUSTOM CURSOR
        --------------------------------------------------------- */

        .cursor-core {
          position: fixed;
          left: 0;
          top: 0;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: rgba(242, 240, 235, 0.95);
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          mix-blend-mode: difference;
          box-shadow:
            0 0 12px rgba(220, 235, 225, 0.2),
            0 0 28px rgba(220, 235, 225, 0.08);
        }

        .cursor-ring {
          position: fixed;
          left: 0;
          top: 0;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(242, 240, 235, 0.35);
          border-radius: 999px;
          pointer-events: none;
          z-index: 9998;
          transform: translate(-50%, -50%);
          transition:
            width 500ms cubic-bezier(0.16, 1, 0.3, 1),
            height 500ms cubic-bezier(0.16, 1, 0.3, 1),
            border-color 400ms ease;
          mix-blend-mode: difference;
        }

        /* ---------------------------------------------------------
           INKY TRAIL
        --------------------------------------------------------- */

        .ink-canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9997;
          mix-blend-mode: screen;
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

        /* ---------------------------------------------------------
           MOBILE
        --------------------------------------------------------- */

        @media (max-width: 640px) {
          .menu-control {
            width: 60px;
            height: 60px;
          }

          .menu-label {
            display: none;
          }

          .outline-text {
            -webkit-text-stroke: 0.8px rgba(242, 240, 235, 0.72);
          }
        }

        @media (max-width: 480px) {
          .menu-control {
            width: 56px;
            height: 56px;
          }

          .menu-control::before {
            inset: 5px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (hover: none), (pointer: coarse) {
          .cursor-core,
          .cursor-ring,
          .ink-canvas {
            display: none !important;
          }

          body {
            cursor: auto;
          }
        }
      `}</style>

      {/* GLOBAL NOISE */}
      <div className="noise pointer-events-none fixed inset-0 z-[100] opacity-[0.025]" />

      {/* CUSTOM CURSOR */}
      {isDesktop && (
        <>
          <div
            className="cursor-core"
            style={{
              left: mouse.x,
              top: mouse.y,
            }}
          />

          <div
            className="cursor-ring"
            style={{
              left: mouse.x,
              top: mouse.y,
            }}
          />

          <canvas
            ref={inkCanvasRef}
            className="ink-canvas"
            aria-hidden="true"
          />
        </>
      )}

      {/* =========================================================
          NAVIGATION
      ========================================================= */}

      <header className="fixed left-0 right-0 top-0 z-[80] flex items-center justify-between px-5 py-5 mix-blend-difference sm:px-6 sm:py-6 md:px-10 md:py-8">
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
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className={`menu-control ${menuOpen ? "open" : ""}`}
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
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[70] overflow-hidden bg-[#0b0b0b] transition-opacity duration-700 ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {/* Atmospheric menu circles */}

        <div
          className={`absolute left-1/2 top-1/2 h-[75vw] w-[75vw] max-h-[900px] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035] transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? "scale-100 rotate-0" : "scale-50 rotate-[-18deg]"
          }`}
        />

        <div
          className={`absolute left-1/2 top-1/2 h-[55vw] w-[55vw] max-h-[650px] max-w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04] transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? "scale-100 rotate-0" : "scale-50 rotate-[24deg]"
          }`}
        />

        <div
          className={`absolute left-1/2 top-1/2 h-[35vw] w-[35vw] max-h-[430px] max-w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.015] blur-3xl transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? "scale-100" : "scale-0"
          }`}
        />

        <nav className="relative z-10 flex h-full flex-col items-center justify-center gap-0">
          {["Work", "Studio", "Services", "Contact"].map(
            (item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className={`group relative text-[clamp(3.2rem,11vw,8rem)] font-light leading-[0.9] tracking-[-0.07em] transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:italic ${
                  menuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-16 opacity-0"
                }`}
                style={{
                  transitionDelay: `${index * 80 + 120}ms`,
                }}
              >
                <span className="relative">
                  {item}
                  <span className="absolute -right-5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 scale-0 rounded-full bg-white transition-transform duration-500 group-hover:scale-100" />
                </span>
              </a>
            )
          )}
        </nav>

        <div
          className={`absolute bottom-7 left-5 text-[8px] uppercase tracking-[0.2em] text-white/30 transition-all duration-700 sm:left-6 md:bottom-8 md:left-10 ${
            menuOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          Independent digital studio
        </div>

        <div
          className={`absolute bottom-7 right-5 text-[8px] uppercase tracking-[0.2em] text-white/20 transition-all duration-700 sm:right-6 md:bottom-8 md:right-10 ${
            menuOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          2026
        </div>
      </div>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section
        ref={heroRef}
        className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pb-7 pt-28 sm:px-6 sm:pb-8 sm:pt-32 md:min-h-screen md:px-10 md:pb-10"
      >
        {/* ATMOSPHERIC LIGHT */}

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[90vw] w-[90vw] max-h-[900px] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[90px] sm:blur-[110px]"
          style={{
            background: `radial-gradient(
              circle at ${50 + mouse.normalizedX * 20}%
              ${50 + mouse.normalizedY * 20}%,
              rgba(150,180,160,0.20),
              rgba(100,120,110,0.06) 35%,
              transparent 70%
            )`,
          }}
        />

        {/* Cursor light */}

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[80px] transition-transform duration-700 ease-out sm:h-[400px] sm:w-[400px] sm:blur-[100px]"
          style={{
            transform: `translate(
              calc(-50% + ${lightX}px),
              calc(-50% + ${lightY}px)
            )`,
            background:
              "radial-gradient(circle, rgba(220,235,225,0.12), transparent 65%)",
          }}
        />

        {/* WebGL */}

        {showWebGL && (
          <div
            className="pointer-events-none absolute left-1/2 top-[42%] z-[5] h-[52vh] w-[78vw] -translate-x-1/2 -translate-y-1/2 sm:top-1/2 sm:h-[65vh] sm:w-[70vw] md:h-[75vh] md:w-[70vw]"
            style={{
              transform: `translate(-50%, -50%) rotateX(${heroRotateX}deg) rotateY(${heroRotateY}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <HeroWebGL />
          </div>
        )}

        {/* HERO CONTENT */}

        <div className="relative z-20 mt-auto">
          <div className="mb-5 flex items-center justify-between text-[8px] uppercase tracking-[0.18em] text-white/40 sm:text-[9px] sm:tracking-[0.2em]">
            <span>Digital studio / 2026</span>

            <span className="hidden md:block">
              Design · Development · Motion
            </span>
          </div>

          <h1 className="select-none text-[22vw] font-light leading-[0.76] tracking-[-0.1em] sm:text-[20vw] md:text-[17vw]">
            <span className="block">JW</span>

            <span className="outline-text ml-[10vw] block">
              STUDIO
            </span>
          </h1>

          <div className="mt-7 flex flex-col justify-between gap-7 sm:mt-8 sm:gap-8 md:flex-row md:items-end">
            <p className="max-w-[320px] text-[13px] font-light leading-[1.7] text-white/55 sm:text-sm md:max-w-md md:text-base">
              Independent digital studio creating distinctive
              websites, identities and interactive experiences for
              ambitious brands.
            </p>

            <a
              href="#work"
              className="magnetic group flex w-fit items-center gap-4 border-b border-white/30 pb-2 text-[9px] uppercase tracking-[0.2em] sm:text-[10px]"
            >
              Explore selected work

              <span className="transition-transform duration-500 group-hover:translate-x-2">
                ↗
              </span>
            </a>
          </div>
        </div>

        {/* Bottom coordinates */}

        <div className="absolute bottom-8 left-5 hidden text-[8px] uppercase tracking-[0.2em] text-white/20 md:bottom-10 md:left-10 md:block">
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
        className="relative border-t border-white/10 px-5 py-24 sm:px-6 sm:py-32 md:px-10 md:py-48"
      >
        <div className="grid gap-12 sm:gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
              01 / Studio
            </p>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <p className="text-[clamp(2.15rem,5vw,5rem)] font-light leading-[1.02] tracking-[-0.06em]">
              Websites should do more than{" "}
              <span
                className={`${serif.className} italic text-white/50`}
              >
                exist.
              </span>
            </p>

            <p className="mt-9 max-w-lg text-sm leading-7 text-white/45 sm:mt-12">
              JW Studio combines visual design, modern development
              and motion to create digital experiences that feel
              considered from the first interaction to the last.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          WORK
      ========================================================= */}

      <section
        id="work"
        className="relative px-5 pb-24 sm:px-6 sm:pb-32 md:px-10 md:pb-48"
      >
        <div className="mb-12 flex items-end justify-between border-b border-white/10 pb-5 sm:mb-16">
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
            02 / Selected work
          </p>

          <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
            03 projects
          </p>
        </div>

        <div className="space-y-20 sm:space-y-24 md:space-y-40">
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

                  <span className="text-[9px] uppercase tracking-[0.14em] text-white/40 sm:text-[10px] sm:tracking-[0.16em]">
                    {project.category}
                  </span>
                </div>

                <span className="hidden text-[9px] uppercase tracking-[0.2em] text-white/30 md:block">
                  View project ↗
                </span>
              </div>

              <a
                href={project.href}
                className="relative block aspect-[4/3] overflow-hidden bg-[#111] sm:aspect-[16/9]"
              >
                <div
                  className="project-image absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${project.image})`,
                  }}
                />

                <div className="absolute inset-0 bg-black/10 transition-colors duration-700 group-hover:bg-black/0" />

                <div className="absolute bottom-5 left-5 right-16 sm:bottom-6 sm:left-6 md:bottom-10 md:left-10">
                  <h2 className="text-[clamp(1.9rem,5vw,5rem)] font-light leading-[0.92] tracking-[-0.06em]">
                    {project.title}
                  </h2>
                </div>

                <div className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/10 text-base backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-black sm:bottom-6 sm:right-6 sm:h-12 sm:w-12 sm:text-lg md:bottom-10 md:right-10">
                  ↗
                </div>
              </a>

              <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row">
                <p className="max-w-md text-xs leading-6 text-white/40">
                  {project.description}
                </p>

                <div className="flex gap-2 text-[8px] uppercase tracking-[0.12em] text-white/30 sm:text-[9px] sm:tracking-[0.15em]">
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
        className="relative overflow-hidden border-y border-white/10 px-5 py-24 sm:px-6 sm:py-32 md:px-10 md:py-48"
      >
        <div className="absolute right-[-25vw] top-1/2 h-[65vw] w-[65vw] -translate-y-1/2 rounded-full border border-white/[0.06] sm:right-[-10vw] sm:h-[35vw] sm:w-[35vw]" />

        <div className="grid gap-16 sm:gap-20 md:grid-cols-12">
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
                className="group flex items-center justify-between border-b border-white/10 py-6 transition-colors duration-500 hover:border-white/40 sm:py-7"
              >
                <div className="flex items-center gap-5 sm:gap-8">
                  <span className="text-[9px] text-white/25">
                    {number}
                  </span>

                  <span className="text-[clamp(1.65rem,4vw,4rem)] font-light tracking-[-0.05em] transition-transform duration-500 group-hover:translate-x-3">
                    {title}
                  </span>
                </div>

                <span className="ml-4 shrink-0 text-white/30 transition-transform duration-500 group-hover:translate-x-2 group-hover:text-white">
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

      <section className="relative px-5 py-32 sm:px-6 sm:py-40 md:px-10 md:py-64">
        <div className="mx-auto max-w-[1400px] text-center">
          <p className="mb-8 text-[9px] uppercase tracking-[0.25em] text-white/30 sm:mb-10">
            Built for the screen
          </p>

          <h2 className="text-[clamp(3.2rem,10vw,10rem)] font-light leading-[0.82] tracking-[-0.08em]">
            <span className="block">MAKE IT</span>

            <span
              className={`${serif.className} italic text-white/50`}
            >
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
        className="relative min-h-[80vh] overflow-hidden border-t border-white/10 px-5 py-12 sm:px-6 sm:py-16 md:px-10"
      >
        <div className="flex min-h-[70vh] flex-col justify-between">
          <div className="flex items-start justify-between gap-6">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
              04 / Contact
            </p>

            <p className="max-w-[150px] text-right text-[8px] uppercase tracking-[0.16em] text-white/30 sm:max-w-none sm:text-[9px] sm:tracking-[0.2em]">
              Available for selected projects
            </p>
          </div>

          <div className="py-20">
            <p className="mb-7 text-sm text-white/40 sm:mb-8">
              Have something worth building?
            </p>

            <a
              href="mailto:hello@jwstudio.design"
              className="group block text-[19vw] font-light leading-[0.82] tracking-[-0.09em] sm:text-[17vw] md:text-[clamp(3rem,10vw,11rem)]"
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

          <div className="flex flex-col justify-between gap-5 border-t border-white/10 pt-6 text-[8px] uppercase tracking-[0.16em] text-white/30 sm:text-[9px] sm:tracking-[0.18em] md:flex-row">
            <span>JW Studio © 2026</span>

            <span>Designed & developed by JW Studio</span>

            <span>United Kingdom / France</span>
          </div>
        </div>
      </section>
    </main>
  );
}
