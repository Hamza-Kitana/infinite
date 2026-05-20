import { motion } from "framer-motion";
import { Car, Swords, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const vipCars = [
  {
    name: "Obey 9F Custom",
    tier: "VIP GOLD",
    image: "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Comet SR",
    tier: "VIP PLATINUM",
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Buffalo STX",
    tier: "VIP ELITE",
    image: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=80",
  },
];

const gangs = [
  {
    name: "Shadow Cartel",
    type: "سيطرة مناطق",
    image: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Neon Vipers",
    type: "تهريب وتجارة",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Iron Wolves",
    type: "قوة ميدانية",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  },
];

const weapons = [
  {
    name: "Carbine MK2",
    classType: "Rifle",
    image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Compact SMG",
    classType: "SMG",
    image: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Heavy Pistol",
    classType: "Sidearm",
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=1200&q=80",
  },
];

const serviceCards = [
  {
    title: "رتب العصابات",
    desc: "أنظمة رتب عصابات مخصصة لكل قائد مع مسارات ترقية واضحة.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80",
    accent: "text-warning",
  },
  {
    title: "باقات VIP",
    desc: "باقات VIP بسيارات وتجهيزات خاصة تعطي تجربة أقوى داخل المدينة.",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80",
    accent: "text-primary",
  },
  {
    title: "توازن القوة",
    desc: "قوانين توازن لضبط القوة بين العصابات وتثبيت العدالة في اللعب.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    accent: "text-secondary",
  },
];

const GangHub = () => {
  return (
    <section id="gang-hub" dir="rtl" className="relative py-32 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background pointer-events-none" />
      <div className="absolute -top-20 -right-24 h-[420px] w-[420px] rounded-full bg-secondary/20 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-24 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[130px] pointer-events-none" />

      <div className="w-full px-4 md:px-8 xl:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <span className="font-display text-xs tracking-[0.35em] text-primary">// عالم العصابات و VIP</span>
          <h2 className="mt-4 font-display font-bold text-4xl md:text-6xl">
            فتح <span className="text-gradient-neon">عصابة</span> وباقات VIP
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            قسم خاص لمن يريد تأسيس عصابة، طلب سيارات VIP، وطلب تجهيزات متقدمة مع عرض المحتوى المتاح بالصور.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="bg-gradient-neon text-primary-foreground font-display tracking-widest">
              <Link to="/gangs#gang-apply">تقديم فتح عصابة</Link>
            </Button>
            <Button asChild variant="outline" className="border-primary/40 bg-primary/5">
              <Link to="/apply/vip">طلب باقة VIP</Link>
            </Button>
          </div>
        </motion.div>

        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-5 border border-primary/25">
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-primary" />
              <h3 className="font-display text-2xl font-bold">سيارات VIP</h3>
            </div>
            <div className="mt-5 space-y-4">
              {vipCars.map((car) => (
                <div key={car.name} className="group relative aspect-square rounded-xl border border-primary/20 overflow-hidden bg-card/80">
                  <img src={car.image} alt={car.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <div className="font-display text-xs text-primary tracking-[0.2em]">{car.tier}</div>
                    <div className="mt-1 text-foreground font-semibold">{car.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-primary/25">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-secondary" />
              <h3 className="font-display text-2xl font-bold">العصابات المتاحة</h3>
            </div>
            <div className="mt-5 space-y-4">
              {gangs.map((gang) => (
                <div key={gang.name} className="group relative aspect-square rounded-xl border border-primary/20 overflow-hidden bg-card/80">
                  <img src={gang.image} alt={gang.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <div className="font-display text-xs text-secondary tracking-[0.2em]">{gang.type}</div>
                    <div className="mt-1 text-foreground font-semibold">{gang.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-primary/25">
            <div className="flex items-center gap-3">
              <Swords className="h-5 w-5 text-accent" />
              <h3 className="font-display text-2xl font-bold">الأسلحة المتاحة</h3>
            </div>
            <div className="mt-5 space-y-4">
              {weapons.map((weapon) => (
                <div key={weapon.name} className="group relative aspect-square rounded-xl border border-primary/20 overflow-hidden bg-card/80">
                  <img src={weapon.image} alt={weapon.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <div className="font-display text-xs text-accent tracking-[0.2em]">{weapon.classType}</div>
                    <div className="mt-1 text-foreground font-semibold">{weapon.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {serviceCards.map((card) => (
            <div key={card.title} className="group relative aspect-square rounded-xl border border-primary/20 overflow-hidden bg-card/80">
              <img src={card.image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-4">
                <h4 className={`font-display text-xl font-bold ${card.accent}`}>{card.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GangHub;
