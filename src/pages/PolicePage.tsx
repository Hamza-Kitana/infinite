import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Siren, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const interiorMinister = {
  name: "الوزير فـالكون",
  title: "وزير الداخلية",
  image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=500&q=80",
  bio: "المسؤول الأول عن المنظومة الأمنية، يقود خطط التطوير والانضباط ويراقب الأداء العام للقطاع.",
};

const policeTeam = [
  {
    name: "الضابط نوفا",
    rank: "عميد",
    image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=500&q=80",
    bio: "يقود الاستراتيجية الأمنية العامة ويتابع جاهزية الفرق الخاصة والقيادات الميدانية.",
  },
  {
    name: "الضابط فانتوم",
    rank: "عقيد",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80",
    bio: "يشرف على غرفة العمليات المركزية وتوزيع الدوريات في أوقات الذروة.",
  },
  {
    name: "الضابط أطلس",
    rank: "مقدم",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
    bio: "مسؤول عن خطط الانتشار الميداني والتنسيق بين الوحدات التكتيكية.",
  },
  {
    name: "الضابط رادار",
    rank: "نقيب",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
    bio: "متخصص في متابعة البلاغات الساخنة وإدارة المطاردات عالية السرعة.",
  },
  {
    name: "الضابط فايبر",
    rank: "ملازم أول",
    image: "https://images.unsplash.com/photo-1542204625-de293a2f7b16?auto=format&fit=crop&w=500&q=80",
    bio: "يقود فرق الاستجابة السريعة ويعمل على رفع انضباط العناصر الجديدة.",
  },
  {
    name: "الضابط كوانتم",
    rank: "ملازم",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
    bio: "يدير الدوريات اليومية ويؤمن تغطية فعالة للمناطق الحيوية في المدينة.",
  },
];

const PolicePage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pt-32 pb-20">
        <section className="w-full px-4 md:px-8 xl:px-12">
          <div className="glass-panel rounded-2xl p-8 md:p-12">
            <span className="font-display text-xs tracking-[0.35em] text-primary">POLICE DEPARTMENT</span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold">
              صفحة <span className="text-gradient-neon">الشرطة</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl">
              واجهة موحدة لعمليات LSPD تشمل الخطط الميدانية، التسلسل الإداري، وإدارة الدوريات.
            </p>
            <Button asChild className="mt-6 bg-gradient-neon text-primary-foreground font-display tracking-widest">
              <Link to="/apply/police">التقديم لهذه المؤسسة</Link>
            </Button>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-8">
          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-primary/35">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
              <img
                src={interiorMinister.image}
                alt={interiorMinister.name}
                className="h-24 w-24 rounded-full object-cover border-2 border-primary/50"
                loading="lazy"
              />
              <div>
                <div className="text-xs text-primary tracking-[0.28em] font-display">LEADERSHIP</div>
                <h2 className="mt-1 text-3xl font-display font-bold">
                  {interiorMinister.title} - {interiorMinister.name}
                </h2>
                <p className="mt-2 text-muted-foreground max-w-3xl">{interiorMinister.bio}</p>
              </div>
            </div>
          </div>
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

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10">
          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              طاقم <span className="text-gradient-neon">الشرطة</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              بطاقات تعريفية تجريبية (وهمية) للأفراد تشمل الصورة والاسم والرتبة.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {policeTeam.map((member) => (
                <div
                  key={member.name}
                  className="group relative min-h-[270px] glass-panel rounded-2xl p-6 border border-primary/25 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_10px_32px_rgba(34,211,238,0.24)]"
                >
                  <img
                    src={member.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover blur-xl scale-125 opacity-30"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-background/90 via-background/80 to-background/95" />
                  <div className="absolute top-4 left-4 z-10 rounded-full border border-primary/40 bg-background/70 px-3 py-1 text-[10px] font-display tracking-[0.22em] text-primary">
                    LSPD
                  </div>
                  <div className="relative z-10 flex items-start gap-4 mt-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary/40 transition-all duration-300 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(34,211,238,0.45)]"
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

export default PolicePage;
