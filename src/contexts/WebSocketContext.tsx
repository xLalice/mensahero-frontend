import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import io, { Socket } from "socket.io-client";

const WebSocketContext = createContext<Socket | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    console.log('Connecting to WebSocket server at:', API_URL);

    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io'  // Add this line
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      console.log('Closing WebSocket connection');
      newSocket.disconnect();
    };
  }, []);

  if (!socket) {
    return <div>Connecting to WebSocket...</div>;
  }

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const socket = useContext(WebSocketContext);
  if (!socket) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return socket;
};