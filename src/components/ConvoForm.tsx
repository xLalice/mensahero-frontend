import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { useWebSocket } from "../contexts/WebSocketContext";
import { Message } from "./Convo";

interface ConvoFormProps {
  conversationId: number | undefined;
  userId: number | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ConvoForm: React.FC<ConvoFormProps> = ({
  conversationId,
  userId,
  setMessages,
}) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const socket = useWebSocket();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (data: Message) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });
    }

    return () => {
      if (socket) {
        socket.off("receive_message");
      }
    };
  }, [socket, setMessages]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage && !selectedImage) || !conversationId || !userId) return;

    const message: Message = {
      id: Date.now(), // Temporary ID for optimistic update
      content: newMessage,
      senderId: userId,
      receiverId: -1, // Placeholder; update it with the actual receiver ID if necessary
      timestamp: new Date(),
      messageType: selectedImage ? "image" : "text",
    };

    // Optimistically add the message to the state
    setMessages((prevMessages) => [...prevMessages, message]);

    const formData = new FormData();
    formData.append("conversationId", String(conversationId));
    formData.append("senderId", String(userId));
    if (newMessage) formData.append("content", newMessage);
    if (selectedImage) formData.append("image", selectedImage);

    try {
      const response = await api.post("/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      socket?.emit("send_message", response.data);

      // After successful response, update the message ID and other details
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === message.id ? response.data : msg
        )
      );
      
      setNewMessage("");
      setSelectedImage(null);
      removeSelectedImage();
    } catch (error: any) {
      console.error("Error sending message:", error);
      // Optionally, you might want to handle the error by removing the optimistic message
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== message.id)
      );
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={sendMessage} className="flex flex-col">
      <div className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-2 border rounded-xl"
          placeholder="Type a message..."
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          className="hidden"
          accept="image/*"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-300 p-2 rounded mr-2"
        >
          📎
        </button>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">
          Send
        </button>
      </div>
      {imagePreview && (
        <div className="relative mb-2">
          <img src={imagePreview} alt="Selected" className="max-h-24 rounded" />
          <button
            type="button"
            onClick={removeSelectedImage}
            className="absolute top-0 left-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}
    </form>
  );
};

export default ConvoForm;