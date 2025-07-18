
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';

export function ProposeSessionForm({ profile }) {
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const { data: { user } } = await supabase.auth.getUser();

    const { data: session, error } = await supabase.from("sessions").insert({
      ...data,
      proposer_id: user.id,
      time_slots: [data.time_slots] // TODO: Handle multiple time slots
    }).select().single();

    if (error) {
      toast.error("Error creating session: " + error.message);
    } else {
      toast.success("Session created successfully!");
      router.push(`/sessions/${session.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="skill_offered">Skill to Teach</Label>
        <Select name="skill_offered">
          <SelectTrigger id="skill_offered"><SelectValue /></SelectTrigger>
          <SelectContent>
            {profile.skills_offered.map((skill) => (
              <SelectItem key={skill} value={skill}>{skill}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="skill_sought">Skill to Learn</Label>
        <Select name="skill_sought">
          <SelectTrigger id="skill_sought"><SelectValue /></SelectTrigger>
          <SelectContent>
            {profile.skills_sought.map((skill) => (
              <SelectItem key={skill} value={skill}>{skill}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="duration">Duration (in minutes)</Label>
        <Input id="duration" name="duration" type="number" placeholder="e.g., 60" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="time_slots">Proposed Time Slots</Label>
        <Input id="time_slots" name="time_slots" type="datetime-local" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="language">Language</Label>
        <Select name="language">
          <SelectTrigger id="language"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="accessibility_needs">Accessibility Needs</Label>
        <Textarea name="accessibility_needs" id="accessibility_needs" placeholder="e.g., screen reader, captions..." />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea name="message" id="message" placeholder="Write a message to the other user..." />
      </div>
      <Button type="submit">Propose Session</Button>
    </form>
  );
}
