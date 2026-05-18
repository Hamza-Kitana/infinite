import type { ApplicationRecord } from "@/data/publicApplicationTypes";
import type { PublicUserProfile } from "@/contexts/PublicUserContext";
import type { StreamerEntry } from "@/types/streamersSchema";

export const STREAMER_PLACEHOLDER_IMAGE = "/placeholder.svg";

/** بيانات بطاقة صانع المحتوى — للتعديل من ستريمر منجر */
export type StreamerCardDraft = {
  name: string;
  role: string;
  bio: string;
  streamUrl: string;
  image: string;
};

export type StreamerCardDraftOverrides = Partial<StreamerCardDraft>;
import { applicationBelongsToPublicProfile } from "@/lib/publicProfileEligibility";

export const STREAMER_APPLICATION_ROLE = "streamers";

/** المسمى الافتراضي على البطاقة — يعيّنه ستريمر منجر عند القبول فقط */
export const STREAMER_MANAGER_DEFAULT_ROLE = "صانع محتوى معتمد";

export function isStreamerApplication(app: ApplicationRecord): boolean {
  return app.roleKey === STREAMER_APPLICATION_ROLE;
}

/** طلبات صانع المحتوى لهذا الحساب — الأحدث أولاً */
export function streamerApplicationsForProfile(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): ApplicationRecord[] {
  if (!profile) return [];
  return applications
    .filter((a) => isStreamerApplication(a) && applicationBelongsToPublicProfile(a, profile))
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

/** آخر طلب صانع محتوى — يحدّد ما يظهر في البروفايل */
export function getLatestStreamerApplicationForProfile(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): ApplicationRecord | null {
  return streamerApplicationsForProfile(profile, applications)[0] ?? null;
}

export type StreamerApplicationUiStatus = "none" | "pending" | "approved" | "rejected";

/** حالة واجهة البروفايل حسب آخر طلب (وليس أي طلب قديم) */
export function getStreamerApplicationUiStatus(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): StreamerApplicationUiStatus {
  const latest = getLatestStreamerApplicationForProfile(profile, applications);
  if (!latest) return "none";
  if (latest.status === "pending") return "pending";
  if (latest.status === "approved") return "approved";
  if (latest.status === "rejected") return "rejected";
  return "none";
}

export function hasPendingStreamerApplication(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): boolean {
  return getStreamerApplicationUiStatus(profile, applications) === "pending";
}

export function hasApprovedStreamerApplication(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): boolean {
  return getStreamerApplicationUiStatus(profile, applications) === "approved";
}

export function hasRejectedStreamerApplication(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): boolean {
  return getStreamerApplicationUiStatus(profile, applications) === "rejected";
}

export function isStreamerApplyFormBlocked(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): boolean {
  const status = getStreamerApplicationUiStatus(profile, applications);
  return status === "pending" || status === "approved";
}

export function countPendingStreamerApplications(applications: ApplicationRecord[]): number {
  return applications.filter((a) => a.status === "pending" && isStreamerApplication(a)).length;
}

export function displayNameFromApplication(app: ApplicationRecord): string {
  const s = app.snapshot;
  return (
    `${s.firstName} ${s.lastName}`.trim() ||
    app.applicantDisplayName?.trim() ||
    app.applicantUsername?.trim() ||
    "صانع محتوى"
  );
}

export function draftFromApplication(
  app: ApplicationRecord,
  cardRole = STREAMER_MANAGER_DEFAULT_ROLE,
): StreamerCardDraft {
  const s = app.snapshot;
  return {
    name: displayNameFromApplication(app),
    role: cardRole.trim() || STREAMER_MANAGER_DEFAULT_ROLE,
    bio: (s.bio || s.experience || "").trim(),
    streamUrl: (s.streamUrl || "").trim(),
    image: s.avatarDataUrl?.trim() || STREAMER_PLACEHOLDER_IMAGE,
  };
}

export function draftFromStreamerEntry(entry: StreamerEntry): StreamerCardDraft {
  return {
    name: entry.name,
    role: entry.role,
    bio: entry.bio,
    streamUrl: entry.streamUrl,
    image: entry.image || STREAMER_PLACEHOLDER_IMAGE,
  };
}

export function findStreamerByLinkedUserId(
  items: StreamerEntry[],
  linkedUserId: string | undefined,
): StreamerEntry | undefined {
  const id = linkedUserId?.trim();
  if (!id) return undefined;
  return items.find((x) => x.linkedUserId === id);
}

export function applicationToStreamerPayload(
  app: ApplicationRecord,
  options?: { cardRole?: string; draft?: StreamerCardDraftOverrides },
): Omit<StreamerEntry, "id"> {
  const base = draftFromApplication(app, options?.cardRole);
  const d = options?.draft;
  const name = (d?.name?.trim() || base.name).trim() || "صانع محتوى";
  return {
    name,
    role: (d?.role?.trim() || base.role).trim() || STREAMER_MANAGER_DEFAULT_ROLE,
    bio: (d?.bio?.trim() ?? base.bio).trim() || "—",
    streamUrl: normalizeStreamUrl(d?.streamUrl?.trim() ?? base.streamUrl),
    image: (d?.image?.trim() || base.image).trim() || STREAMER_PLACEHOLDER_IMAGE,
    hidden: false,
    linkedUserId: app.applicantUserId?.trim() || undefined,
  };
}

export function streamerEntryFromDraft(draft: StreamerCardDraft): Omit<StreamerEntry, "id"> {
  const name = draft.name.trim() || "صانع محتوى";
  return {
    name,
    role: draft.role.trim() || STREAMER_MANAGER_DEFAULT_ROLE,
    bio: draft.bio.trim() || "—",
    streamUrl: normalizeStreamUrl(draft.streamUrl),
    image: draft.image.trim() || STREAMER_PLACEHOLDER_IMAGE,
    hidden: false,
  };
}

export function normalizeStreamUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (t.includes("://")) return t;
  return `https://${t}`;
}

export function isValidStreamUrl(raw: string): boolean {
  const normalized = normalizeStreamUrl(raw);
  if (normalized.length < 8) return false;
  try {
    const u = new URL(normalized);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
