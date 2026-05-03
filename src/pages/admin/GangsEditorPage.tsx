import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Plus, RotateCcw, Shield, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EditorDialogSection,
  editorDialogInputClass,
  editorDialogMonoClass,
  editorDialogTextareaClass,
} from "@/components/admin/EditorDialogSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useGangsContent } from "@/contexts/GangsContentContext";
import { appendActivityLog } from "@/lib/activityLog";
import type { GangCard, GangStatus } from "@/types/gangsSchema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("read"));
    r.readAsDataURL(file);
  });
}

function suggestId(name: string, existingIds: string[]): string {
  const fromLatin = name
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 40);
  const base =
    fromLatin.length >= 2 ? fromLatin : `gang-${crypto.randomUUID().slice(0, 8)}`;
  const set = new Set(existingIds);
  if (!set.has(base)) return base;
  let i = 2;
  while (set.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

function SortableGangRow({
  gang,
  active,
  onSelect,
}: {
  gang: GangCard;
  active: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: gang.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-stretch gap-2 rounded-xl border bg-card/60 p-2 text-right transition-shadow",
        active ? "border-primary/50 ring-1 ring-primary/30" : "border-primary/15",
        isDragging && "z-20 opacity-90 shadow-lg",
      )}
    >
      <button
        type="button"
        className="inline-flex w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-primary/25 text-muted-foreground cursor-grab touch-manipulation active:cursor-grabbing"
        aria-label="سحب للترتيب"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1 text-right">
        <img
          src={gang.logoImage}
          alt=""
          className="h-12 w-12 shrink-0 rounded-lg object-cover border border-primary/20"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-semibold">{gang.name}</p>
          <p className="truncate font-mono text-[10px] text-muted-foreground" dir="ltr">
            {gang.id}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 font-display text-[10px]",
            gang.status === "taken" ? "bg-amber-500/15 text-amber-600" : "bg-emerald-500/15 text-emerald-600",
          )}
        >
          {gang.status === "taken" ? "مأخوذة" : "متاحة"}
        </span>
      </button>
    </div>
  );
}

const emptyForm: GangCard = {
  id: "",
  name: "",
  nameEn: "",
  specialty: "",
  location: "",
  description: "",
  youtubeVideo: "",
  logoImage: "/INF_LOGO.png",
  status: "available",
  brandColor: "#9333EA",
  profilePoints: ["", "", ""],
  leaderName: "",
};

