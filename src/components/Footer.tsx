import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/config/communityLinks";

const quickLinks = [
  { label: "الرئيسية", to: "/" },
  { label: "القوانين", to: "/justice" },
  { label: "صنّاع المحتوى", to: "/streamers" },
  { label: "تواصل معنا", to: "/contact" },
  { label: "تقديم طلب", to: "/apply/citizen" },
];

const Footer = () => {
  return (
    <footer
      dir="rtl"
      className="relative mt-20 border-t border-primary/25 bg-gradient-to-b from-background via-background to-muted/20"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/50 to-transparent" />

      <div className="w-full px-4 py-14 md:px-8 xl:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <Link to="/" className="group inline-block shrink-0 leading-none" aria-label="العودة للرئيسية">
                <img
                  src="/INF_LOGO.png"
                  alt="Infinite City Logo"
                  className="h-10 w-10 object-contain drop-shadow-[0_0_22px_hsl(var(--primary)/0.95)]"
                  loading="lazy"
                />
              </Link>
              <div className="leading-tight">
                <div className="font-latin-display text-base font-bold tracking-widest text-foreground">INFINITE</div>
                <div className="-mt-1 font-latin-display text-[10px] tracking-[0.3em] text-primary">C I T Y</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              سيرفر رول بلاي عربي — قوانين واضحة، فريق إدارة متواجد، ومجتمع يهتم بالتجربة.
            </p>
          </div>

          <div className="md:col-span-4">
            <h3 className="font-display text-sm font-bold tracking-wide text-primary">تصفح سريع</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-display text-sm font-bold tracking-wide text-primary">تواصل</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              انضم لسيرفر الديسكورد للمقابلات، الدعم، وآخر الأخبار.
            </p>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#5865F2]/40 bg-[#5865F2]/10 px-4 py-2.5 text-sm font-medium text-[#c9cdfb] transition-colors hover:border-[#5865F2]/60 hover:bg-[#5865F2]/20"
            >
              <span className="font-display">ديسكورد</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-6xl border-t border-primary/15 px-2 pb-6 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-center text-[11px] leading-relaxed text-muted-foreground sm:gap-x-3 sm:text-xs">
            <span className="font-display font-semibold text-foreground/95">
              © {new Date().getFullYear()} Infinite City
            </span>
            <span className="select-none text-muted-foreground/45" aria-hidden>
              ·
            </span>
            <span className="font-display">جميع الحقوق محفوظة</span>
            <span className="select-none text-muted-foreground/45" aria-hidden>
              ·
            </span>
            <span className="font-display tracking-[0.12em]">صُنع بعناية لمجتمع إنفينيتي سيتي</span>
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
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
