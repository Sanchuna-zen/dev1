'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns';

export type Ticket = {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  message: string;
};

interface TicketListItemProps {
  ticket: Ticket;
}

export function TicketListItem({ ticket }: TicketListItemProps) {
  const getStatusVariant = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'closed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{ticket.subject}</CardTitle>
                <CardDescription>Opened on {format(new Date(ticket.created_at), 'PPP')}</CardDescription>
            </div>
            <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground truncate">{ticket.message}</p>
      </CardContent>
    </Card>
  )
}
