import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Car } from "lucide-react";

const vipCars = [
  {
    name: "Obey 9F Custom",
    tier: "VIP GOLD",
    desc: "سيارة رياضية متوازنة مناسبة للتنقل السريع داخل المدينة.",
    image: "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Comet SR",
    tier: "VIP PLATINUM",
    desc: "أداء أعلى وثبات قوي على المنعطفات مع حضور بصري مميز.",
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Buffalo STX",
    tier: "VIP ELITE",
    desc: "فخامة وقوة عالية للمهام الخاصة والمواكب الرسمية.",
    image: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=80",
  },
];

const VipCarsPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pt-32 pb-20">
        <section className="w-full px-4 md:px-8 xl:px-12">
          <div className="glass-panel rounded-2xl p-8 md:p-12">
            <span className="font-display text-xs tracking-[0.35em] text-primary">VIP CARS</span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold">
              صفحة <span className="text-gradient-neon">سيارات VIP</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl">
              السيارات الحصرية المتاحة ضمن باقات VIP داخل السيرفر.
            </p>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10 grid md:grid-cols-3 gap-6">
          {vipCars.map((car) => (
            <div key={car.name} className="group relative rounded-2xl border border-primary/25 overflow-hidden bg-card/90">
              <img src={car.image} alt={car.name} className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="relative z-10 p-5">
                <div className="inline-flex items-center gap-2 text-xs text-primary font-display tracking-[0.2em]">
                  <Car className="h-4 w-4" />
                  {car.tier}
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold">{car.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{car.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VipCarsPage;
