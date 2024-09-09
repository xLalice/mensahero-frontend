import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthProvider";
import api from "../services/api";
import { User } from "../utils/types";

const CreateGroupChatForm: React.FC = () => {
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState<File | null>(null);
  const [participants, setParticipants] = useState<number[]>([]); 
  const [users, setUsers] = useState<User[]>([]); 
  const { userId } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users"); // Fetch all users
        setUsers(data.filter((user: User) => user.id !== userId));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedParticipants = [...participants, userId];

    const formData = new FormData();
    formData.append("groupName", groupName);
    if (groupImage) formData.append("groupImage", groupImage);
    formData.append("participants", JSON.stringify(updatedParticipants));

    try {
      await api.post("/conversations", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Group chat created successfully!");
    } catch (error) {
      console.error("Error creating group chat:", error);
      alert("Failed to create group chat.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGroupImage(e.target.files[0]);
    }
  };

  const handleParticipantChange = (id: number) => {
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Create Group Chat</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
            Group Name
          </label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter group name"
            required
          />
        </div>

        <div>
          <label htmlFor="groupImage" className="block text-sm font-medium text-gray-700">
            Group Image (Optional)
          </label>
          <input
            type="file"
            id="groupImage"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Add Participants</label>
          <div className="mt-2 grid grid-cols-2 gap-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`participant-${user.id}`}
                  checked={participants.includes(user.id)}
                  onChange={() => handleParticipantChange(user.id)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={`participant-${user.id}`} className="ml-2 block text-sm text-gray-900">
                  {user.username}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Group Chat
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupChatForm;
