
export interface User {
    id: number;
    username: string;
    profilePic: string;
  }

  export interface Participant {
    id: number;
    username: string;
    profilePic: string;
    conversationId: number;
  }
  
export interface Conversation {
    id: number;
    profilePic: string;
    username: string;
    participants: number[];
    lastMessage: {
      content: string;
      timestamp: Date;
      messageType: string;
    };
    userId?: number;
    groupImage?: string;
    groupName?: string;
  }

  type MessageType = "text" | "image";

export interface Message {
  id: number;
  content: string;
  senderId: number;
  conversationId: number;
  timestamp: Date;
  messageType: MessageType;
}