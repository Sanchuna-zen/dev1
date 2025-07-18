
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserDetailsStepProps {
  onSave: (details: {
    avatar: File | null;
    userType: string;
  }) => void;
}

export function UserDetailsStep({ onSave }: UserDetailsStepProps) {
  const [avatar, setAvatar] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [userType, setUserType] = React.useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (userType) {
      onSave({ avatar, userType });
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 text-center">
        <Label>Profile Picture</Label>
        <Avatar className="w-24 h-24 mx-auto">
          <AvatarImage src={preview || "https://github.com/shadcn.png"} alt="Avatar" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Input type="file" accept="image/*" onChange={handleAvatarChange} className="mx-auto" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="user-type">I am a...</Label>
        <Select onValueChange={setUserType} value={userType}>
          <SelectTrigger id="user-type">
            <SelectValue placeholder="Select a user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="mentee">Mentee</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSave} disabled={!userType}>
        Finish Setup
      </Button>
    </div>
  );
}
