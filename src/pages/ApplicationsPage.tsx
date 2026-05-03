import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Applications from "@/components/Applications";

const ApplicationsPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />

      {/* Hero — نفس أسلوب صنّاع المحتوى والقوانين */}
      <section className="relative h-[46vh] min-h-[300px] max-h-[520px] overflow-hidden">
        <img
          src="/INF-CONECT-LOGO.gif"
          alt="قدم الآن — Infinite City"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/10 to-background/85" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/55 to-transparent backdrop-blur-sm" />
        <div className="absolute inset-x-0 -bottom-8 h-32 bg-gradient-to-t from-background/90 via-background/60 to-transparent backdrop-blur-sm" />
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center gap-2 px-4 text-center sm:bottom-3 md:bottom-4">
          <p className="font-display text-xs tracking-[0.35em] text-primary/95 drop-shadow-[0_4px_18px_hsl(var(--background)/0.95)]">
            CITY APPLICATIONS
          </p>
          <h1 className="font-display text-4xl font-bold md:text-6xl drop-shadow-[0_8px_24px_hsl(var(--background)/0.85)]">
            <span className="text-gradient-neon">قدم</span>{" "}
            <span className="text-foreground">الآن</span>
          </h1>
        </div>
      </section>

      <main>
        <Applications />
      </main>
      <Footer />
    </div>
  );
};

export default ApplicationsPage;
