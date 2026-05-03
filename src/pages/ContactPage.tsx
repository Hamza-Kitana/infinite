import { motion, useReducedMotion } from "framer-motion";
import { Clock, Mail, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { DISCORD_INVITE_URL } from "@/config/communityLinks";
import { cn } from "@/lib/utils";

function DiscordGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928-1.793 6.4-2.246 6.4-2.246a.078.078 0 0 1 .075.05c.35 1.27.496 2.59.47 3.9a.077.077 0 0 0 .05.071 19.7 19.7 0 0 0 2.8.47.08.08 0 0 0 .077-.043 19.7 19.7 0 0 0 1.36-3.08.074.074 0 0 0-.041-.094 13.6 13.6 0 0 1-1.665-.795.076.076 0 0 1-.009-.128 12.66 12.66 0 0 0 1.07-.52.074.074 0 0 1 .078.005 19.74 19.74 0 0 0 4.02 2.51.077.077 0 0 0 .084-.028 19.88 19.88 0 0 0 2.85-5.29.074.074 0 0 0-.031-.088 19.65 19.65 0 0 0-2.48-4.28.074.074 0 0 0-.079-.023zm-9.67 12.95c-1.08 0-1.96-.97-1.96-2.18 0-1.19.86-2.18 1.96-2.18 1.1 0 1.97.99 1.96 2.18 0 1.21-.86 2.18-1.96 2.18zm7.88 0c-1.08 0-1.96-.97-1.96-2.18 0-1.19.87-2.18 1.96-2.18 1.1 0 1.97.99 1.96 2.18 0 1.21-.87 2.18-1.96 2.18z"
      />
    </svg>
  );
}

const ContactPage = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />

      <section className="relative h-[46vh] min-h-[300px] max-h-[520px] overflow-hidden">
        <img
          src="/INF-CONECT-LOGO.gif"
          alt="تواصل معنا — Infinite City"
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
            CONTACT & SUPPORT
          </p>
          <h1 className="font-display text-4xl font-bold md:text-6xl drop-shadow-[0_8px_24px_hsl(var(--background)/0.85)]">
            <span className="text-gradient-neon">تواصل</span> <span className="text-foreground">معنا</span>
          </h1>
        </div>
      </section>

      <main className="relative z-10 pb-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8 xl:px-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55 }}
            className="relative mt-10 overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-card/90 via-background/95 to-card/80 p-8 shadow-[0_24px_80px_-20px_hsl(var(--primary)/0.25)] md:p-10"
          >
            <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-primary/15 blur-[100px]" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-secondary/12 blur-[90px]" />
            <div className="relative text-right">
              <h2 className="font-display text-2xl font-bold md:text-4xl">
                نحن هنا <span className="text-gradient-neon">لمجتمعنا</span>
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                أسئلة عن التقديم، الدعم الفني، أو متابعة طلبك؟ قنواتنا الرسمية واضحة وبسيطة — انضم للسيرفر على الديسكورد حيث يتواجد
                الفريق ويتم تنسيق المقابلات والاستفسارات.
              </p>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <motion.article
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-[#5865F2]/35 bg-gradient-to-br from-[#5865F2]/10 via-card/80 to-background p-6 md:p-8",
                "shadow-[0_16px_48px_-12px_rgba(88,101,242,0.35)]",
              )}
            >
              <div className="pointer-events-none absolute -left-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#5865F2]/20 blur-3xl" />
              <div className="relative flex flex-col items-start gap-4 text-right">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#5865F2]/40 bg-[#5865F2]/15 px-3 py-1 font-display text-xs tracking-wide text-[#aab3ff]">
                  <DiscordGlyph className="h-4 w-4" />
                  الديسكورد — القناة الأساسية
                </span>
                <h3 className="font-display text-xl font-bold text-foreground md:text-2xl">انضم إلى السيرفر</h3>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  تواصل مع الإدارة، رتّب مقابلة بعد التقديم، وتابع الإعلانات والفعاليات. الرد يكون عبر التذاكر أو القنوات المعتمدة داخل
                  السيرفر.
                </p>
                <Button
                  type="button"
                  className="mt-2 h-12 w-full gap-2 bg-[#5865F2] font-display text-base text-white hover:bg-[#4752C4] sm:w-auto sm:min-w-[13rem]"
                  asChild
                >
                  <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
                    <DiscordGlyph className="h-5 w-5 shrink-0" />
                    فتح سيرفر الديسكورد
                  </a>
                </Button>
              </div>
            </motion.article>

            <motion.article
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="rounded-2xl border border-primary/25 bg-card/60 p-6 backdrop-blur-sm md:p-8"
            >
              <div className="flex flex-col gap-6 text-right">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">أوقات التواجد</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground md:text-base">
                      الفريق متواجد بشكل يومي على الديسكورد؛ قد يختلف وقت الرد حسب الضغط. للطوارئ استخدم القنوات المخصصة داخل السيرفر.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-primary/15 pt-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">البريد (قريبًا)</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground md:text-base">
                      جارٍ تفعيل بريد رسمي للدعم. حتى ذلك الحين، الديسكورد هو القناة الموثوقة للتواصل مع الإدارة.
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mt-10 rounded-2xl border border-primary/20 bg-muted/25 p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8"
          >
            <div className="flex items-start gap-4 text-right">
              <MessagesSquare className="mt-1 h-8 w-8 shrink-0 text-primary" />
              <div>
                <h3 className="font-display text-lg font-bold md:text-xl">جديد وتريد الانضمام؟</h3>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  ابدأ بتعبئة طلب المواطن أو القطاع المناسب؛ بعد الإرسال ستجد تعليمات المتابعة على الديسكورد.
                </p>
              </div>
            </div>
            <Button
              asChild
              className="mt-6 w-full shrink-0 bg-gradient-neon font-display tracking-wide text-primary-foreground md:mt-0 md:w-auto md:min-w-[11rem]"
            >
              <Link to="/apply/citizen">قدّم طلبك الآن</Link>
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
