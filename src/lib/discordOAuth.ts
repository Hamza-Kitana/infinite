/** Discord OAuth2 مع PKCE — بدون client secret على الواجهة (مناسب لتطبيق عام). */

const DISCORD_AUTHORIZE = "https://discord.com/api/oauth2/authorize";
const DISCORD_TOKEN = "https://discord.com/api/oauth2/token";
const DISCORD_API = "https://discord.com/api";

export const DISCORD_OAUTH_SESSION_KEY = "ic_discord_pkce_oauth_v1";

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** قيمة عشوائية آمنة لـ PKCE و state */
export function randomUrlSafeString(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export async function createPkcePair(): Promise<{ verifier: string; challenge: string }> {
  const verifier = randomUrlSafeString(48);
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const challenge = bytesToBase64Url(new Uint8Array(hash));
  return { verifier, challenge };
}

export function getDiscordRedirectUri(): string {
  const override = import.meta.env.VITE_DISCORD_REDIRECT_URI;
  if (typeof override === "string" && override.trim().length > 0) return override.trim();
  return `${window.location.origin}/auth/discord/callback`;
}

export function isDiscordOAuthConfigured(): boolean {
  const id = import.meta.env.VITE_DISCORD_CLIENT_ID;
  return typeof id === "string" && id.trim().length > 0;
}

export function buildDiscordAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const u = new URL(DISCORD_AUTHORIZE);
  u.searchParams.set("client_id", params.clientId);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("redirect_uri", params.redirectUri);
  u.searchParams.set("scope", "identify email");
  u.searchParams.set("state", params.state);
  u.searchParams.set("code_challenge", params.codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");
  return u.toString();
}

/** يبدأ التوجيه إلى Discord؛ يخزّن verifier في sessionStorage */
export async function startDiscordLogin(): Promise<void> {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID?.trim();
  if (!clientId) throw new Error("DISCORD_CLIENT_ID_MISSING");

  const { verifier, challenge } = await createPkcePair();
  const state = randomUrlSafeString(24);
  sessionStorage.setItem(
    DISCORD_OAUTH_SESSION_KEY,
    JSON.stringify({ verifier, state, at: Date.now() }),
  );

  const redirectUri = getDiscordRedirectUri();
  const url = buildDiscordAuthorizeUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge: challenge,
  });
  window.location.assign(url);
}

export async function exchangeDiscordCode(params: {
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<{ access_token: string; token_type: string }> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  });

  const res = await fetch(DISCORD_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`discord_token_${res.status}:${text}`);
  }
  return res.json() as Promise<{ access_token: string; token_type: string }>;
}

export type DiscordApiUser = {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  email?: string | null;
};

export async function fetchDiscordMe(accessToken: string): Promise<DiscordApiUser> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("discord_me_failed");
  return res.json() as Promise<DiscordApiUser>;
}

export function discordCdnAvatarUrl(userId: string, avatarHash: string | null, size = 128): string | undefined {
  if (!avatarHash) return undefined;
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=${size}`;
}

/** صورة Discord الافتراضية عندما لا يملك المستخدم أفاتار مخصص */
export function discordDefaultAvatarUrl(discordUserId: string, size = 128): string {
  try {
    const id = BigInt(discordUserId);
    const index = Number((id >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${index}.png?size=${size}`;
  } catch {
    return `https://cdn.discordapp.com/embed/avatars/0.png?size=${size}`;
  }
}
