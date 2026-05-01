import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GangHub from "@/components/GangHub";

const GangHubPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pt-20">
        <GangHub />
      </main>
      <Footer />
    </div>
  );
};

export default GangHubPage;
