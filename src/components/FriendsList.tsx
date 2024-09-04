import React, { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthProvider";
import { useOnlineUsers } from "../contexts/OnlineUsersContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { AvatarOnline } from "./AvatarOnline";

interface Friend {
  id: number;
  username: string;
  profilePic: string;
  isOnline: boolean;
}

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const { userId } = useAuth();
  const onlineUsers = useOnlineUsers();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await api.get("/users/");
        const sortedFriends = sortFriends(response.data, onlineUsers);
        setFriends(sortedFriends);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [onlineUsers]);

  const sortFriends = (list: Friend[], onlineUsers: Map<number, string>) => {
    return list.map((friend) => ({
      ...friend,
      isOnline: onlineUsers.has(friend.id),
    })).sort((a, b) => Number(b.isOnline) - Number(a.isOnline));
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
              <AvatarOnline
                profilePic={friend.profilePic}
                isOnline={friend.isOnline}
              />
              <span className="mt-2 text-center w-full truncate">
                {friend.username}
              </span>
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