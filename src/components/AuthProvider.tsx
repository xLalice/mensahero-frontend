import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUserId) {
      setUserId(storedUserId);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token && userId) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
  }, [token, userId]);

  return (
    <AuthContext.Provider value={{ token, setToken, userId, setUserId, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};