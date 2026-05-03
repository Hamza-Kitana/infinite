import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstitutionHero from "@/components/InstitutionHero";
import { LawIcon } from "@/components/laws/lawIcons";
import { LawsPenaltiesSection } from "@/components/laws/LawsPenaltiesSection";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLawsContent } from "@/contexts/LawsContentContext";
import { sectionItemCount } from "@/lib/lawsUtils";
import { cn } from "@/lib/utils";
import type { LawTabSection } from "@/types/lawsSchema";

type RuleVariant = "primary" | "secondary" | "accent" | "magenta";

const variantStyles: Record<
  RuleVariant,
  { border: string; badge: string; line: string; glow: string }
> = {
  primary: {
    border: "border-primary/30 hover:border-primary/55",
    badge: "bg-primary/20 text-primary ring-1 ring-primary/40 shadow-[0_0_24px_hsl(var(--primary)/0.2)]",
    line: "from-primary via-secondary/80 to-transparent",
    glow: "group-hover:shadow-[0_0_32px_hsl(var(--primary)/0.12)]",
  },
  secondary: {
    border: "border-secondary/30 hover:border-secondary/55",
    badge: "bg-secondary/20 text-secondary ring-1 ring-secondary/40 shadow-[0_0_24px_hsl(var(--secondary)/0.2)]",
    line: "from-secondary via-primary/60 to-transparent",
    glow: "group-hover:shadow-[0_0_32px_hsl(var(--secondary)/0.12)]",
  },
  accent: {
    border: "border-accent/30 hover:border-accent/55",
    badge: "bg-accent/20 text-accent ring-1 ring-accent/40 shadow-[0_0_24px_hsl(var(--accent)/0.2)]",
    line: "from-accent via-primary/50 to-transparent",
    glow: "group-hover:shadow-[0_0_32px_hsl(var(--accent)/0.12)]",
  },
  magenta: {
    border: "border-primary/25 hover:border-secondary/50",
    badge: "bg-gradient-to-br from-primary/30 to-secondary/25 text-foreground ring-1 ring-primary/30",
    line: "from-secondary via-primary to-secondary/50",
    glow: "hover:shadow-[0_0_28px_hsl(var(--secondary)/0.14)]",
  },
};

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 380, damping: 28 },
  },
};

type RuleItem = { id: number; title: string; description: string };

function RuleCard({
  rule,
  variant,
  reduceMotion,
}: {
  rule: RuleItem;
  variant: RuleVariant;
  reduceMotion: boolean | null;
}) {
  const v = variantStyles[variant];
  return (
    <motion.article
      layout={!reduceMotion}
      variants={reduceMotion ? undefined : itemVariants}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card/50 p-5 backdrop-blur-md transition-[transform,box-shadow,border-color] duration-300 md:p-6",
        v.border,
        v.glow,
        "hover:-translate-y-1 motion-reduce:transform-none motion-reduce:hover:translate-y-0",
      )}
      style={{ contentVisibility: "auto" }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l opacity-90 transition-opacity duration-500 group-hover:opacity-100",
          v.line,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -left-20 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-gradient-to-r blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          variant === "secondary" ? "from-secondary/25" : "from-primary/20",
        )}
      />

      <div className="relative flex items-start gap-4">
        <span
          className={cn(
            "flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl font-latin-display text-sm font-bold transition-transform duration-300 group-hover:scale-105",
            v.badge,
          )}
        >
          {String(rule.id).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1 space-y-2.5 text-right">
          <h4 className="font-display text-lg font-bold leading-snug text-foreground md:text-xl">{rule.title}</h4>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">{rule.description}</p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b border-l border-primary/20 opacity-40 transition-opacity group-hover:opacity-70" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r border-primary/20 opacity-40 transition-opacity group-hover:opacity-70" />
    </motion.article>
  );
}

