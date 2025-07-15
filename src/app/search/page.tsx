
import { createClient } from "@/lib/supabase/server";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { RealtimeProductList } from './_components/RealtimeProductList';

interface SearchPageProps {
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const supabase = createClient();

    const { data, error } = await supabase.rpc('search_products', {
        search_query: searchParams.q as string || null,
        category_filter: searchParams.category as string[] || null,
        price_min: Number(searchParams.price_min) || null,
        price_max: Number(searchParams.price_max) || null,
        user_lat: Number(searchParams.lat) || null, // Assuming lat/lon are passed in query
        user_lon: Number(searchParams.lon) || null,
        radius_km: Number(searchParams.distance) || null,
    });

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <FilterSidebar />
                </div>
                <div className="md:col-span-3">
                    <h1 className="text-2xl font-bold mb-4">Search Results</h1>
                    {error && <p className="text-red-500">Error: {error.message}</p>}
                    {(data && data.length > 0) ? (
                        <RealtimeProductList initialProducts={data} />
                    ) : (
                        <p>No products found matching your criteria.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
