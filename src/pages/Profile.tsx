import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

interface UserData {
  id: string;
  username: string;
  email: string;
  profilePic: string;
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users/profile");
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prevData) =>
      prevData ? { ...prevData, [name]: value } : null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(`/users/${userData?.id}`, userData);
      setUserData(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("profilePic", file);
    try {
      const response = await api.put(
        `/users/${userData?.id}/profile-picture`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error uploading profile picture. Please try again.");
    }
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    } else {
      alert("Please drop an image file");
    }
  }, []);

  if (!userData) return <Loading width={64} height={64} />;

  return (
    <div className="max-w-lg mx-auto p-6 bg-[var(--card-color)] shadow-lg rounded-lg h-screen">
      <div className="flex items-center mb-6">
        <img
          className="w-6 cursor-pointer"
          src="/back.png"
          alt="Back"
          onClick={() => navigate(-1)}
        />
        <h2 className="text-3xl font-bold ml-4">
          User Profile
        </h2>
      </div>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          <div className="relative inline-block self-center">
            <img
              src={userData.profilePic}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            <input
              type="file"
              id="profilePic"
              name="profilePic"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleFileUpload(e.target.files[0])
              }
            />
            <button
              type="button"
              onClick={() => document.getElementById("profilePic")?.click()}
              className="absolute bottom-0 right-0 bg-[var(--primary-color)] text-white p-2 rounded-full"
            >
              <img src="/upload.png" alt="" className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label htmlFor="username" className="block mb-1 font-semibold">
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={userData.username}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-[var(--background-color)]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 font-semibold">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-[var(--background-color)]"
            />
          </div>

          <div className="flex">
            <button
              type="submit"
              className="bg-[var(--primary-color)] text-white p-2 rounded flex-grow"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="ml-2 bg-[var(--background-color)] p-2 rounded flex-grow"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div
            className={`relative w-32 h-32 mx-auto rounded-full overflow-hidden ${
              isDragging ? "border-2 border-dashed border-[var(--primary-color)]" : ""
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <img
              src={userData.profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = "/default.jpg";
                img.onerror = null;
              }}
            />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg">Username:</h3>
            <p className="bg-[var(--card-color)] p-2 rounded-md font-bold">
              {userData.username}
            </p>
            <h3 className="text-lg">Email:</h3>
            <p className="bg-[var(--card-color)] p-2 rounded-md font-bold">
              {userData.email}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[var(--primary-color)] text-white p-2 rounded mx-auto block"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
