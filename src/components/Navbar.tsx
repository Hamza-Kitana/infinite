import { type FormEvent, useEffect, useState } from "react";
import { Menu, X, Lock, ChevronDown, Volume2, VolumeX, LayoutDashboard, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOptionalHeroBackgroundVideo } from "@/contexts/HeroBackgroundVideoContext";
import { getPostLoginDashboardPath, useAuth } from "@/contexts/AuthContext";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { useSiteVisibility } from "@/lib/siteVisibility";

const institutionLinks = [
  { label: "وزارة الصحة", to: "/health" },
  { label: "وزارة الداخلية", to: "/interior" },
  { label: "الرقابة", to: "/oversight" },
  { label: "وزارة العدل", to: "/justice" },
  { label: "المبرمجين", to: "/developer" },
];

function institutionLinkActive(pathname: string, to: string) {
  if (to === "/interior") return pathname === "/interior" || pathname.startsWith("/interior/");
  return pathname === to;
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, canUseDashboard } = useAuth();
  const publicUser = usePublicUser();
  const [staffUser, setStaffUser] = useState("");
  const [staffPass, setStaffPass] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [institutionsOpen, setInstitutionsOpen] = useState(false);
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [publicUsername, setPublicUsername] = useState("");
  const [publicPassword, setPublicPassword] = useState("");
  const [publicRealName, setPublicRealName] = useState("");
  const [publicFullName, setPublicFullName] = useState("");
  const [publicEmail, setPublicEmail] = useState("");
  const [publicDiscordId, setPublicDiscordId] = useState("");
  const [publicAge, setPublicAge] = useState("");
  const [publicPasswordConfirm, setPublicPasswordConfirm] = useState("");
  const heroBgVideo = useOptionalHeroBackgroundVideo();
  const visibility = useSiteVisibility();
  const canShowInterior =
    visibility.institutions.interior_police ||
    visibility.institutions.interior_sheriff ||
    visibility.institutions.interior_cia ||
    visibility.institutions.interior_marines;
  const visibleInstitutionLinks = institutionLinks.filter((item) => {
    if (item.to === "/health") return visibility.institutions.health;
    if (item.to === "/interior") return canShowInterior;
    if (item.to === "/oversight") return visibility.institutions.oversight;
    if (item.to === "/justice") return visibility.institutions.justice_lawyers;
    if (item.to === "/developer") return visibility.institutions.developer;
    return true;
  });
  const hideApplyNowForPublicProfile = !!publicUser.user && (location.pathname === "/profile" || location.pathname === "/tickets");
  const useLightBrandText = location.pathname === "/profile" || location.pathname === "/tickets";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setInstitutionsOpen(false);
    setOpen(false);
    setPublicMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        dir="rtl"
        className={`fixed inset-x-0 top-0 z-[100] pt-[env(safe-area-inset-top,0px)] transition-all duration-500 ${
          scrolled
            ? "border-b border-primary/20 bg-background/70 py-2 backdrop-blur-xl"
            : "bg-transparent py-3 sm:py-4"
        }`}
      >
        {/* z أعلى من شريط الصوت (z-110) حتى دروبداون المؤسسات والروابط تُنقَط فوقه */}
        <div className="relative z-[120] flex w-full min-w-0 items-center justify-between gap-2 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] sm:gap-4 md:px-8 xl:px-12">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link to="/" className="group inline-block shrink-0 leading-none" aria-label="العودة للرئيسية">
              <img
                src="/INF_LOGO.png"
                alt="Infinite City Logo"
                className="h-9 w-9 object-contain drop-shadow-[0_0_22px_hsl(var(--primary)/0.95)] sm:h-10 sm:w-10"
                loading="eager"
              />
            </Link>
            <div className="min-w-0 leading-tight">
              <div
                className={`truncate font-latin-display text-sm font-bold tracking-widest sm:text-base ${
                  useLightBrandText ? "text-slate-900" : "text-white"
                }`}
              >
                INFINITE
              </div>
              <div className="-mt-1 font-latin-display text-[9px] tracking-[0.28em] text-primary sm:text-[10px] sm:tracking-[0.3em]">
                C I T Y
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className={`relative font-body font-medium text-sm transition-colors after:absolute after:bottom-[-6px] after:right-0 after:h-px after:bg-primary after:transition-all ${
                location.pathname === "/"
                  ? "text-primary after:w-full"
                  : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full"
              }`}
            >
              الرئيسية
            </Link>
            {visibility.pages.laws ? (
              <Link
                to="/laws"
                className={`relative font-body font-medium text-sm transition-colors after:absolute after:bottom-[-6px] after:right-0 after:h-px after:bg-primary after:transition-all ${
                  location.pathname === "/laws"
                    ? "text-primary after:w-full"
                    : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full"
                }`}
              >
                القوانين
              </Link>
            ) : null}
            {visibility.pages.streamers ? (
              <Link
                to="/streamers"
                className={`relative font-body font-medium text-sm transition-colors after:absolute after:bottom-[-6px] after:right-0 after:h-px after:bg-primary after:transition-all ${
                  location.pathname === "/streamers"
                    ? "text-primary after:w-full"
                    : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full"
                }`}
              >
                صنّاع المحتوى
              </Link>
            ) : null}
            {visibility.pages.gangs ? (
              <Link
                to="/gangs"
                className={`relative font-body font-medium text-sm transition-colors after:absolute after:bottom-[-6px] after:right-0 after:h-px after:bg-primary after:transition-all ${
                  location.pathname === "/gangs"
                    ? "text-primary after:w-full"
                    : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full"
                }`}
              >
                العصابات
              </Link>
            ) : null}
            {visibility.pages.vipCars ? (
              <Link
                to="/vip-cars"
                className={`relative font-body font-medium text-sm transition-colors after:absolute after:bottom-[-6px] after:right-0 after:h-px after:bg-primary after:transition-all ${
                  location.pathname === "/vip-cars"
                    ? "text-primary after:w-full"
                    : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full"
                }`}
              >
                سيارات VIP
              </Link>
            ) : null}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setInstitutionsOpen((prev) => !prev);
                }}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body"
              >
                المؤسسات
                <ChevronDown className={`h-4 w-4 transition-transform ${institutionsOpen ? "rotate-180" : ""}`} />
              </button>

              {institutionsOpen && (
                <div className="absolute top-full z-[130] mt-3 right-0 w-64 rounded-xl border border-primary/30 bg-background/95 backdrop-blur-xl p-2 shadow-xl">
                  {visibleInstitutionLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        institutionLinkActive(location.pathname, item.to)
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/contact"
              className={`relative font-body font-medium text-sm transition-colors after:absolute after:bottom-[-6px] after:right-0 after:h-px after:bg-primary after:transition-all ${
                location.pathname === "/contact"
                  ? "text-primary after:w-full"
                  : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full"
              }`}
            >
              من نحن
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {publicUser.user ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setPublicMenuOpen((v) => !v)}
                  className="inline-flex items-center rounded-xl border border-violet-300 bg-white px-3 py-2 text-sm text-violet-700 transition-colors hover:bg-violet-50"
                >
                  <UserCircle2 className="h-4 w-4 ml-2" />
                  {publicUser.user.displayName}
                  <ChevronDown className={`me-2 h-4 w-4 transition-transform ${publicMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {publicMenuOpen ? (
                  <div className="absolute left-0 z-[130] mt-2 w-48 overflow-hidden rounded-xl border border-violet-200 bg-white shadow-xl">
                    <Link
                      to="/tickets"
                      className="block px-3 py-2 text-right text-sm text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-800"
                      onClick={() => setPublicMenuOpen(false)}
                    >
                      التكت
                    </Link>
                    <Link
                      to="/profile"
                      className="block border-t border-violet-100 px-3 py-2 text-right text-sm text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-800"
                      onClick={() => setPublicMenuOpen(false)}
                    >
                      البروفايل
                    </Link>
                    <button
                      type="button"
                      className="block w-full border-t border-violet-100 px-3 py-2 text-right text-sm text-rose-700 transition-colors hover:bg-rose-50"
                      onClick={() => {
                        publicUser.logout();
                        setPublicMenuOpen(false);
                      }}
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            {!hideApplyNowForPublicProfile ? (
              <Button
                asChild
                className="hidden md:inline-flex bg-gradient-neon text-primary-foreground font-display tracking-widest hover:shadow-glow-primary transition-all duration-500"
              >
                <Link to="/apply/citizen">قدّم الآن</Link>
              </Button>
            ) : null}
            {canUseDashboard ? (
              <Button
                asChild
                variant="outline"
                className="hidden sm:inline-flex border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary font-display tracking-wider"
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4 ml-2" />
                  لوحة التحكم
                </Link>
              </Button>
            ) : publicUser.user ? null : (
              <Button
                onClick={() => setLoginOpen(true)}
                variant="outline"
                className="hidden sm:inline-flex border-primary/40 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary hover:shadow-glow-primary font-display tracking-wider"
              >
                <Lock className="h-4 w-4 ml-2" />
                تسجيل دخول
              </Button>
            )}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg p-2 text-foreground touch-manipulation active:bg-primary/10 lg:hidden"
              aria-label="القائمة"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {heroBgVideo && location.pathname === "/" ? (
          <div className="pointer-events-none absolute inset-x-0 top-full z-[110] bg-transparent py-1.5 sm:py-2">
            <div className="pointer-events-auto flex w-full min-w-0 items-center pl-[max(0.75rem,env(safe-area-inset-left,0px))] md:pl-8 xl:pl-12">
              <div className="ms-auto mr-[max(0.75rem,env(safe-area-inset-right,0px))] flex max-w-[min(100%-1rem,17rem)] shrink-0 items-center gap-2 rounded-xl border-0 bg-transparent px-2 py-2 shadow-none ring-0 sm:mr-4 md:mr-5">
                <button
                  type="button"
                  onClick={heroBgVideo.handleMuteToggle}
                  className="inline-flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-lg border-0 bg-transparent text-primary transition-colors hover:bg-primary/10 sm:h-8 sm:w-8"
                  aria-label={heroBgVideo.muted ? "إلغاء كتم الصوت" : "كتم الصوت"}
                >
                  {heroBgVideo.muted || heroBgVideo.volume === 0 ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 font-latin-display text-[9px] uppercase tracking-[0.2em] text-primary/85">Volume</div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={heroBgVideo.volume}
                    onChange={(e) => heroBgVideo.handleVolumeChange(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer accent-primary"
                    aria-label="مستوى صوت الفيديو"
                  />
                </div>
                <span className="shrink-0 font-latin-display text-[10px] tabular-nums text-primary">{heroBgVideo.volume}%</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Mobile */}
        {open && (
          <div className="glass-panel relative z-[125] mx-4 mt-2 max-h-[min(72vh,calc(100dvh-8rem))] overflow-y-auto overscroll-contain rounded-xl p-4 animate-fade-in lg:hidden">
            <nav className="flex flex-col gap-0.5 sm:gap-1">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="touch-manipulation rounded-lg py-3 text-foreground transition-colors active:bg-primary/10 hover:text-primary"
              >
                الرئيسية
              </Link>
              {visibility.pages.laws ? (
                <Link
                  to="/laws"
                  onClick={() => setOpen(false)}
                  className="touch-manipulation rounded-lg py-3 text-foreground transition-colors active:bg-primary/10 hover:text-primary"
                >
                  القوانين
                </Link>
              ) : null}
              {visibility.pages.streamers ? (
                <Link
                  to="/streamers"
                  onClick={() => setOpen(false)}
                  className="touch-manipulation rounded-lg py-3 text-foreground transition-colors active:bg-primary/10 hover:text-primary"
                >
                  صنّاع المحتوى
                </Link>
              ) : null}
              {visibility.pages.gangs ? (
                <Link
                  to="/gangs"
                  onClick={() => setOpen(false)}
                  className="touch-manipulation rounded-lg py-3 text-foreground transition-colors active:bg-primary/10 hover:text-primary"
                >
                  العصابات
                </Link>
              ) : null}
              {visibility.pages.vipCars ? (
                <Link
                  to="/vip-cars"
                  onClick={() => setOpen(false)}
                  className="touch-manipulation rounded-lg py-3 text-foreground transition-colors active:bg-primary/10 hover:text-primary"
                >
                  سيارات VIP
                </Link>
              ) : null}
              <div className="pt-2 pb-1 text-xs tracking-[0.2em] text-primary font-display">المؤسسات</div>
              {visibleInstitutionLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="touch-manipulation rounded-lg py-3 text-foreground transition-colors active:bg-primary/10 hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="touch-manipulation rounded-lg py-3 text-foreground transition-colors active:bg-primary/10 hover:text-primary"
              >
                من نحن
              </Link>
              {!hideApplyNowForPublicProfile ? (
                <Button asChild className="w-full touch-manipulation bg-gradient-neon text-primary-foreground">
                  <Link to="/apply/citizen" onClick={() => setOpen(false)}>
                    قدّم الآن
                  </Link>
                </Button>
              ) : null}
              {publicUser.user ? (
                <>
                  <Button asChild className="w-full touch-manipulation bg-violet-600 text-white hover:bg-violet-700">
                    <Link to="/profile" onClick={() => setOpen(false)}>
                      <UserCircle2 className="h-4 w-4 ml-2" /> حسابي
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full touch-manipulation border-violet-300 bg-white text-violet-700 hover:bg-violet-50"
                    onClick={() => {
                      publicUser.logout();
                      setOpen(false);
                    }}
                  >
                    تسجيل خروج المستخدم
                  </Button>
                </>
              ) : null}
              {canUseDashboard ? (
                <Button asChild className="w-full touch-manipulation bg-primary text-primary-foreground hover:bg-primary-glow">
                  <Link to="/dashboard" onClick={() => setOpen(false)}>
                    <LayoutDashboard className="h-4 w-4 ml-2" /> لوحة التحكم
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setLoginOpen(true);
                  }}
                  className="w-full touch-manipulation bg-primary text-primary-foreground hover:bg-primary-glow"
                >
                  <Lock className="h-4 w-4 ml-2" /> تسجيل دخول
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent
          dir="rtl"
          className={`max-h-[90dvh] gap-0 overflow-y-auto rounded-3xl border border-violet-300/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(248,241,252,0.97)_100%)] p-0 text-slate-900 shadow-[0_30px_80px_-24px_rgba(54,22,79,0.45)] backdrop-blur-xl ${
            isRegisterMode ? "sm:max-w-[700px]" : "sm:max-w-[560px]"
          }`}
        >
          <div className="relative bg-[radial-gradient(ellipse_120%_100%_at_50%_-20%,rgba(54,22,79,0.18),transparent_58%)] px-6 pb-2 pt-12 text-center sm:px-8 sm:pt-14">
            <img
              src="/INF_LOGO.png"
              alt="Infinite City"
              className="mx-auto h-[4.25rem] w-[4.25rem] object-contain drop-shadow-[0_0_24px_rgba(54,22,79,0.35)]"
              loading="eager"
            />
            <p className="mt-3 font-latin-display text-[10px] font-semibold tracking-[0.38em] text-primary/90 sm:text-[11px] sm:tracking-[0.42em]">
              INFINITE CITY
            </p>
            <DialogHeader className="mt-5 space-y-2 text-center sm:text-center">
              <DialogTitle className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
                {isRegisterMode ? "إنشاء حساب مستخدم" : "تسجيل الدخول"}
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-[19rem] text-pretty text-sm leading-relaxed text-slate-600">
                {isRegisterMode
                  ? "حساب عادي لفتح التكتات والتواصل مع الإدارة."
                  : "استخدم نفس النموذج: حساب الموظف يفتح لوحة التحكم، والحساب العادي يفتح البروفايل."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="h-px bg-gradient-to-l from-transparent via-violet-200 to-transparent" aria-hidden />

          <form
            noValidate
            className="space-y-4 px-6 py-6 sm:px-9 sm:py-7"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              if (isRegisterMode) {
                if (publicPassword !== publicPasswordConfirm) {
                  toast.error("تأكيد كلمة السر غير مطابق");
                  return;
                }
                const ageNum = Number(publicAge);
                const result = publicUser.register({
                  realName: publicRealName,
                  fullName: publicFullName,
                  username: publicUsername,
                  email: publicEmail,
                  discordId: publicDiscordId,
                  age: ageNum,
                  password: publicPassword,
                });
                if (!result.ok) {
                  toast.error(result.reason);
                  return;
                }
                toast.success("تم إنشاء الحساب وتسجيل الدخول");
                setLoginOpen(false);
                setPublicUsername("");
                setPublicPassword("");
                setPublicPasswordConfirm("");
                setPublicRealName("");
                setPublicFullName("");
                setPublicEmail("");
                setPublicDiscordId("");
                setPublicAge("");
                setIsRegisterMode(false);
                navigate("/profile");
                return;
              }

              try {
                const session = login(staffUser, staffPass);
                if (session) {
                  toast.success("تم الدخول كموظف");
                  setLoginOpen(false);
                  setStaffUser("");
                  setStaffPass("");
                  setPublicUsername("");
                  setPublicPassword("");
                  setPublicPasswordConfirm("");
                  navigate(getPostLoginDashboardPath(session.roles));
                  return;
                }
                const publicLogin = publicUser.login({ username: publicUsername || staffUser, password: publicPassword || staffPass });
                if (publicLogin.ok) {
                  toast.success("تم الدخول بحسابك الشخصي");
                  setLoginOpen(false);
                  setStaffUser("");
                  setStaffPass("");
                  setPublicUsername("");
                  setPublicPassword("");
                  setPublicPasswordConfirm("");
                  navigate("/profile");
                  return;
                }
                toast.error("اسم المستخدم أو كلمة المرور غير صحيحة");
              } catch (err) {
                if (err instanceof Error && err.message === "IC_SESSION_STORAGE") {
                  toast.error("تعذر حفظ جلسة الموظف في المتصفح.");
                } else {
                  toast.error("حدث خطأ أثناء الدخول");
                  console.error(err);
                }
              }
            }}
          >
            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-xl border border-violet-200/90 bg-white/85 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  !isRegisterMode ? "bg-[#36164f] text-white shadow-sm" : "text-violet-800 hover:bg-violet-50"
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isRegisterMode ? "bg-[#36164f] text-white shadow-sm" : "text-violet-800 hover:bg-violet-50"
                }`}
              >
                إنشاء حساب
              </button>
            </div>

            {isRegisterMode ? (
              <div className="grid gap-3.5">
                <div className="space-y-1.5 text-right">
                  <Label htmlFor="public-real-name" className="text-xs font-medium text-slate-700">
                    الاسم الحقيقي
                  </Label>
                  <Input
                    id="public-real-name"
                    value={publicRealName}
                    onChange={(ev) => setPublicRealName(ev.target.value)}
                    placeholder="مثال: محمد خالد"
                    className="h-11 rounded-xl border-violet-200 bg-white text-right text-slate-900 shadow-sm transition-colors focus-visible:border-violet-400 focus-visible:ring-violet-200"
                  />
                </div>
                <div className="space-y-1.5 text-right">
                  <Label htmlFor="public-full-name" className="text-xs font-medium text-slate-700">
                    الاسم داخل المدينة
                  </Label>
                  <Input
                    id="public-full-name"
                    value={publicFullName}
                    onChange={(ev) => setPublicFullName(ev.target.value)}
                    placeholder="مثال: أبو سالم"
                    className="h-11 rounded-xl border-violet-200 bg-white text-right text-slate-900 shadow-sm transition-colors focus-visible:border-violet-400 focus-visible:ring-violet-200"
                  />
                </div>
                <div className="space-y-1.5 text-right">
                  <Label htmlFor="public-email" className="text-xs font-medium text-slate-700">
                    الإيميل
                  </Label>
                  <Input
                    id="public-email"
                    type="email"
                    value={publicEmail}
                    onChange={(ev) => setPublicEmail(ev.target.value)}
                    placeholder="name@email.com"
                    className="h-11 rounded-xl border-violet-200 bg-white text-right text-slate-900 shadow-sm transition-colors focus-visible:border-violet-400 focus-visible:ring-violet-200"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5 text-right">
                  <Label htmlFor="public-discord-id" className="text-xs font-medium text-slate-700">
                    Discord ID
                  </Label>
                  <Input
                    id="public-discord-id"
                    value={publicDiscordId}
                    onChange={(ev) => setPublicDiscordId(ev.target.value)}
                    placeholder="username#0000 أو ID"
                    className="h-11 rounded-xl border-violet-200 bg-white text-right text-slate-900 shadow-sm transition-colors focus-visible:border-violet-400 focus-visible:ring-violet-200"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5 text-right">
                  <Label htmlFor="public-age" className="text-xs font-medium text-slate-700">
                    العمر
                  </Label>
                  <Input
                    id="public-age"
                    type="number"
                    min={13}
                    value={publicAge}
                    onChange={(ev) => setPublicAge(ev.target.value)}
                    placeholder="18"
                    className="h-11 rounded-xl border-violet-200 bg-white text-right text-slate-900 shadow-sm transition-colors focus-visible:border-violet-400 focus-visible:ring-violet-200"
                  />
                </div>
              </div>
            ) : null}
            <div className="space-y-1.5 text-right">
              <Label htmlFor="user" className="text-xs font-medium text-slate-700">
                اسم المستخدم
              </Label>
              <Input
                id="user"
                autoComplete="username"
                value={isRegisterMode ? publicUsername : staffUser}
                onChange={(ev) => {
                  setStaffUser(ev.target.value);
                  setPublicUsername(ev.target.value);
                }}
                placeholder="أدخل اسم المستخدم"
                className="h-11 rounded-xl border-violet-200 bg-white text-right text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-violet-200"
              />
            </div>
            <div className="space-y-1.5 text-right">
              <Label htmlFor="pass" className="text-xs font-medium text-slate-700">
                كلمة المرور
              </Label>
              <Input
                id="pass"
                type="password"
                autoComplete="current-password"
                value={isRegisterMode ? publicPassword : staffPass}
                onChange={(ev) => {
                  setStaffPass(ev.target.value);
                  setPublicPassword(ev.target.value);
                }}
                placeholder="••••••••"
                className="h-11 rounded-xl border-violet-200 bg-white text-right text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-violet-200"
              />
            </div>
            {isRegisterMode ? (
              <div className="space-y-1.5 text-right">
                <Label htmlFor="pass-confirm" className="text-xs font-medium text-slate-700">
                  تأكيد كلمة السر
                </Label>
                <Input
                  id="pass-confirm"
                  type="password"
                  value={publicPasswordConfirm}
                  onChange={(ev) => setPublicPasswordConfirm(ev.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-violet-200 bg-white text-right text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-violet-200"
                />
              </div>
            ) : null}
            <Button
              type="submit"
              className="mt-2 h-11 w-full rounded-xl bg-gradient-neon font-display text-sm font-semibold tracking-wide text-primary-foreground shadow-md transition-all hover:brightness-110 hover:shadow-[var(--glow-primary)] active:scale-[0.99]"
            >
              <Lock className="ms-2 h-4 w-4 opacity-90" />
              {isRegisterMode ? "إنشاء الحساب" : "تسجيل الدخول"}
            </Button>
            <p className="text-center text-xs text-slate-500">
              {isRegisterMode ? "بعد إنشاء الحساب سيتم تحويلك مباشرة إلى بروفايلك." : "الدخول بحساب موظف يفتح لوحة التحكم، وبحساب عادي يفتح البروفايل."}
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
