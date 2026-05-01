import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Swords } from "lucide-react";

const weapons = [
  {
    name: "Carbine MK2",
    classType: "Rifle",
    desc: "سلاح دقيق للعمليات المتقدمة مع ثبات عالٍ في الاشتباكات المتوسطة.",
    image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Compact SMG",
    classType: "SMG",
    desc: "سلاح خفيف سريع مناسب للمواجهات القريبة وحرب الشوارع.",
    image: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Heavy Pistol",
    classType: "Sidearm",
    desc: "مسدس قوي للاستخدام الشخصي والحالات التكتيكية السريعة.",
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=1200&q=80",
  },
];

const VipWeaponsPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pt-32 pb-20">
        <section className="w-full px-4 md:px-8 xl:px-12">
          <div className="glass-panel rounded-2xl p-8 md:p-12">
            <span className="font-display text-xs tracking-[0.35em] text-primary">VIP WEAPONS</span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold">
              صفحة <span className="text-gradient-neon">أسلحة VIP</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl">
              قائمة الأسلحة المتاحة ضمن باقات VIP الخاصة.
            </p>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10 grid md:grid-cols-3 gap-6">
          {weapons.map((weapon) => (
            <div key={weapon.name} className="group relative rounded-2xl border border-primary/25 overflow-hidden bg-card/90">
              <img src={weapon.image} alt={weapon.name} className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="relative z-10 p-5">
                <div className="inline-flex items-center gap-2 text-xs text-accent font-display tracking-[0.2em]">
                  <Swords className="h-4 w-4" />
                  {weapon.classType}
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold">{weapon.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{weapon.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VipWeaponsPage;
