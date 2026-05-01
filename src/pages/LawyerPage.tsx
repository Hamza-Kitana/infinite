import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Briefcase, FileText, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const legalTeam = [
  {
    name: "المحامي جاستس",
    rank: "رئيس فريق المحاماة",
    image: "https://images.unsplash.com/photo-1555374018-13a8994ab246?auto=format&fit=crop&w=500&q=80",
    bio: "يشرف على استراتيجية القضايا الكبرى ويدير فريق الدفاع في الملفات الحساسة.",
  },
  {
    name: "المحامية فيرديكت",
    rank: "محامية أولى",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=500&q=80",
    bio: "متخصصة في الدعاوى الجنائية وتقديم المذكرات القانونية المحكمة.",
  },
  {
    name: "المحامي لو أند أوردر",
    rank: "محامي مرافعات",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80",
    bio: "يقود جلسات المرافعة ويقدم دفوعًا قانونية دقيقة وفق أنظمة المدينة.",
  },
  {
    name: "المحامية كاونسيل",
    rank: "مستشارة قانونية",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
    bio: "تتابع عقود الشركات والاستشارات وتساعد الأفراد في القضايا المدنية.",
  },
];

const LawyerPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pt-32 pb-20">
        <section className="w-full px-4 md:px-8 xl:px-12">
          <div className="glass-panel rounded-2xl p-8 md:p-12">
            <span className="font-display text-xs tracking-[0.35em] text-primary">LEGAL ADVOCACY</span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold">
              صفحة <span className="text-gradient-neon">المحاماة</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl">
              متابعة القضايا وتمثيل الموكلين وتقديم الاستشارات القانونية وفق أنظمة المدينة.
            </p>
            <Button asChild className="mt-6 bg-gradient-neon text-primary-foreground font-display tracking-widest">
              <Link to="/apply/lawyer">التقديم لهذه المؤسسة</Link>
            </Button>
          </div>
        </section>
        <section className="w-full px-4 md:px-8 xl:px-12 mt-10 grid md:grid-cols-3 gap-5">
          <div className="glass-panel rounded-xl p-6"><Briefcase className="h-8 w-8 text-primary" /><h3 className="mt-4 font-display text-2xl">تمثيل قانوني</h3></div>
          <div className="glass-panel rounded-xl p-6"><FileText className="h-8 w-8 text-secondary" /><h3 className="mt-4 font-display text-2xl">مذكرات</h3></div>
          <div className="glass-panel rounded-xl p-6"><Scale className="h-8 w-8 text-accent" /><h3 className="mt-4 font-display text-2xl">دفوع</h3></div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10">
          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              طاقم <span className="text-gradient-neon">المحاماة</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              بطاقات تعريفية موسعة مع صورة شخصية وصورة خلفية مغبشة ووصف لكل عضو.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {legalTeam.map((member) => (
                <div
                  key={member.name}
                  className="group relative min-h-[270px] glass-panel rounded-2xl p-6 border border-primary/25 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_10px_32px_rgba(180,83,9,0.24)]"
                >
                  <img
                    src={member.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover blur-xl scale-125 opacity-30"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-background/90 via-background/80 to-background/95" />
                  <div className="absolute top-4 left-4 z-10 rounded-full border border-primary/40 bg-background/70 px-3 py-1 text-[10px] font-display tracking-[0.22em] text-primary">
                    LAW
                  </div>
                  <div className="relative z-10 flex items-start gap-4 mt-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary/40 transition-all duration-300 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(180,83,9,0.45)]"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="font-display text-2xl font-bold transition-colors duration-300 group-hover:text-foreground">
                        {member.name}
                      </h3>
                      <p className="mt-1 text-primary font-display tracking-wide transition-all duration-300 group-hover:text-primary-glow">
                        {member.rank}
                      </p>
                    </div>
                  </div>
                  <p className="relative z-10 mt-4 text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LawyerPage;
