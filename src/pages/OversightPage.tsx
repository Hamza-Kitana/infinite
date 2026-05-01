import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, FileCheck2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const OversightPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pt-32 pb-20">
        <section className="w-full px-4 md:px-8 xl:px-12">
          <div className="glass-panel rounded-2xl p-8 md:p-12">
            <span className="font-display text-xs tracking-[0.35em] text-primary">OVERSIGHT</span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold">
              صفحة <span className="text-gradient-neon">الرقابة</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl">
              قسم الرقابة مسؤول عن الجودة والانضباط ومتابعة سير العمل داخل الفصائل المختلفة.
            </p>
            <Button asChild className="mt-6 bg-gradient-neon text-primary-foreground font-display tracking-widest">
              <Link to="/apply/oversight">التقديم لهذه المؤسسة</Link>
            </Button>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10 grid md:grid-cols-3 gap-5">
          <div className="glass-panel rounded-xl p-6">
            <Eye className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display text-2xl">مراقبة الأداء</h3>
            <p className="mt-2 text-muted-foreground">متابعة مؤشرات الأداء والتأكد من الالتزام بالمعايير.</p>
          </div>
          <div className="glass-panel rounded-xl p-6">
            <FileCheck2 className="h-8 w-8 text-secondary" />
            <h3 className="mt-4 font-display text-2xl">تدقيق التقارير</h3>
            <p className="mt-2 text-muted-foreground">مراجعة التقارير اليومية والتأكد من صحة الإجراءات.</p>
          </div>
          <div className="glass-panel rounded-xl p-6">
            <Scale className="h-8 w-8 text-accent" />
            <h3 className="mt-4 font-display text-2xl">سياسات عادلة</h3>
            <p className="mt-2 text-muted-foreground">تطبيق المساءلة والعدالة على الجميع بنفس المعايير.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OversightPage;
