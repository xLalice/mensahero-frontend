import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Friend {
    _id: string;
    username: string;
    profilePic: string;
    isOnline: boolean;
}

const FriendsList: React.FC = () => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const currentUserId = localStorage.getItem('userId');
    const navigate = useNavigate();

    useEffect(() => {
        const newSocket = io('http://localhost:3000', {
            transports: ['websocket', 'polling']
        });
        
        newSocket.on('connect', () => {
            console.log('Connected to server with socket id:', newSocket.id);
            if (currentUserId) {
                console.log('Emitting user_connected event for user:', currentUserId);
                newSocket.emit('user_connected', currentUserId);
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        setSocket(newSocket);
           
        return () => {
            newSocket.disconnect();
        }
    }, [currentUserId]);

    useEffect(() => {
        if (socket) {
            socket.on('user_status_change', ({userId, status}) => {
                console.log('Received user status change:', userId, status);
                setFriends(prevFriends =>
                    prevFriends.map(friend =>
                        friend._id === userId ? {...friend, isOnline: status === 'online'} : friend
                    )
                );
            });
        }

        fetchFriends();

        return () => {
            if (socket) {
                socket.off('user_status_change');
            }
        };
    }, [socket]);

    const fetchFriends = async () => {
        try {
            const response = await api.get('/users/');
            const friendsList = response.data
                .filter((friend: Friend) => friend._id !== currentUserId)
                .sort((a: Friend, b: Friend) => Number(b.isOnline) - Number(a.isOnline));
            setFriends(friendsList);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    }

    const startNewConversation = async (otherUserId: string) => {
    try {
      const response = await api.post('/conversations', {
        participants: [currentUserId, otherUserId],
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const conversation = response.data;
      navigate(`/conversation/${conversation._id}`);
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

    return (
        <div className="p-4 overflow-scroll relative">
            <h2 className="text-lg font-semibold mb-4 fixed">Friends</h2>
            <div className="flex gap-4 mt-8">
                {friends.map(friend => (
                    <div key={friend._id} className="flex flex-col items-center justify-between p-2" onClick={() => startNewConversation(friend._id)}>
                        <img 
                            className="w-10 h-10 rounded-full" 
                            src={friend.profilePic} 
                            alt={friend.username}
                            onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = '/default.jpg';
                                img.onerror = null;
                            }} 
                        />
                        <span className="mt-2 text-center w-full truncate">{friend.username}</span>
                        <span className={`w-3 h-3 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    </div>
                ))}
            </div>
        </div>
    
    )
}

export default FriendsList;