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
import { GripVertical, ImagePlus, Plus, RotateCcw, Trash2, Video } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useStreamersContent } from "@/contexts/StreamersContentContext";
import { appendActivityLog } from "@/lib/activityLog";
import type { StreamerEntry } from "@/types/streamersSchema";
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

function SortableStreamerRow({
  entry,
  active,
  onSelect,
}: {
  entry: StreamerEntry;
  active: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
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
          src={entry.image}
          alt=""
          className="h-12 w-12 shrink-0 rounded-lg object-cover border border-primary/20"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-semibold">{entry.name}</p>
          <p className="truncate text-xs text-muted-foreground">{entry.role}</p>
        </div>
      </button>
    </div>
  );
}

const emptyForm: Omit<StreamerEntry, "id"> = {
  name: "",
  role: "صانع محتوى معتمد",
  bio: "",
  streamUrl: "",
  image: "/placeholder.svg",
};

const StreamersEditorPage = () => {
  const { user } = useAuth();
  const { items, reorder, add, update, remove, resetToDefaults } = useStreamersContent();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Omit<StreamerEntry, "id"> & { id?: string }>(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!selectedId && items.length > 0) setSelectedId(items[0].id);
    if (selectedId && !items.some((x) => x.id === selectedId)) {
      setSelectedId(items[0]?.id ?? null);
    }
  }, [items, selectedId]);

  const selected = items.find((x) => x.id === selectedId) ?? null;

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((x) => x.id === active.id);
    const newIndex = items.findIndex((x) => x.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    reorder(oldIndex, newIndex);
    toast.success("تم تحديث الترتيب");
  };

  const openNew = () => {
    setEditing({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (s: StreamerEntry) => {
    setEditing({
      id: s.id,
      name: s.name,
      role: s.role,
      bio: s.bio,
      streamUrl: s.streamUrl,
      image: s.image,
    });
    setDialogOpen(true);
  };

  const onPickFile = useCallback(
    async (file: File | null) => {
      if (!file || !file.type.startsWith("image/")) return;
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error("حجم الصورة كبير جداً (الحد حوالي 2 ميجابايت). جرّب صورة أصغر.");
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setEditing((prev) => ({ ...prev, image: dataUrl }));
        toast.success("تم تحميل الصورة — احفظ لتطبيقها");
      } catch {
        toast.error("تعذر قراءة الملف");
      }
    },
    [],
  );

  const saveDialog = () => {
    const name = editing.name.trim();
    const streamUrl = editing.streamUrl.trim();
    if (!name || !streamUrl) {
      toast.error("الاسم ورابط البث مطلوبان");
      return;
    }
    const payload: Omit<StreamerEntry, "id"> = {
      name,
      role: editing.role.trim() || "صانع محتوى معتمد",
      bio: editing.bio.trim(),
      streamUrl,
      image: editing.image.trim() || "/placeholder.svg",
    };
    if (editing.id) {
      update(editing.id, payload);
      appendActivityLog(user?.username ?? "—", "ستريمرز: تعديل", name);
      toast.success("تم حفظ التعديلات");
    } else {
      const id = add(payload);
      setSelectedId(id);
      appendActivityLog(user?.username ?? "—", "ستريمرز: إضافة", name);
      toast.success("تمت الإضافة");
    }
    setDialogOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 text-right sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center justify-end gap-2">
            <Video className="h-7 w-7 text-primary" />
            ستريمر منجر — صنّاع المحتوى
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            أضف، عدّل، احذف، ورتّب البطاقات. الصور تُخزَّن في المتصفح (رفع يتحول إلى Data URL). التحديث يظهر في{" "}
            <a href="/streamers" target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
              /streamers
            </a>{" "}
            فوراً.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={openNew}>
            <Plus className="ms-1 h-4 w-4" /> صانع جديد
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
                <AlertDialogDescription>
                  سيُستبدل كل المحتوى الحالي بالقائمة الافتراضية من المشروع.
                </AlertDialogDescription>
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
            <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {items.map((entry) => (
                  <SortableStreamerRow
                    key={entry.id}
                    entry={entry}
                    active={selectedId === entry.id}
                    onSelect={() => setSelectedId(entry.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="min-w-0 space-y-4 rounded-2xl border border-primary/20 bg-card/40 p-4 sm:p-6">
          {!selected ? (
            <p className="text-center text-muted-foreground">لا يوجد صنّاع محتوى.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-primary/15 pb-4">
                <div className="text-right">
                  <h2 className="font-display text-xl font-bold">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">{selected.streamUrl}</p>
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
                            appendActivityLog(user?.username ?? "—", "ستريمرز: حذف", selected.name);
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
              <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                <img
                  src={selected.image}
                  alt=""
                  className="aspect-square w-full max-w-[140px] rounded-xl object-cover border border-primary/25 mx-auto sm:mx-0"
                />
                <div className="space-y-2 text-right text-sm">
                  <p>
                    <span className="text-muted-foreground">الدور:</span> {selected.role}
                  </p>
                  <p className="leading-relaxed text-muted-foreground">{selected.bio}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          dir="rtl"
          className="flex max-h-[min(90dvh,90svh)] w-[calc(100%-1rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl border border-primary/25 bg-card p-0 shadow-[0_24px_64px_-16px_hsl(240_40%_2%/0.88)] sm:w-full lg:max-w-5xl"
        >
          <div className="shrink-0 border-b border-border/60 bg-[radial-gradient(ellipse_100%_120%_at_50%_0%,hsl(var(--primary)/0.14),transparent_58%)] px-6 pb-4 pt-14 sm:px-8 sm:pt-16">
            <DialogHeader className="space-y-1.5 text-right sm:text-right">
              <DialogTitle className="font-display text-xl font-bold sm:text-2xl">
                {editing.id ? "تعديل صانع محتوى" : "صانع محتوى جديد"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                البيانات تُحفظ في المتصفح — اربط البث والصورة ثم احفظ.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8">
            <EditorDialogSection title="البطاقة">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">الاسم</Label>
                <Input
                  className={cn(editorDialogInputClass, "mt-1.5")}
                  value={editing.name}
                  onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">الدور (على البطاقة)</Label>
                <Input
                  className={cn(editorDialogInputClass, "mt-1.5")}
                  value={editing.role}
                  onChange={(e) => setEditing((p) => ({ ...p, role: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">نبذة</Label>
                <Textarea
                  className={cn(editorDialogTextareaClass, "mt-1.5 min-h-[88px]")}
                  value={editing.bio}
                  onChange={(e) => setEditing((p) => ({ ...p, bio: e.target.value }))}
                />
              </div>
            </EditorDialogSection>

            <EditorDialogSection title="البث">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">رابط البث (Kick أو غيره)</Label>
                <Input
                  className={cn(editorDialogMonoClass, "mt-1.5")}
                  dir="ltr"
                  value={editing.streamUrl}
                  onChange={(e) => setEditing((p) => ({ ...p, streamUrl: e.target.value }))}
                />
              </div>
            </EditorDialogSection>

            <EditorDialogSection title="الصورة">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">مسار أو رابط</Label>
                <Input
                  className={cn(editorDialogMonoClass, "mt-1.5")}
                  dir="ltr"
                  placeholder="/hg.webp أو https://..."
                  value={editing.image.startsWith("data:") ? "" : editing.image}
                  onChange={(e) => setEditing((p) => ({ ...p, image: e.target.value }))}
                />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  رفع ملف من الجهاز يتجاوز الرابط أعلاه ويُحفظ مع «حفظ التغييرات».
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onPickFile(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-1 rounded-lg"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImagePlus className="ms-2 h-4 w-4" />
                  رفع صورة من الجهاز
                </Button>
                {editing.image.startsWith("data:") ? (
                  <p className="text-xs text-primary">تم اختيار صورة مرفوعة — اضغط حفظ لتثبيتها.</p>
                ) : null}
              </div>
              <div className="mt-3 flex justify-center rounded-lg border border-dashed border-primary/25 bg-background/40 p-3">
                <img
                  src={editing.image || "/placeholder.svg"}
                  alt=""
                  className="max-h-40 max-w-full rounded-md border border-border/60 object-contain"
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

export default StreamersEditorPage;
