import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  inventory?: any[];
  bills?: any[];
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

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '@Alakh123'
};

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
    try {
      console.log('🔐 Login attempt:', { email: emailOrUsername });
      
      // Check admin login
      if (emailOrUsername === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
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

      // Check franchise login from Supabase
      console.log('📤 Querying Supabase for franchise...');
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .eq('email', emailOrUsername)
        .single();

      console.log('📥 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        return false;
      }

      if (!data) {
        console.error('❌ No franchise found with email:', emailOrUsername);
        return false;
      }

      // Check password match
      console.log('🔑 Checking password...');
      console.log('Entered password:', password);
      console.log('Stored password:', data.password);
      
      if (data.password !== password) {
        console.error('❌ Password mismatch');
        return false;
      }

      const franchiseUser: User = {
        id: data.id,
        email: data.email,
        role: 'franchise',
        franchiseName: data.franchise_name,
        shopNumber: data.shop_number,
        createdAt: data.created_at
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
      const updateData: any = {};
      if (data.franchiseName) updateData.franchise_name = data.franchiseName;
      if (data.shopNumber) updateData.shop_number = data.shopNumber;
      if (data.email) updateData.email = data.email;
      if (data.password) updateData.password = data.password;

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
          franchiseName: data.franchiseName || user.franchiseName,
          shopNumber: data.shopNumber || user.shopNumber,
          email: data.email || user.email
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
