import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { HeroBackgroundVideoProvider } from "@/contexts/HeroBackgroundVideoContext";

const Index = () => {
  return (
    <HeroBackgroundVideoProvider>
      <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-background text-foreground antialiased">
        <Navbar />
        <main className="min-h-0 flex-1 overflow-hidden">
          <Hero />
        </main>
      </div>
    </HeroBackgroundVideoProvider>
  );
};

export default Index;
