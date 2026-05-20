import { GANG_OPEN_TICKET_ROLE } from "@/lib/ticketTypesConfig";
import { createTicket, type TicketAttachment, type TicketThread } from "@/lib/ticketsCenter";

export function findOpenGangOpenTicket(tickets: TicketThread[], userId: string): TicketThread | undefined {
  return tickets.find(
    (t) => t.typeRole === GANG_OPEN_TICKET_ROLE && t.openedById === userId && t.status !== "closed",
  );
}

export function createGangOpenTicket(input: {
  proposedName: string;
  specialty: string;
  location: string;
  body: string;
  openedBy: string;
  openedById: string;
  attachments?: TicketAttachment[];
}) {
  const proposedName = input.proposedName.trim();
  const specialty = input.specialty.trim();
  const location = input.location.trim();
  const details = input.body.trim();
  const intro = [
    `اسم العصابة المقترح: ${proposedName}`,
    `التخصص: ${specialty}`,
    `الموقع/النطاق: ${location}`,
    "",
    "تفاصيل إضافية:",
    details || "—",
  ].join("\n");

  return createTicket({
    typeRole: GANG_OPEN_TICKET_ROLE,
    typeLabel: "طلب فتح عصابة",
    subject: `فتح عصابة — ${proposedName}`,
    openedBy: input.openedBy,
    openedById: input.openedById,
    body: intro,
    attachments: input.attachments,
    gangOpenProposedName: proposedName,
    gangOpenSpecialty: specialty,
    gangOpenLocation: location,
  });
}
