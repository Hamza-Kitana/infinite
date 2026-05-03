import { type CSSProperties, type MouseEvent } from "react";
import "./ChromaGrid.css";

export type ChromaGridItem = {
  image: string;
  title: string;
  subtitle: string;
  handle?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
  location?: string;
};

type ChromaGridProps = {
  items: ChromaGridItem[];
  className?: string;
  radius?: number;
  columns?: number;
  rows?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
  rtl?: boolean;
};

const ChromaGrid = ({
  items,
  className = "",
  columns = 3,
  rows = 2,
  rtl = false,
}: ChromaGridProps) => {
  const handleCardClick = (url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCardMove = (e: MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  if (!items.length) return null;

  return (
    <div
      className={`chroma-grid ${rtl ? "chroma-grid--rtl" : ""} ${className}`.trim()}
      style={
        {
          "--cols": columns,
          "--rows": rows,
        } as CSSProperties
      }
    >
      {items.map((c, i) => (
        <article
          key={`${c.title}-${i}`}
          className="chroma-card"
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(c.url)}
          style={
            {
              "--card-border": c.borderColor || "transparent",
              "--card-gradient": c.gradient || "linear-gradient(145deg, hsl(var(--card)), hsl(var(--background) / 0.92))",
              cursor: c.url ? "pointer" : "default",
            } as CSSProperties
          }
        >
          <div className="chroma-img-wrapper">
            <img src={c.image} alt={c.title} loading="lazy" />
          </div>
          <footer className="chroma-info">
            <h3 className="name">{c.title}</h3>
            {c.handle ? <span className="handle">{c.handle}</span> : null}
            <p className="role">{c.subtitle}</p>
            {c.location ? <span className="location">{c.location}</span> : null}
          </footer>
        </article>
      ))}
    </div>
  );
};

export default ChromaGrid;
