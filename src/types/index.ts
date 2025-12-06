// AI Provider Types
export type AIProvider = 'openai' | 'anthropic' | 'grok' | 'gemini';

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  displayName: string;
  models: AIModel[];
  apiKeyName: string;
  baseUrl: string;
  iconColor: string;
}

export interface AIModel {
  id: string;
  name: string;
  maxTokens: number;
  description?: string;
}

// Message Types
export interface MessageImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: MessageImage[];
  timestamp: number;
  provider?: AIProvider;
  model?: string;
  isStreaming?: boolean;
  error?: string;
}

// Chat Types
export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  provider: AIProvider;
  model: string;
  createdAt: number;
  updatedAt: number;
}

// Settings Types
export interface APIKeys {
  openai?: string;
  anthropic?: string;
  grok?: string;
  gemini?: string;
}

export interface AppSettings {
  apiKeys: APIKeys;
  defaultProvider: AIProvider;
  defaultModel: string;
  systemPrompt: string;
  streamResponses: boolean;
  saveHistory: boolean;
  maxHistoryChats: number;
}

// API Request/Response Types
export interface ChatCompletionRequest {
  messages: { role: string; content: string }[];
  model: string;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  error?: string;
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  settingsOpen: boolean;
  isLoading: boolean;
  error: string | null;
}
