/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_INVITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
