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
import { Building2, GripVertical, ImagePlus, Plus, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { setInstitutionVisible, useSiteVisibility } from "@/lib/siteVisibility";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("read"));
    r.readAsDataURL(file);
  });
}

type MemberDraft = ChromaGridItem & { _key: string; hidden?: boolean };

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

function SortableMemberRow({
  member,
  onEdit,
  onRemove,
}: {
  member: MemberDraft;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member._key,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "space-y-2 rounded-xl border border-violet-200 bg-violet-50/70 p-3 text-right",
        isDragging && "z-20 opacity-90 shadow-lg",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="inline-flex h-10 w-9 shrink-0 cursor-grab touch-manipulation items-center justify-center rounded-lg border border-dashed border-violet-300 text-slate-500 active:cursor-grabbing"
          aria-label="سحب"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <img src={member.image} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-violet-200 object-cover" />
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate font-display font-semibold text-slate-900">{member.title}</p>
              <p className="truncate text-xs text-slate-600">{member.subtitle}</p>
            </div>
            {member.hidden ? (
              <span className="shrink-0 rounded-md bg-slate-200 px-1.5 py-0.5 font-display text-[10px] text-slate-700">
                مخفي
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="outline" size="sm" className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800" onClick={onEdit}>
            تعديل
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="icon" className="shrink-0 border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader className="text-right">
                <AlertDialogTitle>تأكيد حذف العضو</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف هذا العضو من شبكة الطاقم. هل تريد المتابعة؟
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:justify-start">
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={onRemove}>تأكيد الحذف</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function PersonSummaryCard({ label, person, onEdit }: { label: string; person: RosterPerson; onEdit: () => void }) {
  return (
    <div className="space-y-3 rounded-xl border border-violet-200 bg-white/90 p-4 text-right shadow-[0_14px_30px_-22px_rgba(54,22,79,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-right">
          <p className="font-display text-sm font-semibold text-violet-700">{label}</p>
          {person.hidden ? (
            <p className="mt-1 text-[11px] font-display text-slate-500">مخفي من الموقع</p>
          ) : null}
          <p className="mt-1 text-base font-bold text-slate-900">{person.name}</p>
          <p className="text-xs text-slate-600">{person.title}</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800" onClick={onEdit}>
          تعديل
        </Button>
      </div>
      <p className="line-clamp-2 text-sm text-slate-600">{person.bio}</p>
    </div>
  );
}

const DEFAULT_GRADIENT_START = "#0891b2";
const DEFAULT_GRADIENT_END = "#000000";
const defaultGradient = `linear-gradient(160deg, ${DEFAULT_GRADIENT_START}, ${DEFAULT_GRADIENT_END})`;

function normalizeHexColor(value: string | undefined, fallback: string): string {
  const trimmed = (value ?? "").trim();
  const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed);
  if (!isHex) return fallback;
  if (trimmed.length === 4) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

function getGradientStops(gradient: string | undefined): { start: string; end: string } {
  const colors = gradient?.match(/#[0-9a-fA-F]{3,6}/g) ?? [];
  return {
    start: normalizeHexColor(colors[0], DEFAULT_GRADIENT_START),
    end: normalizeHexColor(colors[1], DEFAULT_GRADIENT_END),
  };
}

function buildLinearGradient(start: string, end: string): string {
  const safeStart = normalizeHexColor(start, DEFAULT_GRADIENT_START);
  const safeEnd = normalizeHexColor(end, DEFAULT_GRADIENT_END);
  return `linear-gradient(160deg, ${safeStart}, ${safeEnd})`;
}

const InstitutionRosterEditorPage = () => {
  const { branchId: branchParam } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const { getBranchRoster, setBranchRoster, resetBranchToDefault } = useInstitutionRostersContent();
  const visibility = useSiteVisibility();

  const rosterBranches = useMemo(
    () => institutionRosterBranchIdsFromRoleList(user?.roles ?? []),
    [user?.roles],
  );

  const canAccess = isSuperAdmin || rosterBranches.length > 0;

  const branchId: InstitutionBranchId | null =
    branchParam && isInstitutionBranchId(branchParam) ? branchParam : null;

  const allowedForBranch = branchId != null && (isSuperAdmin || rosterBranches.includes(branchId));

  const [draft, setDraft] = useState<DraftState | null>(null);
  const [personEditTarget, setPersonEditTarget] = useState<"leader" | "deputy" | null>(null);
  const [memberEditKey, setMemberEditKey] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");

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

  const personToEdit = personEditTarget && draft ? draft[personEditTarget] : null;
  const memberToEdit = memberEditKey && draft ? draft.members.find((m) => m._key === memberEditKey) ?? null : null;
  const filteredMembers = useMemo(() => {
    if (!draft) return [];
    const q = memberSearch.trim().toLowerCase();
    if (!q) return draft.members;
    return draft.members.filter((m) => `${m.title} ${m.subtitle}`.toLowerCase().includes(q));
  }, [draft, memberSearch]);

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
    <div className="mx-auto max-w-5xl space-y-8 pb-12 text-right">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center justify-end gap-2 font-display text-2xl font-bold text-slate-900">
            <Building2 className="h-7 w-7 text-violet-700" />
            محرر الطاقم — {INSTITUTION_BRANCH_META[branchId].labelAr}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            تعديل هذا الفرع فقط. التغييرات تظهر في صفحة المعاينة مباشرةً.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {isSuperAdmin ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800"
              onClick={() => setInstitutionVisible(branchId, !visibility.institutions[branchId])}
            >
              {visibility.institutions[branchId] ? "إخفاء المؤسسة من الموقع" : "إظهار المؤسسة بالموقع"}
            </Button>
          ) : null}
          <Button type="button" size="sm" className="bg-[#36164f] text-white hover:bg-[#2f1344]" onClick={save}>
            حفظ الطاقم
          </Button>
          <Button type="button" variant="outline" size="sm" className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800" asChild>
            <a href={previewPath} target="_blank" rel="noreferrer">
              معاينة الفرع
            </a>
          </Button>
        </div>
      </div>

      {isSuperAdmin ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
          <div className="max-w-md w-full space-y-2 sm:ms-auto">
            <Label>تبديل الفرع</Label>
            <Select value={branchId} onValueChange={(v) => navigate(`/dashboard/institution/${v}`)}>
              <SelectTrigger className="border-violet-200 bg-white text-slate-900">
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
          <Button type="button" variant="outline" size="sm" className="shrink-0 border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800" asChild>
            <Link to="/dashboard/institution">كل الفروع</Link>
          </Button>
        </div>
      ) : rosterBranches.length > 1 ? (
        <p className="rounded-lg border border-violet-200 bg-violet-50/70 px-4 py-3 text-sm text-slate-700">
          الفرع الحالي: <strong>{INSTITUTION_BRANCH_META[branchId].labelAr}</strong>
          {" — "}
          للأفرع الأخرى استخدم{" "}
          <Link to="/dashboard/institution" className="font-semibold text-violet-700 underline-offset-4 hover:underline">
            صفحة الطواقم
          </Link>{" "}
          أو القائمة الجانبية.
        </p>
      ) : (
        <p className="rounded-lg border border-violet-200 bg-violet-50/70 px-4 py-3 text-sm text-slate-700">
          أنت تدير: <strong>{INSTITUTION_BRANCH_META[branchId].labelAr}</strong>
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <PersonSummaryCard
          label="القائد"
          person={draft.leader}
          onEdit={() => setPersonEditTarget("leader")}
        />
        <PersonSummaryCard
          label="النائب"
          person={draft.deputy}
          onEdit={() => setPersonEditTarget("deputy")}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-sm font-semibold text-violet-700">أعضاء الشبكة (Chroma)</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800"
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
                          title: "اسم العضو",
                          subtitle: "المنصب",
                          borderColor: "#22D3EE",
                          gradient: defaultGradient,
                          hidden: false,
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
        <div className="max-w-sm">
          <Input
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder="ابحث بالاسم أو المنصب..."
            className="border-violet-200 bg-white text-slate-900 placeholder:text-slate-400"
            autoComplete="off"
          />
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={filteredMembers.map((m) => m._key)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filteredMembers.map((m) => (
                <SortableMemberRow
                  key={m._key}
                  member={m}
                  onEdit={() => setMemberEditKey(m._key)}
                  onRemove={() =>
                    setDraft((d) =>
                      d ? { ...d, members: d.members.filter((x) => x._key !== m._key) } : d,
                    )
                  }
                />
              ))}
              {filteredMembers.length === 0 ? (
                <p className="rounded-lg border border-violet-200 bg-white px-4 py-3 text-sm text-slate-600">
                  لا يوجد أعضاء مطابقون للبحث.
                </p>
              ) : null}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <Dialog open={!!personEditTarget} onOpenChange={(open) => !open && setPersonEditTarget(null)}>
        <DialogContent dir="rtl" className="w-[calc(100%-1rem)] max-w-2xl border-violet-300 bg-[#f7f1fc] text-slate-900">
          <DialogHeader className="text-right">
            <DialogTitle className="text-slate-900">{personEditTarget === "leader" ? "تعديل القائد" : "تعديل النائب"}</DialogTitle>
          </DialogHeader>
          {personToEdit ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-slate-700">الاسم</Label>
                  <Input className="mt-1 border-violet-200 bg-white text-slate-900" value={personToEdit.name} onChange={(e) => setDraft((d) => d ? { ...d, [personEditTarget as "leader" | "deputy"]: { ...d[personEditTarget as "leader" | "deputy"], name: e.target.value } } : d)} />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">المنصب</Label>
                  <Input className="mt-1 border-violet-200 bg-white text-slate-900" value={personToEdit.title} onChange={(e) => setDraft((d) => d ? { ...d, [personEditTarget as "leader" | "deputy"]: { ...d[personEditTarget as "leader" | "deputy"], title: e.target.value } } : d)} />
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-700">سطر تعريفي</Label>
                <Input className="mt-1 border-violet-200 bg-white text-slate-900" value={personToEdit.tagline ?? ""} onChange={(e) => setDraft((d) => d ? { ...d, [personEditTarget as "leader" | "deputy"]: { ...d[personEditTarget as "leader" | "deputy"], tagline: e.target.value || undefined } } : d)} />
              </div>
              <div>
                <Label className="text-xs text-slate-700">نبذة</Label>
                <Textarea className="mt-1 min-h-[90px] border-violet-200 bg-white text-slate-900" value={personToEdit.bio} onChange={(e) => setDraft((d) => d ? { ...d, [personEditTarget as "leader" | "deputy"]: { ...d[personEditTarget as "leader" | "deputy"], bio: e.target.value } } : d)} />
              </div>
              <div>
                <Label className="text-xs text-slate-700">نقاط المسؤوليات (سطر لكل نقطة)</Label>
                <Textarea
                  className="mt-1 min-h-[90px] border-violet-200 bg-white text-slate-900"
                  value={(personToEdit.highlights ?? []).join("\n")}
                  onChange={(e) => {
                    const lines = e.target.value.split("\n").map((l) => l.trim()).filter(Boolean);
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            [personEditTarget as "leader" | "deputy"]: {
                              ...d[personEditTarget as "leader" | "deputy"],
                              highlights: lines.length ? lines : undefined,
                            },
                          }
                        : d,
                    );
                  }}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-700">الصورة</Label>
                <div className="mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = () => {
                        const file = input.files?.[0] ?? null;
                        if (personEditTarget === "leader") onLeaderImage(file);
                        else onDeputyImage(file);
                      };
                      input.click();
                    }}
                  >
                    <ImagePlus className="ms-1 h-3 w-3" /> رفع صورة
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-violet-200 bg-white/70 p-3">
                <p className="text-xs text-slate-600">
                  الظهور في الموقع:{" "}
                  <span className="font-display text-slate-900">{personToEdit.hidden ? "مخفي" : "ظاهر"}</span>
                </p>
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              type="button"
              variant="outline"
              className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800"
              onClick={() =>
                setDraft((d) =>
                  d && personEditTarget
                    ? {
                        ...d,
                        [personEditTarget]: {
                          ...d[personEditTarget],
                          hidden: !d[personEditTarget].hidden,
                        },
                      }
                    : d,
                )
              }
            >
              {personToEdit?.hidden ? "إظهار بالموقع" : "إخفاء من الموقع"}
            </Button>
            <Button type="button" variant="outline" className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800" onClick={() => setPersonEditTarget(null)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!memberEditKey} onOpenChange={(open) => !open && setMemberEditKey(null)}>
        <DialogContent dir="rtl" className="w-[calc(100%-1rem)] max-w-2xl border-violet-300 bg-[#f7f1fc] text-slate-900">
          <DialogHeader className="text-right">
            <DialogTitle className="text-slate-900">تعديل العضو</DialogTitle>
          </DialogHeader>
          {memberToEdit ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-slate-700">الاسم</Label>
                  <Input className="mt-1 border-violet-200 bg-white text-slate-900" value={memberToEdit.title} onChange={(e) => setDraft((d) => d ? { ...d, members: d.members.map((x) => (x._key === memberToEdit._key ? { ...x, title: e.target.value } : x)) } : d)} />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">المنصب</Label>
                  <Input className="mt-1 border-violet-200 bg-white text-slate-900" value={memberToEdit.subtitle} onChange={(e) => setDraft((d) => d ? { ...d, members: d.members.map((x) => (x._key === memberToEdit._key ? { ...x, subtitle: e.target.value } : x)) } : d)} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-slate-700">لون الإطار</Label>
                  <Input
                    type="color"
                    className="mt-1 h-10 border-violet-200 bg-white p-1 text-slate-900"
                    value={normalizeHexColor(memberToEdit.borderColor, "#22d3ee")}
                    onChange={(e) =>
                      setDraft((d) =>
                        d
                          ? {
                              ...d,
                              members: d.members.map((x) =>
                                x._key === memberToEdit._key ? { ...x, borderColor: e.target.value } : x,
                              ),
                            }
                          : d,
                      )
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">التدرج</Label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <Input
                      type="color"
                      className="h-10 border-violet-200 bg-white p-1 text-slate-900"
                      value={getGradientStops(memberToEdit.gradient).start}
                      onChange={(e) => {
                        const stops = getGradientStops(memberToEdit.gradient);
                        const next = buildLinearGradient(e.target.value, stops.end);
                        setDraft((d) =>
                          d
                            ? {
                                ...d,
                                members: d.members.map((x) =>
                                  x._key === memberToEdit._key ? { ...x, gradient: next } : x,
                                ),
                              }
                            : d,
                        );
                      }}
                    />
                    <Input
                      type="color"
                      className="h-10 border-violet-200 bg-white p-1 text-slate-900"
                      value={getGradientStops(memberToEdit.gradient).end}
                      onChange={(e) => {
                        const stops = getGradientStops(memberToEdit.gradient);
                        const next = buildLinearGradient(stops.start, e.target.value);
                        setDraft((d) =>
                          d
                            ? {
                                ...d,
                                members: d.members.map((x) =>
                                  x._key === memberToEdit._key ? { ...x, gradient: next } : x,
                                ),
                              }
                            : d,
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-700">الصورة</Label>
                <div className="mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = () => onMemberImage(memberToEdit._key, input.files?.[0] ?? null);
                      input.click();
                    }}
                  >
                    <ImagePlus className="ms-1 h-3 w-3" /> رفع صورة
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-violet-200 bg-white/70 p-3">
                <p className="text-xs text-slate-600">
                  الظهور في الموقع:{" "}
                  <span className="font-display text-slate-900">{memberToEdit.hidden ? "مخفي" : "ظاهر"}</span>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                  onClick={() =>
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            members: d.members.map((x) =>
                              x._key === memberToEdit._key ? { ...x, hidden: !x.hidden } : x,
                            ),
                          }
                        : d,
                    )
                  }
                >
                  {memberToEdit.hidden ? "إظهار بالموقع" : "إخفاء من الموقع"}
                </Button>
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="button" variant="outline" className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800" onClick={() => setMemberEditKey(null)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionRosterEditorPage;
