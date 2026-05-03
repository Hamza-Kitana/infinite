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
import { Car, GripVertical, ImagePlus, Plus, RotateCcw, Trash2 } from "lucide-react";
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
import { useVipCarsContent } from "@/contexts/VipCarsContentContext";
import { appendActivityLog } from "@/lib/activityLog";
import type { VipCatalogCar } from "@/data/vipCarsCatalog";
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
    fromLatin.length >= 2 ? fromLatin : `vip-${crypto.randomUUID().slice(0, 8)}`;
  const set = new Set(existingIds);
  if (!set.has(base)) return base;
  let i = 2;
  while (set.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function SortableCarRow({
  car,
  active,
  onSelect,
}: {
  car: VipCatalogCar;
  active: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: car.id,
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
          src={car.thumbnailUrl}
          alt=""
          className="h-12 w-16 shrink-0 rounded-lg object-cover border border-primary/20"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-semibold">{car.name}</p>
          <p className="truncate font-mono text-[10px] text-muted-foreground" dir="ltr">
            {car.id} · ${car.priceUsd}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 font-display text-[10px]",
            car.taken ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-600",
          )}
        >
          {car.taken ? "مأخوذة" : "متاحة"}
        </span>
      </button>
    </div>
  );
}

const emptyCar = (): VipCatalogCar => ({
  id: "",
  name: "",
  nameEn: "",
  thumbnailUrl: "/placeholder.svg",
  galleryUrls: [],
  priceUsd: 100,
  description: "",
  modifiable: true,
  taken: false,
  stats: {
    topSpeed: "~250 كم/س",
    acceleration: "~5 ث · 0→100",
    performance: { speed: 70, acceleration: 70, handling: 70, braking: 70 },
  },
});

