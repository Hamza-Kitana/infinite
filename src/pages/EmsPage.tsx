import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstitutionHero from "@/components/InstitutionHero";
import { InstitutionRoster } from "@/components/InstitutionRoster";
import { emsRoster } from "@/data/institutionRosters";
import { Ambulance, HeartPulse, ShieldCheck } from "lucide-react";

const EmsPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />

      <InstitutionHero
        badgeEn="EMERGENCY MEDICAL SERVICES"
        alt="المسعفين — Infinite City"
        title={<span className="text-gradient-neon">المسعفين</span>}
      />

      <main className="pb-20">
        <section className="w-full px-4 md:px-8 xl:px-12 mt-10">
          <InstitutionRoster
            {...emsRoster}
            leaderBadge="وزير الصحة"
            deputyBadge="نائب وزير الصحة"
            leadershipIntro="وزير الصحة ونائبه، ثم طاقم الإسعاف في الشبكة أدناه."
            membersTitle="طاقم الإسعاف"
            membersSubtitle="حرك المؤشر داخل الشبكة لإبراز بطاقات الأعضاء بوضوح."
            chromaRadius={560}
          />
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10 grid md:grid-cols-3 gap-5">
          <div className="glass-panel rounded-xl p-6">
            <Ambulance className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display text-2xl">وحدات الاستجابة</h3>
            <p className="mt-2 text-muted-foreground">توزيع المسعفين والمركبات بحسب أولويات البلاغات.</p>
          </div>
          <div className="glass-panel rounded-xl p-6">
            <HeartPulse className="h-8 w-8 text-secondary" />
            <h3 className="mt-4 font-display text-2xl">بروتوكولات العلاج</h3>
            <p className="mt-2 text-muted-foreground">معايير واضحة للتعامل الطبي داخل المدينة.</p>
          </div>
          <div className="glass-panel rounded-xl p-6">
            <ShieldCheck className="h-8 w-8 text-accent" />
            <h3 className="mt-4 font-display text-2xl">تقارير المناوبات</h3>
            <p className="mt-2 text-muted-foreground">توثيق العمليات اليومية ومتابعة الأداء بشكل احترافي.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EmsPage;
