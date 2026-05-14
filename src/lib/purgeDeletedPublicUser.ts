/**
 * عند حذف مواطن من لوحة الإدارة: إزالة كل ما يربطه بالموقع
 * حتى لا يبقى قبول تقديم أو تكتات يمنحونه امتيازات إذا عاد بنفس Discord بحساب جديد.
 */

import { INSTITUTION_BRANCH_IDS } from "@/data/institutionBranches";
import type { InstitutionRosterData } from "@/data/institutionRosters";
import type { ApplicationRecord } from "@/data/publicApplicationTypes";
import {
  defaultInstitutionRostersPersisted,
  type InstitutionRostersPersisted,
} from "@/data/institutionRostersDefaultState";
import { loadTickets, saveTickets, type TicketThread } from "@/lib/ticketsCenter";

const APPLICATIONS_KEY = "ic_public_applications_v1";
const ROSTERS_KEY = "ic_institution_rosters_v1";

export const IC_PUBLIC_APPLICATIONS_CHANGED_EVENT = "ic-public-applications-changed";
export const IC_INSTITUTION_ROSTERS_CHANGED_EVENT = "ic-institution-rosters-changed";

type ApplicationsPersisted = { v: 1; applications: ApplicationRecord[] };

function loadApplications(): ApplicationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as ApplicationsPersisted;
    if (p?.v === 1 && Array.isArray(p.applications)) return p.applications;
  } catch {
    /* ignore */
  }
  return [];
}

function saveApplications(list: ApplicationRecord[]) {
  if (typeof window === "undefined") return;
  const data: ApplicationsPersisted = { v: 1, applications: list };
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(IC_PUBLIC_APPLICATIONS_CHANGED_EVENT));
}

function hydrateRosters(partial: unknown): InstitutionRostersPersisted {
  const base = defaultInstitutionRostersPersisted();
  if (
    partial &&
    typeof partial === "object" &&
    (partial as InstitutionRostersPersisted).v === 1 &&
    typeof (partial as InstitutionRostersPersisted).rosters === "object" &&
    (partial as InstitutionRostersPersisted).rosters !== null
  ) {
    return { v: 1, rosters: { ...base.rosters, ...(partial as InstitutionRostersPersisted).rosters } };
  }
  return base;
}

function loadRostersPersisted(): InstitutionRostersPersisted {
  if (typeof window === "undefined") return defaultInstitutionRostersPersisted();
  try {
    const raw = localStorage.getItem(ROSTERS_KEY);
    if (!raw) return defaultInstitutionRostersPersisted();
    return hydrateRosters(JSON.parse(raw));
  } catch {
    return defaultInstitutionRostersPersisted();
  }
}

function saveRostersPersisted(data: InstitutionRostersPersisted) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROSTERS_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(IC_INSTITUTION_ROSTERS_CHANGED_EVENT));
}

function unlinkFromRosterPerson(
  p: InstitutionRosterData["leader"],
  userId: string,
  discordIdNorm: string,
): InstitutionRosterData["leader"] {
  const d = (p.discordId ?? "").trim();
  if (p.userId === userId || (discordIdNorm && d === discordIdNorm)) {
    return { ...p, userId: undefined, discordId: undefined };
  }
  return p;
}

function unlinkFromRosterData(roster: InstitutionRosterData, userId: string, discordIdNorm: string): InstitutionRosterData {
  return {
    leader: unlinkFromRosterPerson(roster.leader, userId, discordIdNorm),
    deputy: unlinkFromRosterPerson(roster.deputy, userId, discordIdNorm),
    members: roster.members.map((m) => {
      const md = (m.discordId ?? "").trim();
      if (m.userId === userId || (discordIdNorm && md === discordIdNorm)) {
        return { ...m, userId: undefined, discordId: undefined };
      }
      return m;
    }),
  };
}

export type DeletedPublicUserRef = {
  id: string;
  username: string;
  fullName: string;
  discordId: string;
  /** الاسم المعروض (مثل Discord) — يطابق applicantDisplayName في الطلبات */
  displayName?: string;
};

function applicationMatchesDeletedPublicUser(a: ApplicationRecord, target: DeletedPublicUserRef): boolean {
  const id = target.id.trim();
  const usernameLow = target.username.trim().toLowerCase();
  const discordNorm = target.discordId.trim();
  const fullNameTrim = target.fullName.trim();
  const fullNameLow = fullNameTrim.toLowerCase();

  const linkedApp = (a.applicantUserId ?? "").trim();
  if (linkedApp) return linkedApp === id;
  if (a.applicantUsername && a.applicantUsername.trim().toLowerCase() === usernameLow) return true;
  const disp = (a.applicantDisplayName ?? "").trim();
  const dn = (target.displayName ?? "").trim();
  if (dn && disp && disp.toLowerCase() === dn.toLowerCase()) return true;
  if (fullNameTrim && disp && disp.toLowerCase() === fullNameLow) return true;
  const snapDc = a.snapshot?.discordId?.trim();
  if (discordNorm && snapDc && snapDc === discordNorm) return true;
  return false;
}

/**
 * يحذف طلبات التقديم المرتبطة بالحساب، تكتاته، ويربطه من طواقم المؤسسات فقط (لا يمسح بطاقات الطاقم نصياً).
 */
export function purgeArtifactsForDeletedPublicUser(target: DeletedPublicUserRef): void {
  if (typeof window === "undefined") return;
  const id = target.id.trim();
  const usernameLow = target.username.trim().toLowerCase();
  const discordNorm = target.discordId.trim();
  const fullNameTrim = target.fullName.trim();

  const apps = loadApplications();
  const nextApps = apps.filter((a) => !applicationMatchesDeletedPublicUser(a, target));
  if (nextApps.length !== apps.length) {
    saveApplications(nextApps);
  }

  const tickets = loadTickets();
  const nextTickets: TicketThread[] = tickets.filter((t) => {
    if (t.openedById && t.openedById === id) return false;
    const ob = (t.openedBy ?? "").trim();
    if (ob && ob.toLowerCase() === usernameLow) return false;
    if (fullNameTrim && ob === fullNameTrim) return false;
    return true;
  });
  if (nextTickets.length !== tickets.length) {
    saveTickets(nextTickets);
  }

  const rostersState = loadRostersPersisted();
  let rostersChanged = false;
  const nextRosters: InstitutionRostersPersisted["rosters"] = { ...rostersState.rosters };
  for (const branchId of INSTITUTION_BRANCH_IDS) {
    const r = nextRosters[branchId];
    if (!r) continue;
    const before = JSON.stringify(r);
    const updated = unlinkFromRosterData(r, id, discordNorm);
    if (JSON.stringify(updated) !== before) {
      nextRosters[branchId] = updated;
      rostersChanged = true;
    }
  }
  if (rostersChanged) {
    saveRostersPersisted({ v: 1, rosters: nextRosters });
  }
}
