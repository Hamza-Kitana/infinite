import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users } from "lucide-react";

const gangs = [
  {
    name: "Shadow Cartel",
    type: "سيطرة مناطق",
    desc: "عصابة تركز على السيطرة الجغرافية والعمليات المنظمة داخل الأحياء الحساسة.",
    image: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Neon Vipers",
    type: "تهريب وتجارة",
    desc: "شبكة تهريب ذكية تعتمد على الحركة السريعة والتخطيط طويل المدى.",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Iron Wolves",
    type: "قوة ميدانية",
    desc: "قوة هجومية ميدانية متخصصة في المواجهات والسيطرة على النقاط الساخنة.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  },
];

const GangsPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pt-32 pb-20">
        <section className="w-full px-4 md:px-8 xl:px-12">
          <div className="glass-panel rounded-2xl p-8 md:p-12">
            <span className="font-display text-xs tracking-[0.35em] text-primary">GANG SYSTEM</span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold">
              صفحة <span className="text-gradient-neon">العصابات</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl">
              عرض العصابات المتاحة والهوية القتالية لكل فصيل داخل السيرفر.
            </p>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10 grid md:grid-cols-3 gap-6">
          {gangs.map((gang) => (
            <div key={gang.name} className="group relative rounded-2xl border border-primary/25 overflow-hidden bg-card/90">
              <img src={gang.image} alt={gang.name} className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="relative z-10 p-5">
                <div className="inline-flex items-center gap-2 text-xs text-primary font-display tracking-[0.2em]">
                  <Users className="h-4 w-4" />
                  {gang.type}
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold">{gang.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{gang.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GangsPage;
