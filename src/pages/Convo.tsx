import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthProvider";
import { useWebSocket } from "../contexts/WebSocketContext";
import ConvoForm from "../components/ConvoForm";
import { formatTimeAgo } from "../utils/timeUtils";
import { Message } from "../utils/types";
import { useOnlineUsers } from "../contexts/OnlineUsersContext";
import { AvatarOnline } from "../components/AvatarOnline"; 

const Convo: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const location = useLocation();
  const { profilePic, username } = location.state || {};
  const { conversationId } = useParams<{ conversationId: string }>();
  const [participants, setParticipants] = useState<{ userId: number, conversationId: number }[]>([]);
  const { userId } = useAuth();
  const socket = useWebSocket();
  const onlineUsers = useOnlineUsers();
  const navigate = useNavigate();

  const fetchConversation = useCallback(async () => {
    if (!userId || !conversationId) {
      console.error("Missing userId or conversationId");
      return;
    }

    try {
      const { data } = await api.get<{
        participants: { userId: number; conversationId: number }[];
        messages: Message[];
      }>(`/conversations/${conversationId}`);

      if (!Array.isArray(data.participants) || data.participants.length !== 2) {
        console.error("Invalid participants data:", data.participants);
        return;
      }

      setParticipants(data.participants);
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching conversation data:", error);
    }
  }, [userId, conversationId]);

  useEffect(() => {
    fetchConversation();

    if (socket && conversationId) {
      socket.on(`receive_message`, (newMessage: Message) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      return () => {
        socket.off("receive_message");
      };
    }
  }, [socket, conversationId, fetchConversation]);

  const renderMessage = (msg: Message) => {
    const isCurrentUser = msg.senderId === userId;
    const messageClass = isCurrentUser
      ? "bg-blue-500 text-white"
      : "bg-gray-200 text-black";
    const alignmentClass = isCurrentUser
      ? "justify-end text-right gap-4"
      : "justify-start text-left";
  
    return (
      <div key={msg.id} className={`flex w-full mb-4 ${alignmentClass}`}>
        {!isCurrentUser && (
          <img
            src={profilePic}
            alt="Profile"
            className="rounded-full w-10 h-10 mr-3 self-start"
          />
        )}
  
        <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
          <div className={`inline-block max-w-xs rounded-lg overflow-hidden ${messageClass}`}>
            {msg.messageType === "text" ? (
              <p className="p-3">{msg.content}</p>
            ) : (
              <img src={msg.content} alt="Sent Image" className="w-full h-auto" />
            )}
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {formatTimeAgo(msg.timestamp)}
          </span>
        </div>
  
        {isCurrentUser && (
          <img
            src={profilePic}
            alt="Profile"
            className="rounded-full w-10 h-10 mr-3 self-start"
          />
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-screen">
      <div className="flex bg-gray-200 h-16 items-center p-4 gap-4">
        <img
          src="/back.png"
          className="w-4 h-4 mr-4 cursor-pointer"
          alt="Back"
          onClick={() => navigate(-1)}
        />
        <AvatarOnline
          profilePic={profilePic}
          isOnline={onlineUsers.has(conversationId ? participants[0]?.userId : 0)}
        />
        <h2 className="text-2xl font-bold">
          {username || "Loading..."}
        </h2>
      </div>
      <div className="flex-grow overflow-y-scroll mb-4 p-4">
        {messages.map(renderMessage)}
      </div>
      <ConvoForm
        conversationId={parseInt(conversationId!)}
        userId={userId}
        setMessages={setMessages}
      />
    </div>
  );
};

export default Convo;
