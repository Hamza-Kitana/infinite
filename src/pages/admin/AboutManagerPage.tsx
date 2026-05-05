import { useState } from "react";
import { Link } from "react-router-dom";
import { Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { appendActivityLog } from "@/lib/activityLog";
import {
  loadAboutPageContent,
  saveAboutPageContent,
  type AboutPageContent,
} from "@/lib/aboutPageContent";

const inputClassName = "border-violet-200 bg-white text-slate-900 placeholder:text-slate-400";
const textareaClassName =
  "min-h-[96px] border-violet-200 bg-white text-slate-900 placeholder:text-slate-400";

function PillarEditor({
  index,
  title,
  body,
  onTitleChange,
  onBodyChange,
}: {
  index: number;
  title: string;
  body: string;
  onTitleChange: (next: string) => void;
  onBodyChange: (next: string) => void;
}) {
  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
      <p className="mb-3 font-display text-sm text-violet-700">ميزة {index + 1}</p>
      <div className="space-y-2">
        <Label className="text-slate-700">العنوان</Label>
        <Input value={title} onChange={(e) => onTitleChange(e.target.value)} className={inputClassName} />
      </div>
      <div className="mt-3 space-y-2">
        <Label className="text-slate-700">الوصف</Label>
        <Textarea value={body} onChange={(e) => onBodyChange(e.target.value)} className={textareaClassName} />
      </div>
    </div>
  );
}

