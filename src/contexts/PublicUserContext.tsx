import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type PublicUser = {
  id: string;
  realName: string;
  fullName: string;
  username: string;
  email: string;
  discordId: string;
  age: number;
  password: string;
  displayName: string;
  /** حساب أنشئ بتسجيل يدوي؛ Discord OAuth يضيف discord */
  authProvider?: "local" | "discord";
  avatarUrl?: string;
  isActive?: boolean;
  createdAt: string;
};

type PublicSessionUser = {
  id: string;
  username: string;
  displayName: string;
  authProvider?: "local" | "discord";
};

export type PublicUserProfile = {
  id: string;
  realName: string;
  cityName: string;
  username: string;
  email: string;
  discordId: string;
  age: number;
  avatarUrl?: string;
  authProvider?: "local" | "discord";
  createdAt: string;
};

export type DiscordSignInPayload = {
  discordUserId: string;
  discordUsername: string;
  globalName: string | null;
  email: string | null;
  avatarUrl?: string;
};

type PublicUserContextValue = {
  user: PublicSessionUser | null;
  /** تسجيل دخول عبر Discord OAuth (PKCE) — يربط الحساب بمعرّف Discord */
  signInWithDiscord: (payload: DiscordSignInPayload) => { ok: true } | { ok: false; reason: string };
  register: (input: {
    realName: string;
    fullName: string;
    username: string;
    email: string;
    discordId: string;
    age: number;
    password: string;
  }) => { ok: true } | { ok: false; reason: string };
  login: (input: { username: string; password: string }) => { ok: true } | { ok: false; reason: string };
  logout: () => void;
  getProfile: () => PublicUserProfile | null;
  updateProfile: (
    patch: Partial<Pick<PublicUserProfile, "realName" | "cityName" | "email" | "discordId" | "age" | "avatarUrl">>,
  ) => { ok: true } | { ok: false; reason: string };
};

const USERS_KEY = "ic_public_users_v1";
const SESSION_KEY = "ic_public_user_session_v1";

const PublicUserContext = createContext<PublicUserContextValue | null>(null);

function loadUsers(): PublicUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is PublicUser => {
      if (!x || typeof x !== "object") return false;
      const p = x as Partial<PublicUser>;
      return (
        typeof p.id === "string" &&
        typeof p.realName === "string" &&
        typeof p.fullName === "string" &&
        typeof p.username === "string" &&
        typeof p.email === "string" &&
        typeof p.discordId === "string" &&
        typeof p.age === "number" &&
        typeof p.password === "string" &&
        typeof p.displayName === "string" &&
        (typeof p.avatarUrl === "undefined" || typeof p.avatarUrl === "string") &&
        (typeof p.isActive === "undefined" || typeof p.isActive === "boolean") &&
        typeof p.createdAt === "string" &&
        (p.authProvider === undefined || p.authProvider === "local" || p.authProvider === "discord")
      );
    });
  } catch {
    return [];
  }
}

function saveUsers(users: PublicUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession(): PublicSessionUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PublicSessionUser>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.id !== "string" || typeof parsed.username !== "string" || typeof parsed.displayName !== "string") return null;
    const authProvider =
      parsed.authProvider === "discord" || parsed.authProvider === "local" ? parsed.authProvider : undefined;
    return { id: parsed.id, username: parsed.username, displayName: parsed.displayName, authProvider };
  } catch {
    return null;
  }
}

