import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
