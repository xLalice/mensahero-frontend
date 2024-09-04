import React, { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthProvider";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

interface Friend {
  id: number;
  username: string;
  profilePic: string;
  isOnline: boolean;
}

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const { userId } = useAuth();
  const socket = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndEmitStatus = async () => {
      await fetchFriends();

      if (socket && userId) {
        socket.emit("user_connected", userId);
      }
    };

    fetchAndEmitStatus();
  }, [userId, socket]);

  useEffect(() => {
    if (socket) {
      const handleUpdateOnlineUsers = (onlineUserIds: number[]) => {
        setFriends((prevFriends) => {
          const updatedFriends = prevFriends.map((friend) => ({
            ...friend,
            isOnline: onlineUserIds.includes(friend.id),
          }));
          return sortFriends(updatedFriends);
        });
      };

      socket.on("update_online_users", handleUpdateOnlineUsers);

      return () => {
        if (socket) {
          socket.off("update_online_users", handleUpdateOnlineUsers);
        }
      };
    }
  }, [socket]);

  const fetchFriends = async () => {
    try {
      const response = await api.get("/users/");
      const sortedFriends = sortFriends(response.data);
      setFriends(sortedFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const sortFriends = (list: Friend[]) => {
    const userIdNumber = Number(userId);
    return list
      .filter((friend: Friend) => friend.id !== userIdNumber)
      .sort((a: Friend, b: Friend) => Number(b.isOnline) - Number(a.isOnline));
  };

  const startNewConversation = async (
    otherUserId: number,
    profilePic: string,
    username: string,
    isOnline: boolean
  ) => {
    try {
      const response = await api.post("/conversations", {
        participants: [userId, otherUserId],
      });

      const conversation = response.data;

      if (!conversation.id) {
        console.error(
          "Conversation ID is missing in the response:",
          conversation
        );
        return;
      }

      navigate(`/conversation/${conversation.id}`, {
        state: { profilePic, username, isOnline },
      });
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };

  return (
    <div className="p-4 overflow-scroll relative">
      <h2 className="text-lg font-semibold mb-4 fixed">Friends</h2>
      <div className="flex gap-4 mt-8">
        {friends.length > 0 ? (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="flex flex-col items-center justify-between p-2"
              onClick={() =>
                startNewConversation(
                  friend.id,
                  friend.profilePic,
                  friend.username,
                  friend.isOnline
                )
              }
            >
              <img
                className="w-10 h-10 rounded-full"
                src={friend.profilePic}
                alt={friend.username}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = "/default.jpg";
                  img.onerror = null;
                }}
              />
              <span className="mt-2 text-center w-full truncate">
                {friend.username}
              </span>
              <span
                className={`w-3 h-3 rounded-full ${
                  friend.isOnline ? "bg-green-500" : "bg-gray-500"
                }`}
              ></span>
            </div>
          ))
        ) : (
          <h1>No other users yet.</h1>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
