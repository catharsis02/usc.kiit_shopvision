-- BharatShop Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create franchises table
CREATE TABLE IF NOT EXISTS franchises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    franchise_name TEXT NOT NULL,
    shop_number TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    sales DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    customer_name TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    items JSONB,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_franchises_email ON franchises(email);
CREATE INDEX IF NOT EXISTS idx_inventory_franchise ON inventory(franchise_id);
CREATE INDEX IF NOT EXISTS idx_bills_franchise ON bills(franchise_id);
CREATE INDEX IF NOT EXISTS idx_bills_created ON bills(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Create policies for franchises table
-- Allow public to read franchises (for admin)
CREATE POLICY "Allow public read access to franchises" 
ON franchises FOR SELECT 
USING (true);

-- Allow insert for new franchises
CREATE POLICY "Allow insert franchises" 
ON franchises FOR INSERT 
WITH CHECK (true);

-- Allow update for franchises
CREATE POLICY "Allow update franchises" 
ON franchises FOR UPDATE 
USING (true);

-- Allow delete for franchises
CREATE POLICY "Allow delete franchises" 
ON franchises FOR DELETE 
USING (true);

-- Create policies for inventory table
CREATE POLICY "Allow all operations on inventory" 
ON inventory FOR ALL 
USING (true);

-- Create policies for bills table
CREATE POLICY "Allow all operations on bills" 
ON bills FOR ALL 
USING (true);

-- Insert admin user (optional - for testing)
-- Note: In production, admin should be handled separately
-- This is just a marker to differentiate admin from franchises

COMMENT ON TABLE franchises IS 'Stores all franchise/shop information';
COMMENT ON TABLE inventory IS 'Stores inventory items for each franchise';
COMMENT ON TABLE bills IS 'Stores billing transactions for each franchise';
