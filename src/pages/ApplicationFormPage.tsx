import { useMemo, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LawsReaderDialog from "@/components/LawsReaderDialog";
import Stepper, { Step } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_ARAB_COUNTRY_CODE, arabCountries, getArabCountryLabel, isArabCountryCode } from "@/data/arabCountries";
import { ARABIC_MONTHS, getFullYearsSinceBirth, parseBirthDateParts } from "@/lib/birthdate";
import { cn, isValidArabicNamePart } from "@/lib/utils";
import { DISCORD_INVITE_URL } from "@/config/communityLinks";
import { DiscordIcon } from "@/components/DiscordIcon";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";

const TOTAL_STEPS = 10;
/** نص جاهز للمستخدمين بدون سجل سابق أو بدون نبذة */
const NONE_PLACEHOLDER = "لا يوجد";

type Gender = "" | "male" | "female";

function genderLabel(g: Gender): string {
  if (g === "male") return "ذكر";
  if (g === "female") return "أنثى";
  return "";
}

type ApplicationTarget = {
  title: string;
  subtitle: string;
  dashboardPath: string;
  heroEyebrow: string;
  heroTitleParts: readonly [string, string];
};

const targets: Record<string, ApplicationTarget> = {
  citizen: {
    title: "تقديم المواطن",
    subtitle: "املأ بياناتك الأساسية ثم أكمل رحلتك داخل المدينة.",
    dashboardPath: "/",
    heroEyebrow: "CITIZEN APPLICATION",
    heroTitleParts: ["تقديم", "المواطن"],
  },
  police: {
    title: "تقديم الشرطة",
    subtitle: "تسجيل بيانات المرشح لفرع الشرطة ضمن وزارة الداخلية.",
    dashboardPath: "/interior/police",
    heroEyebrow: "MINISTRY OF INTERIOR — LSPD",
    heroTitleParts: ["تقديم", "الشرطة"],
  },
  ems: {
    title: "تقديم وزارة الصحة",
    subtitle: "تسجيل بيانات مرشحي الطاقم الطبي والإسعافي.",
    dashboardPath: "/health",
    heroEyebrow: "MINISTRY OF HEALTH",
    heroTitleParts: ["تقديم", "وزارة الصحة"],
  },
  streamers: {
    title: "تقديم صناع المحتوى",
    subtitle: "أدخل معلومات البث ليتم تحويلك إلى لوحة صناع المحتوى.",
    dashboardPath: "/streamers",
    heroEyebrow: "CONTENT CREATOR",
    heroTitleParts: ["تقديم", "صنّاع المحتوى"],
  },
  oversight: {
    title: "تقديم الرقابة",
    subtitle: "تسجيل بيانات المرشح لقسم الرقابة والمتابعة.",
    dashboardPath: "/oversight",
    heroEyebrow: "OVERSIGHT DIVISION",
    heroTitleParts: ["تقديم", "الرقابة"],
  },
  justice: {
    title: "تقديم وزارة العدل",
    subtitle: "أدخل بياناتك للانضمام إلى وزارة العدل.",
    dashboardPath: "/justice",
    heroEyebrow: "MINISTRY OF JUSTICE",
    heroTitleParts: ["تقديم", "وزارة العدل"],
  },
  developer: {
    title: "تقديم مبرمج",
    subtitle: "أدخل معلوماتك التقنية للانضمام لفريق البرمجة.",
    dashboardPath: "/developer",
    heroEyebrow: "DEVELOPER TEAM",
    heroTitleParts: ["تقديم", "المبرمج"],
  },
  lawyer: {
    title: "تقديم هيئة المحاماة",
    subtitle: "أدخل بياناتك للانضمام إلى هيئة المحاماة ضمن وزارة العدل.",
    dashboardPath: "/justice",
    heroEyebrow: "MINISTRY OF JUSTICE — LEGAL",
    heroTitleParts: ["تقديم", "هيئة المحاماة"],
  },
  gang: {
    title: "تقديم فتح عصابة",
    subtitle: "سجل بياناتك وبيانات العصابة المقترحة للمراجعة.",
    dashboardPath: "/gangs",
    heroEyebrow: "GANG REGISTRATION",
    heroTitleParts: ["تقديم", "فتح عصابة"],
  },
  vip: {
    title: "طلب باقة VIP",
    subtitle: "أدخل معلوماتك ونوع الباقة المطلوبة (سيارات/تجهيزات).",
    dashboardPath: "/vip-cars",
    heroEyebrow: "VIP PACKAGE",
    heroTitleParts: ["طلب", "باقة VIP"],
  },
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-primary/25 bg-background/50 px-4 py-3 text-right">
      <span className="font-display text-[11px] tracking-wide text-primary">{label}</span>
      <span className="text-sm text-foreground">{value || "—"}</span>
    </div>
  );
}

