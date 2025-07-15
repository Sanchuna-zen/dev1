-- supabase/migrations/20250714120800_create_search_products_function.sql

CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT,
    category_filter TEXT[] DEFAULT NULL,
    price_min NUMERIC DEFAULT NULL,
    price_max NUMERIC DEFAULT NULL,
    user_lat FLOAT DEFAULT NULL,
    user_lon FLOAT DEFAULT NULL,
    radius_km FLOAT DEFAULT 50
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
        -- Calculate distance if user location is provided
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
        -- Ensure product is in stock
        i.quantity > 0
        -- Text search filter (if provided)
        AND (search_query IS NULL OR p.name ILIKE '%' || search_query || '%' OR p.description ILIKE '%' || search_query || '%')
        -- Category filter (if provided)
        AND (category_filter IS NULL OR p.category = ANY(category_filter))
        -- Price range filter (if provided)
        AND (price_min IS NULL OR i.price >= price_min)
        AND (price_max IS NULL OR i.price <= price_max)
        -- Proximity filter (if provided)
        AND (
            user_lat IS NULL OR user_lon IS NULL OR s.location IS NULL OR
            extensions.ST_DWithin(
                s.location,
                extensions.ST_MakePoint(user_lon, user_lat)::extensions.geography,
                radius_km * 1000 -- radius in meters
            )
        );
END;
$$ LANGUAGE plpgsql;
