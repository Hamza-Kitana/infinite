import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles } from "lucide-react";
import ReflectiveCard from "@/components/ReflectiveCard";
import { useStreamersContent } from "@/contexts/StreamersContentContext";

const StreamersPage = () => {
  const { items } = useStreamersContent();

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pb-20">
        <section className="relative h-[46vh] min-h-[300px] max-h-[520px] overflow-hidden">
          <img
            src="/INF-CONECT-LOGO.gif"
            alt="صورة تعبر عن صناع المحتوى"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/10 to-background/85" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/55 to-transparent backdrop-blur-sm" />
          <div className="absolute inset-x-0 -bottom-8 h-32 bg-gradient-to-t from-background/90 via-background/60 to-transparent backdrop-blur-sm" />
          <div className="absolute inset-x-0 bottom-8 flex justify-center px-4">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-center drop-shadow-[0_8px_24px_hsl(var(--background)/0.85)]">
              <span className="text-gradient-neon">صنّاع المحتوى</span>
            </h1>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10">
          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              بروفايلات <span className="text-gradient-neon">صنّاع المحتوى</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              لكل صانع محتوى بطاقة تعريفية مختصرة مع رابط البث المباشر الخاص فيه.
            </p>

            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((streamer) => (
                <ReflectiveCard
                  key={streamer.id}
                  name={streamer.name}
                  role={streamer.role}
                  bio={streamer.bio}
                  image={streamer.image}
                  streamUrl={streamer.streamUrl}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10">
          <div className="glass-panel rounded-xl p-6 md:p-8 flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-primary mt-1" />
            <p className="text-muted-foreground">
              قريبًا سيتم إضافة نموذج رسمي للتقديم كصانع محتوى مع متطلبات القبول والمزايا التفصيلية.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StreamersPage;
