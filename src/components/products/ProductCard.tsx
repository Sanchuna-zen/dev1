import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type ProductSearchResult = {
    product_id: string;
    product_name: string;
    product_description: string;
    product_category: string;
    shop_id: string;
    shop_name: string;
    price: number;
    quantity: number;
    distance_meters: number | null;
};

interface ProductCardProps {
  product: ProductSearchResult;
}

export function ProductCard({ product }: ProductCardProps) {

  const formatDistance = (distance: number | null) => {
    if (distance === null) return null;
    if (distance < 1000) return `${Math.round(distance)} m`;
    return `${(distance / 1000).toFixed(1)} km`;
  };

  const getStockStatus = (quantity: number): { text: string; variant: 'default' | 'secondary' | 'destructive' } => {
    if (quantity > 10) return { text: 'In Stock', variant: 'default' };
    if (quantity > 0) return { text: 'Low Stock', variant: 'secondary' };
    return { text: 'Out of Stock', variant: 'destructive' };
  }

  const stockStatus = getStockStatus(product.quantity);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{product.product_name}</CardTitle>
                <CardDescription>in {product.shop_name}</CardDescription>
            </div>
            <Badge variant="secondary">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{product.product_description}</p>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{product.product_category}</span>
            {product.distance_meters !== null && 
                <span>{formatDistance(product.distance_meters)} away</span>
            }
        </div>
        <Badge variant={stockStatus.variant}>{stockStatus.text}</Badge>
      </CardContent>
    </Card>
  )
}
