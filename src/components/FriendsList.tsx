// FriendsList.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { useOnlineUsers } from "../contexts/OnlineUsersContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { AvatarOnline } from "./AvatarOnline";
import { useTheme } from "../contexts/theme/ThemeContext"; // Import the hook

interface User {
  id: number;
  username: string;
  profilePic: string;
  isOnline: boolean;
}

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [potentialFriends, setPotentialFriends] = useState<User[]>([]);
  const { userId } = useAuth();
  const onlineUsers = useOnlineUsers();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriendsAndPotentialFriends = async () => {
      try {
        const responseFriends = await api.get("/users/friends");
        const responsePotentialFriends = await api.get("/users/potential-friends");

        setFriends(responseFriends.data.friends || []);
        setPotentialFriends(responsePotentialFriends.data.potentialFriends || []);
        console.log(responsePotentialFriends);
      } catch (error) {
        console.error("Error fetching friends or potential friends:", error);
      }
    };

    fetchFriendsAndPotentialFriends();
  }, [userId]);

  const sortedFriends = useMemo(() => {
    return friends
      .map((friend) => ({
        ...friend,
        isOnline: onlineUsers.has(friend.id),
      }))
      .sort((a, b) => Number(b.isOnline) - Number(a.isOnline));
  }, [friends, onlineUsers]);

  const sortedPotentialFriends = useMemo(() => {
    return potentialFriends
      .map((potentialFriend) => ({
        ...potentialFriend,
        isOnline: onlineUsers.has(potentialFriend.id),
      }))
      .sort((a, b) => Number(b.isOnline) - Number(a.isOnline));
  }, [potentialFriends, onlineUsers]);

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
        console.error("Conversation ID is missing in the response:", conversation);
        return;
      }

      navigate(`/conversation/${conversation.id}`, {
        state: { profilePic, username, isOnline },
      });
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };

  const handleAddFriend = async (friendId: number) => {
    try {
      await api.post("/users/add-friend", { friendId });

      const addedFriend = potentialFriends.find((user) => user.id === friendId);

      setPotentialFriends(potentialFriends.filter((user) => user.id !== friendId));

      if (addedFriend) {
        setFriends([...friends, addedFriend]);
      }
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  return (
    <div className="p-4 overflow-auto min-h-screen ">
      <h2 className="text-xl font-bold mb-4">Friends</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sortedFriends.length > 0 ? (
          sortedFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex flex-col items-center p-4 rounded-lg shadow-md transition bg-[var(--card-color)] hover:bg-[var(--primary-color)] cursor-pointer"
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
              <span className="mt-2 text-center font-medium text-lg truncate">
                {friend.username}
              </span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No friends yet.</p>
        )}
      </div>
      <h2 className="text-xl font-bold mb-4">Potential Friends</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPotentialFriends.length > 0 ? (
          sortedPotentialFriends.map((potentialFriend) => (
            <div
              key={potentialFriend.id}
              className="flex flex-col items-center p-4 rounded-lg shadow-md bg-[var(--card-color)] transition hover:bg-[var(--primary-color)]"
            >
              <AvatarOnline
                profilePic={potentialFriend.profilePic}
                isOnline={potentialFriend.isOnline}
              />
              <span className="mt-2 text-center font-medium text-lg truncate">
                {potentialFriend.username}
              </span>
              <button
                className="mt-4 px-4 py-2 rounded transition bg-[var(--primary-color)]  hover:bg-[var(--card-color)]"
                onClick={() => handleAddFriend(potentialFriend.id)}
              >
                Add Friend
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            No potential friends available.
          </p>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
