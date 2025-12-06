import type { Chat, AppSettings, Message } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../config/providers';

class StorageService {
  // Settings
  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return DEFAULT_SETTINGS;
  }

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }

  // Chats
  getChats(): Chat[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading chats:', e);
    }
    return [];
  }

  saveChats(chats: Chat[]): void {
    try {
      const settings = this.getSettings();
      const trimmedChats = chats.slice(0, settings.maxHistoryChats);
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(trimmedChats));
    } catch (e) {
      console.error('Error saving chats:', e);
    }
  }

  saveChat(chat: Chat): void {
    const chats = this.getChats();
    const index = chats.findIndex(c => c.id === chat.id);
    if (index >= 0) {
      chats[index] = chat;
    } else {
      chats.unshift(chat);
    }
    this.saveChats(chats);
  }

  deleteChat(chatId: string): void {
    const chats = this.getChats();
    const filtered = chats.filter(c => c.id !== chatId);
    this.saveChats(filtered);
  }

  // Current Chat ID
  getCurrentChatId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_CHAT);
  }

  setCurrentChatId(chatId: string | null): void {
    if (chatId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, chatId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
    }
  }

  // API Keys (encrypted in a real app, but stored as-is for simplicity)
  getApiKey(provider: string): string | undefined {
    const settings = this.getSettings();
    return settings.apiKeys[provider as keyof typeof settings.apiKeys];
  }

  setApiKey(provider: string, key: string): void {
    const settings = this.getSettings();
    settings.apiKeys = { ...settings.apiKeys, [provider]: key };
    this.saveSettings(settings);
  }

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
  }
}

// Utility functions
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createNewChat(provider: string, model: string): Chat {
  return {
    id: generateId(),
    title: 'New Chat',
    messages: [],
    provider: provider as Chat['provider'],
    model,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createMessage(role: Message['role'], content: string): Message {
  return {
    id: generateId(),
    role,
    content,
    timestamp: Date.now(),
  };
}

export function generateChatTitle(messages: Message[]): string {
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (firstUserMessage) {
    const title = firstUserMessage.content.slice(0, 50);
    return title.length < firstUserMessage.content.length ? `${title}...` : title;
  }
  return 'New Chat';
}

export const storageService = new StorageService();