function RulesGrid({
  rules,
  variant,
  query,
  reduceMotion,
}: {
  rules: RuleItem[];
  variant: RuleVariant;
  query: string;
  reduceMotion: boolean | null;
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rules;
    return rules.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
    );
  }, [rules, query]);

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 py-16 text-center">
        <p className="font-display text-muted-foreground">لا توجد نتائج مطابقة للبحث.</p>
      </div>
    );
  }

  if (reduceMotion) {
    return (
      <div key={query + variant} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((rule) => (
          <RuleCard key={`${rule.id}-${rule.title}`} rule={rule} variant={variant} reduceMotion={reduceMotion} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      key={query + variant + rules.map((r) => r.id).join("-")}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      variants={listVariants}
      initial="hidden"
      animate="show"
    >
      {filtered.map((rule) => (
        <RuleCard key={`${rule.id}-${rule.title}`} rule={rule} variant={variant} reduceMotion={reduceMotion} />
      ))}
    </motion.div>
  );
}

function SectionIntro({
  title,
  subtitle,
  reduceMotion,
}: {
  title: string;
  subtitle: string;
  reduceMotion?: boolean | null;
}) {
  const inner = (
    <>
      <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
      <div className="mt-4 h-px max-w-xs bg-gradient-to-l from-primary via-secondary/50 to-transparent" />
    </>
  );

  if (reduceMotion) {
    return <div className="mb-8 text-right">{inner}</div>;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="mb-8 text-right"
    >
      {inner}
    </motion.div>
  );
}

function renderSectionContent(
  section: LawTabSection,
  query: string,
  reduceMotion: boolean | null,
) {
  if (section.kind === "penalties") {
    return (
      <>
        <SectionIntro reduceMotion={reduceMotion} title={section.label} subtitle={section.subtitle} />
        <LawsPenaltiesSection block={section.penalties} reduceMotion={reduceMotion} />
      </>
    );
  }

  return (
    <>
      <SectionIntro reduceMotion={reduceMotion} title={section.label} subtitle={section.subtitle} />
      <RulesGrid rules={section.rules} variant={section.variant} query={query} reduceMotion={reduceMotion} />
      {section.id === "store" ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          layout={!reduceMotion}
          className="mt-8 rounded-2xl border border-secondary/35 bg-secondary/5 p-6 text-center md:text-right"
        >
          <p className="font-display text-lg text-foreground">التزام المشترين</p>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            يسهّل الالتزام هذه القوانين تجربة عادلة للجميع داخل المتجر والمدينة.
          </p>
        </motion.div>
      ) : null}
    </>
  );
}

const LawsPage = () => {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const { sections } = useLawsContent();

  const defaultTab = sections[0]?.id ?? "general";

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />

      <InstitutionHero
        badgeEn="LAWS & CONSTITUTION"
        alt="دستور المدينة — Infinite City"
        title={
          <>
            صفحة <span className="text-gradient-neon">دستور المدينة</span>
          </>
        }
      />

      <main className="pb-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8 xl:px-12">
          <div className="glass-panel rounded-xl p-6 md:p-8">
            <p className="text-right text-muted-foreground leading-relaxed md:text-lg">
              أنت على أبواب دخول مدينة إنفينيتي. نسعى لمجتمع أقرب للكمال في الـ Roleplay — نرجو الإلمام الكامل بالقوانين
              والالتزام بها احترامًا للجميع.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث في القسم النشط عن كلمة، مثال: رهينة، سرقة، باند..."
                className="h-12 rounded-2xl border-primary/30 bg-card/60 pr-10 text-right backdrop-blur-sm placeholder:text-muted-foreground/70 focus-visible:ring-primary/40"
              />
            </div>
            <p className="text-center text-xs text-muted-foreground sm:text-right font-display tracking-wide">
              استخدم التبويبات أدناه ثم ابحث داخل القسم المفتوح
            </p>
          </div>
        </div>

        <Tabs key={sections.map((s) => s.id).join("|")} defaultValue={defaultTab} className="mt-6 w-full md:mt-8">
          <div className="sticky top-14 z-40 flex justify-center px-3 py-2 sm:top-16 md:px-6 md:py-2.5 xl:px-10">
            <TabsList
              className={cn(
                "inline-flex h-auto w-auto max-w-[calc(100vw-1.5rem)] flex-wrap justify-center gap-1.5 rounded-2xl border border-primary/25 p-1.5",
                "bg-muted/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl supports-[backdrop-filter]:bg-muted/45",
                "sm:gap-2 sm:p-2 md:max-w-none",
              )}
            >
              {sections.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="group flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-display data-[state=active]:bg-gradient-neon data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_28px_hsl(var(--primary)/0.45)] md:px-4 md:text-sm"
                >
                  <LawIcon className="h-4 w-4 shrink-0 opacity-80 group-data-[state=active]:opacity-100" name={t.icon} />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.short}</span>
                  <span className="rounded-md bg-background/50 px-1.5 py-0.5 font-latin-display text-[10px] text-muted-foreground group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                    {sectionItemCount(t)}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mx-auto max-w-6xl px-4 md:px-8 xl:px-12">
            {sections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="mt-8 outline-none" forceMount={false}>
                {renderSectionContent(section, query, reduceMotion)}
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-2 text-right md:px-8 xl:px-12">
          <Link
            to="/justice"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            العودة إلى وزارة العدل
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LawsPage;
