import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Scale,
  Shield,
  Building2,
  MessageSquareWarning,
  Gavel,
  Store,
  Search,
  ChevronLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generalRules,
  crimeRules,
  organizationalRules,
  crimeNegotiationRules,
  warningLevels,
  specificPenalties,
  robberyPeopleRules,
  directPoliceUnitsRules,
  safeZones,
  storeRules,
} from "@/data/justiceRules";
import { cn } from "@/lib/utils";

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
          <RuleCard key={rule.id} rule={rule} variant={variant} reduceMotion={reduceMotion} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      key={query + variant}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      variants={listVariants}
      initial="hidden"
      animate="show"
    >
      {filtered.map((rule) => (
        <RuleCard key={rule.id} rule={rule} variant={variant} reduceMotion={reduceMotion} />
      ))}
    </motion.div>
  );
}

const tabConfig = [
  { id: "general", label: "العامة", short: "عامة", icon: Scale, count: 38 },
  { id: "crime", label: "الإجرام", short: "إجرام", icon: Shield, count: 45 },
  { id: "org", label: "التنظيمية", short: "تنظيم", icon: Building2, count: 18 },
  { id: "negotiation", label: "الجرائم والتفاوض", short: "تفاوض", icon: MessageSquareWarning, count: 8 },
  { id: "penalties", label: "العقوبات", short: "عقوبات", icon: Gavel, count: 10 },
  { id: "store", label: "المتجر", short: "متجر", icon: Store, count: 8 },
] as const;

