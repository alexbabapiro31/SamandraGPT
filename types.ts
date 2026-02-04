export enum MessageRole {
  User = 'user',
  Model = 'model',
  System = 'system'
}

export enum ModelMode {
  Text = 'text', // Gemini 3 Pro (Reasoning/Coding)
  Image = 'image' // Nano Banana Pro (gemini-3-pro-image-preview)
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  imageUrl?: string; // For generated images or user uploads
  isThinking?: boolean;
  timestamp: number;
}

export interface ApiError {
  message: string;
  code?: string;
}