const AboutManagerPage = () => {
  const { user } = useAuth();
  const [draft, setDraft] = useState<AboutPageContent>(() => loadAboutPageContent());
  const [savedSnapshot, setSavedSnapshot] = useState<AboutPageContent>(() => loadAboutPageContent());

  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedSnapshot);

  const setField = <K extends keyof AboutPageContent>(key: K, value: AboutPageContent[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const setPillarField = (index: number, key: "title" | "body", value: string) => {
    setDraft((prev) => {
      const nextPillars = [...prev.pillars];
      nextPillars[index] = { ...nextPillars[index], [key]: value };
      return { ...prev, pillars: nextPillars };
    });
  };

  const handleSave = () => {
    saveAboutPageContent(draft);
    setSavedSnapshot(draft);
    appendActivityLog(user?.username ?? "admin", "تحديث صفحة من نحن", "تم حفظ محتوى صفحة من نحن");
    toast.success("تم حفظ تعديلات صفحة من نحن");
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-violet-200 bg-white/95 p-5 shadow-[0_18px_44px_-30px_rgba(54,22,79,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="text-right">
            <h1 className="font-display text-2xl font-bold text-slate-900">مدير من نحن</h1>
            <p className="mt-1 text-sm text-slate-600">عدّل كل نصوص صفحة من نحن مباشرة من لوحة التحكم.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800"
            >
              <Link to="/contact" target="_blank" rel="noreferrer">
                <ExternalLink className="ms-2 h-4 w-4" />
                معاينة الصفحة
              </Link>
            </Button>
            <Button type="button" className="bg-[#36164f] text-white hover:bg-[#2f1344]" onClick={handleSave}>
              <Save className="ms-2 h-4 w-4" />
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-2xl border border-violet-200 bg-white/95 p-5">
          <h2 className="mb-4 text-right font-display text-lg font-semibold text-slate-900">الهيدر</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">نص أعلى العنوان</Label>
              <Input value={draft.heroEyebrow} onChange={(e) => setField("heroEyebrow", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">العنوان (جزء 1)</Label>
              <Input value={draft.heroTitleA} onChange={(e) => setField("heroTitleA", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">العنوان (جزء 2)</Label>
              <Input value={draft.heroTitleB} onChange={(e) => setField("heroTitleB", e.target.value)} className={inputClassName} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-white/95 p-5">
          <h2 className="mb-4 text-right font-display text-lg font-semibold text-slate-900">قسم من نحن</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">الوسم الصغير</Label>
              <Input value={draft.aboutEyebrow} onChange={(e) => setField("aboutEyebrow", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">العنوان</Label>
              <Input value={draft.aboutTitle} onChange={(e) => setField("aboutTitle", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right sm:col-span-2">
              <Label className="text-slate-700">الوصف</Label>
              <Textarea value={draft.aboutBody} onChange={(e) => setField("aboutBody", e.target.value)} className={textareaClassName} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-white/95 p-5">
          <h2 className="mb-4 text-right font-display text-lg font-semibold text-slate-900">رؤيتنا وكيف نعمل</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
              <div className="space-y-2 text-right">
                <Label className="text-slate-700">عنوان الرؤية</Label>
                <Input value={draft.visionTitle} onChange={(e) => setField("visionTitle", e.target.value)} className={inputClassName} />
              </div>
              <div className="mt-3 space-y-2 text-right">
                <Label className="text-slate-700">وصف الرؤية</Label>
                <Textarea value={draft.visionBody} onChange={(e) => setField("visionBody", e.target.value)} className={textareaClassName} />
              </div>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
              <div className="space-y-2 text-right">
                <Label className="text-slate-700">عنوان كيف نعمل</Label>
                <Input value={draft.workTitle} onChange={(e) => setField("workTitle", e.target.value)} className={inputClassName} />
              </div>
              <div className="mt-3 space-y-2 text-right">
                <Label className="text-slate-700">وصف كيف نعمل</Label>
                <Textarea value={draft.workBody} onChange={(e) => setField("workBody", e.target.value)} className={textareaClassName} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-white/95 p-5">
          <h2 className="mb-4 text-right font-display text-lg font-semibold text-slate-900">قسم المميزات</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">عنوان القسم</Label>
              <Input value={draft.featuresTitle} onChange={(e) => setField("featuresTitle", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">وصف القسم</Label>
              <Input
                value={draft.featuresSubtitle}
                onChange={(e) => setField("featuresSubtitle", e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {draft.pillars.map((item, index) => (
              <PillarEditor
                key={index}
                index={index}
                title={item.title}
                body={item.body}
                onTitleChange={(next) => setPillarField(index, "title", next)}
                onBodyChange={(next) => setPillarField(index, "body", next)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-white/95 p-5">
          <h2 className="mb-4 text-right font-display text-lg font-semibold text-slate-900">قسم الديسكورد</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">العنوان</Label>
              <Input value={draft.discordTitle} onChange={(e) => setField("discordTitle", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">نص زر الديسكورد</Label>
              <Input
                value={draft.discordButtonLabel}
                onChange={(e) => setField("discordButtonLabel", e.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2 text-right sm:col-span-2">
              <Label className="text-slate-700">الوصف</Label>
              <Textarea value={draft.discordBody} onChange={(e) => setField("discordBody", e.target.value)} className={textareaClassName} />
            </div>
            <div className="space-y-2 text-right sm:col-span-2">
              <Label className="text-slate-700">ملاحظة أسفل القسم</Label>
              <Textarea
                value={draft.discordFootnote}
                onChange={(e) => setField("discordFootnote", e.target.value)}
                className={textareaClassName}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-white/95 p-5">
          <h2 className="mb-4 text-right font-display text-lg font-semibold text-slate-900">الصندوق الختامي</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">العنوان</Label>
              <Input value={draft.ctaTitle} onChange={(e) => setField("ctaTitle", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">نص الزر</Label>
              <Input value={draft.ctaButtonLabel} onChange={(e) => setField("ctaButtonLabel", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right sm:col-span-2">
              <Label className="text-slate-700">الوصف</Label>
              <Textarea value={draft.ctaBody} onChange={(e) => setField("ctaBody", e.target.value)} className={textareaClassName} />
            </div>
          </div>
        </div>
      </div>

      {isDirty ? (
        <p className="text-right text-xs text-amber-700">يوجد تغييرات غير محفوظة. اضغط حفظ التغييرات لتطبيقها على صفحة من نحن.</p>
      ) : null}
    </section>
  );
};

export default AboutManagerPage;
