'use client'

import { TicketListItem, Ticket } from "@/components/help/TicketListItem";

interface TicketListProps {
  tickets: Ticket[];
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return <p>You have not submitted any support tickets yet.</p>;
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <TicketListItem key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