const ApplicationFormPage = () => {
  const { role = "" } = useParams();
  const { submitApplication } = useApplicationsContent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const finalSubmitStarted = useRef(false);

  useEffect(() => {
    finalSubmitStarted.current = false;
  }, [role]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [discord, setDiscord] = useState("");
  /** مدن أو سيرفرات RP لعب بها المستخدم سابقًا */
  const [previousCities, setPreviousCities] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [country, setCountry] = useState(DEFAULT_ARAB_COUNTRY_CODE);
  const [experience, setExperience] = useState("");
  const [lawsAccepted, setLawsAccepted] = useState(false);
  const [lawsDialogOpen, setLawsDialogOpen] = useState(false);

  const target = useMemo<ApplicationTarget>(() => {
    const t = targets[role];
    if (t) return t;
    return targets.citizen;
  }, [role]);

  const yearOptions = useMemo(() => {
    const cy = new Date().getFullYear();
    const years: number[] = [];
    for (let y = cy; y >= cy - 100; y -= 1) {
      years.push(y);
    }
    return years;
  }, []);

  const dayOptions = useMemo(() => {
    if (!birthYear || !birthMonth) {
      return Array.from({ length: 31 }, (_, i) => i + 1);
    }
    const y = Number.parseInt(birthYear, 10);
    const m = Number.parseInt(birthMonth, 10);
    if (Number.isNaN(y) || Number.isNaN(m)) return Array.from({ length: 31 }, (_, i) => i + 1);
    const dim = new Date(y, m, 0).getDate();
    return Array.from({ length: dim }, (_, i) => i + 1);
  }, [birthYear, birthMonth]);

  useEffect(() => {
    if (!birthDay || !birthYear || !birthMonth) return;
    const d = Number.parseInt(birthDay, 10);
    const y = Number.parseInt(birthYear, 10);
    const m = Number.parseInt(birthMonth, 10);
    if (Number.isNaN(d) || Number.isNaN(y) || Number.isNaN(m)) return;
    const max = new Date(y, m, 0).getDate();
    if (d > max) {
      setBirthDay(String(max));
    }
  }, [birthYear, birthMonth, birthDay]);

  const validateBirthComplete = useCallback((): boolean => {
    const birth = parseBirthDateParts(birthYear, birthMonth, birthDay);
    if (!birth) {
      toast.error("اختر اليوم والشهر وسنة الميلاد بالكامل");
      return false;
    }
    if (birth > new Date()) {
      toast.error("لا يمكن اختيار تاريخ في المستقبل");
      return false;
    }
    if (getFullYearsSinceBirth(birth) < 16) {
      toast.error("يجب أن يكون عمرك 16 سنة على الأقل");
      return false;
    }
    return true;
  }, [birthYear, birthMonth, birthDay]);

  const birthSummaryLine = useMemo(() => {
    if (!birthYear || !birthMonth || !birthDay) return "—";
    return `${birthDay} / ${birthMonth} / ${birthYear}`;
  }, [birthYear, birthMonth, birthDay]);

  const ageSummaryLine = useMemo(() => {
    const birth = parseBirthDateParts(birthYear, birthMonth, birthDay);
    if (!birth) return "—";
    return `${getFullYearsSinceBirth(birth)} سنة`;
  }, [birthYear, birthMonth, birthDay]);

  /** يُعرض تحت القوائم مباشرةً بعد اكتمال التاريخ */
  const liveBirthAgeYears = useMemo(() => {
    const birth = parseBirthDateParts(birthYear, birthMonth, birthDay);
    if (!birth) return null;
    if (birth > new Date()) return null;
    return getFullYearsSinceBirth(birth);
  }, [birthYear, birthMonth, birthDay]);

  const validateAllFields = useCallback(() => {
    if (!isValidArabicNamePart(firstName)) {
      toast.error("أدخل الاسم الأول بالعربي فقط (حرفين على الأقل)");
      return false;
    }
    if (!isValidArabicNamePart(lastName)) {
      toast.error("أدخل اسم العائلة بالعربي فقط (حرفين على الأقل)");
      return false;
    }
    if (gender !== "male" && gender !== "female") {
      toast.error("اختر الجنس");
      return false;
    }
    if (!validateBirthComplete()) {
      return false;
    }
    if (!isArabCountryCode(country)) {
      toast.error("اختر الدولة من القائمة");
      return false;
    }
    if (!discord.trim()) {
      toast.error("أدخل معرف الديسكورد");
      return false;
    }
    if (!previousCities.trim()) {
      toast.error("اذكر مدن أو سيرفرات سبق لك اللعب فيها، أو اكتب «لا يوجد»");
      return false;
    }
    if (previousCities.trim().length < 3) {
      toast.error("أضف تفاصيل أكثر عن تجاربك السابقة");
      return false;
    }
    if (!experience.trim()) {
      toast.error("اكتب نبذة عن خبرتك ودوافع الانضمام، أو اضغط «لا يوجد»");
      return false;
    }
    const exp = experience.trim();
    if (exp !== NONE_PLACEHOLDER && exp.length < 20) {
      toast.error("اجعل النبذة أوضح (20 حرفًا على الأقل)، أو اضغط «لا يوجد»");
      return false;
    }
    if (!lawsAccepted) {
      toast.error("يجب فتح «قراءة القوانين» والإقرار بالاطلاع قبل الإرسال");
      return false;
    }
    return true;
  }, [firstName, lastName, gender, validateBirthComplete, country, discord, previousCities, experience, lawsAccepted]);

  const validateStep = useCallback(
    (step: number) => {
      switch (step) {
        case 1:
          if (!isValidArabicNamePart(firstName)) {
            toast.error("اكتب الاسم الأول بالعربي فقط، من حرفين فما فوق");
            return false;
          }
          return true;
        case 2:
          if (!isValidArabicNamePart(lastName)) {
            toast.error("اكتب اسم العائلة بالعربي فقط، من حرفين فما فوق");
            return false;
          }
          return true;
        case 3:
          if (gender !== "male" && gender !== "female") {
            toast.error("اختر ذكرًا أو أنثى");
            return false;
          }
          return true;
        case 4:
          return validateBirthComplete();
        case 5:
          if (!isArabCountryCode(country)) {
            toast.error("اختر دولة من القائمة");
            return false;
          }
          return true;
        case 6:
          if (!discord.trim()) {
            toast.error("أدخل معرف الديسكورد");
            return false;
          }
          return true;
        case 7:
          if (!previousCities.trim()) {
            toast.error("اذكر مدن أو سيرفرات لعبت بها، أو «لا يوجد»");
            return false;
          }
          if (previousCities.trim().length < 3) {
            toast.error("أضف تفاصيل أكثر");
            return false;
          }
          return true;
        case 8: {
          if (!experience.trim()) {
            toast.error("اكتب نبذة عن خبرتك ودوافع الانضمام، أو اضغط «لا يوجد»");
            return false;
          }
          const exp = experience.trim();
          if (exp !== NONE_PLACEHOLDER && exp.length < 20) {
            toast.error("اجعل النبذة أوضح (20 حرفًا على الأقل)، أو اضغط «لا يوجد»");
            return false;
          }
          return true;
        }
        case 9:
          if (!lawsAccepted) {
            toast.error("اضغط «قراءة القوانين» ثم أقر بالاطلاع للانتقال إلى المراجعة");
            return false;
          }
          return true;
        case 10:
          return validateAllFields();
        default:
          return true;
      }
    },
    [
      firstName,
      lastName,
      gender,
      validateBirthComplete,
      country,
      discord,
      previousCities,
      experience,
      lawsAccepted,
      validateAllFields,
    ],
  );

  const handleFinal = useCallback(() => {
    if (finalSubmitStarted.current) return;
    if (!validateAllFields()) return;
    finalSubmitStarted.current = true;
    setIsSubmitting(true);
    const roleKey = targets[role] ? role : "citizen";
    try {
      const result = submitApplication({
        roleKey,
        targetTitle: target.title,
        snapshot: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender: gender as "male" | "female",
          birthSummaryLine,
          ageSummaryLine,
          countryCode: country,
          discord: discord.trim(),
          previousCities: previousCities.trim(),
          experience: experience.trim(),
          lawsAccepted,
        },
      });
      if (result === "ok") {
        setSubmitSuccess(true);
      } else {
        finalSubmitStarted.current = false;
        if (result === "storage_quota") {
          toast.error(
            "مساحة تخزين المتصفح ممتلئة. احذف طلبات قديمة من لوحة الإدارة (طلبات التقديم) أو امسح بيانات الموقع من إعدادات المتصفح ثم أعد المحاولة.",
          );
        } else if (result === "storage_blocked") {
          toast.error(
            "المتصفح منع حفظ الطلب (وضع خاص صارم، أو حظر التخزين/ملفات تعريف الارتباط لهذا الموقع). فعّل التخزين المحلي للموقع أو جرّب متصفحاً آخر — لا يُنصح بوضع التصفح الخاص إذا كان يمنع التخزين.",
          );
        } else {
          toast.error("تعذر حفظ الطلب. حدّث الصفحة وأعد المحاولة، أو تحقق من وحدة التخزين في المتصفح.");
        }
      }
    } catch {
      finalSubmitStarted.current = false;
      toast.error("حدث خطأ أثناء الإرسال. أعد المحاولة.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateAllFields,
    role,
    target.title,
    firstName,
    lastName,
    gender,
    birthSummaryLine,
    ageSummaryLine,
    country,
    discord,
    previousCities,
    experience,
    lawsAccepted,
    submitApplication,
  ]);

  const stepIntro = (n: number, title: string, hint: string) => (
    <div className="space-y-1 pb-4 text-right">
      <p className="font-display text-xs text-muted-foreground">
        الخطوة {n} من {TOTAL_STEPS}
      </p>
      <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">{title}</h2>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );

  const fieldWrap = (children: ReactNode) => (
    <div className="mx-auto w-full max-w-lg py-2">{children}</div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />

      <section className="relative h-[46vh] min-h-[300px] max-h-[520px] overflow-hidden">
        <img
          src="/INF-CONECT-LOGO.gif"
          alt={target.title}
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
            {target.heroEyebrow}
          </p>
          <h1 className="font-display text-4xl font-bold md:text-6xl drop-shadow-[0_8px_24px_hsl(var(--background)/0.85)]">
            <span className="text-gradient-neon">{target.heroTitleParts[0]}</span>{" "}
            <span className="text-foreground">{target.heroTitleParts[1]}</span>
          </h1>
        </div>
      </section>

      <main className="pb-24">
        <section className="mx-auto mt-10 w-full max-w-4xl px-4 md:px-8 xl:px-12">
          <p className="mb-8 text-center text-base leading-relaxed text-muted-foreground md:text-right">{target.subtitle}</p>

          {submitSuccess ? (
            <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-primary/25 bg-card/40 px-6 py-12 text-center shadow-[0_0_40px_hsl(var(--primary)/0.12)] backdrop-blur-sm md:px-10">
              <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-success/15 text-success ring-4 ring-success/25">
                <CheckCircle2 className="h-16 w-16" strokeWidth={1.5} aria-hidden />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">تم تقديم الطلب بنجاح</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                تواصل مع الإدارة على الديسكورد لترتيب موعد المقابلة ومتابعة طلبك.
              </p>
              <div className="mt-8 flex w-full justify-center">
                <Button
                  type="button"
                  className="h-12 w-full max-w-sm gap-2 bg-[#5865F2] font-display text-base text-white hover:bg-[#4752C4] sm:w-auto"
                  asChild
                >
                  <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
                    <DiscordIcon className="h-6 w-6 shrink-0" />
                    فتح الديسكورد
                  </a>
                </Button>
              </div>
            </div>
          ) : (
          <Stepper
            initialStep={1}
            onStepChange={() => {}}
            onFinalStepCompleted={handleFinal}
            validateStep={validateStep}
            stayOnLastStepAfterSubmit
            backButtonText="السابق"
            nextButtonText="التالي"
            finalButtonText={isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
            nextButtonProps={{ disabled: isSubmitting }}
            stepCircleContainerClassName="step-circle-container--sharp"
            className="min-h-0"
          >
            <Step>
              {stepIntro(1, "الاسم الأول", "بالعربي فقط — بدون أحرف إنجليزية أو أرقام.")}
              {fieldWrap(
                <>
                  <Label htmlFor="firstName" className="font-display text-xs text-primary">
                    الاسم الأول
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثال: محمد"
                    className="mt-3 h-12 rounded-md border-primary/30 font-display"
                    autoComplete="given-name"
                    lang="ar"
                    dir="rtl"
                  />
                </>,
              )}
            </Step>

            <Step>
              {stepIntro(2, "اسم العائلة", "بالعربي فقط — نفس قواعد الاسم الأول.")}
              {fieldWrap(
                <>
                  <Label htmlFor="lastName" className="font-display text-xs text-primary">
                    اسم العائلة
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثال: العلي"
                    className="mt-3 h-12 rounded-md border-primary/30 font-display"
                    autoComplete="family-name"
                    lang="ar"
                    dir="rtl"
                  />
                </>,
              )}
            </Step>

            <Step>
              {stepIntro(3, "الجنس", "اختر أحد الخيارين للمتابعة.")}
              {fieldWrap(
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={cn(
                      "min-h-[52px] rounded-md border-2 px-3 py-3 font-display text-base transition-all",
                      gender === "male"
                        ? "border-primary bg-primary/15 text-foreground shadow-[0_0_22px_hsl(var(--primary)/0.28)]"
                        : "border-primary/25 bg-background/60 text-muted-foreground hover:border-primary/45 hover:text-foreground",
                    )}
                  >
                    ذكر
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={cn(
                      "min-h-[52px] rounded-md border-2 px-3 py-3 font-display text-base transition-all",
                      gender === "female"
                        ? "border-primary bg-primary/15 text-foreground shadow-[0_0_22px_hsl(var(--primary)/0.28)]"
                        : "border-primary/25 bg-background/60 text-muted-foreground hover:border-primary/45 hover:text-foreground",
                    )}
                  >
                    أنثى
                  </button>
                </div>,
              )}
            </Step>

            <Step>
              {stepIntro(4, "تاريخ الميلاد", "اختر اليوم والشهر والسنة — العمر 16 سنة فأكثر.")}
              {fieldWrap(
                <>
                  <div className="rounded-xl border border-primary/25 bg-card/40 p-4 shadow-inner">
                    <div dir="rtl" className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="birthYear" className="font-display text-xs text-primary">
                          السنة
                        </Label>
                        <Select value={birthYear} onValueChange={setBirthYear}>
                          <SelectTrigger
                            id="birthYear"
                            className="h-12 rounded-md border-primary/30 font-display text-right [&>span]:w-full [&>span]:text-right"
                            dir="rtl"
                          >
                            <SelectValue placeholder="السنة" />
                          </SelectTrigger>
                          <SelectContent dir="rtl" className="max-h-60">
                            {yearOptions.map((y) => (
                              <SelectItem
                                key={y}
                                value={String(y)}
                                className="cursor-pointer font-display pr-8 pl-2 text-right [&>span:first-child]:left-auto [&>span:first-child]:right-2"
                              >
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthMonth" className="font-display text-xs text-primary">
                          الشهر
                        </Label>
                        <Select value={birthMonth} onValueChange={setBirthMonth}>
                          <SelectTrigger
                            id="birthMonth"
                            className="h-12 rounded-md border-primary/30 font-display text-right [&>span]:w-full [&>span]:text-right"
                            dir="rtl"
                          >
                            <SelectValue placeholder="الشهر" />
                          </SelectTrigger>
                          <SelectContent dir="rtl" className="max-h-60">
                            {ARABIC_MONTHS.map((name, i) => {
                              const value = String(i + 1);
                              return (
                                <SelectItem
                                  key={value}
                                  value={value}
                                  className="cursor-pointer font-display pr-8 pl-2 text-right [&>span:first-child]:left-auto [&>span:first-child]:right-2"
                                >
                                  {name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDay" className="font-display text-xs text-primary">
                          اليوم
                        </Label>
                        <Select value={birthDay} onValueChange={setBirthDay}>
                          <SelectTrigger
                            id="birthDay"
                            className="h-12 rounded-md border-primary/30 font-display text-right [&>span]:w-full [&>span]:text-right"
                            dir="rtl"
                          >
                            <SelectValue placeholder="اليوم" />
                          </SelectTrigger>
                          <SelectContent dir="rtl" className="max-h-60">
                            {dayOptions.map((d) => (
                              <SelectItem
                                key={d}
                                value={String(d)}
                                className="cursor-pointer font-display pr-8 pl-2 text-right [&>span:first-child]:left-auto [&>span:first-child]:right-2"
                              >
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {liveBirthAgeYears !== null && (
                    <p className="mt-4 text-right font-display text-sm leading-relaxed text-muted-foreground">
                      عمرك{" "}
                      <span className="text-lg font-bold tabular-nums text-gradient-neon">{liveBirthAgeYears}</span>{" "}
                      سنة
                    </p>
                  )}
                </>,
              )}
            </Step>

            <Step>
              {stepIntro(5, "الدولة", "اختر دولتك من القائمة — الافتراضي الأردن.")}
              {fieldWrap(
                <>
                  <Label htmlFor="country" className="font-display text-xs text-primary">
                    الدولة
                  </Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger
                      id="country"
                      className="mt-3 h-12 rounded-md border-primary/30 font-display text-right [&>span]:w-full [&>span]:text-right"
                      dir="rtl"
                    >
                      <SelectValue placeholder="اختر الدولة" />
                    </SelectTrigger>
                    <SelectContent dir="rtl" className="max-h-72">
                      {arabCountries.map((c) => (
                        <SelectItem
                          key={c.code}
                          value={c.code}
                          className="cursor-pointer text-right font-display pr-8 pl-2 [&>span:first-child]:left-auto [&>span:first-child]:right-2"
                        >
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>,
              )}
            </Step>

            <Step>
              {stepIntro(6, "حساب الديسكورد", "نستخدمه للتواصل الرسمي معك.")}
              {fieldWrap(
                <>
                  <Label htmlFor="discord" className="font-display text-xs text-primary">
                    الديسكورد
                  </Label>
                  <Input
                    id="discord"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                    placeholder="username#0000"
                    className="mt-3 h-12 rounded-md border-primary/30"
                    autoComplete="nickname"
                  />
                </>,
              )}
            </Step>

            <Step>
              {stepIntro(
                7,
                "مدن أو سيرفرات سبق لك اللعب فيها",
                "اذكر أسماء مدن أو سيرفرات الرول بلاي التي جربتها. إن لم يسبق لك، اكتب «لا يوجد».",
              )}
              {fieldWrap(
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="previousCities" className="font-display text-xs text-primary">
                      السجل السابق
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 border-primary/35 font-display text-xs"
                      onClick={() => setPreviousCities(NONE_PLACEHOLDER)}
                    >
                      لا يوجد
                    </Button>
                  </div>
                  <textarea
                    id="previousCities"
                    value={previousCities}
                    onChange={(e) => setPreviousCities(e.target.value)}
                    rows={5}
                    placeholder="مثال: Infinite City، مدينة كذا، سيرفر كذا… أو: لا يوجد"
                    className={cn(
                      "mt-3 w-full resize-none border border-primary/30 bg-input px-3 py-3 text-sm text-foreground",
                      "rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
                    )}
                    dir="rtl"
                  />
                </>,
              )}
            </Step>

            <Step>
              {stepIntro(
                8,
                "نبذة عن الخبرة",
                "لماذا تريد الانضمام؟ ما خلفيتك في الرول بلاي؟ يمكنك تعبئة النص أو الضغط على «لا يوجد» إن لم تكن لديك خبرة بعد.",
              )}
              {fieldWrap(
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="experience" className="font-display text-xs text-primary">
                      النبذة
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 border-primary/35 font-display text-xs"
                      onClick={() => setExperience(NONE_PLACEHOLDER)}
                    >
                      لا يوجد
                    </Button>
                  </div>
                  <textarea
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    rows={6}
                    placeholder="اكتب نبذة مختصرة عن خبرتك ولماذا تريد الانضمام..."
                    className={cn(
                      "mt-3 w-full resize-none border border-primary/30 bg-input px-3 py-3 text-sm text-foreground",
                      "rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
                    )}
                  />
                </>,
              )}
            </Step>

            <Step>
              {stepIntro(
                9,
                "القوانين",
                "يجب فتح نافذة القوانين والإقرار بالاطلاع قبل المراجعة النهائية.",
              )}
              <div className="mt-4 space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full border-primary/40 font-display text-base hover:bg-primary/10"
                  onClick={() => setLawsDialogOpen(true)}
                >
                  قراءة القوانين
                </Button>
                {lawsAccepted ? (
                  <p className="text-center text-sm text-success">تم تأكيد قراءة القوانين والموافقة عليها.</p>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    لن يُسمح بالانتقال للخطوة التالية حتى تؤكد الاطلاع من النافذة.
                  </p>
                )}
              </div>
              <LawsReaderDialog
                open={lawsDialogOpen}
                onOpenChange={setLawsDialogOpen}
                onAccept={() => setLawsAccepted(true)}
              />
            </Step>

            <Step>
              {stepIntro(10, "مراجعة الطلب", "تأكد من صحة البيانات ثم أرسل.")}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SummaryRow label="الاسم الأول" value={firstName} />
                <SummaryRow label="اسم العائلة" value={lastName} />
                <SummaryRow label="الجنس" value={genderLabel(gender)} />
                <SummaryRow label="تاريخ الميلاد" value={birthSummaryLine} />
                <SummaryRow label="العمر" value={ageSummaryLine} />
                <SummaryRow label="الدولة" value={getArabCountryLabel(country)} />
                <SummaryRow label="ديسكورد" value={discord} />
              </div>
              <div className="mt-4 rounded-lg border border-primary/25 bg-background/50 p-4 text-right">
                <span className="font-display text-[11px] tracking-wide text-primary">مدن / سيرفرات لعبت بها سابقًا</span>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{previousCities || "—"}</p>
              </div>
              <div className="mt-4 rounded-lg border border-primary/25 bg-background/50 p-4 text-right">
                <span className="font-display text-[11px] tracking-wide text-primary">نبذة الخبرة</span>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{experience || "—"}</p>
              </div>
            </Step>
          </Stepper>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ApplicationFormPage;
