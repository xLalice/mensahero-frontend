import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import FriendsList from "./FriendsList";
import api from "../services/api";
import { formatTimeAgo } from "../utils/timeUtils";

interface User {
  id: number;
  username: string;
  profilePic: string;
}

interface Conversation {
  id: number;
  profilePic: string;
  username: string;
  participants: number[];
  lastMessage: {
    content: string;
    timestamp: string;
    messageType: string;
  };
}

const Home: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const { userId, logout } = useAuth();
  const navigate = useNavigate();

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    setError(null);

    try {
      const response = await api.get(`/conversations/user/${userId}`);
      setConversations(response.data);
    } catch (error) {
      setError("Error fetching conversations.");
      console.error("Error fetching conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    } else {
      console.error("No user ID");
    }
  }, [userId, fetchConversations]);

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderedConversations = useMemo(() => {
    return conversations.map((conversation) => {
      console.log("Conversation", conversation);
      const lastMessage = conversation.lastMessage;

      return (
        <Link
          key={conversation.id}
          to={`/conversation/${conversation.id}`}
          state={{
            profilePic: conversation.profilePic,
            username: conversation.username
          }}
          className="flex items-center p-3 rounded-lg"
        >
          <img
            src={conversation.profilePic}
            alt={conversation.username}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div className="flex-grow">
            <h3 className="font-semibold">{conversation.username}</h3>
            <p className="text-sm text-gray-600">
              {lastMessage
                ? lastMessage.messageType === "image"
                  ? "Sent an image"
                  : lastMessage.content
                : "No messages yet"}
            </p>
          </div>
          <span className="text-xs text-gray-500">
            {lastMessage
              ? formatTimeAgo(conversation.lastMessage.timestamp)
              : ""}
          </span>
        </Link>
      );
    });
  }, [conversations]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center h-16">
        <img src="/header.png" className="w-[150px]" alt="" />
        <div className="relative">
          <img
            src="/hamburger.png"
            alt="menu"
            className="w-8 h-8 mb-4 cursor-pointer mt-4"
            onClick={toggleDropdown}
          />
          {dropdownVisible && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <FriendsList />

      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Chats</h2>
        {loadingConversations ? (
          <p className="text-gray-500 text-center mt-10">
            Loading conversations...
          </p>
        ) : error ? (
          <p className="text-red-500 text-center mt-10">{error}</p>
        ) : conversations.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No recent chats. Chat someone now!
          </p>
        ) : (
          <div className="space-y-4">{renderedConversations}</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Home);
