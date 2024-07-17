import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

type Message = {
    _id: string;
    content: string;
    senderId: string;
    receiverId: string;
    timestamp: Date;
};

interface User {
    _id: string;
    username: string;
    profilePic: string;
}

const Convo: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState<string>('');
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const { conversationId } = useParams<{ conversationId: string }>();
    const currentUserId = localStorage.getItem('userId');


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

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            const response = await api.post('http://localhost:3000/api/messages', {
                conversationId,
                senderId: currentUserId,
                content: message
            });
            setMessages([...messages, response.data]);
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex bg-gray-200 h-16 items-center p-4">
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
                            {msg.content}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="flex">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow p-2 border rounded-l"
                    placeholder="Type a message..."
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">Send</button>
            </form>
        </div>
    );
};

export default Convo;
