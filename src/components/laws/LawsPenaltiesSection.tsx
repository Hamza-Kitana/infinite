import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import type { PenaltiesBlock } from "@/types/lawsSchema";

type Props = {
  block: PenaltiesBlock;
  reduceMotion: boolean | null;
};

/** محتوى تبويب العقوبات (إنذارات، جداول، مناطق آمنة) — يُقرأ من السياق الديناميكي */
export function LawsPenaltiesSection({ block, reduceMotion }: Props) {
  return (
    <div className="space-y-12">
      {/* Warnings timeline */}
      <div>
        <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-bold md:text-2xl">
          <ChevronLeft className="h-5 w-5 text-primary" />
          الإنذارات المتدرجة
        </h3>
        <div className="relative">
          <div className="absolute right-[22px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/60 via-secondary/50 to-destructive/60 md:right-[26px]" />
          <div className="space-y-4">
            {block.warningLevels.map((w, i) => (
              <motion.div
                key={`${w.id}-${w.title}`}
                initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                layout={!reduceMotion}
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
          {block.specificPenalties.map((item, i) => (
            <motion.div
              key={`${item.id}-${item.title}`}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              layout={!reduceMotion}
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
          layout={!reduceMotion}
          className="overflow-hidden rounded-3xl border border-primary/30 bg-card/50 shadow-inner"
        >
          <div className="border-b border-primary/20 bg-primary/10 px-5 py-4">
            <h4 className="font-display text-lg font-bold">عدد الأشخاص بالسرقات</h4>
            <p className="mt-1 text-xs text-muted-foreground">الحد الأدنى والأقصى للمشاركين — غالباً يلزم رهينة.</p>
          </div>
          <ul className="divide-y divide-border/50">
            {block.robberyPeopleRules.map((row) => (
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
          layout={!reduceMotion}
          className="overflow-hidden rounded-3xl border border-secondary/30 bg-card/50 shadow-inner"
        >
          <div className="border-b border-secondary/20 bg-secondary/10 px-5 py-4">
            <h4 className="font-display text-lg font-bold">وحدات الشرطة المباشرة</h4>
            <p className="mt-1 text-xs text-muted-foreground">الحالات المفتوحة = العدد + 11 — Police MAX 11</p>
          </div>
          <ul className="divide-y divide-border/50">
            {block.directPoliceUnitsRules.map((row) => (
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
          {block.safeZones.map((zone, i) => (
            <motion.div
              key={zone.label}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 8) * 0.03 }}
              layout={!reduceMotion}
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
    </div>
  );
}
