import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        md: "2rem",
        lg: "2rem",
      },
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        warning: "hsl(var(--warning))",
        success: "hsl(var(--success))",
      },
      fontFamily: {
        display: ["Changa", "Tajawal", "system-ui", "sans-serif"],
        body: ["Tajawal", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-neon': 'var(--gradient-neon)',
        'gradient-cyber': 'var(--gradient-cyber)',
        'gradient-glow': 'var(--gradient-glow)',
      },
      boxShadow: {
        'glow-primary': 'var(--glow-primary)',
        'glow-secondary': 'var(--glow-secondary)',
        'glow-accent': 'var(--glow-accent)',
        'cyber': 'var(--shadow-cyber)',
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in-up": { "0%": { opacity: "0", transform: "translateY(40px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "float": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.8), 0 0 80px hsl(var(--primary) / 0.4)" },
        },
        "flicker": {
          "0%,100%": { opacity: "1" },
          "45%": { opacity: "1" }, "50%": { opacity: "0.6" }, "55%": { opacity: "1" },
        },
        "scan": { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100vh)" } },
        "grid-move": { "0%": { backgroundPosition: "0 0" }, "100%": { backgroundPosition: "60px 60px" } },
        "shimmer": { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "godfather-glow": {
          "0%,100%": {
            boxShadow:
              "0 0 0 1px rgba(220, 38, 38, 0.35), 0 0 60px -12px rgba(220, 38, 38, 0.35), 0 0 80px -20px rgba(168, 85, 247, 0.2)",
          },
          "50%": {
            boxShadow:
              "0 0 0 1px rgba(168, 85, 247, 0.45), 0 0 70px -8px rgba(168, 85, 247, 0.35), 0 0 100px -15px rgba(220, 38, 38, 0.25)",
          },
        },
        "godfather-float": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "godfather-ring": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        /** VIP سيارات — خلفية الكرت المتحركة */
        "vip-mesh-drift": {
          "0%,100%": { transform: "translate(0%, 0%) scale(1)" },
          "33%": { transform: "translate(7%, -9%) scale(1.07)" },
          "66%": { transform: "translate(-6%, 6%) scale(0.97)" },
        },
        "vip-sheen-sweep": {
          "0%": { transform: "translateX(-150%) skewX(-16deg)", opacity: "0" },
          "22%": { opacity: "0.92" },
          "78%": { opacity: "0.85" },
          "100%": { transform: "translateX(320%) skewX(-16deg)", opacity: "0" },
        },
        /** إطار الكرت VIP — يتحرك لون التدرّج */
        "vip-gradient-shift": {
          "0%,100%": { backgroundPosition: "0% 40%" },
          "50%": { backgroundPosition: "100% 60%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s var(--ease-cyber) both",
        "fade-in-up": "fade-in-up 0.8s var(--ease-cyber) both",
        "float": "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "flicker": "flicker 4s linear infinite",
        "scan": "scan 6s linear infinite",
        "grid-move": "grid-move 20s linear infinite",
        "shimmer": "shimmer 3s linear infinite",
        "godfather-glow": "godfather-glow 5s ease-in-out infinite",
        "godfather-float": "godfather-float 6s ease-in-out infinite",
        "godfather-ring": "godfather-ring 22s linear infinite",
        "vip-mesh-drift": "vip-mesh-drift 17s ease-in-out infinite",
        "vip-sheen-sweep": "vip-sheen-sweep 8s ease-in-out infinite",
        "vip-gradient-shift": "vip-gradient-shift 9s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
