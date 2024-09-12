import React from 'react';
import Header from '../components/Header';
import Tabs from '../components/Tabs';
import Content from '../components/Content';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';
import { Conversation, Message } from '../utils/types';
import { useOnlineUsers } from '../contexts/OnlineUsersContext';
import { useAuth } from '../contexts/AuthProvider';

const Home: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'chats' | 'friends'>('chats');
  const { userId, logout } = useAuth();
  const onlineUsers = useOnlineUsers();
  const socket = useWebSocket();
  const navigate = useNavigate();
  const notificationSound = new Audio('/notification.mp3');

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    setError(null);

    try {
      const response = await api.get(`/conversations/`);
      console.log(response.data);
      setConversations(response.data);
    } catch (error) {
      setError('Error fetching conversations.');
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  }, [userId]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (data: Message) => {
        console.log('Message received:', data);

        setConversations(prevConversations =>
          prevConversations.map(conversation =>
            conversation.id === data.conversationId
              ? {
                  ...conversation,
                  lastMessage: {
                    content: data.content,
                    timestamp: data.timestamp,
                    messageType: data.messageType,
                  },
                }
              : conversation
          )
        );

        notificationSound.play();
      });

      socket.on('new_conversation', fetchConversations);
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('new_conversation');
      }
    };
  }, [socket, fetchConversations]);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    } else {
      console.error('No user ID');
    }
  }, [userId, fetchConversations]);

  const toggleDropdown = () => {
    setDropdownVisible(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen p-4"
    >
      <Header 
        toggleDropdown={toggleDropdown} 
        dropdownVisible={dropdownVisible} 
        handleLogout={handleLogout} 
      />
      
      <Tabs 
        selectedTab={selectedTab} 
        onSelectTab={setSelectedTab} 
      />
      <Content
        selectedTab={selectedTab}
        conversations={conversations}
        loadingConversations={loadingConversations}
        error={error}
        onlineUsers={onlineUsers}
      />
    </div>
  );
};

export default React.memo(Home);
