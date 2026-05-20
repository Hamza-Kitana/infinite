import { GANG_OPEN_TICKET_ROLE, type TicketTypeRole } from "@/lib/ticketTypesConfig";
import type { TicketThread } from "@/lib/ticketsCenter";

function ticketHasUnreadForStaff(ticket: TicketThread): boolean {
  const cutoff = ticket.lastStaffReadAt ? new Date(ticket.lastStaffReadAt).getTime() : 0;
  return ticket.messages.some(
    (m) => (m.senderType ?? "public") === "public" && new Date(m.at).getTime() > cutoff,
  );
}

export function countGangTicketsByRole(tickets: TicketThread[], typeRole: TicketTypeRole): number {
  return tickets.filter((t) => t.typeRole === typeRole).length;
}

export function countUnreadGangTicketsByRole(tickets: TicketThread[], typeRole: TicketTypeRole): number {
  return tickets.filter((t) => t.typeRole === typeRole && ticketHasUnreadForStaff(t)).length;
}

export function countWaitingGangTicketsByRole(tickets: TicketThread[], typeRole: TicketTypeRole): number {
  return tickets.filter((t) => t.typeRole === typeRole && (t.status === "waiting" || t.status === "in_review")).length;
}

export function countGangOpenUnread(tickets: TicketThread[]): number {
  return countUnreadGangTicketsByRole(tickets, GANG_OPEN_TICKET_ROLE);
}

export function countGangManagerInboxUnread(tickets: TicketThread[]): number {
  return countGangOpenUnread(tickets);
}
