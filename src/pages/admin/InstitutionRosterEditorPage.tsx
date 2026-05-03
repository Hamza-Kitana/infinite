import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Building2, GripVertical, ImagePlus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
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
import { useInstitutionRostersContent } from "@/contexts/InstitutionRostersContentContext";
import {
  INSTITUTION_BRANCH_IDS,
  INSTITUTION_BRANCH_META,
  institutionRosterBranchIdsFromRoleList,
  isInstitutionBranchId,
  type InstitutionBranchId,
} from "@/data/institutionBranches";
import type { InstitutionRosterData } from "@/data/institutionRosters";
import { defaultRosterForBranch } from "@/data/institutionRostersDefaultState";
import type { RosterPerson } from "@/components/InstitutionRoster";
import type { ChromaGridItem } from "@/components/ChromaGrid";
import { appendActivityLog } from "@/lib/activityLog";
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

type MemberDraft = ChromaGridItem & { _key: string };

type DraftState = {
  leader: RosterPerson;
  deputy: RosterPerson;
  members: MemberDraft[];
};

function rosterToDraft(r: InstitutionRosterData): DraftState {
  return {
    leader: { ...r.leader, highlights: r.leader.highlights ? [...r.leader.highlights] : undefined },
    deputy: { ...r.deputy, highlights: r.deputy.highlights ? [...r.deputy.highlights] : undefined },
    members: r.members.map((m) => ({ ...m, _key: crypto.randomUUID() })),
  };
}

function draftToRoster(d: DraftState): InstitutionRosterData {
  const lh = d.leader.highlights?.filter(Boolean);
  const dh = d.deputy.highlights?.filter(Boolean);
  return {
    leader: { ...d.leader, highlights: lh?.length ? lh : undefined },
    deputy: { ...d.deputy, highlights: dh?.length ? dh : undefined },
    members: d.members.map(({ _key, ...m }) => m),
  };
}

/** نص مؤقت للنقاط في الواجهة */
function highlightsToText(p: RosterPerson): string {
  return (p.highlights ?? []).join("\n");
}

