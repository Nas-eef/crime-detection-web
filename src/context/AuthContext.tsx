import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: 'user' | 'officer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount - check multiple possible keys
    const storedUser = localStorage.getItem('user');
    const storedUserData = localStorage.getItem('userData');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    } else if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        // Determine role from stored data or URL
        const role = parsedUserData.role || (storedUserId ? 'user' : 'user');
        const userObj: User = {
          id: parsedUserData.id || parseInt(storedUserId || '0'),
          name: parsedUserData.name || '',
          email: parsedUserData.email || '',
          phone: parsedUserData.phone,
          role: role as 'user' | 'officer' | 'admin',
        };
        setUser(userObj);
        // Also save in 'user' key for consistency
        localStorage.setItem('user', JSON.stringify(userObj));
      } catch (error) {
        console.error('Error parsing stored userData:', error);
        localStorage.removeItem('userData');
        localStorage.removeItem('userId');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
