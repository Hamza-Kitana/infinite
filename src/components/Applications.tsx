import { motion } from "framer-motion";
import { User, Shield, HeartPulse, ArrowLeft, Eye, Scale, Code2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const apps = [
  {
    icon: User,
    title: "مواطن",
    subtitle: "CITIZEN APPLICATION",
    description: "ابدأ حياتك الجديدة في Infinite City. اختر شخصيتك، خلفيتك، واصنع قصتك من الصفر.",
    accent: "hsl(var(--primary))",
    badge: "مفتوح",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    meta: "Roleplay Entry",
    applyPath: "/apply/citizen",
  },
  {
    icon: Shield,
    title: "شرطة",
    subtitle: "POLICE DEPARTMENT",
    description: "انضم لقوة الشرطة (LSPD). تدريب احترافي، رتب، صلاحيات، ومسؤولية حماية المدينة.",
    accent: "hsl(var(--secondary))",
    badge: "تقديم نشط",
    image:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1200&q=80",
    meta: "Tactical Unit",
    applyPath: "/apply/police",
  },
  {
    icon: HeartPulse,
    title: "إسعاف",
    subtitle: "EMERGENCY MEDICAL",
    description: "كن خط الإنقاذ الأول. انضم لطاقم EMS وأنقذ الأرواح في شوارع المدينة.",
    accent: "hsl(var(--accent))",
    badge: "تقديم نشط",
    image:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80",
    meta: "Emergency Team",
    applyPath: "/apply/ems",
  },
  {
    icon: Eye,
    title: "رقابة",
    subtitle: "OVERSIGHT DIVISION",
    description: "انضم لقسم الرقابة لمتابعة الجودة والانضباط ورفع مستوى الأداء في جميع الإدارات.",
    accent: "hsl(var(--primary-glow))",
    badge: "مطلوب",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    meta: "Audit & Review",
    applyPath: "/apply/oversight",
  },
  {
    icon: Scale,
    title: "وزارة العدل",
    subtitle: "MINISTRY OF JUSTICE",
    description: "كن جزءًا من المنظومة القانونية وصناعة القرارات القضائية وإدارة الإجراءات الرسمية.",
    accent: "hsl(var(--warning))",
    badge: "مفتوح",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    meta: "Legal Ministry",
    applyPath: "/apply/justice",
  },
  {
    icon: Code2,
    title: "مبرمج",
    subtitle: "DEVELOPER TEAM",
    description: "انضم لفريق التطوير لتحسين أنظمة السيرفر، البناء التقني، وحلول الأداء والأمان.",
    accent: "hsl(var(--accent))",
    badge: "تقني",
    image:
      "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80",
    meta: "Server Engineering",
    applyPath: "/apply/developer",
  },
  {
    icon: Briefcase,
    title: "المحاماة",
    subtitle: "LEGAL ADVOCACY",
    description: "تقديم الاستشارات القانونية وتمثيل القضايا داخل المدينة وفق الأنظمة المعتمدة.",
    accent: "hsl(var(--secondary))",
    badge: "مفتوح",
    image:
      "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80",
    meta: "Law Practice",
    applyPath: "/apply/lawyer",
  },
];

const Applications = () => {
  return (
    <section id="apply" dir="rtl" className="relative z-20 overflow-hidden bg-background pb-24 pt-10 md:pt-14">
      <div className="absolute inset-0 z-0 bg-background" />
      <motion.div className="pointer-events-none absolute -top-24 -right-24 z-0 h-[460px] w-[460px] rounded-full bg-primary blur-[110px]" />
      <motion.div className="pointer-events-none absolute -bottom-24 -left-24 z-0 h-[460px] w-[460px] rounded-full bg-secondary blur-[110px]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background via-background to-background" />

      <div className="relative z-10 w-full px-4 md:px-8 xl:px-12">
        <div className="grid gap-6 md:grid-cols-3">
          {apps.map((app, i) => (
            <motion.div
              key={app.title}
              initial={{ opacity: 0, y: 100, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.85, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -10 }}
              className="group relative rounded-2xl overflow-hidden border border-primary/25 bg-card/95 transition-all duration-500 hover:-translate-y-2 hover:border-primary/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={app.image}
                  alt={app.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] border font-display tracking-widest" style={{ color: app.accent, borderColor: `${app.accent}80`, background: "rgba(0,0,0,0.45)" }}>
                  {app.badge}
                </div>
                <div className="absolute bottom-3 left-3 text-[10px] tracking-[0.25em] text-foreground/80 font-display">
                  {app.meta}
                </div>
              </div>

              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-500"
                    style={{
                      background: `${app.accent}15`,
                      borderColor: `${app.accent}50`,
                      boxShadow: `0 0 30px ${app.accent}40`,
                    }}
                  >
                    <app.icon className="h-7 w-7" style={{ color: app.accent }} />
                  </div>
                </div>

                <div className="font-display text-[10px] tracking-[0.3em] text-muted-foreground">
                  {app.subtitle}
                </div>
                <h3 className="mt-2 font-display font-bold text-3xl text-foreground">{app.title}</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed min-h-[80px]">
                  {app.description}
                </p>

                <Button
                  asChild
                  variant="ghost"
                  className="mt-6 group/btn px-0 hover:bg-transparent font-display tracking-widest"
                  style={{ color: app.accent }}
                >
                  <Link to={app.applyPath}>
                    ابدأ التقديم
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover/btn:-translate-x-2 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="absolute top-3 left-3 h-4 w-4 border-t border-l opacity-50" style={{ borderColor: app.accent }} />
              <div className="absolute bottom-3 right-3 h-4 w-4 border-b border-r opacity-50" style={{ borderColor: app.accent }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Applications;
