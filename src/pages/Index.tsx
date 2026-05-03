import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { HeroBackgroundVideoProvider } from "@/contexts/HeroBackgroundVideoContext";

const Index = () => {
  return (
    <HeroBackgroundVideoProvider>
      <div className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />
        <main>
          <Hero />
        </main>
      </div>
    </HeroBackgroundVideoProvider>
  );
};

export default Index;
