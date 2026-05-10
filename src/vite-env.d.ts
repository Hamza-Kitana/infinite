/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_INVITE_URL?: string;
  /** معرّف التطبيق من Discord Developer Portal — مطلوب لتسجيل الدخول عبر Discord */
  readonly VITE_DISCORD_CLIENT_ID?: string;
  /** اختياري: إذا كان مختلفاً عن `${origin}/auth/discord/callback` */
  readonly VITE_DISCORD_REDIRECT_URI?: string;
  /** اختياري: في الإنتاج إذا حُظِر الطلب المباشر إلى kick.com (CORS)، وجّه نفس مسار بروكسي يخدم `/api/v2/channels/:slug` */
  readonly VITE_KICK_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