function saveSession(user: PublicSessionUser | null) {
  if (!user) {
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function PublicUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicSessionUser | null>(() => loadSession());

  const value = useMemo<PublicUserContextValue>(
    () => ({
      user,
      signInWithDiscord: ({ discordUserId, discordUsername, globalName, email, avatarUrl }) => {
        const users = loadUsers();
        const existing = users.find((x) => x.discordId === discordUserId);
        const displayFromDiscord = (globalName?.trim() || discordUsername).trim();
        const emailNorm = (email ?? "").trim().toLowerCase();
        const resolvedEmail =
          emailNorm && emailNorm.includes("@") && !emailNorm.startsWith("@") && !emailNorm.endsWith("@")
            ? emailNorm
            : `${discordUserId}@discord.oauth.local`;

        if (existing) {
          if (existing.isActive === false) return { ok: false, reason: "الحساب موقوف من الإدارة" };
          const updatedUsers = users.map((u) =>
            u.id === existing.id
              ? {
                  ...u,
                  authProvider: "discord" as const,
                  avatarUrl: avatarUrl ?? u.avatarUrl,
                  displayName: displayFromDiscord || u.displayName,
                  fullName: u.fullName || displayFromDiscord,
                  email:
                    emailNorm && emailNorm.includes("@") && !emailNorm.startsWith("@") && !emailNorm.endsWith("@")
                      ? emailNorm
                      : u.email,
                }
              : u,
          );
          saveUsers(updatedUsers);
          const sessionUser: PublicSessionUser = {
            id: existing.id,
            username: existing.username,
            displayName: displayFromDiscord || existing.displayName,
            authProvider: "discord",
          };
          setUser(sessionUser);
          saveSession(sessionUser);
          return { ok: true };
        }

        const baseHandle = discordUsername.toLowerCase().replace(/[^a-z0-9._]/g, "") || `u${discordUserId.slice(-8)}`;
        let username = baseHandle;
        let suffix = 0;
        while (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
          suffix += 1;
          username = `${baseHandle}_${suffix}`;
        }

        const created: PublicUser = {
          id: crypto.randomUUID(),
          realName: displayFromDiscord,
          fullName: displayFromDiscord,
          username,
          email: resolvedEmail,
          discordId: discordUserId,
          age: 18,
          password: "",
          displayName: displayFromDiscord,
          authProvider: "discord",
          avatarUrl,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        saveUsers([...users, created]);
        const sessionUser: PublicSessionUser = {
          id: created.id,
          username: created.username,
          displayName: created.displayName,
          authProvider: "discord",
        };
        setUser(sessionUser);
        saveSession(sessionUser);
        return { ok: true };
      },
      register: ({ realName, fullName, username, email, discordId, age, password }) => {
        const r = realName.trim();
        const f = fullName.trim();
        const u = username.trim().toLowerCase();
        const em = email.trim().toLowerCase();
        const dc = discordId.trim();
        if (r.length < 3) return { ok: false, reason: "الاسم الحقيقي قصير" };
        if (f.length < 3) return { ok: false, reason: "اسمك داخل المدينة قصير" };
        if (u.length < 3) return { ok: false, reason: "اسم المستخدم قصير" };
        if (!em.includes("@") || em.startsWith("@") || em.endsWith("@")) return { ok: false, reason: "الإيميل غير صحيح" };
        if (dc.length < 2) return { ok: false, reason: "Discord ID غير صحيح" };
        if (!Number.isFinite(age) || age < 13) return { ok: false, reason: "العمر يجب أن يكون 13 أو أكثر" };
        if (password.length < 4) return { ok: false, reason: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" };
        const users = loadUsers();
        if (users.some((x) => x.username.toLowerCase() === u)) {
          return { ok: false, reason: "اسم المستخدم مستخدم مسبقاً" };
        }
        if (users.some((x) => x.fullName.trim().toLowerCase() === f.toLowerCase())) {
          return { ok: false, reason: "اسمك داخل المدينة مستخدم مسبقاً" };
        }
        if (users.some((x) => x.email.toLowerCase() === em)) {
          return { ok: false, reason: "الإيميل مستخدم مسبقاً" };
        }
        if (users.some((x) => x.discordId.trim() === dc)) {
          return { ok: false, reason: "Discord ID مربوط بحساب آخر — سجّل الدخول عبر Discord" };
        }
        const created: PublicUser = {
          id: crypto.randomUUID(),
          realName: r,
          fullName: f,
          username: u,
          email: em,
          discordId: dc,
          age: Math.floor(age),
          password,
          displayName: f,
          authProvider: "local",
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        saveUsers([...users, created]);
        const sessionUser: PublicSessionUser = {
          id: created.id,
          username: created.username,
          displayName: created.displayName,
          authProvider: "local",
        };
        setUser(sessionUser);
        saveSession(sessionUser);
        return { ok: true };
      },
      login: ({ username, password }) => {
        const u = username.trim().toLowerCase();
        const found = loadUsers().find((x) => x.username.toLowerCase() === u && x.password === password);
        if (!found) return { ok: false, reason: "بيانات الدخول غير صحيحة" };
        if (found.authProvider === "discord") return { ok: false, reason: "هذا الحساب مسجّل عبر Discord — استخدم زر Discord" };
        if (found.isActive === false) return { ok: false, reason: "الحساب موقوف من الإدارة" };
        const sessionUser: PublicSessionUser = {
          id: found.id,
          username: found.username,
          displayName: found.displayName,
          authProvider: found.authProvider ?? "local",
        };
        setUser(sessionUser);
        saveSession(sessionUser);
        return { ok: true };
      },
      logout: () => {
        setUser(null);
        saveSession(null);
      },
      getProfile: () => {
        if (!user) return null;
        const found = loadUsers().find((x) => x.id === user.id);
        if (!found) return null;
        return {
          id: found.id,
          realName: found.realName,
          cityName: found.fullName,
          username: found.username,
          email: found.email,
          discordId: found.discordId,
          age: found.age,
          avatarUrl: found.avatarUrl,
          authProvider: found.authProvider ?? "local",
          createdAt: found.createdAt,
        };
      },
      updateProfile: (patch) => {
        if (!user) return { ok: false, reason: "غير مسجل دخول" };
        const users = loadUsers();
        const idx = users.findIndex((x) => x.id === user.id);
        if (idx < 0) return { ok: false, reason: "الحساب غير موجود" };
        const current = users[idx];
        const nextRealName = (patch.realName ?? current.realName).trim();
        const nextCity = (patch.cityName ?? current.fullName).trim();
        const nextEmail = (patch.email ?? current.email).trim().toLowerCase();
        const nextDiscordId = (patch.discordId ?? current.discordId).trim();
        const nextAge = Math.floor(patch.age ?? current.age);
        const nextAvatar = patch.avatarUrl ?? current.avatarUrl;

        if (nextRealName.length < 3) return { ok: false, reason: "الاسم الحقيقي قصير" };
        if (nextCity.length < 3) return { ok: false, reason: "اسم المدينة قصير" };
        if (!nextEmail.includes("@") || nextEmail.startsWith("@") || nextEmail.endsWith("@")) return { ok: false, reason: "الإيميل غير صحيح" };
        if (nextDiscordId.length < 2) return { ok: false, reason: "Discord ID غير صحيح" };
        if (!Number.isFinite(nextAge) || nextAge < 13) return { ok: false, reason: "العمر يجب أن يكون 13 أو أكثر" };
        if (users.some((x) => x.id !== current.id && x.email.toLowerCase() === nextEmail)) return { ok: false, reason: "الإيميل مستخدم مسبقاً" };

        const next: PublicUser = {
          ...current,
          realName: nextRealName,
          fullName: nextCity,
          email: nextEmail,
          discordId: nextDiscordId,
          age: nextAge,
          avatarUrl: nextAvatar,
          displayName: nextCity,
        };
        const updated = [...users];
        updated[idx] = next;
        saveUsers(updated);
        const nextSession: PublicSessionUser = {
          id: next.id,
          username: next.username,
          displayName: next.displayName,
          authProvider: next.authProvider ?? "local",
        };
        setUser(nextSession);
        saveSession(nextSession);
        return { ok: true };
      },
    }),
    [user],
  );

  return <PublicUserContext.Provider value={value}>{children}</PublicUserContext.Provider>;
}

export function usePublicUser() {
  const ctx = useContext(PublicUserContext);
  if (!ctx) throw new Error("usePublicUser must be used inside PublicUserProvider");
  return ctx;
}
