import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  userId: number | null;
  setUserId: (userId: number | null) => void;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
      setIsLoading(false);
    } else {
      fetch('/users/user', {
        method: 'GET',
        credentials: 'include',
      })
      .then(response => response.json())
      .then(data => {
        if (data.id) {
          localStorage.setItem('userId', data.id);
          setUserId(data.id);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
    }
  }, []);

  const setUserIdHandler = (userId: number | null) => {
    if (userId) {
      localStorage.setItem('userId', String(userId));
    } else {
      localStorage.removeItem('userId');
    }
    setUserId(userId);
  };

  const logout = () => {
    fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    .then(() => {
      localStorage.removeItem('userId');
      setUserId(null);
    });
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
