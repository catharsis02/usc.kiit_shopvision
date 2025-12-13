import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  getFranchiseData: (franchiseId: string) => FranchiseData | null;
  updateFranchiseData: (franchiseId: string, data: Partial<FranchiseData>) => boolean;
  deleteFranchiseData: (franchiseId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '@Alakh123'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
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
      return true;
    }

    // Check franchise login (by email)
    const franchises = JSON.parse(localStorage.getItem('franchises') || '[]');
    const franchise = franchises.find((f: FranchiseData) => 
      f.email === emailOrUsername && f.password === password
    );

    if (franchise) {
      const franchiseUser: User = {
        id: franchise.id,
        email: franchise.email,
        role: 'franchise',
        franchiseName: franchise.franchiseName,
        shopNumber: franchise.shopNumber,
        createdAt: franchise.createdAt
      };
      setUser(franchiseUser);
      localStorage.setItem('currentUser', JSON.stringify(franchiseUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const getFranchiseData = (franchiseId: string): FranchiseData | null => {
    const franchises = JSON.parse(localStorage.getItem('franchises') || '[]');
    return franchises.find((f: FranchiseData) => f.id === franchiseId) || null;
  };

  const updateFranchiseData = (franchiseId: string, data: Partial<FranchiseData>): boolean => {
    const franchises = JSON.parse(localStorage.getItem('franchises') || '[]');
    const index = franchises.findIndex((f: FranchiseData) => f.id === franchiseId);
    
    if (index !== -1) {
      franchises[index] = { ...franchises[index], ...data };
      localStorage.setItem('franchises', JSON.stringify(franchises));
      
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
    }
    return false;
  };

  const deleteFranchiseData = (franchiseId: string): boolean => {
    const franchises = JSON.parse(localStorage.getItem('franchises') || '[]');
    const filtered = franchises.filter((f: FranchiseData) => f.id !== franchiseId);
    
    if (filtered.length < franchises.length) {
      localStorage.setItem('franchises', JSON.stringify(filtered));
      return true;
    }
    return false;
  };

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
