import { useCallback, useEffect, useMemo, useState } from "react";
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
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
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
import { LAW_ICON_OPTIONS } from "@/components/laws/lawIcons";
import { useAuth } from "@/contexts/AuthContext";
import { useLawsContent } from "@/contexts/LawsContentContext";
import { appendActivityLog } from "@/lib/activityLog";
import { sectionItemCount } from "@/lib/lawsUtils";
import type { LawTabSection, LawTabSectionRules, PenaltiesBlock, RuleVariant } from "@/types/lawsSchema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const variants: { value: RuleVariant; label: string }[] = [
  { value: "primary", label: "أساسي" },
  { value: "secondary", label: "ثانوي" },
  { value: "accent", label: "مميز" },
  { value: "magenta", label: "مختلط" },
];

function SortableSectionRow({
  section,
  active,
  onSelect,
  count,
}: {
  section: LawTabSection;
  active: boolean;
  onSelect: () => void;
  count: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
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
        className="inline-flex w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-primary/25 text-muted-foreground touch-manipulation cursor-grab active:cursor-grabbing"
        aria-label="سحب لترتيب القسم"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 rounded-lg px-2 py-1.5 text-right"
      >
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 font-display text-[10px]",
              section.kind === "penalties" ? "bg-secondary/20 text-secondary" : "bg-primary/15 text-primary",
            )}
          >
            {section.kind === "penalties" ? "عقوبات" : "بطاقات"}
          </span>
          <span className="font-display font-semibold">{section.label}</span>
          <span className="text-xs text-muted-foreground">({count})</span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{section.short}</p>
      </button>
    </div>
  );
}

