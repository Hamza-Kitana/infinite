import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Applications from "@/components/Applications";

const ApplicationsPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pt-20">
        <Applications />
      </main>
      <Footer />
    </div>
  );
};

export default ApplicationsPage;
