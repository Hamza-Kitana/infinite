import { motion, useReducedMotion } from "framer-motion";
import ShapeBlur from "@/components/ShapeBlur";
import { getYoutubeEmbedUrl, useHeroBackgroundVideo } from "@/contexts/HeroBackgroundVideoContext";

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const shouldRenderVideo = true;
  const { iframeRef, onIframeLoad } = useHeroBackgroundVideo();

  return (
    <section
      id="hero"
      dir="rtl"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden pt-[9.25rem] sm:pt-40 lg:pt-[10.5rem]"
    >
      {/* Background YouTube video */}
      <div className="absolute inset-0 z-10">
        {shouldRenderVideo ? (
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              ref={iframeRef}
              title="Infinite City Background Video"
              src={getYoutubeEmbedUrl()}
              loading="eager"
              className="absolute left-1/2 top-1/2 h-[100svh] w-[177.78svh] min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 pointer-events-none md:inset-0 md:h-full md:w-full md:translate-x-0 md:translate-y-0 md:scale-[1.28]"
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              onLoad={onIframeLoad}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.28),transparent_45%),radial-gradient(circle_at_bottom,hsl(var(--secondary)/0.2),transparent_45%)]" />
        )}
        {/* Dark overlays */}
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-gradient-cyber" />
      </div>

      {/* Foreground content — إزاحة خفيفة للأسفل (شعار + كل ما تحته) */}
      <motion.div className="relative z-20 container translate-y-8 px-4 text-center sm:translate-y-10 md:translate-y-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative isolate mx-auto mb-8 h-52 w-64 flex items-center justify-center"
        >
          {!reduceMotion ? (
            <div
              className="absolute inset-[-24%] z-0 opacity-95 pointer-events-none"
              style={{
                WebkitMaskImage: "url('/INF_LOGO.png')",
                maskImage: "url('/INF_LOGO.png')",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            >
              <ShapeBlur
                variation={1}
                pixelRatioProp={window.devicePixelRatio || 1}
                shapeSize={1.2}
                roundness={0.5}
                borderSize={0.06}
                circleSize={0.35}
                circleEdge={0.8}
                color={[0.72, 0.36, 1]}
              />
            </div>
          ) : null}
          <motion.img
            src="/INF_LOGO.png"
            alt="Infinite City Logo"
            className="relative z-10 h-48 w-48 object-contain select-none"
            loading="eager"
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: 1,
                    filter: "drop-shadow(0 0 8px hsl(var(--primary)/0.35))",
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    scale: { duration: 0.18, ease: "easeOut" },
                    filter: { duration: 0.2, ease: "easeOut" },
                  }
            }
            whileHover={
              reduceMotion
                ? undefined
                : {
                    scale: 1.24,
                    filter: "drop-shadow(0 0 16px hsl(var(--primary)/0.55))",
                    transition: { duration: 0.14, ease: "easeOut" },
                  }
            }
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mb-6"
        >
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="font-latin-display text-xs tracking-[0.3em] text-success">SERVER ONLINE</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="group font-display font-black text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight"
        >
          <motion.span
            className="block text-foreground neon-text font-latin-display"
            whileHover={
              reduceMotion
                ? undefined
                : {
                    textShadow: [
                      "0 0 10px hsl(var(--primary)/0.55), 0 0 24px hsl(var(--primary)/0.35)",
                      "0 0 20px hsl(var(--primary)/0.95), 0 0 42px hsl(var(--primary)/0.7)",
                      "0 0 10px hsl(var(--primary)/0.55), 0 0 24px hsl(var(--primary)/0.35)",
                    ],
                  }
            }
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          >
            INFINITE
          </motion.span>
          <motion.span
            className="block text-gradient-neon mt-2 animate-flicker font-latin-display"
            whileHover={
              reduceMotion
                ? undefined
                : {
                    textShadow: [
                      "0 0 12px hsl(var(--primary)/0.45), 0 0 28px hsl(var(--primary)/0.3)",
                      "0 0 22px hsl(var(--primary)/0.9), 0 0 48px hsl(var(--primary)/0.65)",
                      "0 0 12px hsl(var(--primary)/0.45), 0 0 28px hsl(var(--primary)/0.3)",
                    ],
                  }
            }
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          >
            CITY
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-body"
        >
          أهلا وسهلا بكم في مدينة إنفنتي، حيث تبدأ رحلتكم وتصنعون قصصكم بكل حرية ضمن أجواء واقعية مليئة بالتفاعل والمتعة.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 1.05 }}
          className="mt-16 sm:mt-20 mx-auto max-w-[min(100%,52rem)] px-2 pb-16 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs"
        >
          <p className="flex flex-nowrap items-center justify-center gap-x-2 overflow-x-auto whitespace-nowrap px-1 pb-1 font-body [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="font-latin-display font-medium text-foreground/90">© 2026 Infinite City</span>
            <span className="select-none text-muted-foreground/45" aria-hidden>
              ·
            </span>
            <span>جميع الحقوق محفوظة</span>
            <span className="select-none text-muted-foreground/45" aria-hidden>
              ·
            </span>
            <span className="tracking-wide">صُنع بعناية لمجتمع إنفينيتي سيتي</span>
            <span className="select-none text-muted-foreground/45" aria-hidden>
              ·
            </span>
            <span>
              المبرمج:{" "}
              <a
                href="https://hamza-kitana.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-latin-display font-medium text-primary underline-offset-2 transition-colors hover:text-primary/85 hover:underline"
              >
                Hamza Kitana
              </a>
            </span>
          </p>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default Hero;
