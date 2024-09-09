import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthProvider";
import { useWebSocket } from "../contexts/WebSocketContext";
import ConvoForm from "../components/ConvoForm";
import { formatTimeAgo } from "../utils/timeUtils";
import { Message, Participant } from "../utils/types";
import { useOnlineUsers } from "../contexts/OnlineUsersContext";
import { AvatarOnline } from "../components/AvatarOnline";

const Convo: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { conversationId } = useParams<{ conversationId: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { userId } = useAuth();
  const socket = useWebSocket();
  const onlineUsers = useOnlineUsers();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState<string | null>(null);
  const [groupImage, setGroupImage] = useState<string | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!userId || !conversationId) {
      console.error("Missing userId or conversationId");
      return;
    }

    try {
      const { data } = await api.get<{
        participants: Participant[];
        messages: Message[];
        groupName?: string;
        groupImage?: string;
      }>(`/conversations/${conversationId}`);

      if (!Array.isArray(data.participants)) {
        console.error("Invalid participants data:", data.participants);
        return;
      }
      console.log(data);
      setParticipants(data.participants);
      setMessages(data.messages);
      setGroupName(data.groupName || null);
      setGroupImage(data.groupImage || null);
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
      ? "justify-end text-right"
      : "justify-start text-left";

    const sender = participants.find(p => p.id === msg.senderId);
    const senderProfilePic = sender?.profilePic || "/default.jpg";
    const senderName = sender?.username || "Unknown User";

    return (
      <div key={msg.id} className={`flex w-full gap-4 mb-4 ${alignmentClass}`}>
        {!isCurrentUser && (
          <img
            src={senderProfilePic}
            alt="Profile"
            className="rounded-full w-10 h-10"
          />
        )}

        <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
          {!isCurrentUser && <span className="text-xs font-bold">{senderName}</span>}
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
      </div>
    );
  };

  const renderHeader = () => {
    if (groupName) {
      return (
        <div className="flex bg-gray-200 h-16 items-center p-4 gap-4">
          <img
            src="/back.png"
            className="w-4 h-4 mr-4 cursor-pointer"
            alt="Back"
            onClick={() => navigate(-1)}
          />
          <AvatarOnline profilePic={groupImage || "/default.jpg"} isOnline={false} />
          <h2 className="text-2xl font-bold">{groupName}</h2>
        </div>
      );
    }

    const recipient = participants.find(p => p.id !== userId);
    if (!recipient) return <div>Loading...</div>;

    return (
      <div className="flex bg-gray-200 h-16 items-center p-4 gap-4">
        <img
          src="/back.png"
          className="w-4 h-4 mr-4 cursor-pointer"
          alt="Back"
          onClick={() => navigate(-1)}
        />
        <AvatarOnline
          profilePic={recipient.profilePic || "/default.jpg"}
          isOnline={onlineUsers.has(recipient.id)}
        />
        <h2 className="text-2xl font-bold">{recipient.username || "Unknown User"}</h2>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {renderHeader()}
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
