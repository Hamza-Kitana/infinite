/** روابط خارجية مشتركة — يُفضّل ضبط الديسكورد في `.env` كـ `VITE_DISCORD_INVITE_URL` */
export const DISCORD_INVITE_URL =
  typeof import.meta.env.VITE_DISCORD_INVITE_URL === "string" && import.meta.env.VITE_DISCORD_INVITE_URL.trim().length > 0
    ? import.meta.env.VITE_DISCORD_INVITE_URL.trim()
    : "https://discord.gg/INFCFW";
