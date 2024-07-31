import React, { useState,  useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import {useNavigate} from 'react-router-dom';

type Message = {
    _id: string;
    content: string;
    senderId: string;
    receiverId: string;
    timestamp: Date;
    messageType: 'text' | 'image';
};

interface User {
    _id: string;
    username: string;
    profilePic: string;
}

const Convo: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const { conversationId } = useParams<{ conversationId: string }>();
    const currentUserId = localStorage.getItem('userId');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();


    useEffect(() => {
        if (!currentUserId) {
            console.error('No user ID found in localStorage.');
            return;
        }

        const fetchOtherUser = async () => {
            try {
                const response = await api.get(`http://localhost:3000/api/conversations/${conversationId}`);
                const participants = response.data.participants;


                const otherUserId = participants.find((id: string) => id !== currentUserId);

                if (!otherUserId) {
                    console.error('No other user found in participants:', participants);
                    return;
                }

                const userResponse = await api.get(`http://localhost:3000/api/users/${otherUserId}`);
                setOtherUser(userResponse.data);
            } catch (error) {
                console.error('Error fetching other user:', error);
            }
        };

        fetchOtherUser();
    }, [conversationId, currentUserId]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await api.get(`http://localhost:3000/api/messages/${conversationId}`);
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [conversationId]);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage && !selectedImage) || !conversationId) return;
      
        const formData = new FormData();
        formData.append('conversationId', conversationId);
        formData.append('senderId', currentUserId!);
        if (newMessage) formData.append('content', newMessage);
        if (selectedImage) formData.append('image', selectedImage);
      
        try {
          const response = await api.post('/messages', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setMessages([...messages, response.data]);
          setNewMessage('');
          setSelectedImage(null);
          removeSelectedImage();
        } catch (error: any) {
          console.error('Error sending message:', error);
          if (error.response) {
            console.error('Error data:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
          } else if (error.request) {
            console.error('Error request:', error.request);
          } else {
            console.error('Error message:', error.message);
          }
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex bg-gray-200 h-16 items-center p-4">
                <img src="/back.png" className="w-4 h-4 mr-4 cursor-pointer" alt="" onClick={() => navigate(-1)}/>
                <img 
                    src={otherUser?.profilePic}
                    className="w-12 h-12 rounded-full mr-4"
                    alt="" />
                <h2 className="text-2xl font-bold ">{otherUser?.username || 'Loading...'}</h2>
            </div>
            
            <div className="flex-grow overflow-y-scroll mb-4 p-4">
                {messages.map((msg) => (
                    <div key={msg._id} className={`mb-2 flex flex-col  ${msg.senderId === currentUserId ? 'text-right items-end' : 'text-left items-start'}`}>
                        <span className={`inline-block p-2 rounded ${msg.senderId === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                            {msg.messageType === "text" ? (
                                <p>{msg.content}</p>
                            ): (<>
                                    <span>{msg.senderId === currentUserId ? 'You: ' : ""}</span>
                                    <img src={`http://localhost:3000/${msg.content}`} alt="Sent Image"/>
                                </>
                            )}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="flex flex-col">
                
                <div className="flex items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-grow p-2 border rounded-xl"
                        placeholder="Type a message..."
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gray-300 p-2 rounded mr-2"
                    >
                        📎
                    </button>
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">Send</button>
                </div>
                {imagePreview && (
                    <div className="relative mb-2">
                        <img src={imagePreview} alt="Selected" className="max-h-24 rounded" />
                        <button
                            type="button"
                            onClick={removeSelectedImage}
                            className="absolute top-0 left-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                            ×
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Convo;