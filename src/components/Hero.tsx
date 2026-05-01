import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import ShapeBlur from "@/components/ShapeBlur";

const YOUTUBE_VIDEO_ID = "9w5SHL6nmkg";
const YOUTUBE_EMBED_URL = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const shouldRenderVideo = true;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);

  const postPlayerCommand = (func: string, args?: unknown[]) => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args: args ?? [],
      }),
      "*",
    );
  };

  useEffect(() => {
    if (!shouldRenderVideo) return;

    const applyPlayerState = () => {
      postPlayerCommand("playVideo");
      postPlayerCommand("setVolume", [volume]);
      if (muted || volume === 0) {
        postPlayerCommand("mute");
      } else {
        postPlayerCommand("unMute");
      }
    };

    const initTimer = window.setTimeout(applyPlayerState, 900);
    const retryTimer = window.setTimeout(applyPlayerState, 1600);

    return () => {
      window.clearTimeout(initTimer);
      window.clearTimeout(retryTimer);
    };
  }, [shouldRenderVideo, muted, volume]);

  useEffect(() => {
    if (!shouldRenderVideo) return;

    const unlockSound = () => {
      postPlayerCommand("playVideo");
      postPlayerCommand("setVolume", [volume]);
      if (!muted && volume > 0) {
        postPlayerCommand("unMute");
      }
    };

    window.addEventListener("pointerdown", unlockSound, { once: true });
    window.addEventListener("keydown", unlockSound, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockSound);
      window.removeEventListener("keydown", unlockSound);
    };
  }, [shouldRenderVideo, muted, volume]);

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);
    postPlayerCommand("setVolume", [nextVolume]);

    if (nextVolume === 0) {
      setMuted(true);
      postPlayerCommand("mute");
      return;
    }

    setMuted(false);
    postPlayerCommand("unMute");
  };

  const handleMuteToggle = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    postPlayerCommand(nextMuted ? "mute" : "unMute");
  };

  return (
    <section
      id="hero"
      dir="rtl"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Background YouTube video */}
      <div className="absolute inset-0 z-10">
        {shouldRenderVideo ? (
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              ref={iframeRef}
              title="Infinite City Background Video"
              src={YOUTUBE_EMBED_URL}
              loading="eager"
              className="absolute left-1/2 top-1/2 h-[100svh] w-[177.78svh] min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 pointer-events-none md:inset-0 md:h-full md:w-full md:translate-x-0 md:translate-y-0 md:scale-[1.28]"
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              onLoad={() => {
                postPlayerCommand("playVideo");
                postPlayerCommand("setVolume", [volume]);
                if (!muted && volume > 0) {
                  postPlayerCommand("unMute");
                }
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.28),transparent_45%),radial-gradient(circle_at_bottom,hsl(var(--secondary)/0.2),transparent_45%)]" />
        )}
        {/* Dark overlays */}
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-gradient-cyber" />
      </div>

      {/* Foreground content */}
      <motion.div className="relative z-20 container text-center px-4">
        {shouldRenderVideo ? (
          <div className="fixed bottom-4 right-3 z-40 w-[min(92vw,320px)] md:bottom-6 md:right-4">
            <div className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3 border border-primary/30 shadow-glow-primary/20">
              <button
                type="button"
                onClick={handleMuteToggle}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/35 bg-background/60 text-primary hover:bg-primary/15 transition-colors"
                aria-label={muted ? "إلغاء كتم الصوت" : "كتم الصوت"}
              >
                {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <div className="flex-1">
                <div className="mb-1 text-[10px] uppercase tracking-[0.22em] text-primary/85 font-latin-display">Volume</div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                  aria-label="مستوى صوت الفيديو"
                />
              </div>
              <span className="font-latin-display text-xs text-primary min-w-10 text-left">{volume}%</span>
            </div>
          </div>
        ) : null}

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

      </motion.div>
    </section>
  );
};

export default Hero;
