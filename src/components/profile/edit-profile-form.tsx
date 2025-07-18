
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { timezones } from "@/lib/timezones";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function EditProfileForm({ profile, onUpdate }) {
  const supabase = createClient();
  const [avatar, setAvatar] = React.useState(null);
  const [preview, setPreview] = React.useState(profile.avatar_url);
  const [skillsOffered, setSkillsOffered] = React.useState(profile.skills_offered || []);
  const [currentSkillOffered, setCurrentSkillOffered] = React.useState("");
  const [skillsSought, setSkillsSought] = React.useState(profile.skills_sought || []);
  const [currentSkillSought, setCurrentSkillSought] = React.useState("");

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSkill = (type) => {
    if (type === "offered" && currentSkillOffered.trim() !== "") {
      setSkillsOffered([...skillsOffered, currentSkillOffered.trim()]);
      setCurrentSkillOffered("");
    } else if (type === "sought" && currentSkillSought.trim() !== "") {
      setSkillsSought([...skillsSought, currentSkillSought.trim()]);
      setCurrentSkillSought("");
    }
  };

  const handleRemoveSkill = (type, skillToRemove) => {
    if (type === "offered") {
      setSkillsOffered(skillsOffered.filter((skill) => skill !== skillToRemove));
    } else if (type === "sought") {
      setSkillsSought(skillsSought.filter((skill) => skill !== skillToRemove));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    let avatar_url = profile.avatar_url;
    if (avatar) {
      const { data: avatarData, error: avatarError } = await supabase.storage
        .from("avatars")
        .upload(`${profile.user_id}/${avatar.name}`, avatar, { upsert: true });

      if (avatarError) {
        toast.error("Error uploading avatar: " + avatarError.message);
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(avatarData.path);
      avatar_url = urlData.publicUrl;
    }

    const { data: updatedProfile, error } = await supabase.from("profiles").update({
      ...data,
      skills_offered: skillsOffered,
      skills_sought: skillsSought,
      avatar_url,
    }).eq("id", profile.id).select().single();

    if (error) {
      toast.error("Error updating profile: " + error.message);
    } else {
      toast.success("Profile updated successfully!");
      onUpdate(updatedProfile);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2 text-center">
        <Label>Profile Picture</Label>
        <Avatar className="w-24 h-24 mx-auto">
          <AvatarImage src={preview} alt="Avatar" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Input type="file" accept="image/*" onChange={handleAvatarChange} className="mx-auto" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="skills-offered">Skills to Teach</Label>
        <div className="flex gap-2">
        <Input
          id="skills-offered"
          placeholder="e.g., React, TypeScript, Next.js"
          value={currentSkillOffered}
          onChange={(e) => setCurrentSkillOffered(e.target.value)}
        />
        <Button type="button" onClick={() => handleAddSkill("offered")}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skillsOffered.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
              <button type="button" className="ml-2" onClick={() => handleRemoveSkill("offered", skill)}><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="skills-sought">Skills to Learn</Label>
        <div className="flex gap-2">
        <Input
          id="skills-sought"
          placeholder="e.g., React, TypeScript, Next.js"
          value={currentSkillSought}
          onChange={(e) => setCurrentSkillSought(e.target.value)}
        />
        <Button type="button" onClick={() => handleAddSkill("sought")}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skillsSought.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
              <button type="button" className="ml-2" onClick={() => handleRemoveSkill("sought", skill)}><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="language">Language</Label>
        <Select name="language" defaultValue={profile.language}>
          <SelectTrigger id="language"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select name="timezone" defaultValue={profile.timezone}>
          <SelectTrigger id="timezone"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-[20rem] overflow-y-auto">
            {timezones.map((tz) => (<SelectItem key={tz} value={tz}>{tz}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Communication Preferences</Label>
        <RadioGroup name="communication_preference" defaultValue={profile.communication_preference}>
          <div className="flex items-center space-x-2"><RadioGroupItem value="email" id="email" /><Label htmlFor="email">Email</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="in-app" id="in-app" /><Label htmlFor="in-app">In-app</Label></div>
        </RadioGroup>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="user-type">User Type</Label>
        <Select name="user_type" defaultValue={profile.user_type}>
          <SelectTrigger id="user-type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="mentee">Mentee</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Save Changes</Button>
    </form>
  );
}
