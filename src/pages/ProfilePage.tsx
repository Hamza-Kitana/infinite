import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  BellRing,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Crown,
  LayoutDashboard,
  LogOut,
  MessageSquareMore,
  ShieldCheck,
  Star,
  Store,
  Users,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { getPostLoginDashboardPath, useAuth } from "@/contexts/AuthContext";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import { useInstitutionRostersContent } from "@/contexts/InstitutionRostersContentContext";
import { INSTITUTION_BRANCH_META } from "@/data/institutionBranches";
import { useTicketsCenter } from "@/lib/ticketsCenter";
import { isJobApplicationRoleKey } from "@/data/jobRoleLaws";
import {
  isPublicTicketsUnlocked,
  MSG_TICKETS_NEED_CITY_PROFILE,
  MSG_TICKETS_UNLOCKED_AFTER_PROFILE,
  isCitizenElectronicApplyComplete,
} from "@/lib/publicProfileEligibility";
import { cn, isValidArabicNamePart } from "@/lib/utils";
import { DiscordIcon } from "@/components/DiscordIcon";

function statusLabel(status: "pending" | "approved" | "rejected") {
  if (status === "pending") return "قيد المراجعة";
  if (status === "approved") return "مقبول";
  return "مرفوض";
}

const ProfilePage = () => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user, getProfile, logout, updateProfile } = usePublicUser();
  const profile = getProfile();
  const { applications } = useApplicationsContent();
  const { findMembershipForUser } = useInstitutionRostersContent();
  const tickets = useTicketsCenter();
  /** جلسة الموظف — تكون موجودة تلقائياً للمواطن المرقّى عبر PublicStaffLinkSync */
  const auth = useAuth();
  const dashboardPath = useMemo(
    () => (auth.user && auth.canUseDashboard ? getPostLoginDashboardPath(auth.user.roles) : null),
    [auth.user, auth.canUseDashboard],
  );

  /** عضوية المستخدم في طاقم مؤسسة (إن وُجدت) */
  const myMembership = useMemo(
    () => findMembershipForUser(user?.id),
    [findMembershipForUser, user?.id],
  );

  /** تكتات هذا المستخدم */
  const myTickets = useMemo(() => {
    if (!user) return [];
    return tickets
      .filter(
        (t) =>
          t.openedById === user.id ||
          t.openedBy === user.username ||
          t.openedBy === user.displayName,
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [tickets, user]);

  const profileAge = profile?.age ?? 0;
  /** المستخدم يعدّل من البروفايل: اسم المدينة + العمر فقط */
  const profileIncomplete =
    !!profile &&
    (profile.cityName.trim().length < 3 || !Number.isFinite(profileAge) || profileAge < 13);

  const cityTicketsOk = isPublicTicketsUnlocked(profile, applications);

  const citizenElectronicApplyDone =
    profile?.authProvider === "discord" && isCitizenElectronicApplyComplete(profile, applications);

  const [formCity1, setFormCity1] = useState("");
  const [formCity2, setFormCity2] = useState("");
  const [formAge, setFormAge] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const cnCity = profile.cityName.trim();
    const parts = cnCity.split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      setFormCity1("");
      setFormCity2("");
    } else if (parts.length === 1) {
      setFormCity1(parts[0] ?? "");
      setFormCity2("");
    } else {
      setFormCity1(parts[0] ?? "");
      setFormCity2(parts.slice(1).join(" "));
    }
    setFormAge(profile.age > 0 ? String(profile.age) : "");
  }, [profile?.id, profile?.cityName, profile?.age]);

  const handleSaveProfile = () => {
    const cityCombined = `${formCity1.trim()} ${formCity2.trim()}`.trim();
    const ageNum = Math.floor(Number(formAge));
    if (!isValidArabicNamePart(formCity1) || !isValidArabicNamePart(formCity2)) {
      toast.error("اكتب جزءي الاسم داخل المدينة بالعربي فقط — حرفين على الأقل لكل جزء");
      return;
    }
    if (!Number.isFinite(ageNum) || ageNum < 13) {
      toast.error("أدخل عمرك الحقيقي (13 أو أكثر)");
      return;
    }
    const unlockedBefore = isPublicTicketsUnlocked(profile, applications);
    setSavingProfile(true);
    const result = updateProfile({
      cityName: cityCombined,
      age: ageNum,
    });
    setSavingProfile(false);
    if (!result.ok) {
      toast.error(result.reason);
      return;
    }
    const profileAfter = getProfile();
    if (!unlockedBefore && profileAfter && isPublicTicketsUnlocked(profileAfter, applications)) {
      toast.success(MSG_TICKETS_UNLOCKED_AFTER_PROFILE);
    } else {
      toast.success("تم حفظ بياناتك");
    }
  };

  /** عدد التكتات التي تحتوي ردًا جديدًا من الإدارة لم يقرأه المستخدم */
  const unreadTicketsCount = useMemo(() => {
    let total = 0;
    for (const ticket of myTickets) {
      const cutoff = ticket.lastPublicReadAt ? new Date(ticket.lastPublicReadAt).getTime() : 0;
      const hasUnread = ticket.messages.some(
        (m) => (m.senderType ?? "public") === "staff" && new Date(m.at).getTime() > cutoff,
      );
      if (hasUnread) total += 1;
    }
    return total;
  }, [myTickets]);

  /** كل تقديمات هذا المستخدم — دخول السيرفر + التوظيف */
  const myApplications = useMemo(() => {
    if (!user) return [];
    return applications
      .filter(
        (a) =>
          a.applicantUserId === user.id ||
          a.applicantUsername === user.username ||
          a.applicantDisplayName === user.displayName,
      )
      .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));
  }, [applications, user]);

  if (!user) return <Navigate to="/" replace />;

  const isDiscord = profile?.authProvider === "discord";
  const cityName = profile?.cityName ?? "";
  const avatarUrl = profile?.avatarUrl ?? "";

  /** في الشريط ورأس البروفايل: لـ Discord الاسم المعروض على الديسكورد وليس يوزر الموقع */
  const profileHeadline =
    isDiscord ? (user.displayName?.trim() || user.username) : (cityName.trim() || user.displayName?.trim() || user.username);

  const initials = (profileHeadline || user.username).slice(0, 2).toUpperCase();

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f0fb] text-slate-900 antialiased">
      <Navbar />

      <div className="relative overflow-hidden pt-[env(safe-area-inset-top,0px)]">
        <div className="pointer-events-none absolute -left-40 top-0 h-72 w-72 rounded-full bg-violet-400/25 blur-[100px]" />
        <div className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-[90px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-violet-200/40 via-transparent to-transparent" />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-10 pt-24 text-center sm:px-6 md:px-8 lg:px-12 xl:px-16"
        >
          <div className="relative mb-4">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-400 via-fuchsia-400 to-violet-600 opacity-80 blur-md" />
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-[0_20px_50px_-12px_rgba(54,22,79,0.45)] ring-2 ring-violet-200/60 md:h-32 md:w-32">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-violet-900 font-display text-2xl font-bold text-white md:text-3xl">
                  {initials}
                </div>
              )}
            </div>
            {isDiscord ? (
              <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#5865F2]/30 bg-[#5865F2] px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-md">
                <DiscordIcon className="h-3.5 w-3.5 text-white" />
                Discord
              </div>
            ) : null}
          </div>

          <p className="font-display text-[11px] tracking-[0.35em] text-violet-700/90">حسابك</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 md:text-3xl">{profileHeadline}</h1>
          <div className="mt-3 flex w-full max-w-md flex-col items-center gap-1.5 text-center">
            <p className="font-mono text-sm text-slate-600" dir="ltr">
              <span className="select-none text-slate-400">@</span>
              {user.username}
            </p>
            {isDiscord && profile?.discordId?.trim() ? (
              <p className="font-mono text-xs text-slate-500" dir="ltr">
                <span className="me-1 font-sans text-[11px] text-slate-500">Discord ID</span>
                {profile.discordId}
              </p>
            ) : null}
            {isDiscord && cityName.trim() ? (
              <p className="text-sm text-slate-600">
                الاسم داخل المدينة:{" "}
                <span className="font-semibold text-slate-900">{cityName}</span>
              </p>
            ) : null}
          </div>
          {isDiscord ? (
            <Badge className="mt-3 border-[#5865F2]/40 bg-[#5865F2]/12 text-[#3c45a5] hover:bg-[#5865F2]/18">
              متصل بـ Discord — المعرّف مربوط بحسابك
            </Badge>
          ) : null}
        </motion.div>
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl space-y-8 px-4 pb-20 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {profileIncomplete ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-300/90 bg-gradient-to-l from-amber-50 to-orange-50/80 px-4 py-3.5 text-right shadow-sm sm:px-5"
          >
            <p className="font-display text-sm font-bold text-amber-950">أكمل بيانات حسابك</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-900/90">
              من القسم أدناه أكمل <span className="font-semibold">اسمك داخل المدينة</span> على{" "}
              <span className="font-semibold">جزئين بالعربي</span> و<span className="font-semibold">عمرك</span> ثم احفظ.
              {!cityTicketsOk ? (
                <>
                  {" "}
                  لا يُعرض تنبيه التكتات قبل الإكمال — بعد الحفظ الصحيح ستظهر لك رسالة أن التكتات أصبحت متاحة.
                </>
              ) : null}{" "}
              الاسم على Discord والبريد ومعرّف Discord للعرض فقط — لتعديلها تواصل مع إدارة السيرفر.
            </p>
          </motion.div>
        ) : null}
        {/* بطاقة العضوية في المؤسسات (تظهر فقط للأعضاء/القادة/النواب) */}
        {myMembership ? (
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.03 }}
            aria-label="عضويتك في المؤسسة"
          >
            <Link
              to={
                myMembership.role === "leader" || myMembership.role === "deputy"
                  ? "/leadership"
                  : INSTITUTION_BRANCH_META[myMembership.branchId].previewPath
              }
              className={cn(
                "group relative flex flex-wrap items-center gap-4 overflow-hidden rounded-3xl border px-5 py-5 text-right shadow-[0_24px_60px_-28px_rgba(245,158,11,0.45)] transition-all hover:-translate-y-0.5 sm:px-6 sm:py-6",
                myMembership.role === "leader"
                  ? "border-amber-300/80 bg-gradient-to-l from-amber-500 via-orange-600 to-amber-700 text-white"
                  : myMembership.role === "deputy"
                    ? "border-indigo-300/80 bg-gradient-to-l from-indigo-600 via-violet-700 to-fuchsia-700 text-white"
                    : "border-emerald-300/80 bg-gradient-to-l from-emerald-50 via-white to-emerald-50 text-slate-900",
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-3xl"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
              />
              <div
                className={cn(
                  "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ring-1 sm:h-20 sm:w-20",
                  myMembership.role === "leader"
                    ? "bg-white/15 text-white ring-white/30"
                    : myMembership.role === "deputy"
                      ? "bg-white/15 text-white ring-white/30"
                      : "bg-emerald-100 text-emerald-700 ring-emerald-300/50",
                )}
              >
                {myMembership.role === "leader" ? (
                  <Crown className="h-8 w-8 sm:h-10 sm:w-10" />
                ) : myMembership.role === "deputy" ? (
                  <Star className="h-8 w-8 sm:h-10 sm:w-10" />
                ) : (
                  <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10" />
                )}
              </div>
              <div className="relative min-w-0 flex-1">
                <p
                  className={cn(
                    "font-display text-[10px] tracking-[0.32em]",
                    myMembership.role === "member" ? "text-emerald-700" : "text-white/80",
                  )}
                >
                  {myMembership.role === "leader"
                    ? "أنت قائد المؤسسة"
                    : myMembership.role === "deputy"
                      ? "أنت نائب القائد"
                      : "أنت عضو معتمد"}
                </p>
                <p
                  className={cn(
                    "mt-1 font-display text-xl font-bold leading-tight sm:text-2xl",
                    myMembership.role === "member" ? "text-slate-900" : "text-white",
                  )}
                >
                  {INSTITUTION_BRANCH_META[myMembership.branchId].labelAr}
                </p>
                <p
                  className={cn(
                    "mt-1 line-clamp-2 text-[13px] leading-snug sm:text-sm",
                    myMembership.role === "member" ? "text-slate-700" : "text-white/85",
                  )}
                >
                  {myMembership.role === "leader" || myMembership.role === "deputy"
                    ? `الرتبة: ${myMembership.rankLabel || "—"} • انتقل إلى لوحة قيادتك لإدارة الأعضاء`
                    : `الرتبة: ${myMembership.rankLabel || "—"} • شاهد بطاقتك في طاقم المؤسسة`}
                </p>
              </div>
              <div className="relative flex shrink-0 items-center gap-2">
                {myMembership.role === "leader" || myMembership.role === "deputy" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-display text-xs font-semibold text-white ring-1 ring-white/30">
                    <Users className="h-3.5 w-3.5" /> لوحة القيادة
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 font-display text-xs font-semibold text-white shadow-sm">
                    <Briefcase className="h-3.5 w-3.5" /> بطاقتي في الطاقم
                  </span>
                )}
              </div>
            </Link>
          </motion.section>
        ) : null}

        {/* بطاقة لوحة التحكم — تظهر فقط للمواطن المرقّى (له صلاحيات موظف) */}
        {dashboardPath ? (
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            aria-label="لوحة التحكم"
          >
            <Link
              to={dashboardPath}
              className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-violet-300/60 bg-gradient-to-l from-slate-950 via-[hsl(265_45%_22%)] to-violet-900 px-5 py-5 text-right text-white shadow-[0_28px_72px_-22px_rgba(124,58,237,0.7)] transition-all hover:-translate-y-0.5 hover:shadow-[0_32px_80px_-22px_rgba(124,58,237,0.85)] sm:px-6 sm:py-6"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-violet-500/30 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-fuchsia-500/25 blur-3xl"
              />
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-500/25 ring-1 ring-violet-300/40 backdrop-blur-sm shadow-[0_0_28px_rgba(167,139,250,0.45)] sm:h-[4.5rem] sm:w-[4.5rem]">
                <LayoutDashboard className="h-8 w-8 text-violet-100 sm:h-9 sm:w-9" />
              </span>
              <div className="relative min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge className="rounded-full bg-violet-500/30 px-2 py-0.5 text-[10px] font-display font-semibold text-violet-100 ring-1 ring-violet-300/40">
                    {auth.user?.roles.length ?? 0} صلاحية
                  </Badge>
                  <p className="font-display text-[10px] tracking-[0.32em] text-violet-200/85">DASHBOARD</p>
                </div>
                <p className="mt-1 font-display text-xl font-bold leading-tight sm:text-2xl">
                  لوحة التحكم — صلاحيات الموظف
                </p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-violet-100/85 sm:text-sm">
                  تم منحك صلاحيات إدارية. اضغط للدخول إلى لوحة التحكم وإدارة محتوى السيرفر.
                </p>
              </div>
            </Link>
          </motion.section>
        ) : null}

        {/* اختصارات سريعة — التقديم الإلكتروني + التكت + المتجر */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.05 }}
          aria-label="اختصارات سريعة"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {citizenElectronicApplyDone ? (
              <div className="relative flex items-center gap-4 overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-l from-emerald-50 via-white to-teal-50 px-5 py-5 text-right text-emerald-950 shadow-[0_18px_44px_-22px_rgba(16,185,129,0.35)] sm:px-6 sm:py-6">
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80 sm:h-16 sm:w-16">
                  <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
                </span>
                <div className="relative min-w-0 flex-1">
                  <p className="font-display text-[10px] tracking-[0.32em] text-emerald-700/90">تم</p>
                  <p className="mt-1 font-display text-xl font-bold leading-tight sm:text-2xl">دخول السيرفر مفعّل</p>
                  <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-emerald-900/85 sm:text-sm">
                    تم قبول تقديمك أو تفعيل بياناتك على المدينة — لا حاجة لإعادة التقديم الإلكتروني. تابع من
                    التكت أو المتجر.
                  </p>
                </div>
              </div>
            ) : (
              <Link
                to="/apply/citizen"
                className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-emerald-300/70 bg-gradient-to-l from-emerald-500 via-teal-600 to-cyan-700 px-5 py-5 text-right text-white shadow-[0_24px_60px_-28px_rgba(16,185,129,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-22px_rgba(16,185,129,0.65)] sm:px-6 sm:py-6"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-cyan-400/30 blur-2xl"
                />
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm sm:h-16 sm:w-16">
                  <ClipboardList className="h-7 w-7 sm:h-8 sm:w-8" />
                </span>
                <div className="relative min-w-0 flex-1">
                  <p className="font-display text-[10px] tracking-[0.32em] text-white/80">APPLY</p>
                  <p className="mt-1 font-display text-xl font-bold leading-tight sm:text-2xl">
                    التقديم الإلكتروني
                  </p>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-white/85 sm:text-sm">
                    قدّم لدخول السيرفر — املأ النموذج، اقرأ القوانين، واجتز الاختبار
                  </p>
                </div>
              </Link>
            )}

            <Link
              to="/tickets"
              onClick={(e) => {
                if (!cityTicketsOk) {
                  e.preventDefault();
                  toast.message(MSG_TICKETS_NEED_CITY_PROFILE);
                  navigate("/profile");
                }
              }}
              className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-violet-200/90 bg-gradient-to-l from-violet-600 via-violet-700 to-fuchsia-700 px-5 py-5 text-right text-white shadow-[0_24px_60px_-28px_rgba(124,58,237,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-22px_rgba(124,58,237,0.65)] sm:px-6 sm:py-6"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-fuchsia-400/25 blur-2xl"
              />
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm sm:h-16 sm:w-16">
                <MessageSquareMore className="h-7 w-7 sm:h-8 sm:w-8" />
                {unreadTicketsCount > 0 ? (
                  <span className="absolute -left-2 -top-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white shadow-[0_0_18px_rgba(244,63,94,0.7)] ring-2 ring-white/90">
                    {unreadTicketsCount}
                  </span>
                ) : null}
              </span>
              <div className="relative min-w-0 flex-1">
                <p className="font-display text-[10px] tracking-[0.32em] text-white/80">SUPPORT</p>
                <p className="mt-1 font-display text-xl font-bold leading-tight sm:text-2xl">مركز التكت</p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-white/85 sm:text-sm">
                  {unreadTicketsCount > 0
                    ? `لديك ${unreadTicketsCount} رد جديد من الإدارة بانتظار قراءتك`
                    : "افتح تكتًا جديدًا أو تابع محادثاتك السابقة"}
                </p>
              </div>
            </Link>

            <Link
              to="/store"
              className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-l from-amber-50 via-orange-50 to-rose-50 px-5 py-5 text-right text-slate-900 shadow-[0_18px_44px_-22px_rgba(217,119,6,0.45)] transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_24px_60px_-22px_rgba(217,119,6,0.55)] sm:px-6 sm:py-6"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-300/35 blur-3xl"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-rose-300/30 blur-2xl"
              />
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md ring-1 ring-white/30 sm:h-16 sm:w-16">
                <Store className="h-7 w-7 sm:h-8 sm:w-8" />
              </span>
              <div className="relative min-w-0 flex-1">
                <p className="font-display text-[10px] tracking-[0.32em] text-amber-700">STORE</p>
                <p className="mt-1 font-display text-xl font-bold leading-tight text-slate-900 sm:text-2xl">المتجر</p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-slate-700 sm:text-sm">
                  سيارات VIP، البيوت، البكجات، وفرص الاستثمار داخل المدينة
                </p>
              </div>
            </Link>
          </div>
        </motion.section>

        {/* معلومات الحساب — تأخذ العرض الكامل (الإشعارات صارت في جرس الشريط العلوي) */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
        >
          <Card className="overflow-hidden border-violet-200/90 bg-white/95 shadow-[0_24px_60px_-28px_rgba(54,22,79,0.35)] backdrop-blur-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-violet-100/90 bg-gradient-to-l from-violet-50/90 to-white pb-6 text-right">
              <div className="min-w-0">
                <CardTitle className="font-display text-xl text-slate-900">معلومات الحساب</CardTitle>
                <CardDescription className="mt-1 text-pretty text-slate-600">
                  أكمل <span className="font-semibold">اسمك داخل المدينة</span> (جزآن بالعربي) و
                  <span className="font-semibold"> عمرك</span> في الحقول أدناه ثم احفظ — لا تُفتح التكتات إلا بعد الحفظ
                  عندما تكون البيانات صحيحة. الاسم على Discord والبريد وDiscord للعرض فقط — تعديلها من الإدارة.
                </CardDescription>
              </div>
              <Link
                to="/tickets"
                onClick={(e) => {
                  if (!cityTicketsOk) {
                    e.preventDefault();
                    toast.message(MSG_TICKETS_NEED_CITY_PROFILE);
                    navigate("/profile");
                  }
                }}
                className="hidden shrink-0 items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-display font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50 sm:inline-flex"
                title="الإشعارات صارت على جرس الشريط العلوي"
              >
                <BellRing className="h-3.5 w-3.5" />
                الإشعارات صارت بجرس الشريط
              </Link>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {profileIncomplete && !cityTicketsOk ? (
                <div
                  role="status"
                  className="rounded-xl border border-violet-300 bg-violet-50 px-4 py-3 text-right text-sm leading-relaxed text-violet-950"
                >
                  <span className="font-semibold">مطلوب:</span> اكتب{" "}
                  <span className="font-semibold">اسمك داخل المدينة</span> في الجزءين (عربي فقط)، و{" "}
                  <span className="font-semibold">عمرك</span> (13 أو أكثر)، ثم اضغط «حفظ التغييرات». الحقول أدناه
                  تبدأ فارغة حتى تكتب اسمك بنفسك — بعد الحفظ الصحيح تُفتح لك التكتات.
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 text-right sm:col-span-2">
                  <Label className="text-sm font-medium text-slate-800">اسم المستخدم في الموقع</Label>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    مُعرّف داخلي للتمييز بين الحسابات — يختلف عن الاسم المعروض على Discord في أعلى الصفحة.
                  </p>
                  <div
                    dir="ltr"
                    className="min-h-10 rounded-lg border border-violet-200 bg-slate-50 px-3 py-2.5 text-left font-mono text-sm text-slate-900"
                  >
                    @{user.username}
                  </div>
                </div>
                <div className="space-y-2 text-right sm:col-span-2">
                  <Label className="text-sm font-medium text-slate-800">الاسم على Discord</Label>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    السطر الكامل كما يظهر في حسابك (الاسم المعروض واسم المستخدم إن وُجدا معاً).
                  </p>
                  <div
                    dir="rtl"
                    className="min-h-10 rounded-lg border border-violet-200 bg-slate-50 px-3 py-2.5 text-right text-sm font-medium text-slate-900"
                  >
                    {profile?.realName?.trim() ? profile.realName : "—"}
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Label htmlFor="prof-city1" className="text-sm font-medium text-slate-800">
                    الاسم داخل المدينة — الجزء الأول <span className="text-xs font-normal text-slate-600">(عربي)</span>
                  </Label>
                  <Input
                    id="prof-city1"
                    value={formCity1}
                    onChange={(e) => setFormCity1(e.target.value)}
                    placeholder=""
                    aria-label="الاسم داخل المدينة — الجزء الأول"
                    className="border-violet-200 bg-white text-right text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-400"
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label htmlFor="prof-city2" className="text-sm font-medium text-slate-800">
                    الاسم داخل المدينة — الجزء الثاني <span className="text-xs font-normal text-slate-600">(عربي)</span>
                  </Label>
                  <Input
                    id="prof-city2"
                    value={formCity2}
                    onChange={(e) => setFormCity2(e.target.value)}
                    placeholder=""
                    aria-label="الاسم داخل المدينة — الجزء الثاني"
                    className="border-violet-200 bg-white text-right text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-400"
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label htmlFor="prof-email" className="text-sm font-medium text-slate-800">
                    البريد الإلكتروني
                  </Label>
                  <div
                    id="prof-email"
                    dir="ltr"
                    className="min-h-10 rounded-lg border border-violet-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-900"
                  >
                    {profile?.email?.trim() ? profile.email : "—"}
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Label htmlFor="prof-discord" className="text-sm font-medium text-slate-800">
                    Discord ID
                  </Label>
                  <div
                    id="prof-discord"
                    dir="ltr"
                    className="min-h-10 rounded-lg border border-violet-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-900"
                  >
                    {profile?.discordId?.trim() ? profile.discordId : "—"}
                  </div>
                </div>
                <div className="space-y-2 text-right sm:col-span-2">
                  <Label htmlFor="prof-age" className="text-sm font-medium text-slate-800">
                    العمر
                  </Label>
                  <Input
                    id="prof-age"
                    type="number"
                    inputMode="numeric"
                    min={13}
                    max={120}
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder="مثال: 17"
                    className="border-violet-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-400"
                  />
                  <p className="text-[11px] text-slate-600">
                    يُخزَّن محلياً مع حسابك ويُستخدم في الطلبات والتكتات حسب سياسة السيرفر.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-violet-100 pt-4">
                <Button
                  type="button"
                  disabled={savingProfile}
                  className="bg-violet-600 font-display text-white hover:bg-violet-700"
                  onClick={handleSaveProfile}
                >
                  {savingProfile ? "جاري الحفظ…" : "حفظ التعديلات"}
                </Button>
              </div>
              <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-3 text-right">
                <p className="text-[11px] font-medium text-violet-900">معاينة سريعة</p>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  <span className="text-slate-600">
                    الاسم في المدينة:{" "}
                    <span className="font-semibold text-slate-900">
                      {`${formCity1.trim()} ${formCity2.trim()}`.trim() || "—"}
                    </span>
                  </span>
                  <span className="text-slate-600">
                    العمر:{" "}
                    <span className="font-semibold text-slate-900">{formAge ? `${formAge} سنة` : "—"}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* سجل الطلبات السابقة */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.2 }}
        >
          <Card className="overflow-hidden border-violet-200/90 bg-white/95 shadow-[0_18px_50px_-22px_rgba(54,22,79,0.25)]">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-violet-100 bg-gradient-to-l from-violet-50/90 to-white pb-4 text-right">
              <div>
                <CardTitle className="flex items-center justify-end gap-2 font-display text-lg text-slate-900">
                  <ClipboardList className="h-5 w-5 text-violet-600" />
                  طلباتي السابقة
                </CardTitle>
                <CardDescription className="mt-1 text-slate-600">
                  سجل تقديماتك (دخول السيرفر والتوظيف) — مرتّب من الأحدث
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full border-violet-200 bg-white text-violet-700">
                {myApplications.length} طلب
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {myApplications.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
                    <ClipboardList className="h-7 w-7 text-violet-500" />
                  </div>
                  <p className="font-display text-base font-semibold text-slate-800">لم تقدّم على شيء بعد</p>
                  <p className="max-w-xs text-sm text-slate-500">
                    {citizenElectronicApplyDone
                      ? "تم قبول تقديم دخول السيرفر أو تفعيل حسابك — يمكنك التقديم للوظائف من الأسفل عند توفر شواغر."
                      : "استخدم زر «التقديم الإلكتروني» من الشريط العلوي للتقديم على دخول السيرفر، أو افتح صفحة الوظائف للتوظيف."}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                    {citizenElectronicApplyDone ? null : (
                      <Link
                        to="/apply/citizen"
                        className="inline-flex h-9 items-center rounded-full bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
                      >
                        التقديم الإلكتروني
                      </Link>
                    )}
                    <Link
                      to="/jobs"
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-violet-300 bg-white px-4 text-sm text-violet-800 shadow-sm transition-colors hover:bg-violet-50"
                    >
                      <Briefcase className="h-4 w-4" />
                      التقديم لوظيفة
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-right text-sm">
                    <thead>
                      <tr className="border-b border-violet-100 bg-violet-50/40 text-[12px] text-slate-600">
                        <th className="px-4 py-3 font-medium">النوع</th>
                        <th className="px-4 py-3 font-medium">المسار</th>
                        <th className="px-4 py-3 font-medium">الحالة</th>
                        <th className="px-4 py-3 font-medium">تاريخ التقديم</th>
                        <th className="px-4 py-3 font-medium">ملاحظة الإدارة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myApplications.map((app) => {
                        const isJob = isJobApplicationRoleKey(app.roleKey);
                        return (
                          <tr key={app.id} className="border-b border-violet-50 transition-colors hover:bg-violet-50/40">
                            <td className="px-4 py-3 align-top">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                                  isJob
                                    ? "border-amber-200 bg-amber-50 text-amber-800"
                                    : "border-violet-200 bg-violet-50 text-violet-700",
                                )}
                              >
                                {isJob ? (
                                  <>
                                    <Briefcase className="h-3 w-3" />
                                    توظيف
                                  </>
                                ) : (
                                  <>
                                    <ClipboardList className="h-3 w-3" />
                                    دخول السيرفر
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top font-display text-slate-900">{app.targetTitle}</td>
                            <td className="px-4 py-3 align-top">
                              {app.status === "approved" ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {statusLabel(app.status)}
                                </span>
                              ) : app.status === "rejected" ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                                  <XCircle className="h-3 w-3" />
                                  {statusLabel(app.status)}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                  {statusLabel(app.status)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 align-top text-xs text-slate-600">
                              {new Date(app.submittedAt).toLocaleString("ar")}
                            </td>
                            <td className="px-4 py-3 align-top text-xs text-slate-700">
                              {app.note ? (
                                <span className="line-clamp-2 max-w-[18rem]">{app.note}</span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* سجل التكتات التي فتحها المستخدم */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.22 }}
        >
          <Card className="overflow-hidden border-violet-200/90 bg-white/95 shadow-[0_18px_50px_-22px_rgba(54,22,79,0.25)]">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-violet-100 bg-gradient-to-l from-violet-50/90 to-white pb-4 text-right">
              <div>
                <CardTitle className="flex items-center justify-end gap-2 font-display text-lg text-slate-900">
                  <MessageSquareMore className="h-5 w-5 text-violet-600" />
                  تكتاتي
                </CardTitle>
                <CardDescription className="mt-1 text-slate-600">
                  كل التكتات التي فتحتها — مرتّبة من الأحدث حسب آخر نشاط
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {unreadTicketsCount > 0 ? (
                  <Badge className="rounded-full bg-rose-600 px-3 text-xs font-semibold text-white shadow-sm">
                    {unreadTicketsCount} رد جديد
                  </Badge>
                ) : null}
                <Badge variant="outline" className="rounded-full border-violet-200 bg-white text-violet-700">
                  {myTickets.length} تكت
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {myTickets.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
                    <MessageSquareMore className="h-7 w-7 text-violet-500" />
                  </div>
                  <p className="font-display text-base font-semibold text-slate-800">لم تفتح أي تكت بعد</p>
                  <p className="max-w-xs text-sm text-slate-500">
                    افتح تكتاً جديداً للتواصل مع الإدارة عبر مركز التكت — كل تكت يفتح يظهر هنا.
                  </p>
                  <div className="mt-2">
                    <Link
                      to="/tickets"
                      onClick={(e) => {
                        if (!cityTicketsOk) {
                          e.preventDefault();
                          toast.message(MSG_TICKETS_NEED_CITY_PROFILE);
                          navigate("/profile");
                        }
                      }}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
                    >
                      <MessageSquareMore className="h-4 w-4" />
                      افتح تكت جديد
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-right text-sm">
                    <thead>
                      <tr className="border-b border-violet-100 bg-violet-50/40 text-[12px] text-slate-600">
                        <th className="px-4 py-3 font-medium">النوع</th>
                        <th className="px-4 py-3 font-medium">الموضوع</th>
                        <th className="px-4 py-3 font-medium">الحالة</th>
                        <th className="px-4 py-3 font-medium">عدد الردود</th>
                        <th className="px-4 py-3 font-medium">آخر نشاط</th>
                        <th className="px-4 py-3 font-medium">إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myTickets.map((t) => {
                        const cutoff = t.lastPublicReadAt ? new Date(t.lastPublicReadAt).getTime() : 0;
                        const unread = t.messages.filter(
                          (m) =>
                            (m.senderType ?? "public") === "staff" &&
                            new Date(m.at).getTime() > cutoff,
                        ).length;
                        const repliesCount = t.messages.length > 0 ? t.messages.length - 1 : 0;
                        return (
                          <tr
                            key={t.id}
                            className="border-b border-violet-50 transition-colors hover:bg-violet-50/40"
                          >
                            <td className="px-4 py-3 align-top">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700">
                                <MessageSquareMore className="h-3 w-3" />
                                {t.typeLabel}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-center justify-end gap-2">
                                {unread > 0 ? (
                                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {unread}
                                  </span>
                                ) : null}
                                <span className="line-clamp-1 max-w-[18rem] font-display font-semibold text-slate-900">
                                  {t.subject}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
                              {t.status === "closed" ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                  <CheckCircle2 className="h-3 w-3" />
                                  مغلق
                                </span>
                              ) : t.status === "in_review" ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                  قيد المراجعة
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                  بانتظار الرد
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 align-top text-xs tabular-nums text-slate-600">
                              {repliesCount}
                            </td>
                            <td className="px-4 py-3 align-top text-xs text-slate-600">
                              {new Date(t.updatedAt).toLocaleString("ar")}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <Link
                                to="/tickets"
                                onClick={(e) => {
                                  if (!cityTicketsOk) {
                                    e.preventDefault();
                                    toast.message(MSG_TICKETS_NEED_CITY_PROFILE);
                                    navigate("/profile");
                                  }
                                }}
                                className="inline-flex h-7 items-center gap-1 rounded-full border border-violet-200 bg-white px-2.5 text-[11px] font-display font-semibold text-violet-700 transition-colors hover:bg-violet-50"
                              >
                                فتح
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* تسجيل خروج صريح في نهاية الصفحة */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.25 }}
          className="flex flex-col items-center gap-3 rounded-3xl border border-rose-200/80 bg-gradient-to-l from-rose-50 via-white to-rose-50 px-6 py-7 text-center shadow-[0_18px_44px_-22px_rgba(244,63,94,0.35)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <LogOut className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-base font-bold text-slate-900">تسجيل الخروج من حسابك</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              ستحتاج لإعادة تسجيل الدخول عبر Discord أو حسابك المحلي للوصول إلى التكت والطلبات.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              toast.success("تم تسجيل الخروج");
              navigate("/", { replace: true });
            }}
            className="group mt-1 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-l from-rose-600 to-rose-700 px-7 font-display text-sm font-semibold text-white shadow-[0_12px_32px_-12px_rgba(244,63,94,0.6)] transition-all hover:from-rose-700 hover:to-rose-800 hover:shadow-[0_16px_40px_-12px_rgba(244,63,94,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-violet-50"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            تسجيل الخروج الآن
          </button>
        </motion.section>
      </main>

      <Footer forceLight />
    </div>
  );
};

export default ProfilePage;
