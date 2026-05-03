import { motion, useReducedMotion } from "framer-motion";
import { HeartHandshake, MessagesSquare, Sparkles, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { DISCORD_INVITE_URL } from "@/config/communityLinks";
import { DiscordIcon } from "@/components/DiscordIcon";
import { cn } from "@/lib/utils";

const pillars = [
  {
    icon: Sparkles,
    title: "تجربة RP عميقة",
    body: "قصص، أدوار، ومؤسسات تعطي كل جلسة معنى — من المواطن البسيط إلى القطاعات الحكومية والعصابات.",
  },
  {
    icon: Users,
    title: "مجتمع واعٍ",
    body: "لاعبون يحترمون القوانين والقصة؛ الإدارة تعمل على بيئة عادلة، شفافة، وقريبة من اللاعبين.",
  },
  {
    icon: HeartHandshake,
    title: "دعم وفريق",
    body: "نسعى لأن تكون المدينة مساحة مريحة للعب الجاد مع مسارات واضحة للانضمام والمتابعة.",
  },
] as const;

const ContactPage = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />

      <section className="relative h-[46vh] min-h-[300px] max-h-[520px] overflow-hidden">
        <img
          src="/INF-CONECT-LOGO.gif"
          alt="من نحن — Infinite City"
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
            WHO WE ARE
          </p>
          <h1 className="font-display text-4xl font-bold md:text-6xl drop-shadow-[0_8px_24px_hsl(var(--background)/0.85)]">
            <span className="text-gradient-neon">من</span> <span className="text-foreground">نحن</span>
          </h1>
        </div>
      </section>

      <main className="relative z-10 pb-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8 xl:px-12">
          {/* ——— من نحن ——— */}
          <motion.section
            aria-labelledby="about-heading"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55 }}
            className="relative mt-10 overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-card/90 via-background/95 to-card/80 p-8 shadow-[0_24px_80px_-20px_hsl(var(--primary)/0.25)] md:p-10"
          >
            <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-primary/15 blur-[100px]" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-secondary/12 blur-[90px]" />
            <div className="relative text-right">
              <p className="font-display text-xs tracking-[0.28em] text-primary/90">من نحن</p>
              <h2 id="about-heading" className="mt-2 font-display text-2xl font-bold md:text-4xl">
                Infinite City <span className="text-gradient-neon">RP</span>
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                نحن فريق ومجتمع يجمع حول مدينة رول بلاي عربية طموحة: قوانين واضحة، وزارات ومؤسسات، وشوارع مليئة بالقصص. هدفنا أن تكون
                كل جلسة قريبة من الواقع الترفيهي — احترام للقصة، ولللاعب، وللوقت الذي يقضيه الجميع هنا.
              </p>
            </div>
          </motion.section>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <motion.article
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-primary/20 bg-card/50 p-6 backdrop-blur-sm md:p-8"
            >
              <div className="flex items-start gap-4 text-right">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold md:text-xl">رؤيتنا</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                    مدينة متجددة يتحكم فيها اللاعبون بقراراتهم، ضمن إطار RP محترم — حيث الإدارة تضع الإطار والمجتمع يملأه بالحياة.
                  </p>
                </div>
              </div>
            </motion.article>
            <motion.article
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="rounded-2xl border border-secondary/20 bg-card/50 p-6 backdrop-blur-sm md:p-8"
            >
              <div className="flex items-start gap-4 text-right">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                  <MessagesSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold md:text-xl">كيف نعمل</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                    قنوات رسمية للتقديم والدعم، وجولة قوانين موحّدة للجميع. نؤمن بالشفافية: تعرف اللاعب ما المتوقع قبل أن يخطو داخل المدينة.
                  </p>
                </div>
              </div>
            </motion.article>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-10"
          >
            <div className="mb-6 text-right">
              <h3 className="font-display text-xl font-bold md:text-2xl">
                ما الذي <span className="text-gradient-neon">يميّزنا</span>
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                ثلاثة محاور نبني عليها تجربة المدينة يوماً بعد يوم.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {pillars.map(({ icon: Icon, title, body }, i) => (
                <article
                  key={title}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-b from-card/80 to-card/40 p-5 text-right shadow-sm transition-shadow hover:border-primary/30 hover:shadow-[0_12px_40px_-20px_hsl(var(--primary)/0.2)] md:p-6",
                  )}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-primary/50 via-secondary/30 to-transparent" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 font-display text-base font-bold md:text-lg">{title}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">{body}</p>
                </article>
              ))}
            </div>
          </motion.div>

          {/* ——— تواصل عبر الديسكورد ——— */}
          <motion.section
            aria-labelledby="discord-heading"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mt-16 overflow-hidden rounded-3xl border border-[#5865F2]/40 bg-gradient-to-br from-[#5865F2]/[0.12] via-card/85 to-background p-8 shadow-[0_24px_64px_-28px_rgba(88,101,242,0.45)] md:mt-20 md:p-12"
          >
            <div className="pointer-events-none absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-[#5865F2]/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#5865F2] text-white shadow-[0_12px_40px_rgba(88,101,242,0.5)] md:h-24 md:w-24"
                aria-hidden
              >
                <DiscordIcon className="h-10 w-10 md:h-12 md:w-12" />
              </div>
              <h2 id="discord-heading" className="mt-8 font-display text-2xl font-bold md:text-3xl">
                تواصل معنا عبر <span className="text-[#aab3ff]">الديسكورد</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                السيرفر هو نقطة التقاء اللاعبين والإدارة: تقديم الطلبات، المقابلات، الدعم، والإعلانات. انضم للمجتمع الرسمي وابقَ على اطلاع
                بكل جديد.
              </p>
              <Button
                type="button"
                className="mt-8 h-12 gap-2 bg-[#5865F2] px-8 font-display text-base text-white shadow-lg shadow-[#5865F2]/30 hover:bg-[#4752C4]"
                asChild
              >
                <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
                  <DiscordIcon className="h-5 w-5 shrink-0" />
                  انضم إلى سيرفر الديسكورد
                </a>
              </Button>
              <p className="mt-6 max-w-md text-xs text-muted-foreground/90 md:text-sm">
                الفريق متواجد يومياً؛ وقت الرد قد يختلف حسب الضغط. للاستفسارات العاجلة استخدم القنوات المعتمدة داخل السيرفر بعد الانضمام.
              </p>
            </div>
          </motion.section>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-10 rounded-2xl border border-primary/20 bg-muted/25 p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8"
          >
            <div className="flex items-start gap-4 text-right">
              <Sparkles className="mt-1 h-8 w-8 shrink-0 text-primary" />
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
