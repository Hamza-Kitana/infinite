import { Link } from "react-router-dom";
import { BookOpen, Building2, Car, ClipboardList, Sparkles, Swords, Users, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/** نظرة عامة — سوبر أدمِن فقط (المحررون يُوجَّهون إلى تحرير القوانين) */
const DashboardHomePage = () => {
  const { user, isSuperAdmin } = useAuth();

  if (!isSuperAdmin) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-card/95 via-background to-card/90 p-6 shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.35)] sm:p-8">
        <div className="pointer-events-none absolute -left-24 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative text-right">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-display text-[11px] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Super Admin
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold md:text-3xl">
            مرحباً، <span className="text-gradient-neon">{user?.username}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            أضف مستخدمين وحدد لهم الأدوار (قوانين، بث، عصابات، سيارات VIP، مدير طاقم لكل فرع مؤسسة، مراجعة تقديمات). التعديلات تظهر للزوّار مباشرةً حسب الصفحة.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/dashboard/users"
          className="group rounded-xl border border-primary/20 bg-card/50 p-6 text-right transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <Users className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-105" />
          <h2 className="font-display text-lg font-bold">المستخدمون والأدوار</h2>
          <p className="mt-2 text-sm text-muted-foreground">إنشاء حسابات، كلمة مرور، وتعيين الأدوار.</p>
        </Link>
        <Link
          to="/dashboard/laws"
          className="group rounded-xl border border-primary/20 bg-card/50 p-6 text-right transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <BookOpen className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-105" />
          <h2 className="font-display text-lg font-bold">تحرير القوانين</h2>
          <p className="mt-2 text-sm text-muted-foreground">الأقسام، الترتيب، البطاقات، وتبويب العقوبات.</p>
        </Link>
        <Link
          to="/dashboard/streamers"
          className="group rounded-xl border border-primary/20 bg-card/50 p-6 text-right transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <Video className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-105" />
          <h2 className="font-display text-lg font-bold">ستريمر منجر</h2>
          <p className="mt-2 text-sm text-muted-foreground">إدارة صنّاع المحتوى، الصور، والترتيب على صفحة البث.</p>
        </Link>
        <Link
          to="/dashboard/gangs"
          className="group rounded-xl border border-primary/20 bg-card/50 p-6 text-right transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <Swords className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-105" />
          <h2 className="font-display text-lg font-bold">مدير العصابات</h2>
          <p className="mt-2 text-sm text-muted-foreground">إضافة وتعديل وحذف العصابات وترتيبها كما في صفحة العصابات.</p>
        </Link>
        <Link
          to="/dashboard/vip-cars"
          className="group rounded-xl border border-primary/20 bg-card/50 p-6 text-right transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <Car className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-105" />
          <h2 className="font-display text-lg font-bold">مدير سيارات VIP</h2>
          <p className="mt-2 text-sm text-muted-foreground">إضافة وتعديل وحذف سيارات الكتالوج وترتيبها كما في صفحة الزوار.</p>
        </Link>
        <Link
          to="/dashboard/institution"
          className="group rounded-xl border border-primary/20 bg-card/50 p-6 text-right transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <Building2 className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-105" />
          <h2 className="font-display text-lg font-bold">طواقم المؤسسات</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            تحرير قائد ونائب وشبكة الأعضاء لكل فرع (صحة، أذرع الداخلية، رقابة، عدل، مبرمجين).
          </p>
        </Link>
        <Link
          to="/dashboard/applications"
          className="group rounded-xl border border-primary/20 bg-card/50 p-6 text-right transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <ClipboardList className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-105" />
          <h2 className="font-display text-lg font-bold">طلبات التقديم</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            طلبات نماذج /apply/* — قبول أو رفض وملاحظة؛ يشاركها كل من له دور مراجع التقديمات.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHomePage;
