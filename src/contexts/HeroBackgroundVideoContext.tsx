import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { boostYoutubePlayerQuality } from "@/lib/youtube";

const YOUTUBE_VIDEO_ID = "9w5SHL6nmkg";

export const getYoutubeEmbedUrl = () =>
  `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=${typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : ""}`;

export type HeroBackgroundVideoContextValue = {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  volume: number;
  muted: boolean;
  handleVolumeChange: (nextVolume: number) => void;
  handleMuteToggle: () => void;
  onIframeLoad: () => void;
};

const HeroBackgroundVideoContext = createContext<HeroBackgroundVideoContextValue | null>(null);

export function HeroBackgroundVideoProvider({ children }: { children: ReactNode }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);

  const postPlayerCommand = useCallback((func: string, args?: unknown[]) => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args: args ?? [],
      }),
      "*",
    );
  }, []);

  const applyPlayerState = useCallback(() => {
    postPlayerCommand("playVideo");
    postPlayerCommand("setVolume", [volume]);
    if (muted || volume === 0) {
      postPlayerCommand("mute");
    } else {
      postPlayerCommand("unMute");
    }
    boostYoutubePlayerQuality(iframeRef.current?.contentWindow);
  }, [muted, volume, postPlayerCommand]);

  useEffect(() => {
    const initTimer = window.setTimeout(applyPlayerState, 900);
    const retryTimer = window.setTimeout(applyPlayerState, 1600);

    return () => {
      window.clearTimeout(initTimer);
      window.clearTimeout(retryTimer);
    };
  }, [applyPlayerState]);

  useEffect(() => {
    const unlockSound = () => {
      postPlayerCommand("playVideo");
      postPlayerCommand("setVolume", [volume]);
      if (!muted && volume > 0) {
        postPlayerCommand("unMute");
      }
      boostYoutubePlayerQuality(iframeRef.current?.contentWindow);
    };

    window.addEventListener("pointerdown", unlockSound, { once: true });
    window.addEventListener("keydown", unlockSound, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockSound);
      window.removeEventListener("keydown", unlockSound);
    };
  }, [muted, volume, postPlayerCommand]);

  const handleVolumeChange = useCallback(
    (nextVolume: number) => {
      setVolume(nextVolume);
      postPlayerCommand("setVolume", [nextVolume]);

      if (nextVolume === 0) {
        setMuted(true);
        postPlayerCommand("mute");
        return;
      }

      setMuted(false);
      postPlayerCommand("unMute");
    },
    [postPlayerCommand],
  );

  const handleMuteToggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      postPlayerCommand(next ? "mute" : "unMute");
      return next;
    });
  }, [postPlayerCommand]);

  const onIframeLoad = useCallback(() => {
    postPlayerCommand("playVideo");
    postPlayerCommand("setVolume", [volume]);
    if (!muted && volume > 0) {
      postPlayerCommand("unMute");
    } else {
      postPlayerCommand("mute");
    }
    boostYoutubePlayerQuality(iframeRef.current?.contentWindow);
    window.setTimeout(() => boostYoutubePlayerQuality(iframeRef.current?.contentWindow), 800);
    window.setTimeout(() => boostYoutubePlayerQuality(iframeRef.current?.contentWindow), 2200);
  }, [muted, volume, postPlayerCommand]);

  const value = useMemo(
    () => ({
      iframeRef,
      volume,
      muted,
      handleVolumeChange,
      handleMuteToggle,
      onIframeLoad,
    }),
    [volume, muted, handleVolumeChange, handleMuteToggle, onIframeLoad],
  );

  return (
    <HeroBackgroundVideoContext.Provider value={value}>{children}</HeroBackgroundVideoContext.Provider>
  );
}

export function useHeroBackgroundVideo(): HeroBackgroundVideoContextValue {
  const ctx = useContext(HeroBackgroundVideoContext);
  if (!ctx) {
    throw new Error("useHeroBackgroundVideo must be used within HeroBackgroundVideoProvider");
  }
  return ctx;
}

export function useOptionalHeroBackgroundVideo(): HeroBackgroundVideoContextValue | null {
  return useContext(HeroBackgroundVideoContext);
}
