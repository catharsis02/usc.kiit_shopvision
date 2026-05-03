-- BharatShop Database Schema for Supabase
-- This file is safe to run more than once.

-- Create tables
CREATE TABLE IF NOT EXISTS public.franchises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    franchise_name TEXT NOT NULL,
    shop_number TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    sales DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    franchise_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    franchise_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
    customer_name TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    items JSONB,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_franchises_email ON public.franchises(email);
CREATE INDEX IF NOT EXISTS idx_inventory_franchise ON public.inventory(franchise_id);
CREATE INDEX IF NOT EXISTS idx_bills_franchise ON public.bills(franchise_id);
CREATE INDEX IF NOT EXISTS idx_bills_created ON public.bills(created_at DESC);

-- The current app is a demo-style client app, so these grants match the
-- permissive RLS policies below.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.franchises TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.inventory TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bills TO anon, authenticated;

-- Enable Row Level Security (RLS)
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Create policies only if they do not already exist.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'franchises'
            AND policyname = 'Allow public read access to franchises'
    ) THEN
        CREATE POLICY "Allow public read access to franchises"
        ON public.franchises FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'franchises'
            AND policyname = 'Allow insert franchises'
    ) THEN
        CREATE POLICY "Allow insert franchises"
        ON public.franchises FOR INSERT
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'franchises'
            AND policyname = 'Allow update franchises'
    ) THEN
        CREATE POLICY "Allow update franchises"
        ON public.franchises FOR UPDATE
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'franchises'
            AND policyname = 'Allow delete franchises'
    ) THEN
        CREATE POLICY "Allow delete franchises"
        ON public.franchises FOR DELETE
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'inventory'
            AND policyname = 'Allow all operations on inventory'
    ) THEN
        CREATE POLICY "Allow all operations on inventory"
        ON public.inventory FOR ALL
        USING (true)
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = 'bills'
            AND policyname = 'Allow all operations on bills'
    ) THEN
        CREATE POLICY "Allow all operations on bills"
        ON public.bills FOR ALL
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

COMMENT ON TABLE public.franchises IS 'Stores all franchise/shop information';
COMMENT ON TABLE public.inventory IS 'Stores inventory items for each franchise';
COMMENT ON TABLE public.bills IS 'Stores billing transactions for each franchise';