function SortableRuleRow({
  id,
  rule,
  onEdit,
  onDelete,
}: {
  id: string;
  rule: { id: number; title: string; description: string };
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-2 rounded-lg border border-border/80 bg-background/50 p-3",
        isDragging && "shadow-md ring-1 ring-primary/30",
      )}
    >
      <button
        type="button"
        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dashed text-muted-foreground cursor-grab touch-manipulation"
        aria-label="سحب لترتيب القانون"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1 text-right">
        <p className="font-display text-sm font-semibold leading-snug">{rule.title}</p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{rule.description}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={onEdit}>
          تعديل
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function PenaltiesBlockEditor({ sectionId, block }: { sectionId: string; block: PenaltiesBlock }) {
  const { updatePenaltiesBlock } = useLawsContent();

  const patch = useCallback(
    (fn: (b: PenaltiesBlock) => PenaltiesBlock) => {
      updatePenaltiesBlock(sectionId, fn);
    },
    [sectionId, updatePenaltiesBlock],
  );

  const moveRow = <T,>(arr: T[], from: number, to: number): T[] => {
    if (to < 0 || to >= arr.length) return arr;
    return arrayMove(arr, from, to);
  };

  return (
    <div className="space-y-10 text-right">
      <section className="space-y-3">
        <h3 className="font-display text-base font-bold">الإنذارات المتدرجة</h3>
        <div className="space-y-2">
          {block.warningLevels.map((w, idx) => (
            <div
              key={`w-${idx}`}
              className="grid gap-2 rounded-lg border border-primary/15 bg-card/40 p-3 sm:grid-cols-[auto_1fr_1fr_auto]"
            >
              <div className="flex flex-row gap-1 sm:flex-col">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={idx === 0}
                  onClick={() =>
                    patch((b) => ({
                      ...b,
                      warningLevels: moveRow(b.warningLevels, idx, idx - 1).map((x, i) => ({
                        ...x,
                        id: i + 1,
                      })),
                    }))
                  }
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={idx === block.warningLevels.length - 1}
                  onClick={() =>
                    patch((b) => ({
                      ...b,
                      warningLevels: moveRow(b.warningLevels, idx, idx + 1).map((x, i) => ({
                        ...x,
                        id: i + 1,
                      })),
                    }))
                  }
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={w.title}
                onChange={(e) =>
                  patch((b) => ({
                    ...b,
                    warningLevels: b.warningLevels.map((x, i) =>
                      i === idx ? { ...x, title: e.target.value } : x,
                    ),
                  }))
                }
                placeholder="العنوان"
              />
              <Input
                value={w.duration}
                onChange={(e) =>
                  patch((b) => ({
                    ...b,
                    warningLevels: b.warningLevels.map((x, i) =>
                      i === idx ? { ...x, duration: e.target.value } : x,
                    ),
                  }))
                }
                placeholder="المدة"
              />
              <Button
                type="button"
                variant="outline"
                className="text-destructive"
                onClick={() =>
                  patch((b) => ({
                    ...b,
                    warningLevels: b.warningLevels
                      .filter((_, i) => i !== idx)
                      .map((x, i) => ({ ...x, id: i + 1 })),
                  }))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            patch((b) => ({
              ...b,
              warningLevels: [
                ...b.warningLevels,
                { id: b.warningLevels.length + 1, title: "جديد", duration: "" },
              ].map((x, i) => ({ ...x, id: i + 1 })),
            }))
          }
        >
          <Plus className="ms-1 h-4 w-4" /> إنذار
        </Button>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-base font-bold">العقوبات المحددة</h3>
        <div className="space-y-2">
          {block.specificPenalties.map((sp, idx) => (
            <div key={`sp-${idx}`} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
              <Input
                value={sp.title}
                onChange={(e) =>
                  patch((b) => ({
                    ...b,
                    specificPenalties: b.specificPenalties.map((x, i) =>
                      i === idx ? { ...x, title: e.target.value } : x,
                    ),
                  }))
                }
              />
              <Input
                value={sp.penalty}
                onChange={(e) =>
                  patch((b) => ({
                    ...b,
                    specificPenalties: b.specificPenalties.map((x, i) =>
                      i === idx ? { ...x, penalty: e.target.value } : x,
                    ),
                  }))
                }
              />
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    patch((b) => ({
                      ...b,
                      specificPenalties: b.specificPenalties
                        .filter((_, i) => i !== idx)
                        .map((x, i) => ({ ...x, id: i + 1 })),
                    }))
                  }
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            patch((b) => ({
              ...b,
              specificPenalties: [
                ...b.specificPenalties,
                { id: b.specificPenalties.length + 1, title: "", penalty: "" },
              ].map((x, i) => ({ ...x, id: i + 1 })),
            }))
          }
        >
          <Plus className="ms-1 h-4 w-4" /> عقوبة
        </Button>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <h4 className="font-display text-sm font-bold">عدد الأشخاص بالسرقات</h4>
          {block.robberyPeopleRules.map((row, idx) => (
            <div key={`rp-${idx}`} className="flex gap-2">
              <Input
                className="flex-1"
                value={row.label}
                onChange={(e) =>
                  patch((b) => ({
                    ...b,
                    robberyPeopleRules: b.robberyPeopleRules.map((x, i) =>
                      i === idx ? { ...x, label: e.target.value } : x,
                    ),
                  }))
                }
              />
              <Input
                className="w-24"
                value={row.value}
                onChange={(e) =>
                  patch((b) => ({
                    ...b,
                    robberyPeopleRules: b.robberyPeopleRules.map((x, i) =>
                      i === idx ? { ...x, value: e.target.value } : x,
                    ),
                  }))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive shrink-0"
                onClick={() =>
                  patch((b) => ({
                    ...b,
                    robberyPeopleRules: b.robberyPeopleRules.filter((_, i) => i !== idx),
                  }))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              patch((b) => ({
                ...b,
                robberyPeopleRules: [...b.robberyPeopleRules, { label: "", value: "" }],
              }))
            }
          >
            <Plus className="ms-1 h-3 w-3" /> صف
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-display text-sm font-bold">وحدات الشرطة المباشرة</h4>
          {block.directPoliceUnitsRules.map((row, idx) => (
            <div key={`dp-${idx}`} className="flex gap-2">
              <Input
                className="flex-1"
                value={row.label}
                onChange={(e) =>
                  patch((b) => ({
                    ...b,
                    directPoliceUnitsRules: b.directPoliceUnitsRules.map((x, i) =>
                      i === idx ? { ...x, label: e.target.value } : x,
                    ),
                  }))
                }
              />
              <Input
                className="w-24"
                value={row.value}
                onChange={(e) =>
                  patch((b) => ({
                    ...b,
                    directPoliceUnitsRules: b.directPoliceUnitsRules.map((x, i) =>
                      i === idx ? { ...x, value: e.target.value } : x,
                    ),
                  }))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive shrink-0"
                onClick={() =>
                  patch((b) => ({
                    ...b,
                    directPoliceUnitsRules: b.directPoliceUnitsRules.filter((_, i) => i !== idx),
                  }))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              patch((b) => ({
                ...b,
                directPoliceUnitsRules: [...b.directPoliceUnitsRules, { label: "", value: "" }],
              }))
            }
          >
            <Plus className="ms-1 h-3 w-3" /> صف
          </Button>
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="font-display text-sm font-bold">المناطق الآمنة</h4>
        {block.safeZones.map((z, idx) => (
          <div key={`sz-${idx}`} className="flex gap-2">
            <Input
              className="w-20 shrink-0 text-lg"
              value={z.icon}
              onChange={(e) =>
                patch((b) => ({
                  ...b,
                  safeZones: b.safeZones.map((x, i) => (i === idx ? { ...x, icon: e.target.value } : x)),
                }))
              }
              placeholder="🏥"
            />
            <Input
              value={z.label}
              onChange={(e) =>
                patch((b) => ({
                  ...b,
                  safeZones: b.safeZones.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                }))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive shrink-0"
              onClick={() =>
                patch((b) => ({
                  ...b,
                  safeZones: b.safeZones.filter((_, i) => i !== idx),
                }))
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            patch((b) => ({
              ...b,
              safeZones: [...b.safeZones, { icon: "📍", label: "" }],
            }))
          }
        >
          <Plus className="ms-1 h-3 w-3" /> منطقة
        </Button>
      </section>
    </div>
  );
}

const LawsEditorPage = () => {
  const { user } = useAuth();
  const {
    sections,
    reorderSections,
    reorderRules,
    addRulesSection,
    addPenaltiesSection,
    deleteSection,
    updateSectionMeta,
    addRule,
    updateRule,
    deleteRule,
    resetToDefaults,
  } = useLawsContent();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addKind, setAddKind] = useState<"rules" | "penalties">("rules");
  const [newLabel, setNewLabel] = useState("");
  const [newShort, setNewShort] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newIcon, setNewIcon] = useState<string>("Scale");
  const [newVariant, setNewVariant] = useState<RuleVariant>("primary");

  const [ruleDialog, setRuleDialog] = useState<{
    mode: "add" | "edit";
    ruleId?: number;
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (!selectedId && sections.length > 0) setSelectedId(sections[0].id);
    if (selectedId && !sections.some((s) => s.id === selectedId)) {
      setSelectedId(sections[0]?.id ?? null);
    }
  }, [sections, selectedId]);

  const selected = useMemo(
    () => sections.find((s) => s.id === selectedId) ?? null,
    [sections, selectedId],
  );

  const sectionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ruleSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onSectionDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    reorderSections(oldIndex, newIndex);
    toast.success("تم تحديث ترتيب الأقسام");
  };

  const onRuleDragEnd = (e: DragEndEvent, sectionId: string) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const sec = sections.find((s) => s.id === sectionId && s.kind === "rules");
    if (!sec || sec.kind !== "rules") return;
    const ruleIds = sec.rules.map((r) => `${sectionId}::${r.id}`);
    const oldIndex = ruleIds.indexOf(String(active.id));
    const newIndex = ruleIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    reorderRules(sectionId, oldIndex, newIndex);
  };

  const openAddRule = () => {
    if (!selected || selected.kind !== "rules") return;
    setRuleDialog({ mode: "add", title: "", description: "" });
  };

  const openEditRule = (ruleId: number, title: string, description: string) => {
    setRuleDialog({ mode: "edit", ruleId, title, description });
  };

  const saveRuleDialog = () => {
    if (!ruleDialog || !selected || selected.kind !== "rules") return;
    const t = ruleDialog.title.trim();
    const d = ruleDialog.description.trim();
    if (!t || !d) {
      toast.error("عنوان ووصف مطلوبان");
      return;
    }
    if (ruleDialog.mode === "add") {
      addRule(selected.id, { title: t, description: d });
      appendActivityLog(
        user?.username ?? "—",
        "قوانين: إضافة قانون",
        `${selected.label} — ${t}`,
      );
      toast.success("تمت إضافة القانون");
    } else if (ruleDialog.ruleId != null) {
      updateRule(selected.id, ruleDialog.ruleId, { title: t, description: d });
      appendActivityLog(
        user?.username ?? "—",
        "قوانين: تعديل قانون",
        `${selected.label} — ${t}`,
      );
      toast.success("تم حفظ التعديل");
    }
    setRuleDialog(null);
  };

  const submitNewSection = () => {
    const label = newLabel.trim();
    const short = newShort.trim();
    const subtitle = newSubtitle.trim();
    if (!label || !short) {
      toast.error("العنوان والاختصار مطلوبان");
      return;
    }
    let id: string;
    if (addKind === "rules") {
      id = addRulesSection({
        label,
        short,
        subtitle: subtitle || label,
        icon: newIcon,
        variant: newVariant,
      });
    } else {
      id = addPenaltiesSection({
        label,
        short,
        subtitle: subtitle || label,
        icon: newIcon,
        variant: newVariant,
      });
    }
    setSelectedId(id);
    setAddOpen(false);
    setNewLabel("");
    setNewShort("");
    setNewSubtitle("");
    toast.success("تم إنشاء القسم");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 text-right sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center justify-end gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            تحرير القوانين
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            التغييرات تُحفظ فوراً وتظهر في صفحة{" "}
            <a href="/laws" target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
              /laws
            </a>{" "}
            مباشرةً (وباقي التبويبات عند التبديل أو تحديث الصفحة).
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={() => setAddOpen(true)}>
            <Plus className="ms-1 h-4 w-4" /> قسم جديد
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="border-warning/40 text-warning">
                <RotateCcw className="ms-1 h-4 w-4" /> استعادة الافتراضي
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader className="text-right">
                <AlertDialogTitle>استعادة القوانين من المصدر الأصلي؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيُستبدل كل المحتوى المخصص بالبيانات الافتراضية من المشروع. لا يمكن التراجع تلقائياً.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:justify-start">
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetToDefaults();
                    appendActivityLog(user?.username ?? "—", "قوانين: استعادة الافتراضي", "كل الأقسام");
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
          <p className="font-display text-xs tracking-wide text-muted-foreground">ترتيب الأقسام (اسحب)</p>
          <DndContext sensors={sectionSensors} collisionDetection={closestCenter} onDragEnd={onSectionDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sections.map((s) => (
                  <SortableSectionRow
                    key={s.id}
                    section={s}
                    active={selectedId === s.id}
                    count={sectionItemCount(s)}
                    onSelect={() => setSelectedId(s.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="min-w-0 space-y-6 rounded-2xl border border-primary/20 bg-card/40 p-4 sm:p-6">
          {!selected ? (
            <p className="text-center text-muted-foreground">لا توجد أقسام.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-primary/15 pb-4">
                <div className="text-right min-w-0 flex-1 space-y-3">
                  <Label>عنوان القسم</Label>
                  <Input
                    value={selected.label}
                    onChange={(e) => updateSectionMeta(selected.id, { label: e.target.value })}
                    className="mt-1"
                  />
                  <Label>الاختصار (جوال)</Label>
                  <Input
                    value={selected.short}
                    onChange={(e) => updateSectionMeta(selected.id, { short: e.target.value })}
                    className="mt-1"
                  />
                  <Label>المقدمة تحت العنوان</Label>
                  <Textarea
                    value={selected.subtitle}
                    onChange={(e) => updateSectionMeta(selected.id, { subtitle: e.target.value })}
                    className="mt-1 min-h-[72px]"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>أيقونة التبويب</Label>
                      <Select
                        value={selected.icon}
                        onValueChange={(v) => updateSectionMeta(selected.id, { icon: v })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          {LAW_ICON_OPTIONS.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>نمط البطاقات</Label>
                      <Select
                        value={selected.variant}
                        onValueChange={(v) => updateSectionMeta(selected.id, { variant: v as RuleVariant })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          {variants.map((v) => (
                            <SelectItem key={v.value} value={v.value}>
                              {v.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" size="sm">
                      <Trash2 className="ms-1 h-4 w-4" /> حذف القسم
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader className="text-right">
                      <AlertDialogTitle>حذف هذا القسم؟</AlertDialogTitle>
                      <AlertDialogDescription>سيزال القسم وجميع قوانينه من الموقع.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:justify-start">
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          appendActivityLog(user?.username ?? "—", "قوانين: حذف قسم", selected.label);
                          deleteSection(selected.id);
                          setSelectedId(null);
                          toast.success("تم حذف القسم");
                        }}
                      >
                        حذف
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {selected.kind === "rules" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold">قوانين هذا القسم</h3>
                    <Button type="button" size="sm" onClick={openAddRule}>
                      <Plus className="ms-1 h-4 w-4" /> إضافة قانون
                    </Button>
                  </div>
                  <DndContext
                    sensors={ruleSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => onRuleDragEnd(e, selected.id)}
                  >
                    <SortableContext
                      items={selected.rules.map((r) => `${selected.id}::${r.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {selected.rules.map((r) => (
                          <SortableRuleRow
                            key={`${selected.id}-${r.id}`}
                            id={`${selected.id}::${r.id}`}
                            rule={r}
                            onEdit={() => openEditRule(r.id, r.title, r.description)}
                            onDelete={() => {
                              appendActivityLog(
                                user?.username ?? "—",
                                "قوانين: حذف قانون",
                                `${selected.label} — ${r.title}`,
                              );
                              deleteRule(selected.id, r.id);
                              toast.success("تم الحذف");
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              ) : (
                <PenaltiesBlockEditor sectionId={selected.id} block={selected.penalties} />
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent dir="rtl" className="w-[calc(100%-1.25rem)] max-w-2xl sm:max-w-2xl">
          <DialogHeader className="text-right">
            <DialogTitle>قسم جديد</DialogTitle>
            <DialogDescription>اختر نوع القسم ثم العناوين.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-right">
            <div>
              <Label>النوع</Label>
              <Select value={addKind} onValueChange={(v) => setAddKind(v as "rules" | "penalties")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="rules">بطاقات قوانين (شبكة)</SelectItem>
                  <SelectItem value="penalties">قسم عقوبات (إنذارات وجداول)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>العنوان</Label>
              <Input className="mt-1" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
            </div>
            <div>
              <Label>الاختصار</Label>
              <Input className="mt-1" value={newShort} onChange={(e) => setNewShort(e.target.value)} />
            </div>
            <div>
              <Label>المقدمة</Label>
              <Textarea className="mt-1" value={newSubtitle} onChange={(e) => setNewSubtitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>أيقونة</Label>
                <Select value={newIcon} onValueChange={setNewIcon}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {LAW_ICON_OPTIONS.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>نمط البطاقات</Label>
                <Select value={newVariant} onValueChange={(v) => setNewVariant(v as RuleVariant)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {variants.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              إلغاء
            </Button>
            <Button type="button" onClick={submitNewSection}>
              إنشاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!ruleDialog} onOpenChange={(o) => !o && setRuleDialog(null)}>
        <DialogContent dir="rtl" className="w-[calc(100%-1.25rem)] max-w-3xl sm:max-w-3xl">
          <DialogHeader className="text-right">
            <DialogTitle>{ruleDialog?.mode === "add" ? "قانون جديد" : "تعديل القانون"}</DialogTitle>
          </DialogHeader>
          {ruleDialog ? (
            <div className="space-y-3 text-right">
              <div>
                <Label>العنوان</Label>
                <Input
                  className="mt-1"
                  value={ruleDialog.title}
                  onChange={(e) => setRuleDialog({ ...ruleDialog, title: e.target.value })}
                />
              </div>
              <div>
                <Label>النص</Label>
                <Textarea
                  className="mt-1 min-h-[120px]"
                  value={ruleDialog.description}
                  onChange={(e) => setRuleDialog({ ...ruleDialog, description: e.target.value })}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="button" variant="outline" onClick={() => setRuleDialog(null)}>
              إلغاء
            </Button>
            <Button type="button" onClick={saveRuleDialog}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LawsEditorPage;
