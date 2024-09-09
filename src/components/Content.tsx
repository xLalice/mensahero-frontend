import React, { useEffect, useState } from "react";
import FriendsList from "../components/FriendsList";
import { Conversation } from "../utils/types";
import { AvatarOnline } from "../components/AvatarOnline";
import { formatTimeAgo } from "../utils/timeUtils";
import { Link } from "react-router-dom";

interface ContentProps {
  selectedTab: "chats" | "friends";
  conversations: Conversation[];
  loadingConversations: boolean;
  error: string | null;
  onlineUsers: Map<number, string>;
}

const Content: React.FC<ContentProps> = ({
  selectedTab,
  conversations,
  loadingConversations,
  error,
  onlineUsers,
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const renderedConversations = conversations.map((conversation) => {
    const lastMessage = conversation.lastMessage;
    const isOnline = onlineUsers.has(conversation.userId!);

    const isGroupChat = conversation.groupName;

    return (
      <Link
        key={conversation.id}
        to={`/conversation/${conversation.id}`}
        className="flex items-center p-3 rounded-lg"
      >
        <AvatarOnline
          profilePic={
            isGroupChat ? conversation.groupImage! : conversation.profilePic
          }
          isOnline={isOnline}
        />
        <div className="flex-grow ml-4">
          <h3 className="font-semibold mb-2">
            {isGroupChat ? conversation.groupName! : conversation.username}
          </h3>
          <p className="text-sm text-gray-600">
            {lastMessage
              ? lastMessage.messageType === "image"
                ? "Sent an image"
                : lastMessage.content
              : "No messages yet"}
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {lastMessage ? formatTimeAgo(lastMessage.timestamp) : ""}
        </span>
      </Link>
    );
  });

  return (
    <>
      {selectedTab === "chats" ? (
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
      ) : (
        <FriendsList />
      )}
    </>
  );
};

export default Content;