const JusticePage = () => {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />

      {/* Hero — نفس أسلوب صفحة صنّاع المحتوى (GIF + تدرجات + عنوان) */}
      <section className="relative h-[46vh] min-h-[300px] max-h-[520px] overflow-hidden">
        <img
          src="/INF-CONECT-LOGO.gif"
          alt="دستور المدينة — Infinite City"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/10 to-background/85" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/55 to-transparent backdrop-blur-sm" />
        <div className="absolute inset-x-0 -bottom-8 h-32 bg-gradient-to-t from-background/90 via-background/60 to-transparent backdrop-blur-sm" />
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center gap-2 px-4 text-center sm:bottom-3 md:bottom-4">
          <p className="font-display text-xs tracking-[0.35em] text-primary/95 drop-shadow-[0_4px_18px_hsl(var(--background)/0.95)]">
            MINISTRY OF JUSTICE
          </p>
          <h1 className="font-display text-4xl font-bold md:text-6xl drop-shadow-[0_8px_24px_hsl(var(--background)/0.85)]">
            <span className="text-gradient-neon">دستور</span>{" "}
            <span className="text-foreground">المدينة</span>
          </h1>
        </div>
      </section>

      {/* Intro + search + tabs */}
      <main className="relative z-10 pb-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8 xl:px-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-card/90 via-background/95 to-card/80 p-8 shadow-[0_24px_80px_-20px_hsl(var(--primary)/0.25)] md:p-10"
          >
            <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-primary/15 blur-[100px]" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-secondary/12 blur-[90px]" />

            <div className="relative text-right">
              <h2 className="font-display text-2xl font-bold md:text-4xl">
                قوانين <span className="text-gradient-neon">Infinite City RP</span>
              </h2>
              <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
                أنت على أبواب دخول مدينة إنفينيتي. نسعى لمجتمع أقرب للكمال في الـ Roleplay — نرجو الإلمام الكامل بالقوانين
                والالتزام بها احترامًا للجميع.
              </p>
            </div>
          </motion.div>

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

        <Tabs defaultValue="general" className="mt-6 w-full md:mt-8">
          {/* تثبيت تحت الـ Navbar — بدون شريط بعرض الشاشة؛ فقط صندوق التبويبات */}
          <div className="sticky top-14 z-40 flex justify-center px-3 py-2 sm:top-16 md:px-6 md:py-2.5 xl:px-10">
            <TabsList
              className={cn(
                "inline-flex h-auto w-auto max-w-[calc(100vw-1.5rem)] flex-wrap justify-center gap-1.5 rounded-2xl border border-primary/25 p-1.5",
                "bg-muted/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl supports-[backdrop-filter]:bg-muted/45",
                "sm:gap-2 sm:p-2 md:max-w-none",
              )}
            >
              {tabConfig.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="group flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-display data-[state=active]:bg-gradient-neon data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_28px_hsl(var(--primary)/0.45)] md:px-4 md:text-sm"
                >
                  <t.icon className="h-4 w-4 shrink-0 opacity-80 group-data-[state=active]:opacity-100" />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.short}</span>
                  <span className="rounded-md bg-background/50 px-1.5 py-0.5 font-latin-display text-[10px] text-muted-foreground group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                    {t.count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mx-auto max-w-6xl px-4 md:px-8 xl:px-12">
            <TabsContent value="general" className="mt-8 outline-none">
              <SectionIntro reduceMotion={reduceMotion} title="القوانين العامة" subtitle="القواعد الأساسية التي تنطبق على جميع اللاعبين دون استثناء." />
              <RulesGrid rules={generalRules} variant="primary" query={query} reduceMotion={reduceMotion} />
            </TabsContent>

            <TabsContent value="crime" className="mt-8 outline-none">
              <SectionIntro reduceMotion={reduceMotion} title="قوانين الإجرام" subtitle="الأنشطة الإجرامية، العصابات، والتفاصيل الحساسة للسيناريوهات." />
              <RulesGrid rules={crimeRules} variant="secondary" query={query} reduceMotion={reduceMotion} />
            </TabsContent>

            <TabsContent value="org" className="mt-8 outline-none">
              <SectionIntro reduceMotion={reduceMotion} title="القوانين التنظيمية" subtitle="الأسماء، الوثائق، العصابات، والقطاعات — لتجربة منظمة وعادلة." />
              <RulesGrid rules={organizationalRules} variant="accent" query={query} reduceMotion={reduceMotion} />
            </TabsContent>

            <TabsContent value="negotiation" className="mt-8 outline-none">
              <SectionIntro reduceMotion={reduceMotion} title="قوانين الجرائم والتفاوض" subtitle="العداوات، النصب، التلويت، والتفاوض بين الأطراف وفق أصول الرول بلاي." />
              <RulesGrid rules={crimeNegotiationRules} variant="magenta" query={query} reduceMotion={reduceMotion} />
            </TabsContent>

            <TabsContent value="penalties" className="mt-8 space-y-12 outline-none">
              <SectionIntro reduceMotion={reduceMotion} title="نظام العقوبات" subtitle="الإنذارات، الغرامات الزمنية، جداول السرقات، والمناطق الآمنة." />

              {/* Warnings timeline */}
              <div>
                <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-bold md:text-2xl">
                  <ChevronLeft className="h-5 w-5 text-primary" />
                  الإنذارات المتدرجة
                </h3>
                <div className="relative">
                  <div className="absolute right-[22px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/60 via-secondary/50 to-destructive/60 md:right-[26px]" />
                  <div className="space-y-4">
                    {warningLevels.map((w, i) => (
                      <motion.div
                        key={w.id}
                        initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ delay: i * 0.06, duration: 0.45 }}
                        className="relative flex items-start gap-4 rounded-2xl border border-destructive/20 bg-card/40 p-4 backdrop-blur-md md:p-5"
                      >
                        <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-neon font-latin-display text-sm font-bold text-primary-foreground shadow-md">
                          {w.id}
                        </span>
                        <div className="min-w-0 flex-1 text-right">
                          <p className="font-display text-lg font-semibold">{w.title}</p>
                          <p className="mt-1 text-muted-foreground">{w.duration}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specific penalties */}
              <div>
                <h3 className="mb-6 font-display text-xl font-bold md:text-2xl">العقوبات المحددة</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {specificPenalties.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="group rounded-2xl border border-warning/35 bg-gradient-to-br from-warning/10 via-card/60 to-card/40 p-5 transition-all hover:border-warning/55 hover:shadow-[0_12px_40px_hsl(var(--warning)/0.12)]"
                    >
                      <span className="inline-flex rounded-lg bg-warning/20 px-2 py-0.5 font-latin-display text-xs text-warning">
                        #{item.id}
                      </span>
                      <p className="mt-3 font-display text-lg font-bold">{item.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.penalty}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Robbery tables */}
              <div className="grid gap-6 lg:grid-cols-2">
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="overflow-hidden rounded-3xl border border-primary/30 bg-card/50 shadow-inner"
                >
                  <div className="border-b border-primary/20 bg-primary/10 px-5 py-4">
                    <h4 className="font-display text-lg font-bold">عدد الأشخاص بالسرقات</h4>
                    <p className="mt-1 text-xs text-muted-foreground">الحد الأدنى والأقصى للمشاركين — غالباً يلزم رهينة.</p>
                  </div>
                  <ul className="divide-y divide-border/50">
                    {robberyPeopleRules.map((row) => (
                      <li
                        key={row.label}
                        className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-primary/5"
                      >
                        <span className="text-sm leading-snug">{row.label}</span>
                        <span className="shrink-0 rounded-lg bg-primary/15 px-3 py-1 font-latin-display text-sm font-semibold text-primary">
                          {row.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 }}
                  className="overflow-hidden rounded-3xl border border-secondary/30 bg-card/50 shadow-inner"
                >
                  <div className="border-b border-secondary/20 bg-secondary/10 px-5 py-4">
                    <h4 className="font-display text-lg font-bold">وحدات الشرطة المباشرة</h4>
                    <p className="mt-1 text-xs text-muted-foreground">الحالات المفتوحة = العدد + 11 — Police MAX 11</p>
                  </div>
                  <ul className="divide-y divide-border/50">
                    {directPoliceUnitsRules.map((row) => (
                      <li
                        key={row.label}
                        className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/5"
                      >
                        <span className="text-sm">{row.label}</span>
                        <span className="shrink-0 rounded-lg bg-secondary/15 px-3 py-1 font-latin-display text-sm font-semibold text-secondary">
                          {row.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Safe zones */}
              <div>
                <h3 className="mb-4 font-display text-xl font-bold md:text-2xl">المناطق الآمنة</h3>
                <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
                  أماكن محظور فيها العنف والجرائم. للشرطة حق الدخول والتعامل وفق القوانين المعتمدة.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {safeZones.map((zone, i) => (
                    <motion.div
                      key={zone.label}
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: (i % 8) * 0.03 }}
                      whileHover={reduceMotion ? undefined : { y: -3 }}
                      className="flex items-center gap-3 rounded-2xl border border-success/25 bg-gradient-to-br from-success/5 to-card/60 px-4 py-3.5 shadow-sm transition-shadow hover:border-success/45 hover:shadow-[0_8px_30px_hsl(var(--success)/0.08)]"
                    >
                      <span className="text-2xl leading-none">{zone.icon}</span>
                      <span className="text-sm font-medium">{zone.label}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="font-display font-semibold text-foreground">ملاحظة:</span> يحق للشرطة الدخول للمناطق الآمنة وإطلاق
                  النار عند الاقتضاء ضمن الأنظمة.
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="store" className="mt-8 outline-none">
              <SectionIntro reduceMotion={reduceMotion} title="قوانين المتجر" subtitle="شروط وأحكام المشتريات — التزامك بالشراء يعني موافقتك الكاملة." />
              <RulesGrid rules={storeRules} variant="primary" query={query} reduceMotion={reduceMotion} />
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8 rounded-2xl border border-secondary/35 bg-secondary/5 p-6 text-center md:text-right"
              >
                <p className="font-display text-lg text-foreground">التزام المشترين</p>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  يسهّل الالتزام هذه القوانين تجربة عادلة للجميع داخل المتجر والمدينة.
                </p>
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

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

export default JusticePage;