function SortableMemberRow({
  member,
  onPatch,
  onRemove,
  onPickImage,
}: {
  member: MemberDraft;
  onPatch: (patch: Partial<ChromaGridItem>) => void;
  onRemove: () => void;
  onPickImage: (file: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member._key,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-primary/20 bg-card/50 p-3 space-y-2 text-right",
        isDragging && "z-20 opacity-90 shadow-lg",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="inline-flex w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-primary/25 text-muted-foreground cursor-grab touch-manipulation active:cursor-grabbing h-10"
          aria-label="سحب"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-xs">العنوان</Label>
              <Input className="mt-1" value={member.title} onChange={(e) => onPatch({ title: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">الوصف الفرعي</Label>
              <Input
                className="mt-1"
                value={member.subtitle}
                onChange={(e) => onPatch({ subtitle: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">رابط الصورة</Label>
            <Input
              className="mt-1 font-mono text-xs"
              dir="ltr"
              value={member.image.startsWith("data:") ? "" : member.image}
              onChange={(e) => onPatch({ image: e.target.value })}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onPickImage(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <Button type="button" variant="secondary" size="sm" className="mt-1" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="ms-1 h-3 w-3" /> رفع
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-xs">لون الإطار</Label>
              <Input
                className="mt-1 font-mono text-xs"
                dir="ltr"
                value={member.borderColor ?? ""}
                onChange={(e) => onPatch({ borderColor: e.target.value || undefined })}
              />
            </div>
            <div>
              <Label className="text-xs">تدرج CSS (linear-gradient…)</Label>
              <Input
                className="mt-1 font-mono text-[11px]"
                dir="ltr"
                value={member.gradient ?? ""}
                onChange={(e) => onPatch({ gradient: e.target.value || undefined })}
              />
            </div>
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function PersonBlock({
  label,
  person,
  setPerson,
  onImageFile,
}: {
  label: string;
  person: RosterPerson;
  setPerson: (p: RosterPerson) => void;
  onImageFile: (file: File | null) => void;
}) {
  const imgRef = useRef<HTMLInputElement>(null);
  const highlightsText = highlightsToText(person);

  return (
    <div className="rounded-xl border border-primary/15 bg-background/40 p-4 space-y-3 text-right">
      <p className="font-display text-sm font-semibold text-primary">{label}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs">الاسم</Label>
          <Input className="mt-1" value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">المنصب</Label>
          <Input
            className="mt-1"
            value={person.title}
            onChange={(e) => setPerson({ ...person, title: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">رابط الصورة</Label>
        <Input
          className="mt-1 font-mono text-xs"
          dir="ltr"
          value={person.image.startsWith("data:") ? "" : person.image}
          onChange={(e) => setPerson({ ...person, image: e.target.value })}
        />
        <input
          ref={imgRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            onImageFile(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="secondary" size="sm" className="mt-1" onClick={() => imgRef.current?.click()}>
          <ImagePlus className="ms-1 h-3 w-3" /> رفع صورة
        </Button>
      </div>
      <div>
        <Label className="text-xs">سطر تعريفي</Label>
        <Input
          className="mt-1"
          value={person.tagline ?? ""}
          onChange={(e) => setPerson({ ...person, tagline: e.target.value || undefined })}
        />
      </div>
      <div>
        <Label className="text-xs">نبذة</Label>
        <Textarea
          className="mt-1 min-h-[72px]"
          value={person.bio}
          onChange={(e) => setPerson({ ...person, bio: e.target.value })}
        />
      </div>
      <div>
        <Label className="text-xs">نقاط المسؤوليات (سطر لكل نقطة)</Label>
        <Textarea
          className="mt-1 min-h-[72px]"
          value={highlightsText}
          onChange={(e) => {
            const lines = e.target.value.split("\n").map((l) => l.trim()).filter(Boolean);
            setPerson({ ...person, highlights: lines.length ? lines : undefined });
          }}
        />
      </div>
    </div>
  );
}

const defaultGradient = "linear-gradient(160deg, #0891B2, #000)";

const InstitutionRosterEditorPage = () => {
  const { branchId: branchParam } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const { getBranchRoster, setBranchRoster, resetBranchToDefault } = useInstitutionRostersContent();

  const rosterBranches = useMemo(
    () => institutionRosterBranchIdsFromRoleList(user?.roles ?? []),
    [user?.roles],
  );

  const canAccess = isSuperAdmin || rosterBranches.length > 0;

  const branchId: InstitutionBranchId | null =
    branchParam && isInstitutionBranchId(branchParam) ? branchParam : null;

  const allowedForBranch = branchId != null && (isSuperAdmin || rosterBranches.includes(branchId));

  const [draft, setDraft] = useState<DraftState | null>(null);

  useEffect(() => {
    if (!branchId) return;
    setDraft(rosterToDraft(getBranchRoster(branchId)));
  }, [branchId, getBranchRoster]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onLeaderImage = useCallback(async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("الصورة كبيرة جداً (حد أقصى 2 ميجابايت).");
      return;
    }
    try {
      const url = await readFileAsDataUrl(file);
      setDraft((d) => (d ? { ...d, leader: { ...d.leader, image: url } } : d));
      toast.success("تم تحديث صورة القائد");
    } catch {
      toast.error("تعذر قراءة الملف");
    }
  }, []);

  const onDeputyImage = useCallback(async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("الصورة كبيرة جداً.");
      return;
    }
    try {
      const url = await readFileAsDataUrl(file);
      setDraft((d) => (d ? { ...d, deputy: { ...d.deputy, image: url } } : d));
      toast.success("تم تحديث صورة النائب");
    } catch {
      toast.error("تعذر قراءة الملف");
    }
  }, []);

  const onMemberImage = useCallback(async (key: string, file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("الصورة كبيرة جداً.");
      return;
    }
    try {
      const url = await readFileAsDataUrl(file);
      setDraft((d) =>
        d
          ? {
              ...d,
              members: d.members.map((m) => (m._key === key ? { ...m, image: url } : m)),
            }
          : d,
      );
    } catch {
      toast.error("تعذر قراءة الملف");
    }
  }, []);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id || !draft) return;
    const oldIndex = draft.members.findIndex((m) => m._key === active.id);
    const newIndex = draft.members.findIndex((m) => m._key === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const members = [...draft.members];
    const [moved] = members.splice(oldIndex, 1);
    members.splice(newIndex, 0, moved);
    setDraft({ ...draft, members });
    toast.success("تم تحديث ترتيب الأعضاء");
  };

  const save = () => {
    if (!draft || !branchId) return;
    if (!isSuperAdmin && !rosterBranches.includes(branchId)) {
      toast.error("لا تملك صلاحية تعديل هذا الفرع.");
      return;
    }
    const l = draft.leader.name.trim();
    const dep = draft.deputy.name.trim();
    if (!l || !dep) {
      toast.error("اسم القائد واسم النائب مطلوبان");
      return;
    }
    const roster = draftToRoster(draft);
    setBranchRoster(branchId, roster);
    appendActivityLog(
      user?.username ?? "—",
      "حفظ طاقم مؤسسة",
      INSTITUTION_BRANCH_META[branchId].labelAr,
    );
    toast.success("تم حفظ الطاقم");
  };

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!branchId) {
    return <Navigate to="/dashboard/institution" replace />;
  }

  if (!allowedForBranch) {
    return <Navigate to="/dashboard/institution" replace />;
  }

  const previewPath = INSTITUTION_BRANCH_META[branchId].previewPath;

  if (!draft) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12 text-right">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center justify-end gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            محرر الطاقم — {INSTITUTION_BRANCH_META[branchId].labelAr}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            تعديل هذا الفرع فقط. التغييرات تظهر في صفحة المعاينة مباشرةً.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={previewPath} target="_blank" rel="noreferrer">
              معاينة الفرع
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="border-warning/40 text-warning">
                <RotateCcw className="ms-1 h-4 w-4" /> استعادة الافتراضي
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader className="text-right">
                <AlertDialogTitle>استعادة الطاقم الافتراضي لهذا الفرع؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيُستبدل محتوى «{INSTITUTION_BRANCH_META[branchId].labelAr}» بالبيانات الأصلية للمشروع.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:justify-start">
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetBranchToDefault(branchId);
                    setDraft(rosterToDraft(defaultRosterForBranch(branchId)));
                    appendActivityLog(
                      user?.username ?? "—",
                      "استعادة طاقم افتراضي",
                      INSTITUTION_BRANCH_META[branchId].labelAr,
                    );
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

      {isSuperAdmin ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
          <div className="max-w-md w-full space-y-2 sm:ms-auto">
            <Label>تبديل الفرع</Label>
            <Select value={branchId} onValueChange={(v) => navigate(`/dashboard/institution/${v}`)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {INSTITUTION_BRANCH_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {INSTITUTION_BRANCH_META[id].labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="outline" size="sm" className="shrink-0" asChild>
            <Link to="/dashboard/institution">كل الفروع</Link>
          </Button>
        </div>
      ) : rosterBranches.length > 1 ? (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          الفرع الحالي: <strong>{INSTITUTION_BRANCH_META[branchId].labelAr}</strong>
          {" — "}
          للأفرع الأخرى استخدم{" "}
          <Link to="/dashboard/institution" className="font-semibold text-primary underline-offset-4 hover:underline">
            صفحة الطواقم
          </Link>{" "}
          أو القائمة الجانبية.
        </p>
      ) : (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          أنت تدير: <strong>{INSTITUTION_BRANCH_META[branchId].labelAr}</strong>
        </p>
      )}

      <PersonBlock
        label="القائد"
        person={draft.leader}
        setPerson={(leader) => setDraft((d) => (d ? { ...d, leader } : d))}
        onImageFile={onLeaderImage}
      />
      <PersonBlock
        label="النائب"
        person={draft.deputy}
        setPerson={(deputy) => setDraft((d) => (d ? { ...d, deputy } : d))}
        onImageFile={onDeputyImage}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-sm font-semibold text-primary">أعضاء الشبكة (Chroma)</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setDraft((d) =>
                d
                  ? {
                      ...d,
                      members: [
                        ...d.members,
                        {
                          _key: crypto.randomUUID(),
                          image: "/placeholder.svg",
                          title: "عضو جديد",
                          subtitle: "الوصف",
                          borderColor: "#22D3EE",
                          gradient: defaultGradient,
                        },
                      ],
                    }
                  : d,
              )
            }
          >
            <Plus className="ms-1 h-4 w-4" /> إضافة عضو
          </Button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={draft.members.map((m) => m._key)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {draft.members.map((m) => (
                <SortableMemberRow
                  key={m._key}
                  member={m}
                  onPatch={(patch) =>
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            members: d.members.map((x) => (x._key === m._key ? { ...x, ...patch } : x)),
                          }
                        : d,
                    )
                  }
                  onRemove={() =>
                    setDraft((d) =>
                      d ? { ...d, members: d.members.filter((x) => x._key !== m._key) } : d,
                    )
                  }
                  onPickImage={(file) => onMemberImage(m._key, file)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" onClick={save}>
          حفظ الطاقم
        </Button>
      </div>
    </div>
  );
};

export default InstitutionRosterEditorPage;
