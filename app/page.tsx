"use client";

import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


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

import Portfolio from "./components/Portfolio";


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

const menuItems = [
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
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
  angle: number;
  drift: number;
  hue: number;
};

type CursorParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
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

  // Single-run state machine
  const [revealStage, setRevealStage] = useState<"init" | "webgl" | "typography" | "nav" | "complete">("init");
  const splashDoneRef = useRef(false);

  // Concept 3: GSAP ScrollTrigger Pin & Scrub with Lift Effect
  const studioSectionRef = useRef<HTMLDivElement>(null);
  const studioPinRef = useRef<HTMLDivElement>(null);
  const verbContainerRef = useRef<HTMLDivElement>(null);
  const verbRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const studioImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const studioIntroRef = useRef<HTMLParagraphElement>(null);
  const studioTakeoverRef = useRef<HTMLDivElement>(null);
  const linesBgRef = useRef<HTMLDivElement>(null);
  const [, setActiveVerbIndex] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);

  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });

  const verbs = ["EXIST.", "OCCUPY SPACE.", "BLEND IN.", "PERFORM."];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let tickerFn: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const studio = studioSectionRef.current;
      const pinTarget = studioPinRef.current;
      const card = cardRef.current;
      const verbElements = verbRefs.current.filter(
        (element): element is HTMLSpanElement => Boolean(element)
      );

      if (!studio || !pinTarget || !card || verbElements.length === 0) return;

      gsap.set(pinTarget, { yPercent: 0, xPercent: 0, clearProps: "transform" });
      gsap.set(card, { autoAlpha: 0, scale: 0.94, filter: "blur(14px)" });

      const studioTakeover = studioTakeoverRef.current;
      if (studioTakeover) {
        gsap.set(studioTakeover, { autoAlpha: 1, yPercent: 100, scale: 1 });
      }

      const introLine = studioIntroRef.current;
      const linesBg = linesBgRef.current;
      const imageElements = studioImageRefs.current.filter(
        (element): element is HTMLDivElement => Boolean(element)
      );

      if (introLine) {
        gsap.set(introLine, { autoAlpha: 0, y: 18, filter: "blur(8px)" });
      }

      if (linesBg) {
        gsap.set(linesBg, { scaleX: 1, scaleY: 1, opacity: 0.38, background: "transparent" });
      }

      imageElements.forEach((image) => {
        gsap.set(image, { autoAlpha: 0 });
      });

      verbElements.forEach((element, index) => {
        gsap.set(element, {
          autoAlpha: index === 0 ? 1 : 0,
          scale: index === 0 ? 1 : 0.85,
          filter: index === 0 ? "blur(0px)" : "blur(12px)",
          xPercent: -50,
          yPercent: -50,
          left: "50%",
          top: "50%",
        });
      });

      const tl = gsap.timeline({ paused: true });

      const existVerb = verbElements[0];
      const occupyVerb = verbElements[1];
      const blendVerb = verbElements[2];
      const performVerb = verbElements[3];
      const existImage = imageElements[0];
      const occupyImage = imageElements[1];
      const blendImage = imageElements[2];
      const performImage = imageElements[3];

      // 0. IMMERSIVE TAKEOVER: Intro layer rises from 100% to 0% over an extremely short scroll distance
      if (studioTakeover) {
        tl.fromTo(
          studioTakeover,
          { yPercent: 100 },
          { yPercent: 0, duration: 0.25, ease: "none" },
          0
        );
      }

      const PHASE = 2.6;
      const ENTER_DUR = 0.75;
      const EXIT_DUR = 0.65;
      const DRIFT_DUR = PHASE - ENTER_DUR - EXIT_DUR;

      const existStart = 0.25;
      const occupyStart = existStart + PHASE;
      const blendStart = occupyStart + PHASE;
      const performStart = blendStart + PHASE;

      if (linesBg) {
        tl.fromTo(
          linesBg,
          { scaleX: 1, scaleY: 1, opacity: 0.38, background: "radial-gradient(circle at center, rgba(59,130,246,0.05) 0%, rgba(249,115,22,0.05) 60%, transparent 100%)" },
          { scaleX: 1.35, scaleY: 1.15, opacity: 0.85, background: "radial-gradient(circle at center, rgba(59,130,246,0.18) 0%, rgba(249,115,22,0.18) 70%, transparent 100%)", duration: ENTER_DUR, ease: "power2.out" },
          existStart
        );
        tl.to(
          linesBg,
          { scaleX: 1.15, scaleY: 1.05, opacity: 0.55, duration: DRIFT_DUR, ease: "none" },
          existStart + ENTER_DUR
        );
      }

      if (introLine) {
        tl.to(introLine, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5 }, existStart + 0.25);
      }
      if (existVerb) {
        tl.fromTo(
          existVerb,
          { autoAlpha: 0, scale: 0.9, filter: "blur(14px)" },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: ENTER_DUR, ease: "power2.out" },
          existStart
        );
      }
      if (existImage) {
        tl.fromTo(
          existImage,
          { autoAlpha: 0, x: -120, scale: 1.1, filter: "blur(10px)" },
          { autoAlpha: 0.95, x: 0, scale: 1, filter: "blur(0px)", duration: ENTER_DUR, ease: "power2.out" },
          existStart
        );
        tl.to(
          existImage,
          { x: 14, scale: 1.035, duration: DRIFT_DUR, ease: "none" },
          existStart + ENTER_DUR
        );
      }

      const existExitAt = occupyStart - EXIT_DUR;
      if (linesBg) {
        tl.to(
          linesBg,
          { scaleX: 1, scaleY: 1, opacity: 0.38, background: "transparent", duration: EXIT_DUR, ease: "power2.in" },
          existExitAt
        );
      }
      if (introLine) {
        tl.to(introLine, { autoAlpha: 0, y: -10, duration: 0.35 }, existExitAt);
      }
      if (existVerb) {
        tl.to(existVerb, { autoAlpha: 0, scale: 1.06, filter: "blur(12px)", duration: EXIT_DUR, ease: "power2.in" }, existExitAt);
      }
      if (existImage) {
        tl.to(existImage, { autoAlpha: 0, x: -50, scale: 1.02, filter: "blur(6px)", duration: EXIT_DUR, ease: "power2.in" }, existExitAt);
      }

      if (occupyVerb) {
        tl.fromTo(
          occupyVerb,
          { autoAlpha: 0, scale: 0.85, filter: "blur(14px)" },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: ENTER_DUR, ease: "power2.out" },
          occupyStart
        );
      }
      if (occupyImage) {
        tl.fromTo(
          occupyImage,
          { autoAlpha: 0, x: 160, scale: 0.6, rotation: -5, filter: "blur(12px)" },
          { autoAlpha: 0.95, x: 20, scale: 1.18, rotation: 1, filter: "blur(0px)", duration: ENTER_DUR, ease: "power2.out" },
          occupyStart
        );
        tl.to(
          occupyImage,
          { scale: 1.26, x: 6, rotation: -0.5, duration: DRIFT_DUR, ease: "none" },
          occupyStart + ENTER_DUR
        );
      }

      const occupyExitAt = blendStart - EXIT_DUR;
      if (occupyVerb) {
        tl.to(occupyVerb, { autoAlpha: 0, scale: 1.06, filter: "blur(12px)", duration: EXIT_DUR, ease: "power2.in" }, occupyExitAt);
      }
      if (occupyImage) {
        tl.to(occupyImage, { autoAlpha: 0, scale: 1.32, duration: EXIT_DUR, ease: "power2.in" }, occupyExitAt);
      }

      if (blendVerb) {
        tl.fromTo(
          blendVerb,
          { autoAlpha: 0, scale: 0.85, filter: "blur(14px)" },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: ENTER_DUR, ease: "power2.out" },
          blendStart
        );
      }
      if (blendImage) {
        tl.fromTo(
          blendImage,
          { autoAlpha: 0, scale: 1.08, filter: "blur(24px) brightness(0.15)" },
          { autoAlpha: 0.55, scale: 1.02, filter: "blur(6px) brightness(0.55)", duration: ENTER_DUR, ease: "power2.out" },
          blendStart
        );
        tl.to(
          blendImage,
          { autoAlpha: 0.75, scale: 1, filter: "blur(0px) brightness(0.85)", duration: DRIFT_DUR, ease: "none" },
          blendStart + ENTER_DUR
        );
      }

      const blendExitAt = performStart - EXIT_DUR;
      if (blendVerb) {
        tl.to(blendVerb, { autoAlpha: 0, scale: 1.06, filter: "blur(12px)", duration: EXIT_DUR, ease: "power2.in" }, blendExitAt);
      }
      if (blendImage) {
        tl.to(blendImage, { autoAlpha: 0, filter: "blur(10px) brightness(0.4)", duration: EXIT_DUR, ease: "power2.in" }, blendExitAt);
      }

      if (performVerb) {
        tl.fromTo(
          performVerb,
          { autoAlpha: 0, scale: 0.85, filter: "blur(14px)" },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: ENTER_DUR, ease: "power2.out" },
          performStart
        );
      }
      if (performImage) {
        tl.fromTo(
          performImage,
          { autoAlpha: 0, x: -120, scale: 0.7, filter: "blur(12px)" },
          { autoAlpha: 1, x: 0, scale: 1.08, filter: "blur(0px)", duration: ENTER_DUR, ease: "power2.out" },
          performStart
        );
        tl.to(
          performImage,
          { scale: 1.24, x: 18, duration: DRIFT_DUR, ease: "none" },
          performStart + ENTER_DUR
        );
      }

      const finalExit = performStart + PHASE - EXIT_DUR;
      if (performVerb) {
        tl.to(performVerb, { autoAlpha: 0, scale: 1.14, filter: "blur(18px)", duration: EXIT_DUR, ease: "power2.in" }, finalExit);
      }
      if (performImage) {
        tl.to(performImage, { autoAlpha: 0, scale: 1.4, filter: "blur(4px)", duration: EXIT_DUR, ease: "power2.in" }, finalExit);
      }

      const cardStart = performStart + PHASE + 0.1;
      tl.to(card, {
        autoAlpha: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.75,
        ease: "power3.out",
      }, cardStart);

      tl.to(card, { autoAlpha: 1, duration: 2.4, ease: "none" }, cardStart + 0.75);

      const totalDuration = tl.duration();
      const cardVisibleThreshold = cardStart / totalDuration;
      let targetProgress = 0;
      let smoothProgress = 0;

      ScrollTrigger.create({
        trigger: studio,
        start: "top top",
        end: "bottom bottom",
        pin: pinTarget,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          targetProgress = self.progress;
        },
      });

      const RESISTANCE = 0.06;

      const handleTick = () => {
        const rate = gsap.ticker.deltaRatio();
        smoothProgress += (targetProgress - smoothProgress) * Math.min(RESISTANCE * rate, 1);

        if (Math.abs(targetProgress - smoothProgress) < 0.0005) {
          smoothProgress = targetProgress;
        }

        tl.progress(smoothProgress);

        if (totalDuration > 0) {
          const index = Math.min(
            verbElements.length - 1,
            Math.floor(smoothProgress * verbElements.length)
          );
          setActiveVerbIndex((previous) => (previous === index ? previous : index));
        }

        setCardVisible((previous) => {
          const next = smoothProgress >= cardVisibleThreshold;
          return previous === next ? previous : next;
        });
      };

      gsap.ticker.add(handleTick);
      tickerFn = handleTick;

    }, studioSectionRef);

    return () => {
      if (tickerFn) {
        gsap.ticker.remove(tickerFn);
      }
      ctx.revert();
    };
  }, []);


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

  useEffect(() => {
    const canvas = inkCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      splashDoneRef.current = true;
      setRevealStage("complete");
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

    let frame = 0;
    const points: InkPoint[] = [];
    const particles: CursorParticle[] = [];

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    let previousPointerX = pointerX;
    let previousPointerY = pointerY;

    let velocityX = 0;
    let velocityY = 0;
    let speed = 0;
    let time = 0;

    let splashPhase: "falling" | "impacting" | "expanding" | "done" = splashDoneRef.current ? "done" : "falling";
    let dropY = -60;
    let dropTargetY = height / 2;
    let dropVelocity = 0;
    let splashRadius = 0;
    let maxSplashRadius = Math.max(width, height) * 0.9;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      maxSplashRadius = Math.max(width, height) * 0.9;
      if (splashPhase !== "done") {
        dropTargetY = height / 2;
      }
    };

    resize();

    const handlePointerMove = (event: PointerEvent) => {
      if (splashPhase !== "done") return;

      const nextX = event.clientX;
      const nextY = event.clientY;

      const dx = nextX - pointerX;
      const dy = nextY - pointerY;

      velocityX = dx;
      velocityY = dy;

      pointerX = nextX;
      pointerY = nextY;

      const distance = Math.sqrt(dx * dx + dy * dy);
      speed += (distance - speed) * 0.35;

      if (distance < 1.5) return;

      const steps = Math.min(Math.ceil(distance / 7), 12);

      for (let i = 1; i <= steps; i++) {
        const progress = i / steps;

        const x = previousPointerX + dx * progress;
        const y = previousPointerY + dy * progress;

        points.push({
          x,
          y,
          life: 1,
          size: 0.7 + Math.random() * 0.8 + Math.min(speed * 0.025, 1.5),
          angle: Math.random() * Math.PI * 2,
          drift: 0.4 + Math.random() * 1.1,
          hue: Math.random() > 0.72 ? 150 : 135,
        });

        if (Math.random() < 0.18 && particles.length < 45 && speed > 2) {
          const angle = Math.atan2(dy, dx);
          const side = Math.random() > 0.5 ? 1 : -1;
          const spread = (Math.random() * 0.7 + 0.25) * side;

          particles.push({
            x,
            y,
            vx: -Math.cos(angle) * (0.15 + Math.random() * 0.7) + Math.cos(angle + Math.PI / 2) * spread,
            vy: -Math.sin(angle) * (0.15 + Math.random() * 0.7) + Math.sin(angle + Math.PI / 2) * spread,
            life: 1,
            size: 0.6 + Math.random() * 1.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.08,
          });
        }
      }

      previousPointerX = nextX;
      previousPointerY = nextY;

      if (points.length > 130) {
        points.splice(0, points.length - 130);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const drawGlow = (x: number, y: number, radius: number, opacity: number, hue: number) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `hsla(${hue}, 30%, 82%, ${opacity})`);
      gradient.addColorStop(0.18, `hsla(${hue}, 30%, 72%, ${opacity * 0.45})`);
      gradient.addColorStop(0.5, `hsla(${hue}, 30%, 62%, ${opacity * 0.12})`);
      gradient.addColorStop(1, "transparent");

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };

    const triggerImpactRipples = () => {
      const rayCount = 32;
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const raySpeed = 4 + Math.random() * 6;

        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * raySpeed,
          vy: Math.sin(angle) * raySpeed,
          life: 1,
          size: 1.5 + Math.random() * 2.5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    const drawRibbon = (offset: number, widthMultiplier: number, opacityMultiplier: number, phase: number) => {
      if (points.length < 3) return;

      context.beginPath();
      const visiblePoints = points.slice(Math.max(0, points.length - 75));

      for (let i = 0; i < visiblePoints.length; i++) {
        const point = visiblePoints[i];
        const progress = i / Math.max(visiblePoints.length - 1, 1);

        const wave = Math.sin(time * 0.003 + i * 0.34 + phase) * (3 + progress * 6);
        const angle = point.angle + time * 0.0003;

        const offsetX = Math.cos(angle) * (offset + wave);
        const offsetY = Math.sin(angle) * (offset + wave);

        const x = point.x + offsetX;
        const y = point.y + offsetY;

        if (i === 0) {
          context.moveTo(x, y);
        } else {
          const previous = visiblePoints[i - 1];
          const previousWave = Math.sin(time * 0.003 + (i - 1) * 0.34 + phase) * (3 + progress * 6);
          const previousAngle = previous.angle + time * 0.0003;

          const previousX = previous.x + Math.cos(previousAngle) * (offset + previousWave);
          const previousY = previous.y + Math.sin(previousAngle) * (offset + previousWave);

          const midpointX = (previousX + x) / 2;
          const midpointY = (previousY + y) / 2;

          context.quadraticCurveTo(previousX, previousY, midpointX, midpointY);
        }
      }

      const gradient = context.createLinearGradient(
        pointerX - 180,
        pointerY - 180,
        pointerX + 180,
        pointerY + 180
      );

      gradient.addColorStop(0, `hsla(135, 28%, 82%, 0)`);
      gradient.addColorStop(0.5, `hsla(150, 35%, 84%, ${0.045 * opacityMultiplier})`);
      gradient.addColorStop(0.75, `hsla(175, 40%, 78%, ${0.11 * opacityMultiplier})`);
      gradient.addColorStop(1, `hsla(125, 30%, 80%, 0)`);

      context.strokeStyle = gradient;
      context.lineWidth = (1.8 + speed * 0.025) * widthMultiplier;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
    };

    const draw = () => {
      time += 16;
      context.clearRect(0, 0, width, height);

      if (splashPhase !== "done") {
        const centerX = width / 2;

        if (splashPhase === "falling") {
          dropVelocity += 0.9;
          dropY += dropVelocity;

          drawGlow(centerX, dropY, 20, 0.95, 145);
          drawGlow(centerX, dropY - dropVelocity * 2, 8, 0.4, 160);

          if (dropY >= dropTargetY) {
            splashPhase = "impacting";
            triggerImpactRipples();
            setRevealStage("webgl");
          }
        } else if (splashPhase === "impacting" || splashPhase === "expanding") {
          if (splashPhase === "impacting") {
            splashPhase = "expanding";
          }

          splashRadius += (maxSplashRadius - splashRadius) * 0.048;

          context.save();
          context.globalCompositeOperation = "screen";

          for (let r = 1; r <= 3; r++) {
            const currentR = Math.max(0, splashRadius - r * 35);
            const opacity = Math.max(0, (1 - currentR / maxSplashRadius) * 0.35);

            context.beginPath();
            context.arc(centerX, dropTargetY, currentR, 0, Math.PI * 2);
            context.strokeStyle = `rgba(180, 220, 200, ${opacity})`;
            context.lineWidth = 6 / r;
            context.stroke();
          }

          drawGlow(centerX, dropTargetY, splashRadius * 0.4, 0.15 * (1 - splashRadius / maxSplashRadius), 150);
          context.restore();

          if (splashRadius > maxSplashRadius * 0.25) {
            setRevealStage("typography");
          }
          if (splashRadius > maxSplashRadius * 0.65) {
            setRevealStage("nav");
          }
          if (splashRadius >= maxSplashRadius * 0.92) {
            splashPhase = "done";
            splashDoneRef.current = true;
            setRevealStage("complete");
          }
        }
      }

      velocityX *= 0.92;
      velocityY *= 0.92;
      speed *= 0.94;

      for (let i = points.length - 1; i >= 0; i--) {
        const point = points[i];
        point.life -= 0.0105;
        point.x += Math.cos(point.angle + time * 0.001) * point.drift * 0.035;
        point.y += Math.sin(point.angle + time * 0.0013) * point.drift * 0.035;

        if (point.life <= 0) {
          points.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.life -= 0.018;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.975;
        particle.vy *= 0.975;
        particle.rotation += particle.rotationSpeed;

        if (particle.life <= 0) {
          particles.splice(i, 1);
        }
      }

      if (isDesktop && splashPhase === "done") {
        context.save();
        context.globalCompositeOperation = "screen";

        const atmosphericRadius = 45 + Math.min(speed * 2.2, 75);
        drawGlow(pointerX, pointerY, atmosphericRadius, 0.07, 145);
        drawGlow(pointerX - velocityX * 3.5, pointerY - velocityY * 3.5, atmosphericRadius * 1.8, 0.025, 165);

        drawRibbon(0, 2.8, 1, 0);
        drawRibbon(5, 1.8, 0.75, 1.7);
        drawRibbon(-5, 1.4, 0.55, 3.1);

        if (points.length > 4) {
          const sampleStep = Math.max(1, Math.floor(points.length / 20));
          for (let i = 0; i < points.length; i += sampleStep) {
            const point = points[i];
            const progress = i / points.length;
            const blobOpacity = point.life * progress * 0.035;
            if (blobOpacity <= 0) continue;

            const blobSize = point.size * (7 + Math.sin(i * 0.7 + time * 0.002) * 2);
            drawGlow(point.x, point.y, blobSize, blobOpacity, point.hue);
          }
        }

        context.globalCompositeOperation = "source-over";

        const revealRadius = 20 + Math.min(speed * 1.5, 45);
        const revealGradient = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, revealRadius);
        revealGradient.addColorStop(0, "rgba(190, 220, 204, 0.10)");
        revealGradient.addColorStop(0.25, "rgba(125, 185, 155, 0.045)");
        revealGradient.addColorStop(0.6, "rgba(80, 145, 115, 0.018)");
        revealGradient.addColorStop(1, "rgba(0,0,0,0)");

        context.fillStyle = revealGradient;
        context.beginPath();
        context.arc(pointerX, pointerY, revealRadius, 0, Math.PI * 2);
        context.fill();

        const pulse = 1 + Math.sin(time * 0.006) * 0.12;
        const innerRadius = (7.5 + Math.min(speed * 0.18, 3)) * pulse;

        const innerGradient = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, innerRadius * 2.5);
        innerGradient.addColorStop(0, "rgba(250, 250, 245, 0.95)");
        innerGradient.addColorStop(0.2, "rgba(225, 240, 230, 0.72)");
        innerGradient.addColorStop(0.5, "rgba(180, 220, 195, 0.18)");
        innerGradient.addColorStop(1, "rgba(180, 220, 195, 0)");

        context.fillStyle = innerGradient;
        context.beginPath();
        context.arc(pointerX, pointerY, innerRadius * 2.5, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "rgba(248, 248, 242, 0.96)";
        context.beginPath();
        context.arc(pointerX, pointerY, 2.15, 0, Math.PI * 2);
        context.fill();

        context.restore();
      }

      for (const particle of particles) {
        const alpha = Math.sin(Math.max(0, particle.life) * Math.PI) * 0.55;
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.globalAlpha = alpha;

        const fragmentGradient = context.createLinearGradient(-particle.size * 3, 0, particle.size * 3, 0);
        fragmentGradient.addColorStop(0, "rgba(220,235,225,0)");
        fragmentGradient.addColorStop(0.5, "rgba(220,235,225,0.85)");
        fragmentGradient.addColorStop(1, "rgba(160,210,190,0)");

        context.fillStyle = fragmentGradient;
        context.fillRect(-particle.size * 3, -particle.size * 0.5, particle.size * 6, particle.size);
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

  const isNavVisible = revealStage === "nav" || revealStage === "complete";
  const isTypographyVisible = revealStage === "typography" || revealStage === "nav" || revealStage === "complete";
  const isWebGLVisible = revealStage === "webgl" || revealStage === "typography" || revealStage === "nav" || revealStage === "complete";

  return (
    <main className={`${sans.className} min-h-screen overflow-x-hidden bg-[#080808] text-[#f2f0eb]`}>
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
          -webkit-text-stroke: 1px rgba(242, 240, 235, 0.75);
          text-shadow: 0 0 40px rgba(183, 101, 60, 0.15);
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

        .ink-canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9997;
          mix-blend-mode: screen;
          overflow: hidden;
        }

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

        .reveal-item {
          opacity: 0;
          will-change: transform, opacity, filter;
          transition:
            opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 1400ms cubic-bezier(0.16, 1, 0.3, 1),
            filter 1200ms ease;
        }

        .reveal-nav { transform: translateY(-35px); filter: blur(8px); }
        .reveal-jw { transform: translateX(-6vw) scale(0.96); filter: blur(16px); }
        .reveal-studio { transform: translateX(6vw) scale(0.96); filter: blur(16px); }
        .reveal-tag { transform: translateY(20px); filter: blur(8px); }
        .reveal-webgl { transform: translate(-50%, -50%) scale(0.85); filter: blur(25px); }

        .reveal-item.is-revealed {
          opacity: 1 !important;
          filter: blur(0px) !important;
        }

        .reveal-nav.is-revealed { transform: translateY(0); }
        .reveal-jw.is-revealed { transform: translateX(0) scale(1); }
        .reveal-studio.is-revealed { transform: translateX(0) scale(1); }
        .reveal-tag.is-revealed { transform: translateY(0); }
        .reveal-webgl.is-revealed { transform: translate(-50%, -50%) scale(1); }

        @media (max-width: 640px) {
          .menu-control {
            width: 60px;
            height: 60px;
          }

          .menu-label {
            display: none;
          }

          .outline-text {
            -webkit-text-stroke: 0.8px rgba(242, 240, 235, 0.65);
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
      `}</style>

      {/* NOISE OVERLAY */}
      <div className="noise pointer-events-none fixed inset-0 z-[100] opacity-[0.025]" />

      {/* FLUID CANVAS */}
      <canvas
        ref={inkCanvasRef}
        className="ink-canvas"
        aria-hidden="true"
      />

      {/* NAVIGATION HEADER */}
      <header 
        style={{ opacity: isNavVisible ? 1 : 0 }} 
        className={`fixed left-0 right-0 top-0 z-[80] flex items-center justify-between px-5 py-5 mix-blend-difference sm:px-6 sm:py-6 md:px-10 md:py-8 reveal-item reveal-nav ${isNavVisible ? "is-revealed" : ""}`}
      >
        <a href="#" className="relative z-10 text-sm font-semibold tracking-[-0.04em]">
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

      {/* MINIMALIST MENU OVERLAY */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[70] flex items-center justify-center bg-[#080808] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          menuOpen ? "pointer-events-auto opacity-100 backdrop-blur-md" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center justify-center gap-6 md:gap-10">
          {menuItems.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`group relative text-[clamp(3.5rem,10vw,8rem)] font-bold tracking-[-0.05em] text-white/90 transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 hover:text-white ${
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: `${index * 80 + 100}ms`,
              }}
            >
              <span className="relative z-10 inline-block transition-transform duration-500 group-hover:scale-110">
                {item.label}
              </span>
            </a>
          ))}
        </nav>
      </div>

      {/* HERO / INTRO SECTION (Pinned Composition containing Hero and Intro as absolutely positioned layers sharing the exact same vertical grid positions) */}
      <section
        id="studio"
        ref={studioSectionRef}
        className="relative z-40 bg-[#080808]"
        style={{ height: "680vh" }}
      >
        <div
          ref={studioPinRef}
          className="absolute inset-0 h-screen w-full flex flex-col items-center justify-center bg-[#080808] overflow-hidden px-6"
        >
          {/* BACKGROUND LIGHT / WEBGL EFFECTS CONTAINER (Bottom Layer of the Pinned View) */}
          <div
            ref={heroRef}
            className="absolute inset-0 z-0 flex flex-col justify-between px-5 pb-10 pt-32 sm:px-6 sm:pb-12 sm:pt-36 md:px-10 md:pb-14 pointer-events-none"
          >
            <div className="pointer-events-none absolute inset-0 z-[15] flex justify-between px-[6%] opacity-[0.12] sm:px-[10%]">
              <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-white to-transparent" />
              <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-white to-transparent hidden sm:block" />
              <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-white to-transparent" />
              <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-white to-transparent hidden md:block" />
              <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-white to-transparent" />
            </div>

            <div
              className={`pointer-events-none absolute left-1/2 top-1/2 h-[86vw] w-[86vw] max-h-[900px] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px] sm:blur-[110px] transition-opacity duration-1000 ${
                isWebGLVisible ? "opacity-50" : "opacity-0"
              }`}
              style={{
                background: `radial-gradient(circle at ${50 + mouse.normalizedX * 20}% ${50 + mouse.normalizedY * 20}%, rgba(183,101,60,0.18), rgba(120,60,35,0.06) 40%, transparent 70%)`,
              }}
            />

            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[80px] transition-transform duration-700 ease-out sm:h-[400px] sm:w-[400px] sm:blur-[100px]"
              style={{
                transform: `translate(calc(-50% + ${lightX}px), calc(-50% + ${lightY}px))`,
                background: "radial-gradient(circle, rgba(210,115,65,0.14), transparent 65%)",
              }}
            />

            {showWebGL && (
              <div
                style={{ opacity: isWebGLVisible ? 1 : 0 }}
                className={`pointer-events-none absolute left-1/2 top-1/2 z-[5] h-[49vh] w-[86vw] sm:h-[65vh] sm:w-[70vw] md:h-[75vh] md:w-[70vw] reveal-item reveal-webgl ${
                  isWebGLVisible ? "is-revealed" : ""
                }`}
              >
                <div
                  style={{
                    transform: `rotateX(${heroRotateX}deg) rotateY(${heroRotateY}deg)`,
                    transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <HeroWebGL />
                </div>
              </div>
            )}

            <div className="relative z-20 my-auto flex flex-col items-start justify-center">
              <h1 className="select-none text-[22vw] font-medium leading-[0.74] tracking-[-0.085em] sm:text-[20vw] md:text-[16.5vw]">
                <span 
                  style={{ opacity: isTypographyVisible ? 1 : 0, fontWeight: 700 }}
                  className={`block tracking-[-0.06em] reveal-item reveal-jw ${isTypographyVisible ? "is-revealed" : ""}`}
                >
                  JW
                </span>
                <span 
                  style={{ opacity: isTypographyVisible ? 1 : 0 }}
                  className={`outline-text block font-extrabold ml-[12vw] sm:ml-[16vw] reveal-item reveal-studio ${isTypographyVisible ? "is-revealed" : ""}`}
                >
                  STUDIO
                </span>
              </h1>

              <div 
                style={{ opacity: isTypographyVisible ? 1 : 0 }}
                className={`mt-8 flex items-center gap-4 sm:mt-12 sm:ml-[16vw] reveal-item reveal-tag ${isTypographyVisible ? "is-revealed" : ""}`}
              >
                <span className="h-px w-8 bg-[#B7653C]/70 sm:w-12" />
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/70 sm:text-xs">
                  Digital Craft &amp; Interactive Systems
                </span>
              </div>
            </div>

            <div 
              style={{ opacity: isNavVisible ? 1 : 0 }}
              className={`absolute bottom-10 right-6 hidden items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-white/30 md:flex reveal-item ${isNavVisible ? "is-revealed" : ""}`}
            >
              <span>Scroll</span>
              <span className="h-12 w-px bg-white/20" />
            </div>
          </div>

          {/* INTRO LAYER (Top Layer, initially translated 100% below the viewport and covering the bottom layer as yPercent moves from 100 to 0) */}
          <div
            ref={studioTakeoverRef}
            className="absolute inset-0 z-30 bg-[#080808] flex flex-col items-center justify-center overflow-hidden px-6 will-change-transform"
          >
            {/* DYNAMIC BACKGROUND GROWING LINES CONTAINER */}
            <div
              ref={linesBgRef}
              className="pointer-events-none absolute inset-0 z-[12] transition-transform duration-300 ease-out"
            />

            {/* FILM CAMERA VERTICAL LINES OVERLAY FOR INTRO MATCHING HERO GRID ALIGNMENT */}
            <div className="pointer-events-none absolute inset-0 z-[15] flex justify-between px-[6%] opacity-[0.38] sm:px-[10%]">
              <div className="h-full w-[1.5px] bg-gradient-to-b from-transparent via-[#3b82f6] to-transparent shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
              <div className="h-full w-[1.5px] bg-gradient-to-b from-transparent via-[#f97316] to-transparent shadow-[0_0_12px_rgba(249,115,22,0.6)] hidden sm:block" />
              <div className="h-full w-[1.5px] bg-gradient-to-b from-transparent via-[#3b82f6] to-transparent shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
              <div className="h-full w-[1.5px] bg-gradient-to-b from-transparent via-[#f97316] to-transparent shadow-[0_0_12px_rgba(249,115,22,0.6)] hidden md:block" />
              <div className="h-full w-[1.5px] bg-gradient-to-b from-transparent via-[#3b82f6] to-transparent shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
            </div>

            {/* LIVE EDITORIAL IMAGE LAYERS */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              {[
                "/images/studio-exist.jpg",
                "/images/studio-occupy.jpg",
                "/images/studio-blend.jpg",
                "/images/studio-perform.jpg",
              ].map((src, index) => (
                <div
                  key={src}
                  ref={(el) => {
                    studioImageRefs.current[index] = el;
                  }}
                  className={`absolute overflow-hidden bg-[#111] shadow-2xl ${
                    index === 0
                      ? "left-[7vw] top-[28%] h-[44vh] w-[31vw] max-w-[520px]"
                      : index === 1
                        ? "right-[-4vw] top-[18%] h-[58vh] w-[43vw] max-w-[720px]"
                        : index === 2
                          ? "left-[18vw] top-[16%] h-[68vh] w-[50vw] max-w-[780px] opacity-80"
                          : "right-[8vw] top-[12%] h-[72vh] w-[46vw] max-w-[760px]"
                  }`}
                  style={{
                    backgroundImage: `url(${src})`,
                    backgroundSize: "cover",
                    backgroundPosition: index === 0 ? "center" : "center",
                  }}
                />
              ))}
            </div>

            {/* FIRST COMPOSITION LINE */}
            <p
              ref={studioIntroRef}
              className={`${sans.className} absolute left-1/2 top-[30%] z-[25] -translate-x-1/2 text-center text-[clamp(0.65rem,1.1vw,1rem)] font-medium uppercase tracking-[0.28em] text-white/55`}
            >
              Websites should do more than
            </p>

            {/* ARTISTICALLY MASSIVE VERBS */}
            <div
              ref={verbContainerRef}
              className={`${sans.className} absolute inset-0 z-10 flex items-center justify-center overflow-visible pointer-events-none`}
            >
              {verbs.map((verb, idx) => (
                <span
                  key={verb}
                  ref={(el) => {
                    verbRefs.current[idx] = el;
                  }}
                  className={`absolute text-center uppercase tracking-[-0.04em] font-black select-none will-change-transform ${
                    idx === 0
                      ? "text-[clamp(4.5rem,16vw,22rem)] text-white drop-shadow-[0_0_60px_rgba(59,130,246,0.4)]"
                      : idx === 3
                        ? "text-[clamp(4.5rem,16vw,22rem)] text-white drop-shadow-[0_0_100px_rgba(255,255,255,0.25)]"
                        : "text-[clamp(4rem,15vw,20rem)] text-white/90"
                  }`}
                >
                  {verb}
                </span>
              ))}
            </div>

            {/* ISOLATED PORTFOLIO TAKEOVER STATEMENT */}
            <div
              ref={cardRef}
              className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#080808] px-6 text-center ${
                cardVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -left-[20%] top-0 h-full w-[45%] bg-gradient-to-r from-orange-600/30 to-transparent blur-3xl" />
                <div className="absolute -right-[20%] top-0 h-full w-[45%] bg-gradient-to-l from-blue-600/30 to-transparent blur-3xl" />
              </div>
              <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
                <h3 className={`${sans.className} text-[clamp(2.5rem,6.5vw,6rem)] font-bold leading-[1.05] tracking-[-0.04em] text-white mb-8`}>
                  Building the portfolio at lower rates.
                </h3>
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white border-b border-white/40 pb-2 transition-all duration-500 hover:border-white hover:tracking-[0.35em]"
                >
                  <span>Initiate Project</span>
                  <span className="transition-transform duration-500 group-hover:translate-x-1">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Portfolio />

      {/* CONTACT */}
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