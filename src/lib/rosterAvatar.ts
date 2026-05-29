import { discordDefaultAvatarUrl } from "@/lib/discordOAuth";

const PUBLIC_USERS_KEY = "ic_public_users_v1";
const PLACEHOLDER = "/placeholder.svg";

export type PublicUserAvatarRow = {
  id: string;
  discordId: string;
  avatarUrl?: string;
};

export function loadPublicUserAvatars(): PublicUserAvatarRow[] {
  try {
    const raw = localStorage.getItem(PUBLIC_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row): row is PublicUserAvatarRow => {
        if (!row || typeof row !== "object") return false;
        const r = row as Partial<PublicUserAvatarRow>;
        return typeof r.id === "string" && typeof r.discordId === "string";
      })
      .map((row) => ({
        id: row.id,
        discordId: row.discordId.trim(),
        avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl.trim() : undefined,
      }));
  } catch {
    return [];
  }
}

function findLinkedUser(
  users: readonly PublicUserAvatarRow[],
  person: { userId?: string; discordId?: string },
): PublicUserAvatarRow | undefined {
  const userId = person.userId?.trim();
  if (userId) {
    const byId = users.find((u) => u.id === userId);
    if (byId) return byId;
  }
  const discordId = person.discordId?.trim();
  if (discordId) {
    return users.find((u) => u.discordId === discordId);
  }
  return undefined;
}

/** يفضّل أفاتار Discord للحساب المرتبط، ثم الصورة المحفوظة في الطاقم */
export function resolveRosterPersonImage(
  users: readonly PublicUserAvatarRow[],
  person: { image?: string; userId?: string; discordId?: string },
  size = 256,
): string {
  const linked = findLinkedUser(users, person);
  const discordId = (linked?.discordId ?? person.discordId)?.trim();

  if (linked?.avatarUrl) return linked.avatarUrl;
  if (discordId) return discordDefaultAvatarUrl(discordId, size);

  const stored = person.image?.trim();
  if (stored && stored !== PLACEHOLDER) return stored;
  return PLACEHOLDER;
}