const VipCarsEditorPage = () => {
  const { user } = useAuth();
  const { cars, reorder, add, update, remove, resetToDefaults } = useVipCarsContent();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [editing, setEditing] = useState<VipCatalogCar>(emptyCar());
  const [galleryText, setGalleryText] = useState("");
  const thumbRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!selectedId && cars.length > 0) setSelectedId(cars[0].id);
    if (selectedId && !cars.some((c) => c.id === selectedId)) {
      setSelectedId(cars[0]?.id ?? null);
    }
  }, [cars, selectedId]);

  const selected = cars.find((c) => c.id === selectedId) ?? null;

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = cars.findIndex((c) => c.id === active.id);
    const newIndex = cars.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    reorder(oldIndex, newIndex);
    toast.success("تم تحديث الترتيب");
  };

  const openNew = () => {
    setIsNew(true);
    setEditing(emptyCar());
    setGalleryText("");
    setDialogOpen(true);
  };

  const openEdit = (c: VipCatalogCar) => {
    setIsNew(false);
    setEditing({ ...c, galleryUrls: [...c.galleryUrls], stats: { ...c.stats, performance: { ...c.stats.performance } } });
    setGalleryText(c.galleryUrls.join("\n"));
    setDialogOpen(true);
  };

  const onThumbFile = useCallback(async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("صورة الغلاف كبيرة جداً (حدّاً 2 ميجابايت).");
      return;
    }
    try {
      const url = await readFileAsDataUrl(file);
      setEditing((p) => ({ ...p, thumbnailUrl: url }));
      toast.success("تم تحميل الغلاف");
    } catch {
      toast.error("تعذر قراءة الملف");
    }
  }, []);

  const onGalleryFile = useCallback(async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("صورة المعرض كبيرة جداً.");
      return;
    }
    try {
      const url = await readFileAsDataUrl(file);
      setEditing((p) => ({ ...p, galleryUrls: [...p.galleryUrls, url] }));
      setGalleryText((t) => (t.trim() ? `${t.trim()}\n${url}` : url));
      toast.success("أُضيفت للمعرض");
    } catch {
      toast.error("تعذر قراءة الملف");
    }
  }, []);

  const saveDialog = () => {
    const name = editing.name.trim();
    if (!name) {
      toast.error("اسم السيارة مطلوب");
      return;
    }
    const gallery = galleryText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (gallery.length < 1) {
      toast.error("أضف رابطاً واحداً على الأقل لمعرض الصور (سطر لكل رابط)");
      return;
    }

    const priceUsd = Math.max(0, Math.round(Number(editing.priceUsd)) || 0);

    const full: VipCatalogCar = {
      id: editing.id,
      name,
      nameEn: editing.nameEn?.trim() || undefined,
      thumbnailUrl: editing.thumbnailUrl.trim() || "/placeholder.svg",
      galleryUrls: gallery,
      priceUsd,
      description: editing.description.trim(),
      modifiable: editing.modifiable,
      taken: editing.taken,
      stats: {
        topSpeed: editing.stats.topSpeed.trim() || "—",
        acceleration: editing.stats.acceleration.trim() || "—",
        performance: {
          speed: clampPct(editing.stats.performance.speed),
          acceleration: clampPct(editing.stats.performance.acceleration),
          handling: clampPct(editing.stats.performance.handling),
          braking: clampPct(editing.stats.performance.braking),
        },
      },
    };

    if (isNew) {
      const existingIds = cars.map((c) => c.id);
      const id = editing.id.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 48) || suggestId(name, existingIds);
      if (existingIds.includes(id)) {
        toast.error("المعرّف مستخدم");
        return;
      }
      add({ ...full, id });
      setSelectedId(id);
      appendActivityLog(user?.username ?? "—", "VIP: إضافة سيارة", full.name);
      toast.success("تمت الإضافة");
    } else {
      update(editing.id, { ...full, id: editing.id });
      appendActivityLog(user?.username ?? "—", "VIP: تعديل سيارة", full.name);
      toast.success("تم الحفظ");
    }
    setDialogOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 text-right sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center justify-end gap-2">
            <Car className="h-7 w-7 text-primary" />
            مدير سيارات VIP
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            نفس حقول كتالوج السيارات الحالية. التعديل يظهر في{" "}
            <a href="/vip-cars" target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
              /vip-cars
            </a>{" "}
            مباشرةً.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={openNew}>
            <Plus className="ms-1 h-4 w-4" /> سيارة جديدة
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="border-warning/40 text-warning">
                <RotateCcw className="ms-1 h-4 w-4" /> استعادة الافتراضي
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader className="text-right">
                <AlertDialogTitle>استعادة الكتالوج الأصلي؟</AlertDialogTitle>
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
            <SortableContext items={cars.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {cars.map((car) => (
                  <SortableCarRow
                    key={car.id}
                    car={car}
                    active={selectedId === car.id}
                    onSelect={() => setSelectedId(car.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="min-w-0 space-y-4 rounded-2xl border border-primary/20 bg-card/40 p-4 sm:p-6">
          {!selected ? (
            <p className="text-center text-muted-foreground">لا توجد سيارات.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-primary/15 pb-4">
                <div className="text-right min-w-0">
                  <h2 className="font-display text-xl font-bold">{selected.name}</h2>
                  <p className="font-mono text-xs text-muted-foreground" dir="ltr">
                    {selected.id}
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
              <div className="flex flex-wrap gap-4">
                <img
                  src={selected.thumbnailUrl}
                  alt=""
                  className="h-24 w-32 rounded-xl object-cover border border-primary/25"
                />
                <p className="min-w-0 flex-1 text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
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
                {isNew ? "سيارة VIP جديدة" : "تعديل السيارة"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                املأ الأقسام بالترتيب، ثم احفظ — يظهر التحديث فوراً في صفحة الكتالوج.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8">
            <EditorDialogSection title="التعريف">
              {isNew ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">المعرّف (اختياري)</Label>
                  <Input
                    className={cn(editorDialogMonoClass, "mt-1.5")}
                    dir="ltr"
                    placeholder="my-car"
                    value={editing.id}
                    onChange={(e) =>
                      setEditing((p) => ({
                        ...p,
                        id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 48),
                      }))
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">اتركه فارغاً ليُولَّد تلقائياً من الاسم.</p>
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
                <Label className="text-xs font-medium text-muted-foreground">الاسم</Label>
                <Input
                  className={cn(editorDialogInputClass, "mt-1.5")}
                  value={editing.name}
                  onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">الاسم بالإنجليزية (اختياري)</Label>
                <Input
                  className={cn(editorDialogMonoClass, "mt-1.5")}
                  dir="ltr"
                  value={editing.nameEn ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, nameEn: e.target.value }))}
                />
              </div>
            </EditorDialogSection>

            <EditorDialogSection title="السعر والحالة">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">السعر (USD)</Label>
                  <Input
                    type="number"
                    min={0}
                    className={cn(editorDialogMonoClass, "mt-1.5")}
                    dir="ltr"
                    value={editing.priceUsd}
                    onChange={(e) => setEditing((p) => ({ ...p, priceUsd: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">قابلة للتعديل داخل اللعبة</Label>
                  <Select
                    value={editing.modifiable ? "yes" : "no"}
                    onValueChange={(v) => setEditing((p) => ({ ...p, modifiable: v === "yes" }))}
                  >
                    <SelectTrigger className={cn(editorDialogInputClass, "mt-1.5")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="yes">نعم</SelectItem>
                      <SelectItem value="no">لا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">حالة السيارة</Label>
                  <Select
                    value={editing.taken ? "yes" : "no"}
                    onValueChange={(v) => setEditing((p) => ({ ...p, taken: v === "yes" }))}
                  >
                    <SelectTrigger className={cn(editorDialogInputClass, "mt-1.5")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="no">متاحة</SelectItem>
                      <SelectItem value="yes">مأخوذة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </EditorDialogSection>

            <EditorDialogSection title="الوصف">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">نص الوصف</Label>
                <Textarea
                  className={cn(editorDialogTextareaClass, "mt-1.5 min-h-[100px]")}
                  value={editing.description}
                  onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </EditorDialogSection>

            <EditorDialogSection title="إحصائيات العرض (نص)">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">أقصى سرعة</Label>
                  <Input
                    className={cn(editorDialogInputClass, "mt-1.5")}
                    value={editing.stats.topSpeed}
                    onChange={(e) =>
                      setEditing((p) => ({ ...p, stats: { ...p.stats, topSpeed: e.target.value } }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">التسارع</Label>
                  <Input
                    className={cn(editorDialogInputClass, "mt-1.5")}
                    value={editing.stats.acceleration}
                    onChange={(e) =>
                      setEditing((p) => ({ ...p, stats: { ...p.stats, acceleration: e.target.value } }))
                    }
                  />
                </div>
              </div>
            </EditorDialogSection>

            <EditorDialogSection title="مخطط الأداء (0–100)">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["speed", "السرعة (شريط)"],
                    ["acceleration", "التسارع (شريط)"],
                    ["handling", "التحكم (شريط)"],
                    ["braking", "الكبح (شريط)"],
                  ] as const
                ).map(([k, label]) => (
                  <div key={k} className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className={cn(editorDialogMonoClass, "mt-1.5")}
                      dir="ltr"
                      value={editing.stats.performance[k]}
                      onChange={(e) =>
                        setEditing((p) => ({
                          ...p,
                          stats: {
                            ...p.stats,
                            performance: {
                              ...p.stats.performance,
                              [k]: clampPct(Number(e.target.value)),
                            },
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </EditorDialogSection>

            <EditorDialogSection title="صورة الغلاف">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">رابط الصورة</Label>
                <Input
                  className={cn(editorDialogMonoClass, "mt-1.5")}
                  dir="ltr"
                  value={editing.thumbnailUrl.startsWith("data:") ? "" : editing.thumbnailUrl}
                  onChange={(e) => setEditing((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                />
                <input
                  ref={thumbRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onThumbFile(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2 rounded-lg"
                  onClick={() => thumbRef.current?.click()}
                >
                  <ImagePlus className="ms-2 h-4 w-4" /> رفع غلاف من الجهاز
                </Button>
              </div>
              <div className="mt-3 flex justify-center rounded-lg border border-dashed border-primary/25 bg-background/40 p-3">
                <img
                  src={editing.thumbnailUrl || "/placeholder.svg"}
                  alt=""
                  className="max-h-36 max-w-full rounded-md border border-border/60 object-contain"
                />
              </div>
            </EditorDialogSection>

            <EditorDialogSection title="معرض الصور">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">رابط لكل سطر</Label>
                <Textarea
                  className={cn(editorDialogTextareaClass, "mt-1.5 min-h-[100px] font-mono text-sm")}
                  dir="ltr"
                  value={galleryText}
                  onChange={(e) => {
                    setGalleryText(e.target.value);
                    const lines = e.target.value
                      .split("\n")
                      .map((l) => l.trim())
                      .filter(Boolean);
                    setEditing((p) => ({ ...p, galleryUrls: lines }));
                  }}
                />
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onGalleryFile(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-lg"
                  onClick={() => galleryRef.current?.click()}
                >
                  <ImagePlus className="ms-2 h-4 w-4" /> إضافة صورة للمعرض
                </Button>
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

export default VipCarsEditorPage;
