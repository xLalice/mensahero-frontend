import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import api from '../services/api';
import { AxiosError } from 'axios';

interface AuthContextType {
  userId: number | null;
  setUserId: (userId: number | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStoredUserId = async () => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(parseInt(storedUserId, 10));
        setIsLoading(false);
      } else {
        try {
          const response = await api.get('/users/user');
          const data = response.data;
          if (data.id) {
            localStorage.setItem('userId', data.id.toString());
            setUserId(data.id);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    checkStoredUserId();
  }, []);

  const setUserIdHandler = (userId: number | null) => {
    if (userId) {
      localStorage.setItem('userId', userId.toString());
    } else {
      localStorage.removeItem('userId');
    }
    setUserId(userId);
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('userId');
      setUserId(null);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Logout failed:', error.response?.data?.message || error.message);
      } else {
        console.error('Error during logout:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ userId, setUserId: setUserIdHandler, isLoading, logout }}>
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