import { type FormEvent, useEffect, useState } from "react";
import { Menu, X, Lock, ChevronDown, Volume2, VolumeX, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOptionalHeroBackgroundVideo } from "@/contexts/HeroBackgroundVideoContext";
import { getPostLoginDashboardPath, useAuth } from "@/contexts/AuthContext";

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
  const [staffUser, setStaffUser] = useState("");
  const [staffPass, setStaffPass] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [institutionsOpen, setInstitutionsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const heroBgVideo = useOptionalHeroBackgroundVideo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setInstitutionsOpen(false);
    setOpen(false);
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
              <div className="truncate font-latin-display text-sm font-bold tracking-widest text-foreground sm:text-base">
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
                  {institutionLinks.map((item) => (
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
            <Button
              asChild
              className="hidden md:inline-flex bg-gradient-neon text-primary-foreground font-display tracking-widest hover:shadow-glow-primary transition-all duration-500"
            >
              <Link to="/apply/citizen">قدّم الآن</Link>
            </Button>
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
            ) : (
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
              <Link
                to="/laws"
                onClick={() => setOpen(false)}
                className="touch-manipulation rounded-lg py-3 text-foreground transition-colors active:bg-primary/10 hover:text-primary"
              >
                القوانين
              </Link>
              <Link
                to="/streamers"
                onClick={() => setOpen(false)}
                className="touch-manipulation rounded-lg py-3 text-foreground transition-colors active:bg-primary/10 hover:text-primary"
              >
                صنّاع المحتوى
              </Link>
              <Link
                to="/gangs"
                onClick={() => setOpen(false)}
                className="touch-manipulation rounded-lg py-3 text-foreground transition-colors active:bg-primary/10 hover:text-primary"
              >
                العصابات
              </Link>
              <Link
                to="/vip-cars"
                onClick={() => setOpen(false)}
                className="touch-manipulation rounded-lg py-3 text-foreground transition-colors active:bg-primary/10 hover:text-primary"
              >
                سيارات VIP
              </Link>
              <div className="pt-2 pb-1 text-xs tracking-[0.2em] text-primary font-display">المؤسسات</div>
              {institutionLinks.map((l) => (
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
              <Button asChild className="w-full touch-manipulation bg-gradient-neon text-primary-foreground">
                <Link to="/apply/citizen" onClick={() => setOpen(false)}>
                  قدّم الآن
                </Link>
              </Button>
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
          className="gap-0 overflow-hidden rounded-2xl border border-primary/25 bg-card/95 p-0 shadow-[0_0_0_1px_hsl(var(--primary)/0.06),0_24px_64px_-12px_hsl(240_50%_2%/0.75),0_0_80px_-24px_hsl(var(--primary)/0.35)] backdrop-blur-xl sm:max-w-[420px]"
        >
          <div className="relative bg-[radial-gradient(ellipse_120%_100%_at_50%_-20%,hsl(var(--primary)/0.22),transparent_55%)] px-6 pb-1 pt-14 text-center sm:px-8 sm:pt-16">
            <div className="mx-auto flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-2xl border border-primary/35 bg-gradient-to-b from-background/90 to-background/40 shadow-[inset_0_1px_0_hsl(var(--primary)/0.2),0_12px_40px_-8px_hsl(var(--primary)/0.45)] ring-1 ring-primary/15">
              <img
                src="/INF_LOGO.png"
                alt="Infinite City"
                className="h-[3.25rem] w-[3.25rem] object-contain drop-shadow-[0_0_28px_hsl(var(--primary)/0.55)]"
                loading="eager"
              />
            </div>
            <p className="mt-3 font-latin-display text-[10px] font-semibold tracking-[0.38em] text-primary/90 sm:text-[11px] sm:tracking-[0.42em]">
              INFINITE CITY
            </p>
            <DialogHeader className="mt-5 space-y-2 text-center sm:text-center">
              <DialogTitle className="font-display text-xl font-bold text-foreground sm:text-2xl">
                دخول الموظفين
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-[19rem] text-pretty text-sm leading-relaxed text-muted-foreground">
                بوابة آمنة للأعضاء المعتمدين — الإدارة، الأجهزة الأمنية، والصحة.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="h-px bg-gradient-to-l from-transparent via-border to-transparent" aria-hidden />

          <form
            noValidate
            className="space-y-4 px-6 py-6 sm:px-8"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              try {
                const session = login(staffUser, staffPass);
                if (session) {
                  toast.success("تم الدخول بنجاح");
                  setLoginOpen(false);
                  setStaffUser("");
                  setStaffPass("");
                  navigate(getPostLoginDashboardPath(session.roles));
                } else {
                  toast.error("اسم المستخدم أو كلمة المرور غير صحيحة");
                }
              } catch (err) {
                if (err instanceof Error && err.message === "IC_SESSION_STORAGE") {
                  toast.error(
                    "تعذر حفظ الجلسة في المتصفح. جرّب تعطيل حظر ملفات تعريف الارتباط لهذا الموقع، أو الخروج من وضع التصفح الخاص إن وُجد.",
                  );
                } else {
                  toast.error("حدث خطأ أثناء الدخول");
                  console.error(err);
                }
              }
            }}
          >
            <div className="space-y-1.5 text-right">
              <Label htmlFor="user" className="text-xs font-medium text-muted-foreground">
                اسم المستخدم
              </Label>
              <Input
                id="user"
                autoComplete="username"
                value={staffUser}
                onChange={(ev) => setStaffUser(ev.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="h-11 rounded-xl border-border/80 bg-background/60 text-right shadow-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:ring-primary/25"
              />
            </div>
            <div className="space-y-1.5 text-right">
              <Label htmlFor="pass" className="text-xs font-medium text-muted-foreground">
                كلمة المرور
              </Label>
              <Input
                id="pass"
                type="password"
                autoComplete="current-password"
                value={staffPass}
                onChange={(ev) => setStaffPass(ev.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl border-border/80 bg-background/60 text-right shadow-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:ring-primary/25"
              />
            </div>
            <Button
              type="submit"
              className="mt-1 h-11 w-full rounded-xl bg-gradient-neon font-display text-sm font-semibold tracking-wide text-primary-foreground shadow-md transition-all hover:brightness-110 hover:shadow-[var(--glow-primary)] active:scale-[0.99]"
            >
              <Lock className="ms-2 h-4 w-4 opacity-90" />
              دخول آمن
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
