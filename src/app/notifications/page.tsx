
import { createServerClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Notifications</h1>
      <div className="grid gap-4">
        {notifications?.map((notification) => (
          <Card key={notification.id} className={`${notification.is_read ? 'bg-gray-100' : ''}`}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Bell className="w-6 h-6" />
              <CardTitle>{notification.message}</CardTitle>
            </CardHeader>
          </Card>
        ))}
        {notifications?.length === 0 && <p>No notifications yet.</p>}
      </div>
    </div>
  );
}
