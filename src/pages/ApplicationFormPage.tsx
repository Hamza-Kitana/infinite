import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ApplicationTarget = {
  title: string;
  subtitle: string;
  dashboardPath: string;
};

const targets: Record<string, ApplicationTarget> = {
  citizen: {
    title: "تقديم المواطن",
    subtitle: "املأ بياناتك الأساسية ثم أكمل رحلتك داخل المدينة.",
    dashboardPath: "/",
  },
  police: {
    title: "تقديم الشرطة",
    subtitle: "تسجيل بيانات المرشح للقطاع العسكري / الشرطة.",
    dashboardPath: "/police",
  },
  ems: {
    title: "تقديم الإسعاف",
    subtitle: "تسجيل بيانات مرشحي الطاقم الطبي والإسعافي.",
    dashboardPath: "/ems",
  },
  streamers: {
    title: "تقديم صناع المحتوى",
    subtitle: "أدخل معلومات البث ليتم تحويلك إلى لوحة صناع المحتوى.",
    dashboardPath: "/streamers",
  },
  oversight: {
    title: "تقديم الرقابة",
    subtitle: "تسجيل بيانات المرشح لقسم الرقابة والمتابعة.",
    dashboardPath: "/oversight",
  },
  justice: {
    title: "تقديم وزارة العدل",
    subtitle: "أدخل بياناتك للانضمام إلى وزارة العدل.",
    dashboardPath: "/justice",
  },
  developer: {
    title: "تقديم مبرمج",
    subtitle: "أدخل معلوماتك التقنية للانضمام لفريق البرمجة.",
    dashboardPath: "/developer",
  },
  lawyer: {
    title: "تقديم المحاماة",
    subtitle: "أدخل بياناتك القانونية للانضمام إلى فريق المحاماة.",
    dashboardPath: "/lawyer",
  },
  gang: {
    title: "تقديم فتح عصابة",
    subtitle: "سجل بياناتك وبيانات العصابة المقترحة للمراجعة.",
    dashboardPath: "/gangs",
  },
  vip: {
    title: "طلب باقة VIP",
    subtitle: "أدخل معلوماتك ونوع الباقة المطلوبة (سيارات/تجهيزات).",
    dashboardPath: "/vip-cars",
  },
};

const ApplicationFormPage = () => {
  const navigate = useNavigate();
  const { role = "" } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const target = useMemo<ApplicationTarget>(() => {
    return targets[role] ?? targets.citizen;
  }, [role]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    window.setTimeout(() => {
      navigate(target.dashboardPath);
    }, 550);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pt-32 pb-20">
        <section className="w-full px-4 md:px-8 xl:px-12">
          <div className="relative overflow-hidden rounded-2xl border border-primary/25 min-h-[320px] md:min-h-[360px]">
            <img
              src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80"
              alt="Application Banner"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/25" />
            <div className="absolute bottom-0 inset-x-0 h-[55%] backdrop-blur-md bg-background/30" />
            <div className="relative z-10 p-8 md:p-12">
              <span className="font-display text-xs tracking-[0.35em] text-primary">APPLICATION PORTAL</span>
              <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold">{target.title}</h1>
              <p className="mt-4 text-lg text-foreground/85 max-w-3xl">{target.subtitle}</p>
            </div>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-8">
          <form onSubmit={onSubmit} className="glass-panel rounded-2xl p-6 md:p-8 border border-primary/25">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="fullName" className="font-display tracking-wide text-xs text-primary">
                  الاسم الكامل
                </Label>
                <Input id="fullName" required placeholder="اكتب اسمك الكامل" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="discord" className="font-display tracking-wide text-xs text-primary">
                  ديسكورد
                </Label>
                <Input id="discord" required placeholder="username#0000" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="age" className="font-display tracking-wide text-xs text-primary">
                  العمر
                </Label>
                <Input id="age" required type="number" min={16} placeholder="18" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="country" className="font-display tracking-wide text-xs text-primary">
                  الدولة
                </Label>
                <Input id="country" required placeholder="مثال: الأردن" className="mt-2" />
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="experience" className="font-display tracking-wide text-xs text-primary">
                نبذة عن الخبرة
              </Label>
              <textarea
                id="experience"
                required
                rows={5}
                placeholder="اكتب نبذة مختصرة عن خبرتك ولماذا تريد الانضمام..."
                className="mt-2 w-full rounded-md border border-primary/25 bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="mt-6 flex items-center justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-neon text-primary-foreground font-display tracking-widest px-8"
              >
                {isSubmitting ? "جاري الإرسال..." : "Submit"}
              </Button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ApplicationFormPage;
