import type { PublicUserProfile, PublicSessionUser } from "@/contexts/PublicUserContext";
import { createTicket, type TicketThread } from "@/lib/ticketsCenter";

export const STORE_ORDER_TICKET_LABEL = "طلب متجر";

export function appendStoreOrderRequesterBlock(
  body: string,
  profile: PublicUserProfile,
  user: PublicSessionUser,
): string {
  const lines = [
    "——————————",
    "بيانات صاحب الطلب (تلقائي من الحساب):",
    `الاسم المعروض: ${(user.displayName || "").trim() || "—"}`,
    `اسم المستخدم: ${user.username}`,
    `معرّف الحساب: ${user.id}`,
    `الاسم داخل المدينة: ${profile.cityName.trim() || "—"}`,
    `الاسم الكامل (الحقيقي): ${profile.realName.trim() || "—"}`,
  ];
  if (profile.email?.trim()) lines.push(`البريد: ${profile.email.trim()}`);
  if (profile.discordId?.trim()) lines.push(`Discord: ${profile.discordId.trim()}`);
  if (Number.isFinite(profile.age)) lines.push(`العمر: ${profile.age}`);
  return `${body.trim()}\n\n${lines.join("\n")}`;
}

export function createStoreOrderTicket(input: {
  user: PublicSessionUser;
  profile: PublicUserProfile;
  subject: string;
  productDetailsBody: string;
}): TicketThread {
  const body = appendStoreOrderRequesterBlock(input.productDetailsBody, input.profile, input.user);
  return createTicket({
    typeRole: "ticket_store_manager",
    typeLabel: STORE_ORDER_TICKET_LABEL,
    openedBy: input.user.displayName?.trim() || input.user.username,
    openedById: input.user.id,
    subject: input.subject.trim() || STORE_ORDER_TICKET_LABEL,
    body,
  });
}
