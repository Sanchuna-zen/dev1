-- supabase/migrations/20250714120100_add_rls_and_constraints.sql

-- First, enable RLS on all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, to ensure a clean slate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

DROP POLICY IF EXISTS "Shops are viewable by everyone." ON public.shops;
DROP POLICY IF EXISTS "Authenticated users can create shops." ON public.shops;
DROP POLICY IF EXISTS "Shop owners can update their own shop." ON public.shops;
DROP POLICY IF EXISTS "Shop owners can delete their own shop." ON public.shops;

DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;

DROP POLICY IF EXISTS "Inventory is viewable by everyone." ON public.inventory;
DROP POLICY IF EXISTS "Shop owners can manage their inventory." ON public.inventory;

DROP POLICY IF EXISTS "Users can view their own transactions." ON public.transactions;
DROP POLICY IF EXISTS "Shop owners can view their shop's transactions." ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can create transactions." ON public.transactions;

DROP POLICY IF EXISTS "Users can view items in their own transactions." ON public.transaction_items;
DROP POLICY IF EXISTS "Shop owners can view items in their shop's transactions." ON public.transaction_items;
DROP POLICY IF EXISTS "Allow insert for authenticated users." ON public.transaction_items;

DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews." ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews." ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews." ON public.reviews;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- RLS Policies for shops
CREATE POLICY "Shops are viewable by everyone."
  ON public.shops FOR SELECT
  USING ( true );

CREATE POLICY "Authenticated users can create shops."
  ON public.shops FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Shop owners can update their own shop."
  ON public.shops FOR UPDATE
  USING ( auth.uid() = owner_id );

CREATE POLICY "Shop owners can delete their own shop."
    ON public.shops FOR DELETE
    USING (auth.uid() = owner_id);

-- RLS Policies for products
CREATE POLICY "Products are viewable by everyone."
  ON public.products FOR SELECT
  USING ( true );
-- Note: Product creation/modification is restricted to service_role by default.

-- RLS Policies for inventory
CREATE POLICY "Inventory is viewable by everyone."
  ON public.inventory FOR SELECT
  USING ( true );

CREATE POLICY "Shop owners can manage their inventory."
  ON public.inventory FOR ALL
  USING ( auth.uid() = (SELECT owner_id FROM shops WHERE id = shop_id) );

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions."
  ON public.transactions FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Shop owners can view their shop's transactions."
  ON public.transactions FOR SELECT
  USING ( auth.uid() = (SELECT owner_id FROM shops WHERE id = shop_id) );

CREATE POLICY "Authenticated users can create transactions."
  ON public.transactions FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- RLS Policies for transaction_items
CREATE POLICY "Users can view items in their own transactions."
  ON public.transaction_items FOR SELECT
  USING ( EXISTS (
    SELECT 1 FROM transactions
    WHERE transactions.id = transaction_id AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Shop owners can view items in their shop's transactions."
    ON public.transaction_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM transactions t
        JOIN shops s ON t.shop_id = s.id
        WHERE t.id = transaction_items.transaction_id AND s.owner_id = auth.uid()
    ));

CREATE POLICY "Allow insert for authenticated users."
    ON public.transaction_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM transactions
        WHERE transactions.id = transaction_id AND transactions.user_id = auth.uid()
    ));

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone."
  ON public.reviews FOR SELECT
  USING ( true );

CREATE POLICY "Authenticated users can create reviews."
  ON public.reviews FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' AND auth.uid() = user_id );

CREATE POLICY "Users can update their own reviews."
  ON public.reviews FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own reviews."
    ON public.reviews FOR DELETE
    USING (auth.uid() = user_id);
