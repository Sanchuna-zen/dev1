'use client'

import { useState, useEffect } from 'react';
import { ProductCard, ProductSearchResult } from "@/components/products/ProductCard";
import { createClient } from '@/lib/supabase/client';

interface RealtimeProductListProps {
  initialProducts: ProductSearchResult[];
}

export function RealtimeProductList({ initialProducts }: RealtimeProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const supabase = createClient();

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    const channel = supabase
      .channel('inventory-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'inventory' },
        (payload) => {
          setProducts(currentProducts =>
            currentProducts.map(p => {
              if (p.product_id === payload.new.product_id && p.shop_id === payload.new.shop_id) {
                return { ...p, quantity: payload.new.quantity };
              }
              return p;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, initialProducts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={`${product.product_id}-${product.shop_id}`} product={product} />
      ))}
    </div>
  );
}
