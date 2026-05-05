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
  avatarUrl?: string;
  isActive?: boolean;
  createdAt: string;
};

type PublicSessionUser = {
  id: string;
  username: string;
  displayName: string;
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
  createdAt: string;
};

type PublicUserContextValue = {
  user: PublicSessionUser | null;
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
        typeof p.createdAt === "string"
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
    return { id: parsed.id, username: parsed.username, displayName: parsed.displayName };
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
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        saveUsers([...users, created]);
        const sessionUser: PublicSessionUser = { id: created.id, username: created.username, displayName: created.displayName };
        setUser(sessionUser);
        saveSession(sessionUser);
        return { ok: true };
      },
      login: ({ username, password }) => {
        const u = username.trim().toLowerCase();
        const found = loadUsers().find((x) => x.username.toLowerCase() === u && x.password === password);
        if (!found) return { ok: false, reason: "بيانات الدخول غير صحيحة" };
        if (found.isActive === false) return { ok: false, reason: "الحساب موقوف من الإدارة" };
        const sessionUser: PublicSessionUser = { id: found.id, username: found.username, displayName: found.displayName };
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
        const nextSession: PublicSessionUser = { id: next.id, username: next.username, displayName: next.displayName };
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
