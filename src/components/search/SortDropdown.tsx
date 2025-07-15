'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'distance_asc', label: 'Distance: Closest' },
];

export function SortDropdown() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentSort = searchParams.get('sort') || 'relevance';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'relevance') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
        <Label htmlFor="sort-by">Sort by</Label>
        <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger id="sort-by" className="w-[180px]">
            <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
            {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                    {option.label}
                </SelectItem>
            ))}
        </SelectContent>
        </Select>
    </div>
  );
}