const GangsEditorPage = () => {
  const { user } = useAuth();
  const { gangs, reorder, add, update, remove, resetToDefaults } = useGangsContent();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GangCard>(emptyForm);
  const [isNew, setIsNew] = useState(false);
  const [pointsText, setPointsText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!selectedId && gangs.length > 0) setSelectedId(gangs[0].id);
    if (selectedId && !gangs.some((g) => g.id === selectedId)) {
      setSelectedId(gangs[0]?.id ?? null);
    }
  }, [gangs, selectedId]);

  const selected = gangs.find((g) => g.id === selectedId) ?? null;

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = gangs.findIndex((g) => g.id === active.id);
    const newIndex = gangs.findIndex((g) => g.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    reorder(oldIndex, newIndex);
    toast.success("تم تحديث الترتيب");
  };

  const openNew = () => {
    setIsNew(true);
    setEditing({ ...emptyForm, profilePoints: ["", "", ""] });
    setPointsText(["", "", ""].join("\n"));
    setDialogOpen(true);
  };

  const openEdit = (g: GangCard) => {
    setIsNew(false);
    setEditing({ ...g, profilePoints: [...g.profilePoints] });
    setPointsText(g.profilePoints.join("\n"));
    setDialogOpen(true);
  };

  const onPickLogo = useCallback(async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("حجم الصورة كبير جداً (حدّاً 2 ميجابايت تقريباً).");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditing((p) => ({ ...p, logoImage: dataUrl }));
      toast.success("تم تحميل الشعار");
    } catch {
      toast.error("تعذر قراءة الملف");
    }
  }, []);

  const saveDialog = () => {
    const name = editing.name.trim();
    if (!name) {
      toast.error("اسم العصابة مطلوب");
      return;
    }
    const points = pointsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (points.length < 1) {
      toast.error("أضف سطراً واحداً على الأقل في «نقاط الهوية»");
      return;
    }

    const payload: Omit<GangCard, "id"> & { id?: string } = {
      name,
      nameEn: editing.nameEn?.trim() || undefined,
      specialty: editing.specialty.trim(),
      location: editing.location.trim(),
      description: editing.description.trim(),
      youtubeVideo: editing.youtubeVideo.trim(),
      logoImage: editing.logoImage.trim() || "/INF_LOGO.png",
      status: editing.status,
      brandColor: editing.brandColor.trim() || "#9333EA",
      profilePoints: points,
      leaderName:
        editing.status === "taken" ? (editing.leaderName?.trim() || "مجهول") : undefined,
    };

    if (isNew) {
      const existingIds = gangs.map((g) => g.id);
      const manual = editing.id.trim().toLowerCase();
      const id = manual || suggestId(name, existingIds);
      if (existingIds.includes(id)) {
        toast.error("المعرّف مستخدم — اختر معرّفاً آخر أو اترك الحقل ليُولَّد تلقائياً");
        return;
      }
      add({ ...payload, id } as GangCard);
      setSelectedId(id);
      appendActivityLog(user?.username ?? "—", "عصابات: إضافة", name);
      toast.success("تمت إضافة العصابة");
    } else {
      const id = editing.id;
      update(id, { ...payload });
      appendActivityLog(user?.username ?? "—", "عصابات: تعديل", name);
      toast.success("تم حفظ التعديلات");
    }
    setDialogOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 text-right sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center justify-end gap-2">
            <Shield className="h-7 w-7 text-primary" />
            مدير العصابات
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            نفس الحقول المعروضة في صفحة العصابات. التعديل يظهر في{" "}
            <a href="/gangs" target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
              /gangs
            </a>{" "}
            مباشرةً.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={openNew}>
            <Plus className="ms-1 h-4 w-4" /> عصابة جديدة
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="border-warning/40 text-warning">
                <RotateCcw className="ms-1 h-4 w-4" /> استعادة الافتراضي
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader className="text-right">
                <AlertDialogTitle>استعادة القائمة الأصلية؟</AlertDialogTitle>
                <AlertDialogDescription>سيُستبدل كل المحتوى الحالي بالبيانات الافتراضية للمشروع.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:justify-start">
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetToDefaults();
                    toast.success("تمت الاستعادة");
                  }}
                >
                  تأكيد
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div className="space-y-3">
          <p className="font-display text-xs tracking-wide text-muted-foreground">الترتيب (اسحب)</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={gangs.map((g) => g.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {gangs.map((gang) => (
                  <SortableGangRow
                    key={gang.id}
                    gang={gang}
                    active={selectedId === gang.id}
                    onSelect={() => setSelectedId(gang.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="min-w-0 space-y-4 rounded-2xl border border-primary/20 bg-card/40 p-4 sm:p-6">
          {!selected ? (
            <p className="text-center text-muted-foreground">لا توجد عصابات.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-primary/15 pb-4">
                <div className="text-right min-w-0">
                  <h2 className="font-display text-xl font-bold">{selected.name}</h2>
                  <p className="font-mono text-xs text-muted-foreground" dir="ltr">
                    id: {selected.id}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(selected)}>
                    تعديل كامل
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" size="sm">
                        <Trash2 className="ms-1 h-4 w-4" /> حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader className="text-right">
                        <AlertDialogTitle>حذف {selected.name}؟</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2 sm:justify-start">
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            appendActivityLog(user?.username ?? "—", "عصابات: حذف", selected.name);
                            remove(selected.id);
                            setSelectedId(null);
                            toast.success("تم الحذف");
                          }}
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                <img
                  src={selected.logoImage}
                  alt=""
                  className="h-28 w-full rounded-xl object-cover border border-primary/25"
                />
                <div className="space-y-1 text-right text-sm">
                  <p className="text-muted-foreground">{selected.specialty}</p>
                  <p>{selected.location}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          dir="rtl"
          className="flex max-h-[min(92dvh,92svh)] w-[calc(100%-1rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl border border-primary/25 bg-card p-0 shadow-[0_24px_64px_-16px_hsl(240_40%_2%/0.88)] sm:w-full lg:max-w-5xl"
        >
          <div className="shrink-0 border-b border-border/60 bg-[radial-gradient(ellipse_100%_120%_at_50%_0%,hsl(var(--primary)/0.14),transparent_58%)] px-6 pb-4 pt-14 sm:px-8 sm:pt-16">
            <DialogHeader className="space-y-1.5 text-right sm:text-right">
              <DialogTitle className="font-display text-xl font-bold sm:text-2xl">
                {isNew ? "عصابة جديدة" : "تعديل العصابة"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                حدّد الهوية والوسائط والحالة، ثم احفظ — يظهر التحديث في صفحة العصابات.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8">
            <EditorDialogSection title="التعريف والمعرّف">
              {isNew ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">المعرّف (اختياري)</Label>
                  <Input
                    className={cn(editorDialogMonoClass, "mt-1.5")}
                    dir="ltr"
                    placeholder="مثال: my-crew"
                    value={editing.id}
                    onChange={(e) =>
                      setEditing((p) => ({
                        ...p,
                        id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 48),
                      }))
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">إن تركته فارغاً يُولَّد تلقائياً من الاسم.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">المعرّف</Label>
                  <Input
                    className={cn(editorDialogMonoClass, "mt-1.5 opacity-80")}
                    dir="ltr"
                    value={editing.id}
                    readOnly
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">الاسم العربي</Label>
                <Input
                  className={cn(editorDialogInputClass, "mt-1.5")}
                  value={editing.name}
                  onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">الاسم الإنجليزي (اختياري)</Label>
                <Input
                  className={cn(editorDialogMonoClass, "mt-1.5")}
                  dir="ltr"
                  value={editing.nameEn ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, nameEn: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">التخصص (السطر فوق الاسم)</Label>
                <Input
                  className={cn(editorDialogInputClass, "mt-1.5")}
                  value={editing.specialty}
                  onChange={(e) => setEditing((p) => ({ ...p, specialty: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">الموقع</Label>
                <Input
                  className={cn(editorDialogInputClass, "mt-1.5")}
                  value={editing.location}
                  onChange={(e) => setEditing((p) => ({ ...p, location: e.target.value }))}
                />
              </div>
            </EditorDialogSection>

            <EditorDialogSection title="المحتوى والوسائط">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">الوصف</Label>
                <Textarea
                  className={cn(editorDialogTextareaClass, "mt-1.5 min-h-[100px]")}
                  value={editing.description}
                  onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">رابط أو معرف يوتيوب</Label>
                <Input
                  className={cn(editorDialogMonoClass, "mt-1.5")}
                  dir="ltr"
                  value={editing.youtubeVideo}
                  onChange={(e) => setEditing((p) => ({ ...p, youtubeVideo: e.target.value }))}
                />
              </div>
            </EditorDialogSection>

            <EditorDialogSection title="الحالة والهوية">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">حالة العصابة</Label>
                <Select
                  value={editing.status}
                  onValueChange={(v) =>
                    setEditing((p) => ({
                      ...p,
                      status: v as GangStatus,
                      leaderName: v === "taken" ? p.leaderName || "مجهول" : undefined,
                    }))
                  }
                >
                  <SelectTrigger className={cn(editorDialogInputClass, "mt-1.5")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="available">متاحة</SelectItem>
                    <SelectItem value="taken">مأخوذة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editing.status === "taken" ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">اسم صاحب العصابة</Label>
                  <Input
                    className={cn(editorDialogInputClass, "mt-1.5")}
                    value={editing.leaderName ?? ""}
                    onChange={(e) => setEditing((p) => ({ ...p, leaderName: e.target.value }))}
                  />
                </div>
              ) : null}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">لون الهوية (HEX)</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    type="color"
                    className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-border/70 p-1"
                    value={/^#[0-9A-Fa-f]{6}$/.test(editing.brandColor) ? editing.brandColor : "#9333EA"}
                    onChange={(e) => setEditing((p) => ({ ...p, brandColor: e.target.value }))}
                  />
                  <Input
                    className={cn(editorDialogMonoClass, "min-w-0 flex-1")}
                    dir="ltr"
                    value={editing.brandColor}
                    onChange={(e) => setEditing((p) => ({ ...p, brandColor: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">نقاط الهوية (سطر لكل نقطة)</Label>
                <Textarea
                  className={cn(editorDialogTextareaClass, "mt-1.5 min-h-[120px] font-mono text-sm")}
                  value={pointsText}
                  onChange={(e) => setPointsText(e.target.value)}
                  placeholder={"سطر 1\nسطر 2\nسطر 3"}
                />
              </div>
            </EditorDialogSection>

            <EditorDialogSection title="الشعار">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">مسار أو رابط</Label>
                <Input
                  className={cn(editorDialogMonoClass, "mt-1.5")}
                  dir="ltr"
                  value={editing.logoImage.startsWith("data:") ? "" : editing.logoImage}
                  onChange={(e) => setEditing((p) => ({ ...p, logoImage: e.target.value }))}
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onPickLogo(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2 rounded-lg"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImagePlus className="ms-2 h-4 w-4" />
                  رفع شعار من الجهاز
                </Button>
              </div>
              <div className="mt-3 flex justify-center rounded-lg border border-dashed border-primary/25 bg-background/40 p-3">
                <img
                  src={editing.logoImage || "/placeholder.svg"}
                  alt=""
                  className="max-h-36 max-w-full rounded-md border border-border/60 object-contain"
                />
              </div>
            </EditorDialogSection>
          </div>

          <div className="shrink-0 border-t border-border/60 bg-background/85 px-6 py-4 backdrop-blur-sm sm:px-8">
            <DialogFooter className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-start sm:gap-3">
              <Button type="button" variant="outline" className="rounded-lg sm:min-w-[7rem]" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="button" className="rounded-lg sm:min-w-[7rem]" onClick={saveDialog}>
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GangsEditorPage;
