'use client'

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const MOCK_CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Home Goods', 'Toys'];
const MAX_PRICE = 50000;
const MAX_DISTANCE = 100; // in km

export function FilterSidebar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Component state, initialized from URL params
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.getAll('category'));
  const [priceRange, setPriceRange] = useState<[number, number]>(
    [Number(searchParams.get('price_min')) || 0, Number(searchParams.get('price_max')) || MAX_PRICE]
  );
  const [distance, setDistance] = useState<number>(Number(searchParams.get('distance')) || MAX_DISTANCE);

  // Debounce helpers
  const [debouncedPrice, setDebouncedPrice] = useState(priceRange);
  const [debouncedDistance, setDebouncedDistance] = useState(distance);

  // Update URL when debounced values change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    // Handle Categories
    params.delete('category');
    selectedCategories.forEach(cat => params.append('category', cat));

    // Handle Price
    params.set('price_min', debouncedPrice[0].toString());
    params.set('price_max', debouncedPrice[1].toString());

    // Handle Distance
    params.set('distance', debouncedDistance.toString());

    replace(`${pathname}?${params.toString()}`);
  }, [selectedCategories, debouncedPrice, debouncedDistance, pathname, replace, searchParams]);

  // Debounce price changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPrice(priceRange);
    }, 500);
    return () => clearTimeout(handler);
  }, [priceRange]);

  // Debounce distance changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDistance(distance);
    }, 500);
    return () => clearTimeout(handler);
  }, [distance]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <h3 className="font-semibold mb-2">Category</h3>
          <div className="space-y-2">
            {MOCK_CATEGORIES.map(cat => (
              <div key={cat} className="flex items-center space-x-2">
                <Checkbox 
                  id={cat}
                  checked={selectedCategories.includes(cat)}
                  onCheckedChange={() => handleCategoryChange(cat)}
                />
                <Label htmlFor={cat}>{cat}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
            <h3 className="font-semibold mb-2">Price Range</h3>
            <Slider
                defaultValue={[0, MAX_PRICE]}
                max={MAX_PRICE}
                step={100}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
            />
            <div className="flex justify-between text-xs mt-2">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
            </div>
        </div>

        {/* Proximity Filter */}
        <div>
            <h3 className="font-semibold mb-2">Distance</h3>
            <Slider
                defaultValue={[MAX_DISTANCE]}
                max={MAX_DISTANCE}
                step={1}
                value={[distance]}
                onValueChange={(value) => setDistance(value[0])}
            />
            <div className="text-center text-xs mt-2">{distance} km</div>
        </div>
      </CardContent>
    </Card>
  );
}
