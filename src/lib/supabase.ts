import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Database types
export interface Database {
  public: {
    Tables: {
      franchises: {
        Row: {
          id: string;
          franchise_name: string;
          shop_number: string;
          email: string;
          password: string;
          created_at: string;
          sales: number;
        };
        Insert: {
          id?: string;
          franchise_name: string;
          shop_number: string;
          email: string;
          password: string;
          created_at?: string;
          sales?: number;
        };
        Update: {
          id?: string;
          franchise_name?: string;
          shop_number?: string;
          email?: string;
          password?: string;
          created_at?: string;
          sales?: number;
        };
      };
      inventory: {
        Row: {
          id: string;
          franchise_id: string;
          product_name: string;
          quantity: number;
          price: number;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          franchise_id: string;
          product_name: string;
          quantity: number;
          price: number;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          franchise_id?: string;
          product_name?: string;
          quantity?: number;
          price?: number;
          category?: string;
          created_at?: string;
        };
      };
      bills: {
        Row: {
          id: string;
          franchise_id: string;
          customer_name: string;
          total_amount: number;
          items: Record<string, unknown> | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          franchise_id: string;
          customer_name: string;
          total_amount: number;
          items: Record<string, unknown> | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          franchise_id?: string;
          customer_name?: string;
          total_amount?: number;
          items?: Record<string, unknown> | null;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local for database features.'
  );
}

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;
