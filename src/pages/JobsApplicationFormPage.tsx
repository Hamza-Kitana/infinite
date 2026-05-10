import { useCallback, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ImagePlus,
  Lock,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  User2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DiscordIcon } from "@/components/DiscordIcon";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import { JOB_ROLE_LAWS, type JobRoleKey } from "@/data/jobRoleLaws";
import { JOB_ROLE_LAWS_QUIZ } from "@/data/lawsQuiz";
import { LawsQuizDialog } from "@/components/LawsQuizDialog";
import type { LawsQuizResult } from "@/data/publicApplicationTypes";
import {
  branchIdFromApplicationRoleKey,
  useApplicationsClosure,
} from "@/lib/applicationsClosure";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

const JobsApplicationFormPage = () => {
  const reduceMotion = useReducedMotion();
  const { role = "" } = useParams();
  const navigate = useNavigate();
  const publicUser = usePublicUser();
  const { user, getProfile, logout } = publicUser;
  const { submitApplication } = useApplicationsContent();

  const [cityName, setCityName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [openLaws, setOpenLaws] = useState(false);
  const [acceptedLaws, setAcceptedLaws] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  /** نتيجة اختبار قراءة قوانين الجهة — تُضاف للطلب وتُعرض للأدمن */
  const [quizResult, setQuizResult] = useState<LawsQuizResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const roleKey = (role in JOB_ROLE_LAWS ? role : "") as JobRoleKey | "";
  const lawSet = roleKey ? JOB_ROLE_LAWS[roleKey] : null;
  const closure = useApplicationsClosure();
  const closureBranchId = roleKey ? branchIdFromApplicationRoleKey(roleKey) : null;
  const isClosed = closureBranchId ? closure.closed[closureBranchId] === true : false;
  const closureNote = closureBranchId ? closure.notes[closureBranchId] : undefined;

  /** بيانات Discord الكاملة للمستخدم — تُستخرج مرة واحدة */
  const profile = useMemo(() => (user ? getProfile() : null), [user, getProfile]);
  const isDiscordUser = user?.authProvider === "discord";

  const onPickImage = useCallback(async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("الرجاء اختيار ملف صورة فقط");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("حجم الصورة كبير — الحد الأقصى 2 ميجابايت");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarDataUrl(dataUrl);
      toast.success("تم اعتماد الصورة");
    } catch {
      toast.error("تعذر قراءة الصورة");
    }
  }, []);

  if (!user) return <Navigate to="/" replace />;
  if (!lawSet) return <Navigate to="/jobs" replace />;

  const titleShort = lawSet.title.replace("قوانين ", "").replace("قانون ", "");

  const submit = () => {
    if (!isDiscordUser) {
      toast.error("التقديم متاح فقط للحسابات المسجّلة عبر Discord");
      return;
    }
    if (isClosed) {
      toast.error("التقديم مغلق حالياً لهذه الجهة");
      return;
    }
    const cityNameTrim = cityName.trim();
    if (cityNameTrim.length < 3) {
      toast.error("اكتب اسم شخصيتك في المدينة (3 أحرف على الأقل)");
      return;
    }
    if (bio.trim().length < 20) {
      toast.error("اكتب نبذة أوضح عن نفسك (20 حرف على الأقل)");
      return;
    }
    if (!avatarDataUrl) {
      toast.error("الرجاء رفع صورة شخصية للتقديم");
      return;
    }
    if (!acceptedLaws) {
      toast.error("يجب قراءة قوانين الجهة والإقرار بها");
      return;
    }
    setSubmitting(true);
    const discordHandle = profile?.username ?? user.username;
    const discordId = profile?.discordId ?? "";
    const discordSnapshot = discordId ? `${discordHandle} (ID: ${discordId})` : discordHandle;

    const result = submitApplication({
      roleKey,
      targetTitle: titleShort,
      applicantUserId: user.id,
      applicantUsername: user.username,
      applicantDisplayName: user.displayName,
      snapshot: {
        firstName: cityNameTrim,
        lastName: "",
        gender: "male",
        birthSummaryLine: "—",
        ageSummaryLine: "—",
        countryCode: "JO",
        discord: discordSnapshot,
        previousCities: "—",
        experience: bio.trim(),
        lawsAccepted: true,
        lawsQuizResult: quizResult ?? undefined,
        cityName: cityNameTrim,
        bio: bio.trim(),
        avatarDataUrl,
        discordId: discordId || undefined,
      },
    });
    setSubmitting(false);
    if (result === "storage_quota") {
      toast.error("لا توجد مساحة كافية للحفظ — حاول حذف الصورة أو تصغيرها");
      return;
    }
    if (result !== "ok") {
      toast.error("تعذر إرسال الطلب حالياً");
      return;
    }
    toast.success("تم إرسال طلب التوظيف بنجاح");
    navigate("/jobs");
  };

  /** صفحة بديلة للمستخدمين الذين سجّلوا عبر حساب محلي — يجب عليهم التحوّل إلى Discord */
  if (!isDiscordUser) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#f4f0fb] text-slate-900 antialiased">
        <Navbar />
        <main className="relative z-10 mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center px-4 py-24 md:px-8">
          <div className="w-full overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-l from-indigo-50 via-white to-violet-50 p-8 text-right shadow-[0_28px_70px_-30px_rgba(99,102,241,0.45)] md:p-10">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-right">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2] text-white shadow-inner">
                <DiscordIcon className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-display text-[11px] font-semibold tracking-[0.32em] text-indigo-700/90">
                  تسجيل الدخول مطلوب
                </p>
                <h1 className="flex flex-wrap items-center justify-center gap-2 font-display text-2xl font-bold text-slate-900 sm:justify-start md:text-3xl">
                  <ShieldAlert className="h-6 w-6 text-indigo-600" aria-hidden />
                  التقديم متاح عبر Discord فقط
                </h1>
                <p className="text-sm leading-relaxed text-slate-700">
                  للحفاظ على هويتك ومنع الازدواجية، التقديم الإلكتروني يتطلب تسجيل الدخول عبر حسابك على Discord.
                  حسابك الحالي مسجّل بطريقة محلية، لذا يُرجى تسجيل الخروج ثم الدخول من جديد عبر Discord.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Button
                    type="button"
                    className="rounded-xl bg-[#5865F2] text-white shadow-md hover:bg-[#4752c4]"
                    onClick={() => {
                      logout();
                      toast.message("تم تسجيل الخروج — اضغط زر تسجيل الدخول أعلى الصفحة واختر Discord");
                      navigate("/", { replace: true });
                    }}
                  >
                    <DiscordIcon className="ms-2 h-4 w-4" />
                    تسجيل الخروج والدخول عبر Discord
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-violet-300 bg-white text-violet-700 hover:bg-violet-50"
                    onClick={() => navigate("/jobs")}
                  >
                    العودة لصفحة التوظيف
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer forceLight />
      </div>
    );
  }

  const stepCity = cityName.trim().length >= 3;
  const stepBio = bio.trim().length >= 20;
  const stepImg = !!avatarDataUrl;
  const stepLaws = acceptedLaws;
  const completedSteps = [stepCity, stepBio, stepImg, stepLaws].filter(Boolean).length;
  const progressPct = Math.round((completedSteps / 4) * 100);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f0fb] text-slate-900 antialiased">
      <Navbar />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-violet-400/25 blur-[90px]" />
        <div className="pointer-events-none absolute -right-20 top-24 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-[80px]" />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mx-auto max-w-4xl px-4 pb-6 pt-24 md:px-8"
        >
          <div className="text-center md:text-right">
            <p className="font-display text-[11px] tracking-[0.28em] text-violet-700/90">طلب توظيف</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">{titleShort}</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{lawSet.subtitle}</p>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between text-[11px] font-display text-slate-500">
              <span>اكتمال البيانات</span>
              <span className="font-mono text-violet-700">{progressPct}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-violet-100">
              <div
                className="h-full bg-gradient-to-l from-violet-600 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-20 md:px-8">
        {isClosed ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6 overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-l from-rose-50 via-white to-rose-50 p-6 text-right shadow-[0_24px_60px_-28px_rgba(244,63,94,0.4)] md:p-7"
          >
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-right">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 shadow-inner">
                <Lock className="h-7 w-7" />
              </div>
              <div className="flex-1 space-y-1.5">
                <p className="font-display text-[11px] font-semibold tracking-[0.3em] text-rose-700/80">
                  ملاحظة هامة
                </p>
                <h2 className="font-display text-xl font-bold text-rose-800 md:text-2xl">
                  التقديم مغلق حالياً
                </h2>
                <p className="text-sm leading-relaxed text-rose-900/80">
                  لا يمكن إرسال طلبات توظيف جديدة لـ
                  <span className="mx-1 font-semibold text-rose-900">{titleShort}</span>
                  في هذه الفترة. يُرجى المتابعة لاحقاً.
                </p>
                {closureNote ? (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-white/80 px-3 py-2 text-sm leading-relaxed text-rose-800 shadow-sm">
                    <span className="font-semibold text-rose-700">من الإدارة:</span> {closureNote}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
                    onClick={() => navigate("/jobs")}
                  >
                    العودة لصفحة التوظيف
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-violet-300 bg-white text-violet-700 hover:bg-violet-50"
                    onClick={() => navigate("/")}
                  >
                    الصفحة الرئيسية
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <Card
            className={cn(
              "overflow-hidden border-violet-200/90 bg-white/95 shadow-[0_24px_60px_-28px_rgba(54,22,79,0.28)] backdrop-blur-sm",
              isClosed && "pointer-events-none opacity-60",
            )}
          >
            <CardHeader className="border-b border-violet-100 bg-gradient-to-l from-violet-50/90 to-white text-right">
              <CardTitle className="font-display text-xl text-slate-900">نموذج التوظيف</CardTitle>
              <CardDescription className="text-pretty text-slate-600">
                {isClosed
                  ? "النموذج معطّل مؤقتاً لإغلاق التقديم على هذه الجهة."
                  : "بياناتك من Discord مأخوذة تلقائياً — أكمل المعلومات الأربع: اسمك في المدينة، نبذتك، صورتك، ثم الإقرار بالقوانين."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 md:p-8">
              {/* بطاقة Discord (تلقائية) */}
              <section className="rounded-2xl border border-indigo-200 bg-gradient-to-l from-indigo-50/80 via-white to-violet-50/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5865F2] text-white shadow-sm">
                    <DiscordIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <p className="flex items-center gap-1.5 font-display text-sm font-semibold text-slate-900">
                      حسابك على Discord
                      <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-xl border border-indigo-100 bg-white px-3 py-2">
                        <p className="text-[11px] text-slate-500">الاسم على Discord</p>
                        <p className="truncate font-mono text-sm font-semibold text-slate-900" dir="ltr">
                          @{profile?.username ?? user.username}
                        </p>
                      </div>
                      <div className="rounded-xl border border-indigo-100 bg-white px-3 py-2">
                        <p className="text-[11px] text-slate-500">Discord ID</p>
                        <p className="truncate font-mono text-sm font-semibold text-slate-900" dir="ltr">
                          {profile?.discordId || "—"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-indigo-100 bg-white px-3 py-2">
                        <p className="text-[11px] text-slate-500">الجهة المتقدَّم لها</p>
                        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900">
                          <Briefcase className="h-3.5 w-3.5 text-violet-700" />
                          {titleShort}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                      تُؤخذ هذه البيانات تلقائياً من حسابك المتصل ولا يمكن تعديلها هنا.
                    </p>
                  </div>
                </div>
              </section>

              {/* اسم الشخصية في المدينة */}
              <section className="space-y-2 rounded-2xl border border-violet-200/80 bg-gradient-to-l from-violet-50/40 to-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="city-name" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <User2 className="h-4 w-4 text-violet-700" />
                    اسمك داخل المدينة
                  </Label>
                  {stepCity ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-display font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> مكتمل
                    </span>
                  ) : null}
                </div>
                <Input
                  id="city-name"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="مثال: الضابط آدم سيف"
                  className="rounded-xl border-violet-200 bg-white text-base text-slate-900"
                  maxLength={80}
                  disabled={isClosed}
                />
                <p className="text-[11px] leading-relaxed text-slate-500">
                  هذا الاسم سيظهر للأدمن مع طلبك ويُستخدم تلقائياً عند تعيينك في الطاقم.
                </p>
              </section>

              {/* النبذة */}
              <section className="space-y-2 rounded-2xl border border-violet-200/80 bg-gradient-to-l from-violet-50/40 to-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="bio" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <ScrollText className="h-4 w-4 text-violet-700" />
                    نبذة عنك (الخبرة والدوافع)
                  </Label>
                  <span className="inline-flex items-center gap-2 text-[11px] font-display text-slate-500">
                    <span dir="ltr">{bio.trim().length} / 4000</span>
                    {stepBio ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> مكتمل
                      </span>
                    ) : null}
                  </span>
                </div>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 4000))}
                  placeholder="عرّف الأدمن عن نفسك، خبراتك السابقة، ولماذا ترغب بالانضمام لهذه الجهة (لا تقل عن 20 حرفاً)…"
                  className="min-h-[160px] rounded-xl border-violet-200 bg-white text-base leading-relaxed text-slate-900"
                  disabled={isClosed}
                />
              </section>

              {/* رفع الصورة */}
              <section className="space-y-3 rounded-2xl border border-violet-200/80 bg-gradient-to-l from-violet-50/40 to-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <ImagePlus className="h-4 w-4 text-violet-700" />
                    صورة شخصية
                  </Label>
                  {stepImg ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-display font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> مرفوعة
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/50">
                    {avatarDataUrl ? (
                      <img
                        src={avatarDataUrl}
                        alt="معاينة الصورة"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-violet-500">
                        <ImagePlus className="h-7 w-7" />
                        <span className="text-[11px] font-display">لم تُرفع</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-[12px] leading-relaxed text-slate-600">
                      اختر صورة واضحة لك (PNG / JPG / WEBP) بحجم أقصى 2 ميجابايت. ستظهر للأدمن مع الطلب
                      ويمكن استخدامها في طاقم المؤسسة.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-violet-300 bg-white text-violet-800 hover:bg-violet-50"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isClosed}
                      >
                        <ImagePlus className="ms-2 h-4 w-4" />
                        {avatarDataUrl ? "تغيير الصورة" : "اختيار صورة"}
                      </Button>
                      {avatarDataUrl ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          onClick={() => setAvatarDataUrl(null)}
                          disabled={isClosed}
                        >
                          إزالة
                        </Button>
                      ) : null}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        void onPickImage(file);
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* قراءة القوانين */}
              <section className="rounded-2xl border border-violet-200 bg-gradient-to-l from-violet-50/80 to-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      {acceptedLaws ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                    </div>
                    <div className="text-sm text-slate-700">
                      {acceptedLaws && quizResult?.passed ? (
                        <>
                          <p className="font-semibold text-emerald-700">
                            تم اعتماد إقرارك بقوانين الجهة بعد اجتياز الأسئلة ✓
                          </p>
                          <p className="mt-0.5 text-[12px] text-emerald-700/80">
                            النتيجة: {quizResult.correctCount} / {quizResult.totalQuestions} • محاولات: {quizResult.attempts}
                          </p>
                        </>
                      ) : acceptedLaws && quizResult && !quizResult.passed ? (
                        <>
                          <p className="font-semibold text-amber-700">
                            أُرسلت إجاباتك للمراجع مع الطلب
                          </p>
                          <p className="mt-0.5 text-[12px] text-amber-700/80">
                            النتيجة: {quizResult.correctCount} / {quizResult.totalQuestions} • محاولات: {quizResult.attempts}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-slate-800">قوانين {titleShort}</p>
                          <p className="mt-0.5 text-[12px] text-slate-600">
                            اقرأ القوانين، ثم أجب عن أسئلة الإقرار للمتابعة.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 rounded-xl border-violet-300 bg-white text-violet-800 hover:bg-violet-50"
                    onClick={() => setOpenLaws(true)}
                  >
                    {acceptedLaws ? "إعادة عرض القوانين" : "عرض قوانين الجهة"}
                  </Button>
                </div>
              </section>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-violet-300 bg-white px-6 text-violet-800 hover:bg-violet-50"
                  onClick={() => navigate("/jobs")}
                >
                  رجوع
                </Button>
                <Button
                  type="button"
                  className="rounded-xl bg-gradient-to-l from-violet-700 to-violet-600 px-8 text-white shadow-lg shadow-violet-500/25 hover:from-violet-800 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={submit}
                  disabled={submitting || isClosed}
                >
                  {isClosed ? "التقديم مغلق حالياً" : submitting ? "جاري الإرسال..." : "إرسال طلب التوظيف"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Dialog open={openLaws} onOpenChange={setOpenLaws}>
        <DialogContent dir="rtl" className="max-h-[85vh] max-w-2xl overflow-y-auto border-violet-200 bg-white text-slate-900 shadow-2xl">
          <DialogHeader className="text-right">
            <DialogTitle className="font-display text-lg">{lawSet.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-right">
            {lawSet.rules.map((rule, idx) => (
              <div key={idx} className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 text-sm leading-relaxed text-slate-800">
                <span className="font-semibold text-violet-700">{idx + 1}.</span> {rule}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-right text-sm leading-relaxed text-amber-900">
            بعد الضغط على «متابعة وأسئلة الإقرار» سيُعرض عليك اختبار قصير (
            {(JOB_ROLE_LAWS_QUIZ[roleKey as JobRoleKey] ?? []).length} أسئلة) للتحقق من قراءتك. لن يُعتمد إقرارك إلا
            بالإجابة الصحيحة على الأسئلة جميعها.
          </div>
          <div className="mt-4 flex justify-end border-t border-violet-100 pt-4">
            <Button
              type="button"
              className="rounded-xl bg-violet-600 text-white hover:bg-violet-700"
              onClick={() => {
                setOpenLaws(false);
                setQuizOpen(true);
              }}
            >
              متابعة وأسئلة الإقرار
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LawsQuizDialog
        open={quizOpen}
        onOpenChange={setQuizOpen}
        questions={JOB_ROLE_LAWS_QUIZ[roleKey as JobRoleKey] ?? []}
        contextLabel={lawSet.title}
        onComplete={(result) => {
          setQuizResult(result);
          setAcceptedLaws(true);
          setQuizOpen(false);
          if (result.passed) {
            toast.success("تم اعتماد إقرارك بقوانين الجهة");
          } else {
            toast.message("تم تسجيل إجاباتك — ستظهر للمراجع مع الطلب", {
              description: `النتيجة: ${result.correctCount} من ${result.totalQuestions}`,
            });
          }
        }}
        onReread={() => {
          setQuizOpen(false);
          setOpenLaws(true);
        }}
      />
      <Footer forceLight />
    </div>
  );
};

export default JobsApplicationFormPage;
