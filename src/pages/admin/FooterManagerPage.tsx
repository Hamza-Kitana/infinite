import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { appendActivityLog } from "@/lib/activityLog";
import {
  loadFooterContent,
  saveFooterContent,
  type FooterContent,
  type FooterQuickLink,
} from "@/lib/footerContent";

const inputClassName = "border-violet-200 bg-white text-slate-900 placeholder:text-slate-400";

const FooterManagerPage = () => {
  const { user } = useAuth();
  const [draft, setDraft] = useState<FooterContent>(() => loadFooterContent());
  const [savedSnapshot, setSavedSnapshot] = useState<FooterContent>(() => loadFooterContent());

  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedSnapshot);

  const setField = <K extends keyof FooterContent>(key: K, value: FooterContent[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const setQuickLink = (id: string, patch: Partial<FooterQuickLink>) => {
    setDraft((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const addQuickLink = () => {
    setDraft((prev) => ({
      ...prev,
      quickLinks: [...prev.quickLinks, { id: crypto.randomUUID(), label: "رابط جديد", to: "/" }],
    }));
  };

  const removeQuickLink = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks.filter((item) => item.id !== id),
    }));
  };

  const handleSave = () => {
    const filteredLinks = draft.quickLinks.filter((item) => item.label.trim() && item.to.trim());
    if (filteredLinks.length === 0) {
      toast.error("أضف رابطاً واحداً على الأقل في الفوتر");
      return;
    }
    const payload: FooterContent = { ...draft, quickLinks: filteredLinks };
    saveFooterContent(payload);
    setDraft(payload);
    setSavedSnapshot(payload);
    appendActivityLog(user?.username ?? "admin", "تحديث الفوتر", "تم حفظ إعدادات الفوتر");
    toast.success("تم حفظ تعديلات الفوتر");
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-violet-200 bg-white/95 p-5 shadow-[0_18px_44px_-30px_rgba(54,22,79,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="text-right">
            <h1 className="font-display text-2xl font-bold text-slate-900">مدير الفوتر</h1>
            <p className="mt-1 text-sm text-slate-600">تعديل نصوص وروابط الفوتر مع إمكانية الإضافة والحذف.</p>
          </div>
          <Button type="button" className="bg-[#36164f] text-white hover:bg-[#2f1344]" onClick={handleSave}>
            <Save className="ms-2 h-4 w-4" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-2xl border border-violet-200 bg-white/95 p-5">
          <h2 className="mb-4 text-right font-display text-lg font-semibold text-slate-900">روابط التصفح السريع</h2>
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button type="button" variant="outline" className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50" onClick={addQuickLink}>
                <Plus className="ms-2 h-4 w-4" />
                إضافة رابط
              </Button>
            </div>
            <div className="space-y-3">
              {draft.quickLinks.map((item) => (
                <div key={item.id} className="rounded-xl border border-violet-200 bg-violet-50/40 p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <div className="space-y-2 text-right">
                      <Label className="text-slate-700">اسم الرابط</Label>
                      <Input value={item.label} onChange={(e) => setQuickLink(item.id, { label: e.target.value })} className={inputClassName} />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label className="text-slate-700">المسار أو الرابط</Label>
                      <Input
                        value={item.to}
                        onChange={(e) => setQuickLink(item.id, { to: e.target.value })}
                        className={inputClassName}
                        placeholder="/path أو https://example.com"
                        dir="ltr"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
                        onClick={() => removeQuickLink(item.id)}
                      >
                        <Trash2 className="ms-2 h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-white/95 p-5">
          <h2 className="mb-4 text-right font-display text-lg font-semibold text-slate-900">النصوص العامة</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">عنوان روابط التصفح</Label>
              <Input value={draft.quickLinksTitle} onChange={(e) => setField("quickLinksTitle", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">عنوان قسم التواصل</Label>
              <Input value={draft.contactTitle} onChange={(e) => setField("contactTitle", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right sm:col-span-2">
              <Label className="text-slate-700">وصف قسم التواصل</Label>
              <Textarea
                value={draft.contactBody}
                onChange={(e) => setField("contactBody", e.target.value)}
                className="min-h-[96px] border-violet-200 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">نص زر الديسكورد</Label>
              <Input value={draft.discordLabel} onChange={(e) => setField("discordLabel", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">رابط الديسكورد</Label>
              <Input value={draft.discordUrl} onChange={(e) => setField("discordUrl", e.target.value)} className={inputClassName} dir="ltr" />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">نص الحقوق</Label>
              <Input value={draft.rightsText} onChange={(e) => setField("rightsText", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">نص صُنع بعناية</Label>
              <Input value={draft.madeWithText} onChange={(e) => setField("madeWithText", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">وسم المبرمج</Label>
              <Input value={draft.developerLabel} onChange={(e) => setField("developerLabel", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-slate-700">اسم المبرمج</Label>
              <Input value={draft.developerName} onChange={(e) => setField("developerName", e.target.value)} className={inputClassName} />
            </div>
            <div className="space-y-2 text-right sm:col-span-2">
              <Label className="text-slate-700">رابط المبرمج</Label>
              <Input
                value={draft.developerUrl}
                onChange={(e) => setField("developerUrl", e.target.value)}
                className={inputClassName}
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>

      {isDirty ? <p className="text-right text-xs text-amber-700">يوجد تغييرات غير محفوظة في الفوتر.</p> : null}
    </section>
  );
};

export default FooterManagerPage;
