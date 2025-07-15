
import { createClient } from "@/lib/supabase/server";
import { TicketList } from "./_components/TicketList";
import { redirect } from "next/navigation";

export default async function ViewTicketsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: tickets, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // This could be a more user-friendly error message
    return <div>Error loading tickets.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Your Support Tickets</h1>
      <TicketList tickets={tickets || []} />
    </div>
  );
}
