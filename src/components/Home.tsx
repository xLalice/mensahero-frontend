import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import api from '../services/api';

interface User {
  _id: string;
  username: string;
  profilePic: string;
}

interface Conversation {
  _id: string;
  participants: string[];
  lastMessage: {
    content: string;
    timestamp: string;
  };
}

const Home: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const { token, userId } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (userId && token) {
        fetchUsers();
        fetchConversations();
      } else {
        console.error('No user ID or token found in localStorage');
      }
    }, [userId, token]);

    const fetchUsers = async () => {
      try {
        const response = await api.get('http://localhost:3000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.filter((user: User) => user._id !== userId));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchConversations = async () => {
      try {
        const response = await api.get(`http://localhost:3000/api/conversations/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    const startNewConversation = async (otherUserId: string) => {
      try {
        const response = await api.post('http://localhost:3000/api/conversations', {
          participants: [userId, otherUserId],
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const conversation = response.data;
        navigate(`/conversation/${conversation._id}`);
      } catch (error) {
        console.error('Error starting new conversation:', error);
      }
    };

    return (
      <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mensahero</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Available Users</h2>
        <div className="flex space-x-4 overflow-x-auto">
          {users.map((user) => (
            <div key={user._id} className="flex flex-col items-center cursor-pointer" onClick={() => startNewConversation(user._id)}>
              <img src={user.profilePic} alt={user.username} className="w-12 h-12 rounded-full" />
              <span className="text-sm mt-1">{user.username}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Chats</h2>
        {conversations.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No recent chats. Chat someone now!</p>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => {
              const otherUser = users.find(user => conversation.participants.includes(user._id));
              return (
                <Link key={conversation._id} to={`/conversation/${conversation._id}`} className="flex items-center p-3 bg-gray-100 rounded-lg">
                  <img src={otherUser?.profilePic} alt={otherUser?.username} className="w-12 h-12 rounded-full mr-4" />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{otherUser?.username}</h3>
                    <p className="text-sm text-gray-600">{conversation.lastMessage?.content || "No messages yet"}</p>
                  </div>
                  <span className="text-xs text-gray-500">{conversation.lastMessage ? new Date(conversation.lastMessage.timestamp).toLocaleTimeString() : ""}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
