import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import FriendsList from './FriendsList';
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
    messageType: string;
  };
}

const Home: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { token, userId, logout } = useAuth();
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

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

	return (
		<div className="container mx-auto p-4">
      
			<div className="flex justify-between items-center h-16">
        <img src="/header.png" className='w-[150px]' alt="" />
        <div className="relative">
          <img 
            src="/hamburger.png" 
            alt="menu" 
            className="w-8 h-8 mb-4 cursor-pointer mt-4" 
            onClick={toggleDropdown} 
          />
          {dropdownVisible && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
              <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</Link>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <FriendsList />
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Chats</h2>
        {conversations.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No recent chats. Chat someone now!</p>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => {
                const otherUser = users.find(user => conversation.participants.includes(user._id));
                const lastMessage = conversation.lastMessage;

                return (
                  <Link key={conversation._id} to={`/conversation/${conversation._id}`} className="flex items-center p-3 rounded-lg">
                    <img src={otherUser?.profilePic} alt={otherUser?.username} className="w-12 h-12 rounded-full mr-4" />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{otherUser?.username}</h3>
                      <p className="text-sm text-gray-600">
                        {lastMessage ? 
                          (lastMessage.messageType === "image" ? "Sent an image" : lastMessage.content) 
                          : "No messages yet"}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString() : ""}
                    </span>
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

