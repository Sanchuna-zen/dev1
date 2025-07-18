
"use client";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const supabase = createServerClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return notFound();
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        return notFound();
      }
      setProfile(profile);
    };

    fetchProfile();
  }, [supabase]);

  const handleUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url} alt="Avatar" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.email}</CardTitle>
            </div>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <EditProfileForm profile={profile} onUpdate={handleUpdate} />
          ) : (
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold">Skills Offered</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.skills_offered.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-gray-200 rounded-md text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Skills Sought</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.skills_sought.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-gray-200 rounded-md text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Language</h3>
                <p>{profile.language}</p>
              </div>
              <div>
                <h3 className="font-semibold">Timezone</h3>
                <p>{profile.timezone}</p>
              </div>
              <div>
                <h3 className="font-semibold">Communication Preference</h3>
                <p>{profile.communication_preference}</p>
              </div>
              <div>
                <h3 className="font-semibold">User Type</h3>
                <p>{profile.user_type}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
