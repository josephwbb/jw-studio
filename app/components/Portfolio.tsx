"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Project = {
  number: string;
  title: string;
  category: string;
  description: string;
  image: string;
  accent: string;
};

const projects: Project[] = [
  {
    number: "01",
    title: "Katy Webb Photography",
    category: "Wedding / Photography",
    description:
      "A refined digital experience for a destination wedding photographer working across France and Europe.",
    image: "/projects/katy.jpg",
    accent: "Luxury destination wedding photography",
  },
  {
    number: "02",
    title: "Premier Pools & Gardens",
    category: "Property / Luxury",
    description:
      "A cinematic website designed around premium pool and garden maintenance across South West France.",
    image: "/projects/premier.jpg",
    accent: "Luxury property services",
  },
  {
    number: "03",
    title: "The Property Studio",
    category: "Property / Creative",
    description:
      "A visual-first identity and website for high-end property photography, video and drone work.",
    image: "/projects/property-studio.jpg",
    accent: "Property / Photography / Film",
  },
];

const constellationPositions = [
  {
    x: -300,
    y: -145,
    rotation: -7,
    scale: 1,
  },
  {
    x: 285,
    y: -120,
    rotation: 6,
    scale: 0.9,
  },
  {
    x: 35,
    y: 225,
    rotation: -4,
    scale: 0.94,
  },
];

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);

  const statementRef = useRef<HTMLDivElement>(null);
  const statementTextRef = useRef<HTMLHeadingElement>(null);

  const originRef = useRef<HTMLDivElement>(null);
  const morphImageRef = useRef<HTMLDivElement>(null);

  const constellationRef = useRef<HTMLDivElement>(null);
  const constellationCoreRef = useRef<HTMLDivElement>(null);
  const orbitalRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const starRefs = useRef<(HTMLDivElement | null)[]>([]);

  const projectRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLDivElement>(null);

  const [activeProject, setActiveProject] = useState<number | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const statement = statementRef.current;
    const statementText = statementTextRef.current;
    const origin = originRef.current;
    const morphImage = morphImageRef.current;
    const constellation = constellationRef.current;
    const core = constellationCoreRef.current;

    if (
      !section ||
      !statement ||
      !statementText ||
      !origin ||
      !morphImage ||
      !constellation ||
      !core
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const projectsEls = projectRefs.current.filter(
        (el): el is HTMLButtonElement => Boolean(el)
      );

      const orbitEls = orbitalRefs.current.filter(
        (el): el is HTMLDivElement => Boolean(el)
      );

      const lineEls = lineRefs.current.filter(
        (el): el is HTMLDivElement => Boolean(el)
      );

      const stars = starRefs.current.filter(
        (el): el is HTMLDivElement => Boolean(el)
      );

      /*
       * ---------------------------------------------------------
       * INITIAL STATE
       * ---------------------------------------------------------
       */

      gsap.set(statement, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(statementText, {
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
      });

      /*
       * The white square is the actual "seed" of the constellation.
       */
      gsap.set(origin, {
        width: 0,
        height: 0,
        opacity: 0,
        scale: 0.2,
        borderRadius: 3,
        rotation: 0,
      });

      gsap.set(morphImage, {
        opacity: 0,
        scale: 0.2,
        clipPath: "inset(50% 50% 50% 50%)",
      });

      /*
       * Constellation begins completely dormant.
       */
      gsap.set(constellation, {
        opacity: 0,
        scale: 0.35,
      });

      gsap.set(core, {
        scale: 0,
        opacity: 0,
      });

      orbitEls.forEach((orbit) => {
        gsap.set(orbit, {
          opacity: 0,
          scale: 0.2,
          rotation: -20,
        });
      });

      lineEls.forEach((line) => {
        gsap.set(line, {
          opacity: 0,
          scaleX: 0,
          transformOrigin: "0% 50%",
        });
      });

      stars.forEach((star, index) => {
        gsap.set(star, {
          opacity: index % 3 === 0 ? 0.45 : 0.2,
          scale: 0,
        });
      });

      /*
       * Project cards begin at the centre.
       *
       * They will travel outward along curved-looking trajectories
       * instead of simply appearing at their final positions.
       */
      projectsEls.forEach((project) => {
        gsap.set(project, {
          opacity: 0,
          x: 0,
          y: 0,
          scale: 0.2,
          rotation: 0,
        });
      });

      /*
       * ---------------------------------------------------------
       * MAIN SCROLL TIMELINE
       * ---------------------------------------------------------
       *
       * This is deliberately shorter than the previous 900%.
       *
       * The user gets resistance without having to scroll for
       * eternity.
       */
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=620%",
          pin: true,
          scrub: 1.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      /*
       * ---------------------------------------------------------
       * 01
       * WORK THAT SPEAKS FOR ITSELF
       * ---------------------------------------------------------
       */

      timeline.to(
        statementText,
        {
          scale: 0.055,
          opacity: 0,
          filter: "blur(9px)",
          duration: 2.3,
          ease: "power4.inOut",
        },
        0
      );

      /*
       * As the typography disappears, a tiny point of light
       * remains at its centre.
       */
      timeline.fromTo(
        origin,
        {
          width: 0,
          height: 0,
          opacity: 0,
          scale: 0.2,
        },
        {
          width: 82,
          height: 82,
          opacity: 1,
          scale: 1,
          rotation: 45,
          duration: 1.15,
          ease: "power4.out",
        },
        1.7
      );

      /*
       * ---------------------------------------------------------
       * 02
       * THE SQUARE BECOMES THE IMAGE
       * ---------------------------------------------------------
       *
       * Rather than growing huge, it opens naturally into the
       * first project image.
       */

      timeline.to(
        origin,
        {
          width: 255,
          height: 255,
          borderRadius: 2,
          rotation: 0,
          duration: 1.4,
          ease: "power4.inOut",
        },
        2.45
      );

      timeline.to(
        morphImage,
        {
          opacity: 1,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.25,
          ease: "power4.inOut",
        },
        2.7
      );

      /*
       * The image holds briefly.
       */
      timeline.to(
        morphImage,
        {
          scale: 1.035,
          duration: 0.55,
          ease: "sine.inOut",
        },
        3.75
      );

      /*
       * ---------------------------------------------------------
       * 03
       * IMAGE BECOMES CONSTELLATION
       * ---------------------------------------------------------
       *
       * This is the important redesign.
       *
       * The image doesn't shrink into a boring dot.
       *
       * It collapses into the centre while the constellation
       * simultaneously expands from that exact point.
       */

      timeline.to(
        morphImage,
        {
          scale: 0.45,
          opacity: 0,
          filter: "blur(8px)",
          duration: 0.8,
          ease: "power4.in",
        },
        4.35
      );

      timeline.to(
        origin,
        {
          width: 8,
          height: 8,
          opacity: 1,
          scale: 1,
          borderRadius: 999,
          rotation: 0,
          duration: 0.75,
          ease: "power3.inOut",
        },
        4.35
      );

      /*
       * Constellation itself emerges.
       */
      timeline.to(
        constellation,
        {
          opacity: 1,
          scale: 1,
          duration: 1.15,
          ease: "power4.out",
        },
        4.65
      );

      timeline.to(
        core,
        {
          opacity: 1,
          scale: 1,
          duration: 0.75,
          ease: "back.out(2)",
        },
        4.8
      );

      /*
       * Orbital rings expand from the centre.
       */
      orbitEls.forEach((orbit, index) => {
        timeline.to(
          orbit,
          {
            opacity: index === 0 ? 0.18 : 0.11,
            scale: 1,
            rotation: index === 0 ? 0 : index === 1 ? 38 : -28,
            duration: 1.1,
            ease: "power3.out",
          },
          4.75 + index * 0.12
        );
      });

      /*
       * Connecting lines grow outward.
       */
      lineEls.forEach((line, index) => {
        timeline.to(
          line,
          {
            opacity: index === 0 ? 0.22 : 0.14,
            scaleX: 1,
            duration: 0.85,
            ease: "power3.out",
          },
          4.95 + index * 0.13
        );
      });

      /*
       * Stars appear independently.
       */
      stars.forEach((star, index) => {
        timeline.to(
          star,
          {
            scale: index % 4 === 0 ? 1 : 0.7,
            opacity: index % 3 === 0 ? 0.55 : 0.25,
            duration: 0.6,
            ease: "back.out(2)",
          },
          4.8 + (index % 7) * 0.06
        );
      });

      /*
       * ---------------------------------------------------------
       * 04
       * PROJECTS LAUNCH FROM THE CORE
       * ---------------------------------------------------------
       *
       * Every project begins at the centre and travels to its
       * constellation position.
       */

      projectsEls.forEach((project, index) => {
        const position = constellationPositions[index];

        /*
         * First movement: launch outward.
         */
        timeline.to(
          project,
          {
            opacity: 1,
            x: position.x * 0.35,
            y: position.y * 0.35,
            scale: position.scale * 0.48,
            rotation: position.rotation * 0.3,
            duration: 0.65,
            ease: "power3.out",
          },
          5.15 + index * 0.15
        );

        /*
         * Second movement: glide into orbit.
         */
        timeline.to(
          project,
          {
            x: position.x,
            y: position.y,
            scale: position.scale,
            rotation: position.rotation,
            duration: 1.05,
            ease: "power4.out",
          },
          5.7 + index * 0.15
        );
      });

      /*
       * A little settling motion gives the cards physicality.
       */
      projectsEls.forEach((project, index) => {
        const position = constellationPositions[index];

        timeline.to(
          project,
          {
            x: position.x + (index === 1 ? -7 : 6),
            y: position.y + (index === 2 ? -6 : 5),
            duration: 0.55,
            ease: "sine.inOut",
          },
          6.95 + index * 0.1
        );

        timeline.to(
          project,
          {
            x: position.x,
            y: position.y,
            duration: 0.55,
            ease: "sine.inOut",
          },
          7.5 + index * 0.1
        );
      });

      /*
       * ---------------------------------------------------------
       * 05
       * HOLD
       * ---------------------------------------------------------
       *
       * Once everything is assembled, scrolling has very little
       * effect for a moment. This gives the composition room to
       * breathe before the section eventually releases.
       */

      timeline.to(
        constellation,
        {
          scale: 1.025,
          duration: 1.5,
          ease: "sine.inOut",
        },
        8
      );

      /*
       * Do not collapse the constellation at the end.
       *
       * Let it remain intact until the pin releases.
       *
       * This means the user actually gets to SEE the portfolio
       * rather than immediately watching it disappear.
       */

      timeline.to(
        constellation,
        {
          opacity: 1,
          duration: 1.8,
        },
        9
      );
    }, section);

    /*
     * ---------------------------------------------------------
     * AMBIENT CONSTELLATION MOTION
     * ---------------------------------------------------------
     *
     * This is deliberately NOT tied to scroll.
     *
     * Once the constellation exists, it has its own life.
     */

    const ambientOrbitEls = orbitalRefs.current.filter(
      (el): el is HTMLDivElement => Boolean(el)
    );

    const ambientProjectEls = projectRefs.current.filter(
      (el): el is HTMLButtonElement => Boolean(el)
    );

    const ambientStars = starRefs.current.filter(
      (el): el is HTMLDivElement => Boolean(el)
    );

    const ambientTweens: gsap.core.Tween[] = [];

    ambientOrbitEls.forEach((orbit, index) => {
      ambientTweens.push(
        gsap.to(orbit, {
          rotation: `+=${index % 2 === 0 ? 7 : -8}`,
          duration: 16 + index * 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );
    });

    ambientProjectEls.forEach((project, index) => {
      const position = constellationPositions[index];

      ambientTweens.push(
        gsap.to(project, {
          x: position.x + (index === 0 ? 8 : index === 1 ? -9 : 6),
          y: position.y + (index === 0 ? -7 : index === 1 ? 6 : -8),
          rotation: position.rotation + (index === 1 ? -1.5 : 1.2),
          duration: 5.5 + index * 1.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );
    });

    ambientStars.forEach((star, index) => {
      ambientTweens.push(
        gsap.to(star, {
          opacity: index % 3 === 0 ? 0.7 : 0.12,
          scale: index % 4 === 0 ? 1.2 : 0.75,
          duration: 1.8 + (index % 5) * 0.45,
          repeat: -1,
          yoyo: true,
          delay: (index % 6) * 0.35,
          ease: "sine.inOut",
        })
      );
    });

    return () => {
      ambientTweens.forEach((tween) => tween.kill());
      ctx.revert();
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * PROJECT HOVER PREVIEW
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const preview = previewRef.current;
    const previewImage = previewImageRef.current;

    if (!preview || !previewImage) return;

    if (activeProject === null) {
      gsap.to(preview, {
        opacity: 0,
        scale: 0.94,
        y: 20,
        duration: 0.4,
        ease: "power3.out",
        overwrite: true,
      });

      return;
    }

    const project = projects[activeProject];

    gsap.killTweensOf([preview, previewImage]);

    gsap.set(previewImage, {
      backgroundImage: `url(${project.image})`,
    });

    gsap.fromTo(
      preview,
      {
        opacity: 0,
        scale: 0.94,
        y: 20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.55,
        ease: "power3.out",
        overwrite: true,
      }
    );

    gsap.fromTo(
      previewImage,
      {
        scale: 1.08,
      },
      {
        scale: 1,
        duration: 1.1,
        ease: "power3.out",
        overwrite: true,
      }
    );
  }, [activeProject]);

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-[#080808] text-[#f2f0eb]"
    >
      {/* =====================================================
          WORK THAT SPEAKS FOR ITSELF
      ===================================================== */}

      <div
        ref={statementRef}
        className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center"
      >
        <h2
          ref={statementTextRef}
          className="max-w-[1300px] text-[clamp(4rem,12vw,12rem)] font-bold leading-[0.82] tracking-[-0.085em]"
        >
          WORK THAT
          <br />
          SPEAKS FOR ITSELF.
        </h2>
      </div>

      {/* =====================================================
          MORPH ORIGIN
      ===================================================== */}

      <div
        ref={originRef}
        className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 bg-white"
      />

      {/* =====================================================
          FIRST IMAGE
      ===================================================== */}

      <div
        ref={morphImageRef}
        className="absolute left-1/2 top-1/2 z-40 h-[255px] w-[255px] -translate-x-1/2 -translate-y-1/2 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${projects[0].image})`,
          }}
        />

        <div className="absolute inset-0 bg-black/10" />

        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
      </div>

      {/* =====================================================
          CONSTELLATION
      ===================================================== */}

      <div
        ref={constellationRef}
        className="absolute left-1/2 top-1/2 z-30 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2"
      >
        {/* -------------------------------------------------
            BACKGROUND STARS
        ------------------------------------------------- */}

        {Array.from({ length: 32 }).map((_, index) => {
          const positions = [
            [-390, -260],
            [-315, -205],
            [-245, -285],
            [-165, -235],
            [-75, -305],
            [25, -270],
            [115, -310],
            [215, -245],
            [330, -285],
            [405, -205],
            [-430, -80],
            [-350, 40],
            [-275, 125],
            [-205, -45],
            [-110, 165],
            [-25, -190],
            [75, 180],
            [165, -125],
            [255, 115],
            [345, 45],
            [420, 155],
            [-410, 240],
            [-320, 205],
            [-230, 285],
            [-120, 245],
            [-20, 305],
            [100, 260],
            [205, 295],
            [310, 215],
            [395, 275],
            [455, 90],
            [-455, 20],
          ];

          const [x, y] = positions[index];

          return (
            <div
              key={`star-${index}`}
              ref={(el) => {
                starRefs.current[index] = el;
              }}
              className="absolute left-1/2 top-1/2 h-[2px] w-[2px] rounded-full bg-white"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            />
          );
        })}

        {/* -------------------------------------------------
            ORBITAL STRUCTURE
        ------------------------------------------------- */}

        <div
          ref={(el) => {
            orbitalRefs.current[0] = el;
          }}
          className="absolute left-1/2 top-1/2 h-[430px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/20"
        />

        <div
          ref={(el) => {
            orbitalRefs.current[1] = el;
          }}
          className="absolute left-1/2 top-1/2 h-[540px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/10"
        />

        <div
          ref={(el) => {
            orbitalRefs.current[2] = el;
          }}
          className="absolute left-1/2 top-1/2 h-[300px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/[0.07]"
        />

        {/* -------------------------------------------------
            CENTRAL CORE
        ------------------------------------------------- */}

        <div
          ref={constellationCoreRef}
          className="absolute left-1/2 top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute inset-0 rounded-full bg-white" />

          <div className="absolute -inset-4 rounded-full border border-white/20" />

          <div className="absolute -inset-8 rounded-full bg-white/[0.025] blur-xl" />
        </div>

        {/* -------------------------------------------------
            CONNECTING LINES
        ------------------------------------------------- */}

        <div
          ref={(el) => {
            lineRefs.current[0] = el;
          }}
          className="absolute left-1/2 top-1/2 h-px w-[330px] bg-gradient-to-r from-white/40 to-transparent"
          style={{
            transform: "translate(-2px, -50%) rotate(-25deg)",
          }}
        />

        <div
          ref={(el) => {
            lineRefs.current[1] = el;
          }}
          className="absolute left-1/2 top-1/2 h-px w-[315px] bg-gradient-to-r from-white/30 to-transparent"
          style={{
            transform: "translate(-2px, -50%) rotate(22deg)",
          }}
        />

        <div
          ref={(el) => {
            lineRefs.current[2] = el;
          }}
          className="absolute left-1/2 top-1/2 h-px w-[285px] bg-gradient-to-r from-white/25 to-transparent"
          style={{
            transform: "translate(-2px, -50%) rotate(91deg)",
          }}
        />

        {/* =================================================
            PROJECTS
        ================================================= */}

        {projects.map((project, index) => (
          <button
            key={project.title}
            ref={(el) => {
              projectRefs.current[index] = el;
            }}
            type="button"
            onMouseEnter={() => setActiveProject(index)}
            onMouseLeave={() => setActiveProject(null)}
            className="absolute left-1/2 top-1/2 z-40 h-[150px] w-[205px] -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-white/15 bg-[#111] text-left outline-none will-change-transform"
            aria-label={`View ${project.title}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
              style={{
                backgroundImage: `url(${project.image})`,
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

            <div className="absolute inset-0 border border-white/0 transition-all duration-700 hover:border-white/40" />

            <div className="absolute left-3 top-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />

              <span className="text-[8px] uppercase tracking-[0.2em] text-white/65">
                {project.number}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-[7px] uppercase tracking-[0.16em] text-white/55">
                {project.category}
              </p>

              <p className="mt-1 text-[13px] font-medium leading-[1.05] tracking-[-0.035em] text-white">
                {project.title}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* =====================================================
          PROJECT PREVIEW
      ===================================================== */}

      <div
        ref={previewRef}
        className="pointer-events-none absolute left-1/2 top-1/2 z-[100] w-[min(86vw,760px)] -translate-x-1/2 -translate-y-1/2 opacity-0"
      >
        <div className="grid overflow-hidden border border-white/15 bg-[#0d0d0d]/95 shadow-2xl backdrop-blur-xl md:grid-cols-[1.4fr_0.8fr]">
          <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
            <div
              ref={previewImageRef}
              className="absolute inset-0 bg-cover bg-center will-change-transform"
            />

            <div className="absolute inset-0 bg-black/10" />

            <div className="absolute left-5 top-5 text-[8px] uppercase tracking-[0.2em] text-white/60">
              Selected project
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-8">
            {activeProject !== null && (
              <>
                <div>
                  <p className="mb-4 text-[8px] uppercase tracking-[0.2em] text-white/35">
                    {projects[activeProject].number} /{" "}
                    {projects[activeProject].category}
                  </p>

                  <h3 className="text-[clamp(1.8rem,4vw,3rem)] font-light leading-[0.9] tracking-[-0.06em]">
                    {projects[activeProject].title}
                  </h3>

                  <p className="mt-5 text-xs leading-6 text-white/45">
                    {projects[activeProject].description}
                  </p>
                </div>

                <div className="mt-8">
                  <p className="text-[8px] uppercase tracking-[0.16em] text-white/30">
                    {projects[activeProject].accent}
                  </p>

                  <div className="mt-5 flex items-center gap-3 text-[8px] uppercase tracking-[0.2em] text-white/65">
                    <span>View project</span>
                    <span>↗</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          UI
      ===================================================== */}

      <div className="absolute bottom-8 left-6 z-[110] text-[8px] uppercase tracking-[0.22em] text-white/25 sm:left-10">
        02 / Selected work
      </div>

      <div className="absolute bottom-8 right-6 z-[110] text-[8px] uppercase tracking-[0.22em] text-white/25 sm:right-10">
        Scroll to explore
      </div>
    </section>
  );
}