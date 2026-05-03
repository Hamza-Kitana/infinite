import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstitutionHero from "@/components/InstitutionHero";
import { InstitutionRoster } from "@/components/InstitutionRoster";
import { lawyerRoster } from "@/data/institutionRosters";
import { Briefcase, FileText, Scale } from "lucide-react";

const LawyerPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <InstitutionHero
        badgeEn="LEGAL ADVOCACY"
        alt="المحاماة — Infinite City"
        title={
          <>
            صفحة <span className="text-gradient-neon">المحاماة</span>
          </>
        }
      />
      <main className="pb-20">
        <section className="w-full px-4 md:px-8 xl:px-12 mt-10">
          <InstitutionRoster
            {...lawyerRoster}
            membersTitle="أعضاء المحاماة"
            membersSubtitle="محامون ومحاميات يمثلون الموكلين مع تمييز بصري للشبكة."
            chromaRadius={560}
          />
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10 grid md:grid-cols-3 gap-5">
          <div className="glass-panel rounded-xl p-6"><Briefcase className="h-8 w-8 text-primary" /><h3 className="mt-4 font-display text-2xl">تمثيل قانوني</h3></div>
          <div className="glass-panel rounded-xl p-6"><FileText className="h-8 w-8 text-secondary" /><h3 className="mt-4 font-display text-2xl">مذكرات</h3></div>
          <div className="glass-panel rounded-xl p-6"><Scale className="h-8 w-8 text-accent" /><h3 className="mt-4 font-display text-2xl">دفوع</h3></div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LawyerPage;
