import { useEffect, useState } from "react";
import { Menu, X, Lock, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "react-router-dom";
import { useOptionalHeroBackgroundVideo } from "@/contexts/HeroBackgroundVideoContext";

const institutionLinks = [
  { label: "المسعفين", to: "/ems" },
  { label: "الشرطة", to: "/police" },
  { label: "الرقابة", to: "/oversight" },
  { label: "وزارة العدل", to: "/justice" },
  { label: "المحاماة", to: "/lawyer" },
  { label: "المبرمجين", to: "/developer" },
];

const Navbar = () => {
  const location = useLocation();
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
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
          scrolled
            ? "border-b border-primary/20 bg-background/70 py-2 backdrop-blur-xl"
            : "bg-transparent py-4"
        }`}
      >
        <div className="flex w-full items-center justify-between gap-4 px-4 md:px-8 xl:px-12">
          <div className="flex items-center gap-3">
            <Link to="/" className="group inline-block leading-none" aria-label="العودة للرئيسية">
              <img
                src="/INF_LOGO.png"
                alt="Infinite City Logo"
                className="h-10 w-10 object-contain drop-shadow-[0_0_22px_hsl(var(--primary)/0.95)]"
                loading="eager"
              />
            </Link>
            <div className="leading-tight">
              <div className="font-latin-display text-base font-bold tracking-widest text-foreground">INFINITE</div>
              <div className="-mt-1 font-latin-display text-[10px] tracking-[0.3em] text-primary">C I T Y</div>
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
              to="/justice"
              className={`relative font-body font-medium text-sm transition-colors after:absolute after:bottom-[-6px] after:right-0 after:h-px after:bg-primary after:transition-all ${
                location.pathname === "/justice"
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
                <div className="absolute top-full mt-3 right-0 w-64 rounded-xl border border-primary/30 bg-background/95 backdrop-blur-xl p-2 shadow-xl">
                  {institutionLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        location.pathname === item.to
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
              تواصل معنا
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              asChild
              className="hidden md:inline-flex bg-gradient-neon text-primary-foreground font-display tracking-widest hover:shadow-glow-primary transition-all duration-500"
            >
              <Link to="/apply/citizen">قدّم الآن</Link>
            </Button>
            <Button
              onClick={() => setLoginOpen(true)}
              variant="outline"
              className="hidden sm:inline-flex border-primary/40 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary hover:shadow-glow-primary font-display tracking-wider"
            >
              <Lock className="h-4 w-4 ml-2" />
              تسجيل دخول
            </Button>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 text-foreground"
              aria-label="القائمة"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {heroBgVideo && location.pathname === "/" ? (
          <div className="pointer-events-none absolute inset-x-0 top-full z-[110] bg-transparent py-2">
            <div className="pointer-events-auto flex w-full items-center pl-4 md:pl-8 xl:pl-12">
              <div className="ms-auto mr-3 flex max-w-[17rem] shrink-0 items-center gap-2 rounded-xl border-0 bg-transparent px-2.5 py-2 shadow-none ring-0 sm:mr-4 md:mr-5">
                <button
                  type="button"
                  onClick={heroBgVideo.handleMuteToggle}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-primary transition-colors hover:bg-primary/10"
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
          <div className="lg:hidden glass-panel mx-4 mt-2 rounded-xl p-4 animate-fade-in">
            <nav className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="py-2 text-foreground hover:text-primary transition-colors"
              >
                الرئيسية
              </Link>
              <Link
                to="/justice"
                onClick={() => setOpen(false)}
                className="py-2 text-foreground hover:text-primary transition-colors"
              >
                القوانين
              </Link>
              <Link
                to="/streamers"
                onClick={() => setOpen(false)}
                className="py-2 text-foreground hover:text-primary transition-colors"
              >
                صنّاع المحتوى
              </Link>
              <Link
                to="/gangs"
                onClick={() => setOpen(false)}
                className="py-2 text-foreground hover:text-primary transition-colors"
              >
                العصابات
              </Link>
              <Link
                to="/vip-cars"
                onClick={() => setOpen(false)}
                className="py-2 text-foreground hover:text-primary transition-colors"
              >
                سيارات VIP
              </Link>
              <div className="pt-2 pb-1 text-xs tracking-[0.2em] text-primary font-display">المؤسسات</div>
              {institutionLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="py-2 text-foreground hover:text-primary transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="py-2 text-foreground hover:text-primary transition-colors"
              >
                تواصل معنا
              </Link>
              <Button asChild className="bg-gradient-neon text-primary-foreground">
                <Link to="/apply/citizen" onClick={() => setOpen(false)}>
                  قدّم الآن
                </Link>
              </Button>
              <Button
                onClick={() => { setOpen(false); setLoginOpen(true); }}
                className="bg-primary text-primary-foreground hover:bg-primary-glow"
              >
                <Lock className="h-4 w-4 ml-2" /> تسجيل دخول
              </Button>
            </nav>
          </div>
        )}
      </header>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent dir="rtl" className="glass-panel border-primary/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-gradient-neon">
              دخول الموظفين
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              هذا الدخول مخصص للأعضاء المعتمدين فقط (الإدارة، الشرطة، الإسعاف).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="user" className="font-display tracking-wider text-xs text-primary">اسم المستخدم</Label>
              <Input id="user" placeholder="username" className="mt-1 bg-input border-primary/30 focus:border-primary focus:ring-primary" />
            </div>
            <div>
              <Label htmlFor="pass" className="font-display tracking-wider text-xs text-primary">كلمة المرور</Label>
              <Input id="pass" type="password" placeholder="••••••••" className="mt-1 bg-input border-primary/30 focus:border-primary focus:ring-primary" />
            </div>
            <Button className="w-full bg-gradient-neon text-primary-foreground font-display tracking-widest hover:shadow-glow-primary transition-all">
              دخول آمن
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              قريباً — سيتم تفعيل النظام بعد ربط بوابة الدخول
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
