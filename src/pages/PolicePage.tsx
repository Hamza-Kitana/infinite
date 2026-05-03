import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstitutionHero from "@/components/InstitutionHero";
import { InstitutionRoster } from "@/components/InstitutionRoster";
import { policeRoster } from "@/data/institutionRosters";
import { Shield, Siren, Users } from "lucide-react";

const PolicePage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <InstitutionHero
        badgeEn="POLICE DEPARTMENT"
        alt="الشرطة — Infinite City"
        title={
          <>
            صفحة <span className="text-gradient-neon">الشرطة</span>
          </>
        }
      />
      <main className="pb-20">
        <section className="w-full px-4 md:px-8 xl:px-12 mt-10">
          <InstitutionRoster
            {...policeRoster}
            leaderBadge="وزير الداخلية"
            deputyBadge="نائب وزير الداخلية"
            leadershipIntro="وزير الداخلية ونائبه، ثم ضباط وأعضاء الشرطة في الشبكة أدناه."
            membersTitle="ضباط وأعضاء الشرطة"
            membersSubtitle="شبكة تفاعلية — مرّر المؤشر لإظهار التفاصيل بوضوح."
            chromaRadius={560}
          />
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10 grid md:grid-cols-3 gap-5">
          <div className="glass-panel rounded-xl p-6">
            <Siren className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display text-2xl">غرفة العمليات</h3>
            <p className="mt-2 text-muted-foreground">تنسيق البلاغات والمطاردات مع توزيع وحدات الاستجابة.</p>
          </div>
          <div className="glass-panel rounded-xl p-6">
            <Shield className="h-8 w-8 text-secondary" />
            <h3 className="mt-4 font-display text-2xl">الأنظمة والانضباط</h3>
            <p className="mt-2 text-muted-foreground">قوانين السلوك، المخالفات، وإجراءات المساءلة الداخلية.</p>
          </div>
          <div className="glass-panel rounded-xl p-6">
            <Users className="h-8 w-8 text-accent" />
            <h3 className="mt-4 font-display text-2xl">الرتب والتدريب</h3>
            <p className="mt-2 text-muted-foreground">مسار واضح للترقيات وبرامج تدريب للضباط الجدد.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PolicePage;
