import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, type Database } from '@/lib/supabase';
import {
  ADMIN_CREDENTIALS,
  DEMO_FRANCHISE,
  normalizeEmail,
  normalizePassword,
} from '@/lib/authCredentials';

export interface User {
  id: string;
  username?: string;
  email?: string;
  role: 'admin' | 'franchise';
  franchiseName?: string;
  shopNumber?: string;
  createdAt: string;
}

export interface FranchiseData {
  id: string;
  franchiseName: string;
  shopNumber: string;
  email: string;
  password: string;
  createdAt: string;
  sales?: number;
  inventory?: unknown[];
  bills?: unknown[];
}

interface AuthContextType {
  user: User | null;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFranchise: boolean;
  getFranchiseData: (franchiseId: string) => Promise<FranchiseData | null>;
  updateFranchiseData: (franchiseId: string, data: Partial<FranchiseData>) => Promise<boolean>;
  deleteFranchiseData: (franchiseId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    const identifier = emailOrUsername.trim();
    const normalizedIdentifier = normalizeEmail(identifier);
    const enteredPassword = normalizePassword(password);

    try {
      console.log('🔐 Login attempt:', { email: identifier });

      if (!normalizedIdentifier || !enteredPassword) {
        return false;
      }
	      
      // Check admin login
      if (normalizedIdentifier === ADMIN_CREDENTIALS.username && enteredPassword === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: 'admin-001',
          username: 'admin',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        setUser(adminUser);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        console.log('✅ Admin login successful');
        return true;
      }
	
      // Check demo franchise credentials first
      if (normalizedIdentifier === DEMO_FRANCHISE.email && enteredPassword === DEMO_FRANCHISE.password) {
        const demoUser: User = {
          id: 'demo-franchise-001',
          email: DEMO_FRANCHISE.email,
          role: 'franchise',
          franchiseName: DEMO_FRANCHISE.franchiseName,
          shopNumber: DEMO_FRANCHISE.shopNumber,
          createdAt: new Date().toISOString()
        };
        setUser(demoUser);
        localStorage.setItem('currentUser', JSON.stringify(demoUser));
        console.log('✅ Demo franchise login successful');
        return true;
      }

      // Check franchise login from Supabase
      if (!supabase) {
        console.warn('Supabase is not configured; only built-in demo credentials are available.');
        return false;
      }

      console.log('📤 Querying Supabase for franchise...');
      const { data: franchise, error } = await supabase
        .from('franchises')
        .select('id,email,password,franchise_name,shop_number,created_at')
        .eq('email', normalizedIdentifier)
        .maybeSingle();

      console.log('📥 Supabase response:', { found: !!franchise, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        return false;
      }

      if (!franchise) {
        console.error('❌ No franchise found with email:', identifier);
        return false;
      }
	
      // Check password match
      console.log('🔑 Checking password...');
	      
      if (normalizePassword(franchise.password) !== enteredPassword) {
        console.error('❌ Password mismatch');
        return false;
      }

      const franchiseUser: User = {
        id: franchise.id,
        email: normalizeEmail(franchise.email),
        role: 'franchise',
        franchiseName: franchise.franchise_name,
        shopNumber: franchise.shop_number,
        createdAt: franchise.created_at
      };
      
      setUser(franchiseUser);
      localStorage.setItem('currentUser', JSON.stringify(franchiseUser));
      console.log('✅ Franchise login successful');
      return true;
    } catch (error) {
      console.error('❌ Login exception:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const getFranchiseData = async (franchiseId: string): Promise<FranchiseData | null> => {
    try {
      if (!supabase) {
        if (user?.role === 'franchise' && user.id === franchiseId) {
          return {
            id: user.id,
            franchiseName: user.franchiseName || DEMO_FRANCHISE.franchiseName,
            shopNumber: user.shopNumber || DEMO_FRANCHISE.shopNumber,
            email: user.email || DEMO_FRANCHISE.email,
            password: user.id === 'demo-franchise-001' ? DEMO_FRANCHISE.password : '',
            createdAt: user.createdAt,
            sales: 0
          };
        }

        console.warn('Supabase is not configured; franchise data is unavailable.');
        return null;
      }

      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .eq('id', franchiseId)
        .single();

      if (error || !data) {
        console.error('Error fetching franchise:', error);
        return null;
      }

      return {
        id: data.id,
        franchiseName: data.franchise_name,
        shopNumber: data.shop_number,
        email: data.email,
        password: data.password,
        createdAt: data.created_at,
        sales: data.sales || 0
      };
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const updateFranchiseData = async (franchiseId: string, data: Partial<FranchiseData>): Promise<boolean> => {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured; franchise updates are disabled.');
        return false;
      }

      const updateData: Database['public']['Tables']['franchises']['Update'] = {};
      if (data.franchiseName) updateData.franchise_name = data.franchiseName.trim();
      if (data.shopNumber) updateData.shop_number = data.shopNumber.trim();
      if (data.email) updateData.email = normalizeEmail(data.email);
      if (data.password) updateData.password = normalizePassword(data.password);

      const { error } = await supabase
        .from('franchises')
        .update(updateData)
        .eq('id', franchiseId);

      if (error) {
        console.error('Update error:', error);
        return false;
      }

      // Update current user if it's the same franchise
      if (user?.id === franchiseId) {
        const updatedUser = {
          ...user,
          franchiseName: updateData.franchise_name || user.franchiseName,
          shopNumber: updateData.shop_number || user.shopNumber,
          email: updateData.email || user.email
        };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      return true;
    } catch (error) {
      console.error('Error updating franchise:', error);
      return false;
    }
  };

  const deleteFranchiseData = async (franchiseId: string): Promise<boolean> => {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured; franchise deletion is disabled.');
        return false;
      }

      const { error } = await supabase
        .from('franchises')
        .delete()
        .eq('id', franchiseId);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting franchise:', error);
      return false;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl font-bold text-gradient-tricolor">Loading...</div>
    </div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isFranchise: user?.role === 'franchise',
        getFranchiseData,
        updateFranchiseData,
        deleteFranchiseData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
