import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useAuth } from './AuthProvider';

type OnlineUsersContextType = Map<number, string>;
const OnlineUsersContext = createContext<OnlineUsersContextType>(new Map());

interface OnlineUsersProviderProps {
  children: ReactNode;
}

export const OnlineUsersProvider: React.FC<OnlineUsersProviderProps> = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsersContextType>(new Map());
  const socket = useWebSocket();
  const { userId } = useAuth();

  useEffect(() => {
    if (socket) {
      const handleUpdateOnlineUsers = (userIds: { [userId: number]: string }) => {
        const updatedOnlineUsers = new Map<number, string>(Object.entries(userIds).map(([key, value]) => [Number(key), value]));
        setOnlineUsers(updatedOnlineUsers);
      };

      const handleUserDisconnected = (userId: number) => {
        setOnlineUsers(prevOnlineUsers => {
          const newOnlineUsers = new Map(prevOnlineUsers);
          newOnlineUsers.delete(userId);
          return newOnlineUsers;
        });
      };

      socket.on('update_online_users', handleUpdateOnlineUsers);
      socket.on('user_disconnected', handleUserDisconnected);

      if (userId) {
        socket.emit('user_connected', userId);
      }

      return () => {
        socket.off('update_online_users', handleUpdateOnlineUsers);
        socket.off('user_disconnected', handleUserDisconnected);
      };
    }
  }, [socket, userId]);

  return (
    <OnlineUsersContext.Provider value={onlineUsers}>{children}</OnlineUsersContext.Provider>
  );
};

export const useOnlineUsers = () => useContext(OnlineUsersContext);
