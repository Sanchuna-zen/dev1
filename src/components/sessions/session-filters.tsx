
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SessionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.name && e.target.value) {
      newParams.set(e.target.name, e.target.value);
    } else if (e.target.name) {
      newParams.delete(e.target.name);
    }
    router.push(`?${newParams.toString()}`);
  };

  const handleSelectChange = (name, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    router.push(`?${newParams.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <Label htmlFor="skill">Skill</Label>
        <Input id="skill" name="skill" defaultValue={searchParams.get('skill')} onChange={handleFilterChange} />
      </div>
      <div>
        <Label htmlFor="language">Language</Label>
        <Select name="language" defaultValue={searchParams.get('language')} onValueChange={(value) => handleSelectChange('language', value)}>
          <SelectTrigger id="language"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Time filter would go here */}
    </div>
  );
}
