import React from "react";

interface AvatarOnlineProps {
  profilePic: string;
  isOnline: boolean;
}

export const AvatarOnline: React.FC<AvatarOnlineProps> = ({ profilePic, isOnline }) => {
  return (
    <div className="relative">
      <img
        className="w-10 h-10 rounded-full"
        src={profilePic}
        alt="Avatar"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.src = "/default.jpg";
          img.onerror = null;
        }}
      />
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
          isOnline ? "bg-green-500" : "none"
        }`}
      />
    </div>
  );
};
