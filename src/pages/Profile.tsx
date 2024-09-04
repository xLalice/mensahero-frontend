// src/components/UserProfile.tsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

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
        const response = await api.get('/users/profile');
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prevData => prevData ? { ...prevData, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(`/users/${userData?.id}`, userData);
      setUserData(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    console.log('File dropped');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileUpload(file);
      } else {
        alert('Please drop an image file');
      }
    } else if (e.dataTransfer.items && e.dataTransfer.items[0]) {
      const item = e.dataTransfer.items[0];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleFileUpload(file);
        }
      } else {
        alert('Please drop an image file');
      }
    } else {
      console.log('No vaid file found in the drop event');
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('profilePic', file);
  
    try {
      const response = await api.put(`/users/${userData?.id}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Error uploading profile picture. Please try again.');
    }
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <div className="flex items-center mb-4">
        <img className="" src="/back.png" alt="" onClick={() => navigate(-1)} />
        <h2 className="text-3xl font-bold mb-2 ml-2">User Profile</h2>
      </div>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1">Username:</label>
            <input
              type="text"
            id="username"
              name="username"
              value={userData.username}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1">Email:</label>
            <input
              type="email"
            id="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="profilePic" className="inline-block mr-2  ">Profile Picture:</label>
            <input
              type="file"
              id="profilePic"
              name="profilePic"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="idden"
            />
            <button
              type="button"
              onClick={() => document.getElementById('profilePic')?.click()}
              className="bg-green-500 text-white p-2 rounded"
            >
              Upload Image
            </button>
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Save Changes</button>
          <button type="button" onClick={() => setIsEditing(false)} className="ml-2 bg-gray-300 p-2 rounded">Cancel</button>
        </form>
      ) : (
        <div className="space-y-4 flex flex-col">
          <div 
            className={`w-32 h-32 mx-auto  rounded-full overflow-idden ${isDragging ? 'border-2 border-dashed border-blue-500' : ''}`}
            onDragEnter={handleDragIn}
            onDragOver={handleDrag}
            onDragLeave={handleDragOut}
            onDrop={handleDrop}
          >
            <img 
            src={userData.profilePic}
            alt="Profile Picture" 
            className="w-full h-full object-cover"
            onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = '/default.jpg';
                img.onerror = null;
            }} />
          </div>
          <p><strong>Username:</strong> {userData.username}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white p-2 rounded mx-auto">Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;