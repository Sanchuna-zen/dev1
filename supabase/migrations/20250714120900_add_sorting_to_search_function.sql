-- supabase/migrations/20250714120900_add_sorting_to_search_function.sql

CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT,
    category_filter TEXT[] DEFAULT NULL,
    price_min NUMERIC DEFAULT NULL,
    price_max NUMERIC DEFAULT NULL,
    user_lat FLOAT DEFAULT NULL,
    user_lon FLOAT DEFAULT NULL,
    radius_km FLOAT DEFAULT 50,
    sort_by TEXT DEFAULT NULL -- 'price_asc', 'price_desc', 'distance_asc'
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_description TEXT,
    product_category TEXT,
    shop_id UUID,
    shop_name TEXT,
    price NUMERIC,
    quantity INT,
    distance_meters FLOAT
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.description AS product_description,
        p.category AS product_category,
        s.id AS shop_id,
        s.name AS shop_name,
        i.price,
        i.quantity,
        CASE
            WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL AND s.location IS NOT NULL
            THEN extensions.ST_Distance(
                s.location,
                extensions.ST_MakePoint(user_lon, user_lat)::extensions.geography
            )
            ELSE NULL
        END AS distance_meters
    FROM
        public.products AS p
    JOIN
        public.inventory AS i ON p.id = i.product_id
    JOIN
        public.shops AS s ON i.shop_id = s.id
    WHERE
        i.quantity > 0
        AND (search_query IS NULL OR p.name ILIKE '%' || search_query || '%' OR p.description ILIKE '%' || search_query || '%')
        AND (category_filter IS NULL OR p.category = ANY(category_filter))
        AND (price_min IS NULL OR i.price >= price_min)
        AND (price_max IS NULL OR i.price <= price_max)
        AND (
            user_lat IS NULL OR user_lon IS NULL OR s.location IS NULL OR
            extensions.ST_DWithin(
                s.location,
                extensions.ST_MakePoint(user_lon, user_lat)::extensions.geography,
                radius_km * 1000
            )
        )
    ORDER BY
        CASE
            WHEN sort_by = 'price_asc' THEN i.price
            ELSE NULL
        END ASC,
        CASE
            WHEN sort_by = 'price_desc' THEN i.price
            ELSE NULL
        END DESC,
        CASE
            WHEN sort_by = 'distance_asc' THEN distance_meters
            ELSE NULL
        END ASC;
END;
$$ LANGUAGE plpgsql;
