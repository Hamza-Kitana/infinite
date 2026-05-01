import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Ambulance, HeartPulse, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const healthMinister = {
  name: "الوزير سيراف",
  title: "وزير الصحة",
  image: "https://images.unsplash.com/photo-1612276529731-4b21494e6d71?auto=format&fit=crop&w=500&q=80",
  bio: "المسؤول الأول عن ملف الإسعاف والصحة، يشرف على جودة الاستجابة الطبية وتطوير الكوادر.",
};

const emsTeam = [
  {
    name: "المسعف لايف لاين",
    rank: "رئيس طاقم إسعاف",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80",
    bio: "يقود خطط الاستجابة السريعة ويشرف على توزيع الفرق الميدانية وقت الطوارئ.",
  },
  {
    name: "المسعف ريسكيو",
    rank: "مسعف أول",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=500&q=80",
    bio: "متخصص بالحالات الحرجة والإنعاش، ويغطي البلاغات عالية الخطورة.",
  },
  {
    name: "المسعف ميدك",
    rank: "مسعف ميداني",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80",
    bio: "يدير العمليات الميدانية السريعة ويضمن نقل المصابين بأعلى كفاءة.",
  },
  {
    name: "المسعفة هيلث",
    rank: "أخصائية إسعاف",
    image: "https://images.unsplash.com/photo-1594824475544-3a0f8f1c0e58?auto=format&fit=crop&w=500&q=80",
    bio: "مختصة بفرز الحالات وتنسيق الرعاية الأولية قبل التحويل للمراكز الطبية.",
  },
];

const EmsPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pt-32 pb-20">
        <section className="w-full px-4 md:px-8 xl:px-12">
          <div className="glass-panel rounded-2xl p-8 md:p-12">
            <span className="font-display text-xs tracking-[0.35em] text-primary">EMS DIVISION</span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold">
              صفحة <span className="text-gradient-neon">المسعفين</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl">
              مركز شامل لطاقم الإسعاف: التدريب، البروتوكولات، الجداول، والاستجابة للحالات الحرجة.
            </p>
            <Button asChild className="mt-6 bg-gradient-neon text-primary-foreground font-display tracking-widest">
              <Link to="/apply/ems">التقديم لهذه المؤسسة</Link>
            </Button>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-8">
          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-primary/35">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
              <img
                src={healthMinister.image}
                alt={healthMinister.name}
                className="h-24 w-24 rounded-full object-cover border-2 border-primary/50"
                loading="lazy"
              />
              <div>
                <div className="text-xs text-primary tracking-[0.28em] font-display">LEADERSHIP</div>
                <h2 className="mt-1 text-3xl font-display font-bold">
                  {healthMinister.title} - {healthMinister.name}
                </h2>
                <p className="mt-2 text-muted-foreground max-w-3xl">{healthMinister.bio}</p>
              </div>
            </div>
          </div>
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

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10">
          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              طاقم <span className="text-gradient-neon">الإسعاف</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              بطاقات تعريفية تجريبية تشمل صورة كل مسعف مع الاسم والرتبة.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {emsTeam.map((member) => (
                <div
                  key={member.name}
                  className="group relative min-h-[260px] glass-panel rounded-2xl p-6 border border-primary/25 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_10px_32px_rgba(239,68,68,0.22)]"
                >
                  <img
                    src={member.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover blur-xl scale-125 opacity-30"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-background/90 via-background/80 to-background/95" />
                  <div className="absolute top-4 left-4 z-10 rounded-full border border-primary/40 bg-background/75 px-3 py-1 text-[10px] font-display tracking-[0.22em] text-primary">
                    EMS
                  </div>
                  <div className="relative z-10 flex items-start gap-4 mt-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary/40 transition-all duration-300 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(239,68,68,0.45)]"
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

export default EmsPage;
