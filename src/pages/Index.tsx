import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

const Index = () => {
  return (
    <div className="h-screen overflow-hidden bg-background text-foreground antialiased">
      <Navbar />
      <main className="h-full">
        <Hero />
      </main>
    </div>
  );
};

export default Index;
