import { NavLink } from "react-router-dom";
import { Anchor, BadgeCheck, Eye, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteVisibility } from "@/lib/siteVisibility";

const links = [
  { to: "/interior/police", label: "الشرطة", short: "شرطة", icon: Shield },
  { to: "/interior/sheriff", label: "الشيرف", short: "شرف", icon: BadgeCheck },
  { to: "/interior/cia", label: "CIA", short: "CIA", icon: Eye },
  { to: "/interior/marines", label: "المارينز", short: "مارينز", icon: Anchor },
] as const;

/**
 * شريط تنقل ثابت بين أقسام وزارة الداخلية — بنفس أسلوب شريط تبويبات صفحة القوانين.
 */
export function InteriorMinistryNav() {
  const visibility = useSiteVisibility();
  const visibleLinks = links.filter((link) => {
    if (link.to === "/interior/police") return visibility.institutions.interior_police;
    if (link.to === "/interior/sheriff") return visibility.institutions.interior_sheriff;
    if (link.to === "/interior/cia") return visibility.institutions.interior_cia;
    if (link.to === "/interior/marines") return visibility.institutions.interior_marines;
    return true;
  });

  return (
    <div className="sticky top-14 z-40 flex justify-center px-3 py-2 sm:top-16 md:px-6 md:py-2.5 xl:px-10">
      <nav
        aria-label="أقسام وزارة الداخلية"
        className={cn(
          "inline-flex h-auto w-auto max-w-[calc(100vw-1.5rem)] flex-wrap justify-center gap-1.5 rounded-2xl border border-primary/25 p-1.5",
          "bg-muted/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl supports-[backdrop-filter]:bg-muted/45",
          "sm:gap-2 sm:p-2 md:max-w-none",
        )}
      >
        {visibleLinks.map(({ to, label, short, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "group inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-display md:px-4 md:text-sm",
                isActive
                  ? "bg-gradient-neon text-primary-foreground shadow-[0_0_28px_hsl(var(--primary)/0.45)]"
                  : "text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary-foreground" : "opacity-80 group-hover:opacity-100",
                  )}
                />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{short}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
